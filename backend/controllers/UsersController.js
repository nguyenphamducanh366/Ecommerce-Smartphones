import Users from "../models/Users.js";
import HoaDon from "../models/HoaDon.js";
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

class UsersController {
  async apiList(req, res) {
    try {
      const users = await Users.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async apiDetail(req, res) {
    try {
      const user = await Users.findById(req.params.id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Không thấy tài khoản' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async apiDelete(req, res) {
    try {
      const id = req.params.id;
      const user = await Users.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      res.status(200).json({ message: "Xoá người dùng thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  

  async apiSignUp(req, res) {
    const signUpSchema = Joi.object({
      HoVaTen: Joi.string().required(), 
      SDT: Joi.string().required(), 
      Email: Joi.string().email().required(), 
      DiaChi: Joi.string().required(),
      MatKhau: Joi.string().min(6).required(), 
      confirmPassword: Joi.string().min(6).required(),
    }).options({ abortEarly: false });
  
    try {
      const { error } = signUpSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).json({ message: errorMessages });
      }
  
      if (req.body.confirmPassword !== req.body.MatKhau) {
        return res.status(400).json({ message: 'Mật khẩu và xác nhận mật khẩu không khớp' });
      }

      const existingFields = await Users.findOne({
        $or: [
          { Email: req.body.Email },
        ]
      });
      if (existingFields) {
        let message = '';
        if (existingFields.Email === req.body.Email) {
          message = 'Email đã tồn tại';
        }
        return res.status(400).json({ message });
      }
  
      const hashedPassword = await bcrypt.hash(req.body.MatKhau, 10);
      const newUser = new Users({
        MaND: new mongoose.Types.ObjectId().toString(),
        HoVaTen: req.body.HoVaTen,
        GioiTinh: 'Nam',
        SDT: req.body.SDT,
        Email: req.body.Email,
        DiaChi: req.body.DiaChi,
        TaiKhoan: req.body.HoVaTen, 
        MatKhau: hashedPassword,
        MaQuyen: 0,
        TrangThai: 1
      });
  
      const savedUser = await newUser.save();
  
      res.status(201).json({
        id: savedUser._id,
        Email: savedUser.Email
      });
    } catch (error) {
      if (error.message.includes('đã tồn tại')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
  
  async apiLogin(req, res) {
    const loginSchema = Joi.object({
      Email: Joi.string().required(),
      MatKhau: Joi.string().required()
    }).options({ abortEarly: false });
    
    try {
      const { error } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const user = await Users.findOne({ Email: req.body.Email });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      const validPassword = await bcrypt.compare(req.body.MatKhau, user.MatKhau);
      if (!validPassword) {
        return res.status(401).json({ message: 'Mật khẩu không chính xác' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        user: {
          id: user._id,
          Email: user.Email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async apiUpdate(req, res) {
    try {
      const user = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (user) {
        res.json({ message: 'Cập nhật thông tin thành công!' }); 
      } else {
        res.status(404).json({ message: 'Không thấy tài khoản' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async apiForgotPassword(req, res) {
    const { Email } = req.body;
    try {
      const user = await Users.findOne({ Email });
      if (!user) {
        return res.status(404).json({ message: 'Email không tồn tại' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ 
        message: 'Xác Nhận Email thành công, bạn sẽ được chuyển hướng đến trang đặt lại mật khẩu.', 
        token 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async apiResetPassword(req, res) {
    const { token, MatKhau } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      const hashedPassword = await bcrypt.hash(MatKhau, 10);
      user.MatKhau = hashedPassword;
      await user.save();

      res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async apiUpdatePassword(req, res) {
    const { id } = req.params; 
    const { MatKhau } = req.body;
    try {
      const user = await Users.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      const hashedPassword = await bcrypt.hash(MatKhau, 10);
      const updatePassword = await Users.findByIdAndUpdate(
        id,
        { MatKhau: hashedPassword },
        { new: true }
      );
  
      res.json({ message: 'Mật khẩu đã được cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UsersController;
