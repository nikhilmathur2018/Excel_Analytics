const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { saveAnalysisSession, getUserAnalysisHistory } = require('../controllers/analysisController');

const router = express.Router();

router.post('/', protect, saveAnalysisSession);
router.get('/', protect, getUserAnalysisHistory); // This line is correct as is (no comma needed between '/' and protect)

module.exports = router;