import facebook from 'facebook-chat-api'

export function facebookFriendToUser(friend: facebook.FacebookFriend): facebook.FacebookUser {
  return {
    id: friend.userID,
    name: friend.fullName,
    isBirthday: friend.isBirthday,
    vanity: friend.vanity,
    isFriend: friend.isFriend,
    type: friend.type,
    firstName: friend.firstName,
    thumbSrc: friend.profilePicture,
    gender: friend.gender,
    profileUrl: friend.profileUrl
  }
}