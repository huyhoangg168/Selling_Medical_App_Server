require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const globalErrorHandler = require('../src/controllers/ErrorController');
const route = require('./routes');
const rateLimit = require('express-rate-limit');

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

// Layer 1: Global Rate Limit - Giới hạn 100 request/15 phút mỗi IP
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 phút
	max: 100, // Limit each IP to 100 requests per `window`
	standardHeaders: true, 
	legacyHeaders: false, 
    message: {
        status: 429,
        message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút"
    }
});

// Apply cho tất cả routes
app.use(globalLimiter);