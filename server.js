const express = require('express');
const bodyParser = require('body-parser');
const { addSubmission, getSubmissions } = require('./storage');
const app = express();

// Configuration
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the main app shell for all routes
app.get(['/', '/register', '/success'], (req, res) => {
  res.render('index', { formData: {}, errors: {} });
});

app.post('/submit', (req, res) => {
  const { username, email, password, age } = req.body;
  const errors = {};

  // Enhanced server-side validation
  if (!username || username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (/[^a-zA-Z0-9_]/.test(username)) {
    errors.username = 'Only letters, numbers and underscores allowed';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else {
    const strength = checkPasswordStrength(password);
    if (strength < 2) { // Require at least "Medium" strength
      errors.password = 'Password is too weak (include numbers and special chars)';
    }
  }

  if (!age || age < 18 || age > 120) {
    errors.age = 'Age must be between 18 and 120';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const userData = { username, email, password: '***', age };
  addSubmission(userData);
  
  // Return success response with user data
  res.json({ 
    success: true, 
    userData, 
    submissions: getSubmissions(),
    redirect: '/success'
  });
});

// Helper function for password strength
function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
}

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});