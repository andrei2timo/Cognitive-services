"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var mysql = require('mysql');

var bcrypt = require('bcrypt');

var _require = require('child_process'),
    spawn = _require.spawn;

var app = express();
var PORT = 3000;
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'new_schema'
});
connection.connect(function (err) {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL database');
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express["static"]('public'));
app.use('/images', express["static"]('images')); // Logout endpoint

app.get('/logout', function (req, res) {
  // Perform logout actions here (e.g., destroy session, clear cookies, etc.)
  // Redirect to the main page
  res.redirect('/');
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/signup', function _callee(req, res) {
  var _req$body, first_name, last_name, email, password, hashedPassword, isAdmin, role, sql;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req.body);
          _req$body = req.body, first_name = _req$body.first_name, last_name = _req$body.last_name, email = _req$body.email, password = _req$body.password;
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 5:
          hashedPassword = _context.sent;
          // Check for the condition to determine the role
          isAdmin = email.endsWith('@admin.com');
          role = isAdmin ? 'admin' : 'regularUser';
          sql = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
          connection.query(sql, [first_name, last_name, email, hashedPassword, role], function (err, result) {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).send('Internal Server Error');
              return;
            }

            console.log('User registered:', result);
            res.redirect('/');
          });
          _context.next = 16;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](2);
          console.error('Error hashing password:', _context.t0);
          res.status(500).send('Internal Server Error');

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 12]]);
});
app.post('/login', function _callee3(req, res) {
  var _req$body2, email, password, sql;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          console.log('Login request:', {
            email: email,
            password: password
          });
          sql = 'SELECT * FROM users WHERE email = ?';
          connection.query(sql, [email], function _callee2(err, results) {
            var user, passwordMatch;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!err) {
                      _context2.next = 4;
                      break;
                    }

                    console.error('Error querying user:', err);
                    res.status(500).send('Internal Server Error');
                    return _context2.abrupt("return");

                  case 4:
                    if (!(results.length > 0)) {
                      _context2.next = 12;
                      break;
                    }

                    user = results[0];
                    _context2.next = 8;
                    return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

                  case 8:
                    passwordMatch = _context2.sent;

                    if (passwordMatch) {
                      // Check user role and redirect accordingly
                      if (user.role === 'admin') {
                        res.sendFile(__dirname + '/public/adminOptions.html');
                      } else if (user.role === 'regularUser') {
                        res.sendFile(__dirname + '/public/userOptions.html');
                      } else {
                        res.send('Invalid user role!');
                      }
                    } else {
                      // Redirect to invalidPassword.html
                      res.sendFile(__dirname + '/public/invalidPassword.html');
                    }

                    _context2.next = 13;
                    break;

                  case 12:
                    res.send('User not found. Please sign up.');

                  case 13:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // Endpoint to get all users

app.get('/api/allUsers', function (req, res) {
  var sql = 'SELECT * FROM users';
  connection.query(sql, function (err, results) {
    if (err) {
      console.error('Error querying users:', err);
      res.status(500).json({
        error: 'Internal Server Error'
      });
      return;
    }

    res.json(results);
  });
}); // Endpoint to handle user edits

app.post('/api/editUser', function (req, res) {
  var rawData = '';
  req.on('data', function (chunk) {
    rawData += chunk;
  });
  req.on('end', function () {
    try {
      var _JSON$parse = JSON.parse(rawData),
          first_name = _JSON$parse.first_name,
          last_name = _JSON$parse.last_name,
          email = _JSON$parse.email,
          new_email = _JSON$parse.new_email; // Log the received edit request


      console.log('Received edit request:', {
        first_name: first_name,
        last_name: last_name,
        email: email,
        new_email: new_email
      }); // Update the user's information including the email address

      var sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE email = ?';
      console.log('SQL Statement:', sql, 'Values:', [first_name, last_name, new_email, email]);
      connection.query(sql, [first_name, last_name, new_email, email], function (err, result) {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
          return;
        }

        if (result.affectedRows === 0) {
          console.error('No user found with the provided email:', email);
          res.status(404).json({
            success: false,
            error: 'User not found'
          });
          return;
        }

        res.json({
          success: true
        });
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid JSON format'
      });
    }
  });
}); // Use body-parser middleware

app.use(bodyParser.json());
app.post('/api/translate', function _callee4(req, res) {
  var _req$body3, input_language, output_language, input_text, pythonProcess, translatedText;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body3 = req.body, input_language = _req$body3.input_language, output_language = _req$body3.output_language, input_text = _req$body3.input_text; // Log the values to check if they are received correctly

          console.log("Received request with values:", input_language, output_language, input_text); // Execute the translation Python script

          pythonProcess = spawn('python', ['translate.py', input_language, output_language, input_text]); // Collect data from the script's output

          translatedText = '';
          pythonProcess.stdout.on('data', function (data) {
            translatedText += data.toString();
          }); // Handle script completion

          pythonProcess.on('close', function (code) {
            if (code === 0) {
              try {
                var result = JSON.parse(translatedText);
                res.json({
                  translated_text: result
                });
              } catch (error) {
                res.status(500).json({
                  error: 'Invalid JSON format received from the translation script.'
                });
              }
            } else {
              res.status(500).json({
                error: 'Translation failed.'
              });
            }
          });

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.listen(PORT, function () {
  console.log("Server is running at http://localhost:".concat(PORT));
});