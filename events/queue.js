const amqp = require('amqplib/callback_api');
const queueConfig = require('./queue.config.json');
var https = require('follow-redirects').https;
var Event = require('./models/event');
const { stringify } = require('querystring');
const payuConfig = require('./payu.config.json');
const { checkBuyer, checkEvent } = require('./validate.js');

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
var access_token
var orderId
var options = {
    'method': 'POST',
    'hostname': 'secure.snd.payu.com',
    'path': '/pl/standard/user/oauth/authorize',
    'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': payuConfig.cookie
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        access_token = JSON.parse(body.toString()).access_token
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

    var postData = stringify({
        'grant_type': 'client_credentials',
        'client_secret': payuConfig.client_secret,
        'client_id': payuConfig.client_id
    });
    req.write(postData);
    req.end();
function sendMessageToGatewayQueue(payload){

    message = JSON.stringify(payload)
    channel.publish(queueConfig.events.send.exchangeName, '', Buffer.from(message));
    console.log("[MESSAGE TO " + queueConfig.events.send.queueName + "] " + message)
}


async function parseResponse(message){

  console.log("[RECIEVED MESSAGE]: ", message)

  request = JSON.parse(message)
  req = request.payload
  console.log(req);
  if (req.emitedEvent === "testEvents"){
      console.log("TEST EVENTS CONNECTION")
      sendMessageToGatewayQueue({
          correlationId: request.correlationId,
          emitedEvent: request.emitedEvent,
          payload: {
              status: 200,
              body: {success:true, message:"Połączono"}
          }
      })
  }
  if (request.emitedEvent === "postEvent"){
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
                      emitedEvent: request.emitedEvent,
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
                      emitedEvent: request.emitedEvent,
                      payload: {
                          status: 200,
                          body: {success:true,message:'Utworzono wydarzenie', created_id: event._id}
                      }
                  })
              }
          });
  }
  else if(request.emitedEvent === "getEvents"){
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
                  emitedEvent: request.emitedEvent,
                  payload: {
                      body: result
                  }
              })
          }
      });
  }
  else if(request.emitedEvent === "leaveFraction"){
      Event.updateOne({"_id":req.body._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body.gracz}}},{safe:true,multi:true},function(error,result){
          if(error){
              console.log(error);
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  emitedEvent: request.emitedEvent,
                  payload: {
                      body: {success:false,message:"Wystąpił błąd"}
                  }
              })
              }
              else{
                  sendMessageToGatewayQueue({
                      correlationId: request.correlationId,
                      emitedEvent: request.emitedEvent,
                      payload: {
                          body: {success:true,message:"Wypisano z wydarzenia"}
                      }
                  })
              }
      })
  }
  else if(request.emitedEvent === "updateEvent"){
      await Event.updateOne({_id:req.body._id},req.body,function(error,result){
          if(error){
          console.log(error);
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              emitedEvent: request.emitedEvent,
              payload: {
                  body: {success:false,message:"Wystąpił błąd"}
              }
          })
          }
          else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  emitedEvent: request.emitedEvent,
                  payload: {
                      body: {success:true,message:"Wydarzenie zaaktualizowane"}
                  }
              })
          }
      });
  }
  else if(request.emitedEvent === "joinFraction"){
      if(req.body._id==='') {
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              emitedEvent: request.emitedEvent,
              payload: {
                  status: 200,
                  body: {success:false, message:' Musisz być zalogowany'}
              }
          })
      }
      else {
      await Event.updateOne({"_id":req.body._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body._idGracz}}},{safe:true,multi:true});
      await Event.updateOne({"_id":req.body._id},{$addToSet:{"frakcje.$[s].zapisani":{_id:req.body._idGracz,imie:req.body.gracz}}},
      {arrayFilters:[{"s.strona":req.body.strona}],upsert:true},function(error,result){
         if(error)
         console.log(error);
         else{
             if(result.nModified==0)
             {
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  emitedEvent: request.emitedEvent,
                  payload: {
                      body: {message:"Już jesteś zapisany"}
                  }
              })
             }
             else{
              sendMessageToGatewayQueue({
                  correlationId: request.correlationId,
                  emitedEvent: request.emitedEvent,
                  payload: {
                      body: {message:"Zostałeś zapisany"}
                  }
              })
             }
             
         }
      })}
  }
  else if(request.emitedEvent === "deleteEvent") {
      console.log(req.body);
      Event.deleteOne({_id:req.body._id},function(error,result){
          if(error){
          console.log(error);
          sendMessageToGatewayQueue({
              correlationId: request.correlationId,
              emitedEvent: request.emitedEvent,
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
  else if (request.emitedEvent === "updateUserPayment") {
    Event.updateOne({_id:req.body.params._id},
        {
            $set: {
                "frakcje.$[f].zapisani.$[z].czy_oplacone" : req.body.params.czy_oplacone  
            }
        },
        {
            arrayFilters:[
                {
                    "f.strona": req.body.params.strona
                },
                {
                    "z._id": req.body.params._idGracz
                }
            ]
        }
        ,function(error,result){
            if(error){
                console.log(error);
                sendMessageToGatewayQueue({
                    correlationId: request.correlationId,
                    emitedEvent: request.emitedEvent,
                    payload: {
                        body: {success:false,message:"Wystąpił błąd"}
                    }
                })
                }
                else{
                    sendMessageToGatewayQueue({
                        correlationId: request.correlationId,
                        emitedEvent: request.emitedEvent,
                        payload: {
                            body: {success:true,message:"Zapisano opłatę"}
                        }
                    })
                }
    });
  }
  else if (request.emitedEvent === "payment/createOrder"){
    createOrder(req, access_token);
  }
  else if(request.emitedEvent == "orderDetails"){
    orderDetails(req, access_token);
  }
}

module.exports = {
    init,
    sendMessageToGatewayQueue
}


var https = require('follow-redirects').https;
const sendM = require("./sendMessage.js");
var access_token
var orderId
var orders = {}

function authorize() {
    var postData = stringify({
        'grant_type': 'client_credentials',
        'client_secret': payuConfig.client_secret,
        'client_id': payuConfig.client_id
    });
    var options = {
        'method': 'POST',
        'hostname': 'secure.snd.payu.com',
        'path': '/pl/standard/user/oauth/authorize',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': payuConfig.cookie
        },
        'maxRedirects': 20
    };
    var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            access_token = JSON.parse(body.toString()).access_token
            console.log(access_token)
            // res1.status(200).json({ message: "Authorized" })
        });
        res.on("error", function (error) {
            console.error(error);
        });
    });
    req.write(postData);
    req.end();
}

function createOrder(req, access_token){
    var statusCode;
    var responseUrl;
    console.log(req.body)
    var extOrderId = req.body.extOrderId
    var id = extOrderId+"-"+(+new Date).toString(36)

    if(checkBuyer(req.body) & checkEvent(req.body)) {
        body = req.body
        var options = {
            'method': 'POST',
            'hostname': 'secure.snd.payu.com',
            'path': '/api/v2_1/orders',
            'headers': {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json',
                'Cookie': payuConfig.cookie
            },
            'maxRedirects': 1
        };
        var req = https.request(options, function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                var body1 = Buffer.concat(chunks);
                // console.log(res.responseUrl)
                responseUrl = res.responseUrl;
                // console.log(body.toString());
                if (res.statusCode != 200) {
                    console.log("error")
                    console.log(body1.toString())
                    res.status(res.statusCode).json({ message: "error" })
                }
                else {
                    statusCode = 302;
                    orderId = res.responseUrl.split('orderId=')[1].split('&')[0]
                    console.log("Order Id: " + orderId);
                    orders[id] = orderId
                    // res1.setHeader("Location", res.responseUrl);
                    // res.end();
                    sendMessageToGatewayQueue({
                        correlationId: request.correlationId,
                        emitedEvent: request.emitedEvent,
                        payload: {
                            status: statusCode,
                            body: {success:true, message:responseUrl}//, created_id: event._id}
                        }
                    });
                }
            });
            res.on("error", function (error) {
                console.error(error);
                sendMessageToGatewayQueue({
                    correlationId: request.correlationId,
                    emitedEvent: request.emitedEvent,
                    payload: {
                        status: 400,
                        body: {success:false, message: error}//, created_id: event._id}
                    }
                });
            });
        });
        var postData = JSON.stringify({
            "notifyUrl": "http://localhost:3010/api/paymentRecieved",
            // "notifyUrl": payuConfig.notifyUrl,
            "continueUrl": "http://localhost:3010/api/orderDetails/"+id,
            "customerIp": "127.0.0.1",
            "merchantPosId": payuConfig.merchantPosId,
            "description": body.eventName,
            "visibleDescription": body.des,
            "currencyCode": "PLN",
            "totalAmount": body.price,
            "products": [
                {
                    "name": body.ticketName,
                    "unitPrice": body.price,
                    "quantity": "1",
                    "listingDate": body.date
                }
            ],
            "buyer": {
                "email": body.email,
                "phone": body.phone,
                "firstName": body.fname,
                "lastName": body.lname,
                "delivery": {
                    "city": body.location,
                    "street": body.date
                }
            }
        });
        req.write(postData);
        req.end();
    } else {
        m = "incorrect input data"
        console.log(m);
        sendMessageToGatewayQueue({
            correlationId: request.correlationId,
            emitedEvent: request.emitedEvent,
            payload: {
                status: 400,
                body: {success:false, message: m}//, created_id: event._id}
            }
        });
    }    
}

function orderDetails(params, access_token) {
    id = params.body;
    console.log(id + " " + orders[id]);
    var options = {
        'method': 'GET',
        'hostname': 'secure.snd.payu.com',
        'path': '/api/v2_1/orders/' + orders[id],
        'headers': {
            'Authorization': 'Bearer ' + access_token,
            'Cookie': payuConfig.cookie
        },
        'maxRedirects': 20
    };

    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            body = JSON.parse(body.toString())
            // res.status(200).json(body);
            buyer = body.orders[0].buyer;
            m = {
                'LastName': buyer.lastName,
                'FirstName': buyer.firstName,
                'Email': buyer.email,
                'EventName': body.orders[0].products[0].name,
                'EventDate': buyer.delivery.street,
                'EventLocation': buyer.delivery.city,
                'EventId': id.split("-")[0],
                "Status": body.orders[0].status
            }
            message = JSON.stringify(m)
            console.log(body.orders[0].status)
            if (body.orders[0].status == 'COMPLETED') {
                sendM.sendMessage(message, '127.0.0.1', 'UserSignedInForEvent');
                sendMessageToGatewayQueue({
                    correlationId: request.correlationId,
                    emitedEvent: request.emitedEvent,
                    payload: {
                        status: 301,
                        body: {success:true, message: m, address: "http://localhost:4200/paymentResult"}
                    }
                });
            }
        });
        res.on("error", function (error) {
            console.error(error);
            sendMessageToGatewayQueue({
                correlationId: request.correlationId,
                emitedEvent: request.emitedEvent,
                payload: {
                    status: 400,
                    body: {success:false, message: "error"}
                }
            });
        });
    })
    req.end();
}
