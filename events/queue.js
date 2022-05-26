const amqp = require('amqplib/callback_api');
const queueConfig = require('./queue.config.json');
var https = require('follow-redirects').https;
var Event = require('./models/event');
const { stringify } = require('querystring');
const payuConfig = require('./payu.config.json');

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
      console.log(req.body);
      Event.deleteOne({_id:req.body._id},function(error,result){
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
  else if (req.endpoint === "updateUserPayment") {
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
                    payload: {
                        body: {success:false,message:"Wystąpił błąd"}
                    }
                })
                }
                else{
                    sendMessageToGatewayQueue({
                        correlationId: request.correlationId,
                        payload: {
                            body: {success:true,message:"Zapisano opłatę"}
                        }
                    })
                }
    });
  }
  else if (req.endpoint === "payment/createOrder"){
    createOrder(req, access_token);
  }
  else if(req.endpoint == "orderDetails/1"){
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
    // console.log(req.body)
    // console.log(checkBuyer(req.body))
    // if (checkBuyer(req.body)) {
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
            responseUrl = res.responseUrl
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
                // res1.setHeader("Location", res.responseUrl);
                // res.end();
                sendMessageToGatewayQueue({
                    correlationId: request.correlationId,
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
                payload: {
                    status: 400,
                    body: {success:false, message: error}//, created_id: event._id}
                }
            });
        });
    });
    var postData = JSON.stringify({
        "notifyUrl": "http://localhost:3000/api/paymentRecieved",
        // "notifyUrl": payuConfig.notifyUrl,
        "continueUrl": "http://localhost:3000/api/orderDetails/1",
        "customerIp": "127.0.0.1",
        "merchantPosId": payuConfig.merchantPosId,
        "description": body.eventName,
        "visibleDescription": body.des,
        "currencyCode": "PLN",
        "totalAmount": body.price,
        "products": [
            {
                "name": "Bilet na Wydarzenie 1",
                "unitPrice": "10000",
                "quantity": "1"
            }
        ],
        "buyer": {
            "email": body.email,
            "phone": body.phone,
            "firstName": body.fname,
            "lastName": body.lname
        }
    });
    req.write(postData);
    req.end();
    // } else {
    //     res1.status(400).json({ message: "incorrect input data" })
    // }    
}

function orderDetails(params, access_token) {
    console.log(orderId);
    var options = {
        'method': 'GET',
        'hostname': 'secure.snd.payu.com',
        'path': '/api/v2_1/orders/' + orderId,
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
            message = JSON.stringify({
                'LastName': buyer.lastName,
                'FirstName': buyer.firstName,
                'Email': buyer.email,
                'EventName': body.orders[0].products[0].Name,
                'EventDate': '2020-05-07T00:00:00',
                'EventLocation': 'Wroclaw',
            })
            console.log(body.orders[0].status)
            if (body.orders[0].status == 'COMPLETED') {
                sendM.sendMessage(message, '127.0.0.1', 'UserSignedInForEvent');
                sendMessageToGatewayQueue({
                    correlationId: request.correlationId,
                    payload: {
                        status: 200,
                        body: {success:true, message:  message}
                    }
                });
            }
        });
        res.on("error", function (error) {
            console.error(error);
            sendMessageToGatewayQueue({
                correlationId: request.correlationId,
                payload: {
                    status: 400,
                    body: {success:false, message: "error"}
                }
            });
        });
    })
    req.end();
}
