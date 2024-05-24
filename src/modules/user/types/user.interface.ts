import { Tweet } from 'src/modules/tweet/entities/tweet.entity';

export interface UserWithTweets {
  id: string;
  username: string; // Include other desired user fields
  tweets: Tweet[];
}
