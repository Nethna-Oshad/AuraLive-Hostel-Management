const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, updateMessageStatus } = require('../controllers/contactController');

router.post('/', submitMessage);
router.get('/', getMessages); 
router.patch('/:id', updateMessageStatus);

module.exports = router;