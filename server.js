const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const apiRouter = require('./api/api');

app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Listening hard on port ${PORT}! Woo hoo!`);
});

module.exports = app;
