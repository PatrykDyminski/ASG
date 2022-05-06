const amqp = require('amqplib/callback_api');
const queueConfig = require('./queue.config.json');

var channel = null
var queue = "NOTIFICATION"

function init() {
    queueUrl = 'amqp://' + queueConfig.ip + ":" + queueConfig.port
    amqp.connect(queueUrl, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, newChannel) {
          if (error1) {
            throw error1;
          }
      
          channel = newChannel
      
          channel.assertQueue(queue, {
            durable: false
          });
        });
      });
}

function sendMessage(message){
    channel.sendToQueue(queue, Buffer.from(message));
    console.log("[MESSAGE TO QUEUE]: " + message)
}

module.exports = {
    init,
    sendMessage
}
