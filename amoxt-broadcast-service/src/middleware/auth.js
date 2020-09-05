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

  const PRIVATE_KEY = 'myprivatekey';

  //spiliting Authorization then escape Bearer and send token in token variable
  const token = authHeader.split(' ')[1];
  
  //trying to decode the token in any case it will throw error
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, PRIVATE_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  
  //seperating variables to use in next functions
  req.email = decodedToken.email;
  
  // calling next function
  next();
};
