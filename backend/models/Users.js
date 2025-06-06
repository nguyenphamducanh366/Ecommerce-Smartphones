import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  MaND: {
    type: String,
  },
  HoVaTen: {
    type: String,
  },
  Avata:{
    type: String,
  },
  GioiTinh: {
    type: String,
  },
  SDT: {
    type: Number,
    unique: true,
  },
  Email: {
    type: String,
    unique: true,
  },
  DiaChi: {
    type: String,
  },
  TaiKhoan: {
    type: String,
    unique: true,
  },
  MatKhau: {
    type: String,
    unique: true,
  },
  MaQuyen: {
    type: Number,
  },
  TrangThai: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Add error handling for duplicate keys
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} đã tồn tại`));
  } else {
    next(error);
  }
});

const Users = mongoose.model("users", userSchema);
export default Users;