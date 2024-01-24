const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'new_schema'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Logout endpoint
app.get('/logout', (req, res) => {
  // Perform logout actions here (e.g., destroy session, clear cookies, etc.)

  // Redirect to the main page
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/signup', async (req, res) => {
  console.log(req.body);
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check for the condition to determine the role
    const isAdmin = email.endsWith('@admin.com');
    const role = isAdmin ? 'admin' : 'regularUser';

    const sql = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [first_name, last_name, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('User registered:', result);
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request:', { email, password });

  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    //console.log('Results from database:', results);

    if (results.length > 0) {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

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
    } else {
      res.send('User not found. Please sign up.');
    }
  });
});

// Endpoint to get all users
app.get('/api/allUsers', (req, res) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

// Endpoint to handle user edits
app.post('/api/editUser', (req, res) => {
  let rawData = '';
  req.on('data', (chunk) => {
    rawData += chunk;
  });

  req.on('end', () => {
    try {
      const { first_name, last_name, email, new_email } = JSON.parse(rawData);

      // Log the received edit request
      console.log('Received edit request:', { first_name, last_name, email, new_email });

      // Update the user's information including the email address
      const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE email = ?';
      console.log('SQL Statement:', sql, 'Values:', [first_name, last_name, new_email, email]);

      connection.query(sql, [first_name, last_name, new_email, email], (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
          return;
        }

        if (result.affectedRows === 0) {
          console.error('No user found with the provided email:', email);
          res.status(404).json({ success: false, error: 'User not found' });
          return;
        }

        res.json({ success: true });
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(400).json({ success: false, error: 'Invalid JSON format' });
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
