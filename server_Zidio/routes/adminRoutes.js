const express=require('express');
const {getAllUsers,deleteUser,updateUserRole}=require('../controllers/adminController');
const {protect,admin}=require('../middleware/authMiddleware');
const router=express.Router();

router.get('/users',protect,admin,getAllUsers);
router.delete('/users/:id',protect,admin,deleteUser);
router.put('/users/:id/role',protect,admin,updateUserRole);

module.exports=router;

