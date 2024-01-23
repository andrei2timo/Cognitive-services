const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

const connection = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host
  user: 'root', // Replace with your MySQL user
  password: '', // Replace with your MySQL password
  database: 'new_schema' // Replace with your MySQL database name
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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/signup', async (req, res) => {
  
  console.log(req.body); // Add this line to log the request body
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    connection.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
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
  
      console.log('Results from database:', results);
  
      if (results.length > 0) {
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (passwordMatch) {
          // Redirect to a new HTML file for cognitive services options
          res.sendFile(__dirname + '/public/cognitiveServicesOptions.html');
        } else {
          res.send('Invalid password!');
        }
      } else {
        res.send('User not found. Please sign up.');
      }
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
