const express =require('express'); //import express
const app=express();
const cors = require("cors");
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
// const errorMiddleware = require('./middlewares/errors')
const morgan = require('morgan');
const fs = require('fs');
// app.use(cors());
const dotenv = require('dotenv');
dotenv.config({path: 'config/config.env'})
app.use(cors({
  origin: '*', // replace with the allowed origin domain
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // add any additional headers required by the application
}));


const path = require('path');
// app.use('/uploads', express.static('uploads'));
const multer  = require('multer');

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// const swaggerJsDoc = require("swagger-jsdoc");
// Create a write stream for logging HTTP requests to a file
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), { flags: 'a' }
);
// app.use(express.urlencoded({ extended: true }));
  // Set up Morgan middleware to log HTTP requests to the file stream
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json({limit : "2mb"}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended:true}));
app.use(fileUpload());
// Import all routes
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const payment = require('./routes/payment');


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PETSTORE API",
      version: "1.0.0",
      description: "A simple Express Library API"
    },
    servers: [
      {
        url: "http://localhost:4000"
      }
    ]
  },
  apis: ["/controllers/.*.js","/routes/*.js"]
};

// const specs = swaggerJsDoc(options);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use('/api/v1',products)
app.use('/api/v1',auth)
app.use('/api/v1',order)
app.use('/api/v1',payment)

app.use(bodyParser.text({ type: '/' }));




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

app.post('/mohan', upload.single('file'), (req, res) => {
  console.log(req.body);
  if (!req.file) {
    // Handle the case where no file was uploaded
    return res.status(404).send('No file was uploaded');
  }

  // Process the uploaded file
  console.log(req.file);8
  res.send('File uploaded successfully');
});


// Middleware to handle errors
// app.use(errorMiddleware);





module.exports=app