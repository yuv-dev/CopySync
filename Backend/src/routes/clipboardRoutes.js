const express = require('express');
const router = express.Router();
const { postClipboard, getClipboardHistory, toggleSync } = require('../controllers/clipboardController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);
router.post('/', postClipboard);
router.get('/', getClipboardHistory);
router.patch('/toggle-sync', toggleSync);

module.exports = router;
