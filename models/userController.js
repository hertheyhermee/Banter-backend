import User from './user.js';

export const findUser = (username, email, password, googleId)=> {
  const result = User.findOne({username, email, password, googleId});
  return result;
};

export const updateUser = (username, email, password, favoriteClub, role, profilePic)=> {
  const result = User.UpdateOne({ username, email, password },
                                {$set: {username: username, 
                                        password: password,
                                        favoriteClub: favoriteClub,
                                        role: role,
                                        profilePic: profilePic}
                                });
  return result;
};

export const deleteUser = (username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats)=> {
  const result = User.deleteOne({username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats});
  return result;
};
