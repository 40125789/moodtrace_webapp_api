const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' });
const router = require ('./routes/moodroutes');
const userrouter = require('./routes/userroutes');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const apiKey = process.env.API_KEY 

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', userrouter);
app.use(bodyParser.json());
app.use(cors());


app.use('/', router);

app.listen(process.env.PORT, (err) => {
    if (err) return console.log(err);

    console.log(`Express listening on port ${process.env.PORT}`);
});


