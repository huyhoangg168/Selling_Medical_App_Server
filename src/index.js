require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const globalErrorHandler = require('../src/controllers/ErrorController');
const route = require('./routes');

const sync = require('./scripts/sync')

const app = express();
const port = process.env.PORT;

// logger
app.use(morgan('combined'));


// config data input/output
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(bodyParser.json());

//Routes init
route(app);

//test domain
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//Global Error Handling Middleware
app.use(globalErrorHandler);

sync();


app.listen(port, () => {
  console.log(`app is running on  port ${port}`)
})