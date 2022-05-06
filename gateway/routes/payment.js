const express = require("express");
const router = express.Router();
var validate = require('express-jsonschema').validate;

router.get("/", function (req, res) {
    // #swagger.tags = ['Payments'] 
    // #swagger.description = 'Test description'
	console.log("payment request")
});

module.exports = router;