import { DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../modules/user/entities/user.entity';
import { Blacklist } from '../modules/auth/entities/blacklist.entity';
import { Tweet } from '../modules/tweet/entities/tweet.entity';
import { Like } from '../modules/like/entities/like.entity';
import { Retweet } from '../modules/retweet/entities/retweet.entity';
import { Comment } from '../modules/comment/entities/comment.entity';
import { Bookmark } from '../modules/bookmark/entities/bookmark.entity';
import { Follow } from '../modules/follow/entities/follow.entity';
import { Hashtag } from '../modules/hashtag/entities/hashtag.entity';
import { Interest } from '../modules/interest/entities/interest.entity';

ConfigModule.forRoot();

const { NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const host = DB_HOST;
const port = Number(DB_PORT);
const username = DB_USER;
const password = DB_PASSWORD;
const database = DB_NAME;
const url =
  NODE_ENV === 'production' ? `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}` : undefined;

// console.log(NODE_ENV);
// console.log(host);
// console.log(port);
// console.log(username);
// console.log(password);
// console.log(database);
// console.log(url);

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  url,
  entities: [
    User,
    Blacklist,
    Tweet,
    Like,
    Retweet,
    Comment,
    Bookmark,
    Follow,
    Hashtag,
    Interest
  ],
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: true,
};
