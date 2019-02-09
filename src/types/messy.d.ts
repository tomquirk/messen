import facebook from 'facebook-chat-api';

export type MessyMeUser = facebook.FacebookUser & {
  friends: Array<any>;
};
