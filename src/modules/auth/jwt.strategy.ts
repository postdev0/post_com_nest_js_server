import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configSvc: ConfigService,
    private jwtSvc: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configSvc.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(req: Request) {
    let jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    let user = await this.jwtSvc.decode(jwt);
    if (!user) {
      throw new UnauthorizedException('JwtStrategy unauthorized');
    }
    let userData: User = await this.userRepository.findOne({ where: { email: user.email, deleteFlag: false } });
    return userData;
  }
}
