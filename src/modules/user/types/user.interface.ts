import { Tweet } from '../../tweet/entities/tweet.entity';

export interface UserWithTweets {
  id: string;
  username: string; // Include other desired user fields
  tweets: Tweet[];
}
