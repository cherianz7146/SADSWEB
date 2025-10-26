const { body, validationResult } = require('express-validator');

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', details: errors.array() });
    }
    next();
  }
];

const createUserRules = () => validate([
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]);

module.exports = { validate, createUserRules };