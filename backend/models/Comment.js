// models/Comment.js
import mongoose from "mongoose";

const binhLuanSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
  },
  MaSP: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sanpham",
    required: true,
  },
  NoiDung: {
    type: String,
    required: true,
  },
  DanhGia: {
    type: Number,
    required: true,
  },
  Reply: {
    Content: { type: String },
    Date: { type: Date },
    AdminEmail: { type: String },
  },
  NgayBL: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false, // Mặc định là chưa duyệt
  },
});

const Binhluan = mongoose.model("binhluan", binhLuanSchema);
export default Binhluan;