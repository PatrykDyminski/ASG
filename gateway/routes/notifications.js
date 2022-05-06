const express = require("express");
const queue = require("../queue.js")
const router = express.Router();
var validate = require('express-jsonschema').validate;


var NotificationSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            required: true
        },
        topic: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        }
    }
}

router.get("/test/", function (req, res) {
    console.log("Test")
})

router.post("/notifications/send/", validate({body: NotificationSchema}), function (req, res) {
    // #swagger.tags = ['Notifications'] 
    // #swagger.description = 'Test description'

    let notification = JSON.stringify(req.body)
    queue.sendMessage(notification)

    res.send('Notification send')
});

module.exports = router;