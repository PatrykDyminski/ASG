const swaggerAutogen = require('swagger-autogen')()


const options = {
    info: {
        version: "1.0.0",
        title: "ASG API",
        description: "API gateway for ASG project"
    },
    host: "localhost:3000",
    basePath: "/api/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "Notifications",
            "description": "Endpoints"
        },
        {
            "name": "Payments",
            "description": "Endpoints"
        }
    ],
    definitions: {
        Notification: {
            topic: "Przypomnienie o wydarzeniu",
            email: "example@email.com",
            message: "Przypominamy o nadchodzącym wydarzeniu"
        },
        Payment: {
            user: {
                email: "example@email.com",
                name: "Andrzej Kowalski"
            },
            amount: 29.90,
            currency: "pln"
        }
    }
  };

const outputFile = './swagger.json'
const endpointsFiles = ['./routes/notifications.js', './routes/payment.js']

swaggerAutogen(outputFile, endpointsFiles, options)