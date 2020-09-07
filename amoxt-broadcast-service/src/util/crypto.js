// Nodejs encryption with CTR
const crypto = require('crypto');




exports.encrypt = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
}
