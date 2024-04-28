export const RoutesConstants = {
    // Common
    PARAM_ID: '/:id',
    PAGE: 'page',
    PAGESIZE: 'pageSize',
    ID: 'id',
    ACTION: 'action',

    // Auth Module
    AUTH: 'auth',
    SEND_OTP: 'send-otp',
    VERIFY_OTP: 'verify-otp',
    LOGIN: 'login',
    SSO_LOGIN: 'sso-login',
    NEW_ACCESS_TOKEN: 'new-access-token',
    FORGOT_PASSWORD_SEND_OTP: 'forgot-password/send-otp',
    FORGOT_PASSWORD: 'forgot-password',
    CHANGE_PASSWORD: 'change-password',
    GET_USER_TWEETS: 'get-user-tweets',
    GET_USER_LIKED_TWEETS: 'get-user-liked-tweets',
    GET_USER_RETWEETED_TWEETS: 'get-user-retweeted-tweets',
    GET_USER_BOOKMARKED_TWEETS: 'get-user-bookmarked-tweets',
    GET_USER_COMMENTED_TWEETS: 'get-user-commented-tweets',
    GET_USER_DETAILS: 'get-user-details',
    GET_ALL_USER: 'get-all-user',
    UPDATE_USER_DETAILS: 'update-user-details',
    UPDATE_USER_ACTION: 'update-user-action',

    // User Module
    USER: "user",
    SET_PASSWORD: "set-password",
    CHECK_USERNAME: "check-username",


    // Tweet Module
    TWEET: "tweet",
    ADD_TWEET: "add-tweet",
    GET_TWEET: "get-tweet/:id",
    GET_ALL_TWEET: "get-all-tweet",
    UPDATE_TWEET: "update-tweet/:id",
    UPDATE_TWEET_ACTION: "update-tweet-action/:id/action/:action",

    // Interest Module
    INTEREST: "interest",

    // Like Module
    LIKE: "like",

    // Retweet Module
    RETWEET: "retweet",

    // Hashtag Module
    HASHTAG: "hashtag",

    // Comment Module
    COMMENT: "comment",

    // Bookmark Module
    BOOKMARK: "bookmark",

}