const express = require("express");
const queue = require("../queue.js")
const router = express.Router();
var validate = require('express-jsonschema').validate;


var NotificationSchema = {
    type: 'object',
    properties: {
        "LastName": {
            type: 'string',
            required: true
        },
        "FirstName": {
            type: 'string',
            required: true
        },
        "Email": {
            type: 'string',
            required: true
        },
        "EventName": {
            type: 'string',
            required: true
        },
        "EventDate": {
            type: 'string',
            required: true
        },
        "EventLocation": {
            type: 'string',
            required: true
        }
    }
}

router.get("/test/", function (req, res) {
    console.log("Test")
})

router.post("/notifications/send/", validate({body: NotificationSchema}),  function (req, res) {
    // #swagger.tags = ['Notifications'] 
    // #swagger.description = 'Test description'

    let notification = JSON.stringify(req.body)
    queue.sendMessageToNotificationsQueue(notification)

    res.send('Notification send')
});

module.exports = router;