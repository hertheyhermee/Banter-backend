import User from './user.js';
import bycrypt from 'bycryptjs';

export const createUser = (username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats)=> {
  bycrypt.genSalt(10, (err, salt)=>{
    bycrypt.hash(password, Salt, (err, hash)=>{
      if(err){
        return `error: ${err}`
      }
      hashedPassword = hash;
      const user = new User({username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats});
      const result = user.save();
      return result;
         }
  })
};


export const findUser = (username, email, password, googleId)=> {
  bycrypt.genSalt(10, (err, salt)=>{
    bycrypt.hash(password, Salt, (err, hash)=>{
      if(err){
        return `error: ${err}`
      }
      hashedPassword = hash;
      const result = User.findOne({username, email, hashedPassword, googleId});
      return result;
    }
  })
};

export const updateUser = (username, email, password, favoriteClub, role, profilePic)=> {
  bycrypt.genSalt(10, (err, salt)=>{
    bycrypt.hash(password, Salt, (err, hash)=>{
      if(err){
        return `error: ${err}`
      }
      hashedPassword = hash
      const result = User.UpdateOne({ username, email, hashedPassword },
                                {$set: {username: username, 
                                        password: hashedPassword,
                                        favoriteClub: favoriteClub,
                                        role: role,
                                        profilePic: profilePic}
                                });
      return result;
    }
  })
};
export const deleteUser = (username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats)=> {
  const result = User.deleteOne({username, email, password, googleId, favoriteClub, trophies, fanscore, oauth, role, profilePic, stats});
  return result;
};
