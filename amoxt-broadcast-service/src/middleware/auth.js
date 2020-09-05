const jwt = require('jsonwebtoken');

//Export default authorization funciton
module.exports = (req, res, next) => {

  //checking if we have Authorization set or not
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  const SECRET_KEY = process.env.JWT_PRIVATE_KEY || 'amoxtbroadcast';

  //spiliting Authorization then escape Bearer and send token in token variable
  const token = authHeader.split(' ')[1];
  
  //trying to decode the token in any case it will throw error
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  //checking expiray of token
  const currentTime = Date.now()/1000;
  if (decodedToken.exp < currentTime) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
}

  // calling next function
  next();
};
