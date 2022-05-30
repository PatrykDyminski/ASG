const amqp = require('amqplib/callback_api');
const queueConfig = require('./queue.config.json');

var channel = null

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

        channel.assertQueue(queueConfig.notifications.queueName, {
          durable: false
        });
        channel.assertExchange(queueConfig.notifications.exchangeName, queueConfig.notifications.type, {durable: false})

        channel.assertQueue(queueConfig.events.send.queueName, {
          durable: false
        });
        channel.assertExchange(queueConfig.events.send.exchangeName, queueConfig.events.send.type, {durable: false})

        channel.assertQueue(queueConfig.events.recieve.queueName, {
          durable: false
        });
        channel.assertExchange(queueConfig.events.recieve.exchangeName, queueConfig.events.recieve.type, {durable: false})

        channel.assertQueue('', {
          exclusive: true
        }, function(error2, q) {
          if (error2) {
            throw error2;
          }
          channel.bindQueue(q.queue, queueConfig.events.recieve.exchangeName, '');

          channel.consume(q.queue, (msg) => {
            parseResponse(msg.content.toString())
          }, {
            noAck: true
          })
        })
      });
  });
}

function sendMessageToNotificationsQueue(message){
    channel.publish(queueConfig.notifications.exchangeName, '', Buffer.from(message));
    console.log("[MESSAGE TO " + queueConfig.notifications.queueName + "] " + message)
}

function sendToQueueHelper(payload){

    message = JSON.stringify(payload)
    channel.publish(queueConfig.events.send.exchangeName, '', Buffer.from(message));
    console.log("[MESSAGE TO " + queueConfig.events.send.queueName + "] " + message)
}


var callers = {}

function generateCallerId() {
    return (+new Date).toString(36);
}

function sendMessageToEventsQueue(emitedEvent, message, callerCallback) {
    callerId = generateCallerId()
    callers[callerId] = callerCallback
    payload = {
        correlationId: callerId,
        emitedEvent: emitedEvent,
        payload: message
    }
    
    sendToQueueHelper(payload)
}
``
function parseResponse(message) {
    parsed = JSON.parse(message)
    caller = callers[parsed.correlationId]
    payload = parsed.payload
    if (payload.status && payload.status == 301){
      caller.status(301).redirect(payload.body.address)
    } else if(payload.status == 302) {
        caller.emit(parsed.emitedEvent, payload.body.message)
    } else {
      caller.emit(parsed.emitedEvent, payload.body)
    }
}
module.exports = {
    init,
    sendMessageToNotificationsQueue,
    sendMessageToEventsQueue,
}
