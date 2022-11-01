const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio');

const client = new twilio(accountSid, authToken);

const sendSms = async(message, to) => {

client.messages
  .create({
     body: message,
     from: process.env.TWILIO_NUMBER,
     to: to
   })
  .then(message => console.log(message.sid));

}

module.exports = sendSms