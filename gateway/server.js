const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require('./swagger.json')
const queue = require("./queue.js")

queue.init()

const app = express();

app.use("/docs/", swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

app.use(function (err, req, res, next) {
  var responseData;

  if (err.name === "JsonSchemaValidation") {
    // Log the error however you please
    console.log(JSON.stringify(err.message));
    // logs "express-jsonschema: Invalid data found"

    // Set a bad request http response status or whatever you want
    res.status(400);

    // Format the response body however you want
    responseData = {
      statusText: "Bad Request",
      jsonSchemaValidation: true,
      validations: err.validations, // All of your validation information
    };

    // Take into account the content type if your app serves various content types
    if (req.xhr || req.get("Content-Type") === "application/json") {
      res.json(responseData);
    } else {
      // If this is an html request then you should probably have
      // some type of Bad Request html template to respond with
      res.render("badrequestTemplate", responseData);
    }
  } else {
    // pass error to next error middleware handler
    next(err);
  }
});
app.use(bodyParser.json());
app.use(express.json())

app.use("/api/", require("./routes/notifications.js"));

const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.debug("Server listening on port: " + PORT);
