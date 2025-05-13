import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import verification from '../utils/sendEmail.js';
import dotenv from 'dotenv'
dotenv.config()


const generateToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2d' });
}

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' });
}

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments();

    res.json({
      users: users || [], 
      total: total || 0, 
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      message: err.message,
      users: [],
      total: 0
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    Object.assign(user, req.body);
    const updatedUser = await user.save();
    res.json(updatedUser); // Trả về user đã cập nhật
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.deleteOne({ _id: req.params.id }); // Xóa user
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const login = async (req, res) => {
  const { phone, password } = req.body;
  

  try {
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(401).json({ message: 'Số điện thoại không tồn tại.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
    }

    user.status = 'Active';
    user.lastActive = new Date();

    const userpayload = {
      id: user._id,
      role: user.role,
    }
    const accessToken = await generateToken(userpayload);
    const refreshToken = await generateRefreshToken(userpayload);
    await user.save();

    const userData = {
      ...user.toObject()
    }

    res.cookie('accessToken', accessToken, {
      maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN),
      httpOnly: true,
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN),
      httpOnly: true,
    });

    

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Không có refresh token' });
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });

      const user = await User.findById(decoded.id);
      
      if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

      const payload = { id: user._id, role: user.role };
      const newAccessToken = generateToken(payload);

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN),
      });

      res.status(200).json({ message: 'Access token đã được cấp lại' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi làm mới token' });
  }
};


export const logout = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'Inactive';
    user.lastActive = new Date();
    await user.save();

    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({ success: true, message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const checkDuplicate = async (req, res) => {
  const { phone, email } = req.body;

  try {
    const duplicateEmail = await User.findOne({ email });
    const duplicatePhone = await User.findOne({ phone });

    res.json({
      duplicateEmail: !!duplicateEmail,
      duplicatePhone: !!duplicatePhone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export const register = async (req, res) => {
  const { fullName, phone, email, birthDate, password, avatar } = req.body;
  const hashedPassword = await hashPassword(password);

  try {
    const user = new User({
      fullName,
      phone,
      email,
      birthDate,
      password: hashedPassword,
      role: "user",
      avatar
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getUsersWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments();

    res.json({
      users: users || [],
      total: total || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching users with pagination:', err);
    res.status(500).json({
      message: err.message,
      users: [],
      total: 0
    });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { searchTerm = "", status = "all", role = "all" } = req.query;

    let query = {};
    
    if (searchTerm) {
      query.$or = [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (status !== "all") {
      query.status = status;
    }

    if (role !== "all") {
      query.role = role;
    }

    const users = await User.find(query);
    const total = await User.countDocuments(query);

    res.json({
      users: users || [],
      total: total || 0,
    });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({
      message: err.message,
      users: [],
      total: 0,
    });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại.' });
    }

    const otp = await verification(email);

    if(!otp) {
      return res.status(500).json({ message: 'Gửi mã OTP thất bại.' });
    }

    res.status(200).json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn.', otp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


export const resetPassword = async (req, res) => {
  const {email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({success: true, message: 'Mật khẩu đã được thay đổi thành công.' });
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
}

export const getUserMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
}

export const loginWithGoogle = async (req, res) => {
  const { email, fullName, avatar } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        fullName,
        avatar,
        role: 'user',
        status: 'Active',
        type: 'google',
      });
      await user.save();
    }
    const userPayload = {
      id: user._id,
      role: user.role,
    }
    const accessToken = await generateToken(userPayload);
    const refreshToken = await generateRefreshToken(userPayload);
    res.cookie('accessToken', accessToken, {
      maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN),
      httpOnly: true,
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN),
      httpOnly: true,
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
