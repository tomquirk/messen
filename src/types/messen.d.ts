import facebook from 'facebook-chat-api';

export type MessenMeUser = facebook.FacebookUser & {
  friends: Array<facebook.FacebookFriend>;
};
