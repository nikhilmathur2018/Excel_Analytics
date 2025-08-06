const express=require('express');
const {getAiSummary} =require('../controllers/aiController');
const {protect} =require('../middleware/authMiddleware');

const router=express.Router();

router.post('/summary',protect,getAiSummary);

module.exports=router;

