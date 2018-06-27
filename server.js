const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');

const app = express();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const PORT = process.env.PORT || 4000;

app.use(cors());

//Logging
if (!process.env.TEST_DATABASE) {
  app.use(morgan('dev'));
}
//Parsing
app.use(bodyParser.json());

// errorhandler
app.use(errorhandler());

// Import and mount the employeeRouter
const employeeRouter = require('./employees.js');
app.use('/api/employees', employeeRouter);

// Import and mount the menuRouter
const menuRouter = require('./menu.js');
app.use('/api/menus', menuRouter);


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
