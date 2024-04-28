import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { VerifyEmailDto, VerifyOtpDto, LoginDto, SSOLoginDto, NewAccessTokenDto, ForgotPasswordDto, ForgotPasswordVerifyEmailDto } from './dto/create.dto';
import * as bcrypt from 'bcryptjs';
import { Blacklist } from './entities/blacklist.entity';
import { otpGenerator } from '../../common/generator';
import { UserAuthData } from '../../base/interface';
import { extractUsername } from '../../common/common';

@Injectable()
export class AuthService {
  constructor(
    private jwtSvc: JwtService,
    private mailService: MailService,
    private configSvc: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Blacklist)
    private readonly blackListRepository: Repository<Blacklist>,
  ) { }

  #createOtpToken(user: any) {
    let accessToken = this.jwtSvc.sign(
      user,
      {
        secret: this.configSvc.get<string>('JWT_SECRET'),
        expiresIn: `${this.configSvc.get<number>('JWT_OTP_TOKEN_EXPIRY_TIME')}m`,
      },
    );
    this.jwtSvc.decode;
    return accessToken;
  }
  #createJwtAccessToken(user: User) {
    let { email } = user;
    let accessToken = this.jwtSvc.sign(
      { email },
      {
        secret: this.configSvc.get<string>('JWT_SECRET'),
        expiresIn: `${this.configSvc.get<number>('JWT_ACCESS_TOKEN_EXPIRY_TIME')}d`,
      },
    );
    this.jwtSvc.decode;
    return accessToken;
  }
  #createJwtRefreshToken(user: User) {
    let { email } = user;
    let refreshToken = this.jwtSvc.sign(
      { email },
      {
        secret: this.configSvc.get<string>('JWT_SECRET'),
        expiresIn: `${this.configSvc.get<number>('JWT_REFRESH_TOKEN_EXPIRY_TIME')}d`,
      },
    );
    this.jwtSvc.decode;
    return refreshToken;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async sendOtp(verifyEmailDto: VerifyEmailDto): Promise<any> {
    let existingUser = await this.userRepository.findOne({ where: { email: verifyEmailDto.email, deleteFlag: false, ssoLogin: false } })
    if (existingUser) {
      throw new Error("User already registered, please login...!");
    } else {
      let otp = otpGenerator();
      await this.mailService.sendOTP({ email: verifyEmailDto.email, otp });
      let hashedOtp = await bcrypt.hash(otp, 8);
      return { otp, otpToken: this.#createOtpToken({ hashedOtp, ...verifyEmailDto }) };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<UserAuthData> {
    let verify = await this.jwtSvc.decode(verifyOtpDto.otpToken);
    if (!verify) throw new Error("OTP is expired...!");
    let otpIsValid = await bcrypt.compare(verifyOtpDto.otp, verify.hashedOtp)
    if (!otpIsValid) throw new Error("OTP is not valid...!");
    let user: any = {
      fullName: verify.fullName,
      email: verify.email,
      dob: verify.dob,
    }
    let userDetails: User = await this.userRepository.save(user);
    let accessToken = this.#createJwtAccessToken(userDetails);
    let refreshToken = this.#createJwtRefreshToken(userDetails);
    delete userDetails.password;
    delete userDetails.activeFlag;
    delete userDetails.deleteFlag;
    userDetails.interests = [];
    return { ...userDetails, accessToken, refreshToken, isNewUser: true };
  }

  async login(loginDto: LoginDto): Promise<UserAuthData> {
    let usernameOrEmail: string = loginDto.user;
    let userDetails = await this.userRepository
      .createQueryBuilder('userDetails')
      .where('userDetails.username = :usernameOrEmail', { usernameOrEmail })
      .orWhere('userDetails.email = :usernameOrEmail', { usernameOrEmail })
      .andWhere('userDetails.deleteFlag = :deleteFlag', { deleteFlag: false })
      .andWhere('userDetails.ssoLogin = :ssoLogin', { ssoLogin: false })
      .getOne();

    if (!userDetails) throw new Error("Incorrect username/email");
    let match = await bcrypt.compare(loginDto.password, userDetails.password);
    if (!match) throw new Error("Incorrect password");
    let accessToken = this.#createJwtAccessToken(userDetails);
    let refreshToken = this.#createJwtRefreshToken(userDetails);
    delete userDetails.password;
    delete userDetails.activeFlag;
    delete userDetails.deleteFlag;
    return { ...userDetails, accessToken, refreshToken, isNewUser: false };
  }

  async ssoLogin(ssoLoginDto: SSOLoginDto): Promise<UserAuthData> {
    let existingUser = await this.userRepository.findOne({ where: { email: ssoLoginDto.email, deleteFlag: false, ssoLogin: true } })
    if (existingUser) {
      let accessToken = this.#createJwtAccessToken(existingUser);
      let refreshToken = this.#createJwtRefreshToken(existingUser);
      delete existingUser.password;
      delete existingUser.activeFlag;
      delete existingUser.deleteFlag;
      return { ...existingUser, accessToken, refreshToken, isNewUser: false };
    } else {
      let user: any = {
        email: ssoLoginDto.email,
        fullName: ssoLoginDto.fullName,
        username: extractUsername(ssoLoginDto.email),
        avatar: ssoLoginDto.picture,
        ssoLogin: true
      }
      let userDetails: User = await this.userRepository.save(user);
      let accessToken = this.#createJwtAccessToken(userDetails);
      let refreshToken = this.#createJwtRefreshToken(userDetails);
      delete userDetails.password;
      delete userDetails.activeFlag;
      delete userDetails.deleteFlag;
      return { ...userDetails, accessToken, refreshToken, isNewUser: true };
    }
  }

  async newAccessToken(newAccessTokenDto: NewAccessTokenDto): Promise<any> {
    let verify = await this.jwtSvc.decode(newAccessTokenDto.refreshToken);
    if (!verify) throw new Error("Invalid refresh token");
    let existingRefreshToken = await this.blackListRepository.findOne({ where: { refreshToken: newAccessTokenDto.refreshToken } });
    if (existingRefreshToken) throw new Error("Refresh Token is expired");
    await this.blackListRepository.save(newAccessTokenDto);
    let accessToken = this.#createJwtAccessToken(verify);
    let refreshToken = this.#createJwtRefreshToken(verify);
    return { accessToken, refreshToken };
  }

  async sendOtpForgotPassword(forgotPasswordVerifyEmailDto: ForgotPasswordVerifyEmailDto): Promise<any> {
    let existingUser = await this.userRepository.findOne({ where: { email: forgotPasswordVerifyEmailDto.email, deleteFlag: false, ssoLogin: false } })
    if (!existingUser) throw new Error("Invalid User/Email or User may be deleted...!");
    let otp = otpGenerator();
    await this.mailService.sendOTP({ email: forgotPasswordVerifyEmailDto.email, otp });
    let hashedOtp = await bcrypt.hash(otp, 8);
    return { otp, otpToken: this.#createOtpToken({ hashedOtp, ...forgotPasswordVerifyEmailDto }) };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    let verify = await this.jwtSvc.decode(forgotPasswordDto.otpToken);
    if (!verify) throw new Error("OTP is expired...!");
    let otpIsValid = await bcrypt.compare(forgotPasswordDto.otp, verify.hashedOtp)
    if (!otpIsValid) throw new Error("OTP is not valid...!");
    let userDetails = await this.userRepository.findOne({ where: { email: verify.email, deleteFlag: false } })
    if (!userDetails) throw new Error("Invalid User or User may be deleted...!");
    let password = await bcrypt.hash(forgotPasswordDto.password, 8);
    await this.userRepository.update(userDetails.id, { password });
    let accessToken = this.#createJwtAccessToken(userDetails);
    let refreshToken = this.#createJwtRefreshToken(userDetails);
    delete userDetails.password;
    return { ...userDetails, accessToken, refreshToken };
  }
}
