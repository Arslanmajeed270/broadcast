// Nodejs encryption with CTR
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
// const key = crypto.randomBytes(32);
const secretKey = process.env.ROOM_SECRET_KEY;
const iv = crypto.randomBytes(16);



exports.encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')} ${encrypted.toString('hex')}`
    // return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
   }
   
exports.decrypt = (text) => {
    // let iv = Buffer.from(text.iv, 'hex');
    let iv = Buffer.from(text.split(" ")[0], 'hex');
    // let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let encryptedText = Buffer.from(text.split(" ")[1], 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
   }
