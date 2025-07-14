const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/contact
router.post('/', contactController.submitContactMessage);

// GET /api/contact
router.get('/', authMiddleware, contactController.getAllContactMessages);

// DELETE /api/contact/:id
router.delete('/:id', authMiddleware, contactController.deleteContactMessage);

module.exports = router;