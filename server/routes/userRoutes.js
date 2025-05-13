import express from 'express';
import {
  getAllUsers,
  getUsersWithPagination,
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  register,
  checkDuplicate,
  logout,
  forgotPassword,
  resetPassword,
  getUserMe,
  refreshToken,
  loginWithGoogle,
} from '../controllers/userController.js';
import { verifyMidedleware } from '../middlewares/verifytoken.js';

const router = express.Router();

router.get("/me", verifyMidedleware.verifyToken, getUserMe)
router.get('/', getAllUsers);
router.get('/paginated', getUsersWithPagination);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', login);
router.post('/register', register);
router.post('/check-duplicate', checkDuplicate);
router.post('/logout', verifyMidedleware.verifyToken, logout); 
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post("/forgotpassword", forgotPassword)
router.post("/resetpassword", resetPassword)
router.post("/refresh-token", refreshToken)
router.post("/login-google", loginWithGoogle)

export default router;