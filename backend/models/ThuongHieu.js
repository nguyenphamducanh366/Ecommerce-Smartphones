import mongoose from "mongoose";

const ThuongHieuSchema = new mongoose.Schema({
  TenTH: { type: String, required: true },
  HinhAnh: { type: String },
  Mota: { type: String },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("ThuongHieu", ThuongHieuSchema);
