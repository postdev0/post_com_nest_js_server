export interface UserAuthData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  cover: string;
  bio: string;
  dob: string;
  status: string;
  verified: boolean;
  ssoLogin: boolean;
  isNewUser: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  lastSeen: Date;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  interests: string[];
  avatar: string;
  cover: string;
  bio: string;
  dob: string;
  status: string;
  verified: boolean;
  ssoLogin: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  lastSeen: Date;
  createdAt: Date;
  modifiedAt: Date;
}

export interface UsersList {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  verified: boolean;
  isFollowing: boolean;
  isFollower: boolean;
  isBlocked: boolean;
}

export interface TweetsList {
  id: string;
  text: string;
  media: string[];
  interests: string[];
  hashtags: string[];
  commentsCount: number;
  retweetsCount: number;
  likesCount: number;
  bookmarksCount: number;
  taggedUsers: string[];
  isRetweeted: boolean;
  isEdited: boolean;
  isPublic: boolean;
  selfLiked: boolean;
  selfRetweeted: boolean;
  selfCommented: boolean;
  selfBookmarked: boolean;
  isFollowingToOwner: boolean;
  isOwnerBlocked: boolean;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface InterestsList {
  id: string;
  name: string;
  users?: UsersList[];
  tweets?: TweetsList[];
}

export interface InterestsUsersList {
  id: string;
  name: string;
  user_id: string;
  user_fullName: string;
  user_username: string;
  user_avatar: string;
  user_verified: boolean;
  user_isFollowing: boolean;
}

export interface CommentsList {
  id: string;
  text: string;
  media: string[];
  isEdited: boolean;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface UserCommentedTweetsList {
  tweet_id: string;
  tweet_text: string;
  tweet_media: string[];
  tweet_interests: string[];
  tweet_hashtags: string[];
  tweet_commentsCount: number;
  tweet_retweetsCount: number;
  tweet_likesCount: number;
  tweet_bookmarksCount: number;
  tweet_taggedUsers: string[];
  tweet_isRetweeted: boolean;
  tweet_isEdited: boolean;
  tweet_isPublic: boolean;
  tweet_selfLiked: boolean;
  tweet_selfRetweeted: boolean;
  tweet_selfCommented: boolean;
  tweet_selfBookmarked: boolean;
  tweet_isFollowingToOwner: boolean;
  tweet_isOwnerBlocked:boolean;
  tweet_userId:string;
  tweet_username:string;
  tweet_fullName:string;
  tweet_avatar:string;
  tweet_createdAt:Date;
  tweet_modifiedAt:Date;
  id: string;
  text: string;
  media: string[];
  isEdited: boolean;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  createdAt: Date;
  modifiedAt: Date;
}
