const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv()
addFormats(ajv)

const buyer_schema = {
  // "$schema": "https://json-schema.org/draft/2020-12/schema",
  // "$id": "https://example.com/buyer.schema.json",
  // "title": "Buyer",
  // "description": "Person buying a ticket",
  "type": "object",
  "properties": {
    "buyerId": {
      "description": "The unique identifier for a buyer",
      "type": "integer"
    },
    "email": {
      "description": "Email address",
      "type": "string",
      "format": "email"
    },
    "phone": {
      "description": "Phone number",
      "type": "string",
      "pattern":"^[0-9]{9}$"
    },
    "firstName":{
      "description": "Buyer's first name",
      "type": "string",
      "minLength": 2
    },
    "lastName": {
      "description": "Buyer's last name",
      "type": "string",
      "minLength": 2
    }
  },
  "required": [ "buyerId", "email", "phone", "firstName", "lastName" ]
}

const event_schema = {
  // "$schema": "https://json-schema.org/draft/2020-12/schema",
  // "$id": "https://example.com/event.schema.json",
  // "title": "Event",
  // "description": "Airsoft event",
  "type": "object",
  "properties": {
    "eventId": {
      "description": "The unique identifier for the event",
      "type": "integer"
    },
    "eventName":{
      "description": "Name of the event",
      "type": "string",
      "minLength": 2
    },
    "ticketName": {
      "description": "Name of the ticket",
      "type": "string",
      "minLength": 2
    },
    "description": {
      "description": "Description of the event",
      "type": "string",
      "minLength": 2
    },
    "location": {
      "description": "Location of the event",
      "type": "string",
      "minLength": 2
    },
    "price":{
      "description": "Price of the event in gr",
      "type": "integer",
      "exclusiveMinimum": 100
    },
    "date": {
      "description": "Date of the event",
      "type": "string",
      "format": "date-time"
    },
  },
  "required": [ "eventId", "eventName", "ticketName", "description", "location", "price", "date" ]
}

function checkBuyer(data){
  const dataB = {
    buyerId: 1, 
    email: data.email, 
    phone: data.phone, 
    firstName: data.fname, 
    lastName: data.lname
  }
  const valid = ajv.validate(buyer_schema, dataB)
  if (!valid) {
    console.log(ajv.errors)
    return false
  }
  return true
}

function checkEvent(data){
  const dataE = {
    eventId: 1,  
    eventName: data.eventName, 
    ticketName: data.ticketName,
    description: data.des,
    location: data.location,
    price: parseInt(data.price),
    date: data.date
  }
  const valid1 = ajv.validate(event_schema, dataE)
  if (!valid1) {
    console.log(ajv.errors)
    return false
  }
  return true
}

module.exports = {
  checkBuyer,
  checkEvent
}
