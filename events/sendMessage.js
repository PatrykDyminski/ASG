var amqp = require('amqplib/callback_api');

function sendMessage(msg, address='localhost', qName='UserSignedInForEvent'){
    amqp.connect('amqp://'+address, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            var queue = qName;
            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(msg));

            console.log(" [x] Sent %s", msg);
        });
        setTimeout(function() {
            connection.close();
            // process.exit(0);
        }, 500);
    });
}

module.exports = {
    sendMessage
}