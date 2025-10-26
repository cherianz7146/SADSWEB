require('dotenv').config();
const mongoose = require('mongoose');
const { mongoUri } = require('./config/constants');

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the register function
const { register } = require('./controllers/authcontroller');

// Mock request and response objects
const mockReq = {
  body: {
    name: 'Test Registration User',
    email: 'test-registration@example.com',
    password: 'testpassword123'
  }
};

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response status:', this.statusCode);
    console.log('Response data:', data);
    return this;
  }
};

console.log('Testing registration process...');

// Test the registration function
register(mockReq, mockRes)
  .then(() => {
    console.log('Registration test completed');
    setTimeout(() => {
      console.log('Waiting a few seconds for email to be sent...');
      process.exit(0);
    }, 5000);
  })
  .catch(err => {
    console.error('Registration test failed:', err);
    process.exit(1);
  });