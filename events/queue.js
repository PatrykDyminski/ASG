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

function sendMessageToGatewayQueue(payload){

    message = JSON.stringify(payload)
    channel.publish(queueConfig.events.send.exchangeName, '', Buffer.from(message));
    console.log("[MESSAGE TO " + queueConfig.events.send.queueName + "] " + message)
}


async function parseResponse(message){

  console.log("[RECIEVED MESSAGE]: ", message)

  request = JSON.parse(message)
  req = request.payload
  if (req.endpoint === "testEvents"){
      console.log("TEST EVENTS CONNECTION")
      sendMessageToGatewayQueue({
          correlationId: request.correlationId,
          payload: {
              status: 200,
              body: {success:true, message:"Połączono"}
          }
      })
  }
  if (req.endpoint === "event"){
      new Event({
          organizator:req.body.organizator,
          nazwa:req.body.nazwa,
          wsp:req.body.wsp,
          miejsce:req.body.miejsce,
          rodzaj:req.body.rodzaj,
          limity:req.body.limity,
          oplata:req.body.oplata,
          termin:req.body.termin,
          roznica:req.body.roznica,
          frakcje:req.body.frakcje,
          opis:req.body.opis
  
          }).save((err, event)=>{
              if(err!==null)
              {
                  console.log(err);
                  sendMessageToGatewayQueue({
                      correlationId: request.correlationId,
                      payload: {
                          status: 400,
                          body: {success:false, message:"Wystąpił błąd", created_id:''}
                      }
                  })
              }
              else{
                  
                  console.log(err);
                  sendMessageToGatewayQueue({
                      correlationId: request.correlationId,
                      payload: {
                          status: 200,
                          body: {success:true,message:'Utworzono wydarzenie', created_id: event._id}
                      }
                  })
              }
          });
  }
  else if(req.endpoint === "events"){
      var date = new Date();
      date.setDate(date.getDate()-1);
      date.setHours(23,59,59);
      //console.log(date);
      Event.find({"termin":{"$gte": date}},function(error,result){
          if(error)
          console.log(error)
          else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: result
                  }
              })
          }
      });
  }
  else if(req.endpoint === "unsignUser"){
      Event.updateOne({"_id":req.body._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body.gracz}}},{safe:true,multi:true},function(error,result){
          if(error){
              console.log(error);
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: {success:false,message:"Wystąpił błąd"}
                  }
              })
              }
              else{
                  sendMessageToGatewayQueue({
                      correlationId: request.correlationId,
                      payload: {
                          body: {success:true,message:"Wypisano z wydarzenia"}
                      }
                  })
              }
      })
  }
  else if(req.endpoint === "updateEvent"){
      await Event.updateOne({_id:req.body._id},req.body,function(error,result){
          if(error){
          console.log(error);
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              payload: {
                  body: {success:false,message:"Wystąpił błąd"}
              }
          })
          }
          else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: {success:true,message:"Wydarzenie zaaktualizowane"}
                  }
              })
          }
      });
  }
  else if(req.endpoint === "signUser"){
      if(req.body.params._id==='') {
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              payload: {
                  status: 200,
                  body: {success:false, message:' Musisz być zalogowany'}
              }
          })
      }
      else {
      await Event.updateOne({"_id":req.body.params._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body.params._idGracz}}},{safe:true,multi:true});
      await Event.updateOne({"_id":req.body.params._id},{$addToSet:{"frakcje.$[s].zapisani":{_id:req.body.params._idGracz,imie:req.body.params.gracz}}},
      {arrayFilters:[{"s.strona":req.body.params.strona}],upsert:true},function(error,result){
         if(error)
         console.log(error);
         else{
             if(result.nModified==0)
             {
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: {message:"Już jesteś zapisany"}
                  }
              })
             }
             else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: {message:"Zostałeś zapisany"}
                  }
              })
             }
             
         }
      })}
  }
  else if(req.endpoint === "deleteEvent") {
      Event.remove({_id:req.query._id},function(error,result){
          if(error){
          console.log(error);
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              payload: {
                  body: {success:false,message:"Wystąpił błąd"}
              }
          })
          }
          else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  payload: {
                      body: {success:true,message:"Wydarzenie usunięte"}
                  }
              })
          }
      })
  }
}

module.exports = {
    init,
    sendMessageToGatewayQueue
}
