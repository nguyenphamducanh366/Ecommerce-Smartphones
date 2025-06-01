import mongoose from "mongoose";

const DanhGiaSchema = new mongoose.Schema({
    Ten: { type: String },
    NoiDung: { type: String },
    DanhGia: { type: String },
    created_at: { type: Date, default: Date.now },
    SanPham: { type: String },
    HinhAnh1: { type: String },
    HinhAnh2: { type: String },
    HinhAnh3: { type: String },
    isApproved: { type: Boolean, default: false }, // Thêm trường này
});

const danhgia = mongoose.model("DanhGia", DanhGiaSchema);
export default danhgia;