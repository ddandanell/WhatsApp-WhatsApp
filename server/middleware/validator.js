const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Knowledge validation rules
const knowledgeValidation = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().trim(),
    body('tags').optional().trim(),
    validate
  ],
  update: [
    param('id').isInt().withMessage('Invalid ID'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().trim(),
    body('tags').optional().trim(),
    validate
  ],
  delete: [
    param('id').isInt().withMessage('Invalid ID'),
    validate
  ]
};

// Settings validation rules
const settingsValidation = {
  update: [
    body('auto_reply_enabled').optional().isIn(['true', 'false']),
    body('response_delay').optional().isInt({ min: 0, max: 300 }),
    body('active_hours_start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('active_hours_end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('response_mode').optional().isIn(['always', 'smart', 'manual']),
    body('ai_temperature').optional().isFloat({ min: 0, max: 1 }),
    body('system_prompt').optional().trim(),
    validate
  ]
};

module.exports = {
  validate,
  knowledgeValidation,
  settingsValidation
};

