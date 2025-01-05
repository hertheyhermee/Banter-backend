import User from './user.js';

export const createUser = (username, email, password, favoriteClub, role, profilePic)=> {
  const user = new User({username, email, password, favoriteClub, role, profilePic})
}
