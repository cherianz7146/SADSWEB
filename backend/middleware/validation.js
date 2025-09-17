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
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
]);

module.exports = { validate, createUserRules };
