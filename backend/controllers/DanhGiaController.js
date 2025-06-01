import danhgia from "../models/DanhGia.js";
import { io } from "../server.js";

class DanhGiaController {
  // Lấy danh sách đánh giá
  async apiList(req, res) {
    try {
      const danhGias = await danhgia.find();
      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: danhGias,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

  // Xóa đánh giá
  async apiDelete(req, res) {
    try {
      const id = req.params.id;
      const deletedDanhGia = await danhgia.findByIdAndDelete(id);
      if (!deletedDanhGia) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá",
        });
      }
      // Phát sự kiện Socket.IO khi xóa đánh giá
      io.emit("danhGiaDeleted", deletedDanhGia);
      res.status(200).json({
        message: "Xóa thành công",
        data: deletedDanhGia,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi xóa",
        error: error.message,
      });
    }
  }

  // Tạo mới đánh giá
  async apiCreate(req, res) {
    try {
      const data = req.body;
      const newDanhGia = await danhgia.create(data);
      // Phát sự kiện Socket.IO khi tạo đánh giá
      io.emit("danhGiaCreated", newDanhGia);
      res.status(200).json({
        message: "Tạo đánh giá thành công",
        data: newDanhGia,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi tạo đánh giá",
        error: error.message,
      });
    }
  }

  // Cập nhật đánh giá
  async apiUpdate(req, res) {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updatedDanhGia = await danhgia.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedDanhGia) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá",
        });
      }
      // Phát sự kiện Socket.IO khi cập nhật đánh giá
      io.emit("danhGiaUpdated", updatedDanhGia);
      res.status(200).json({
        message: "Cập nhật đánh giá thành công",
        data: updatedDanhGia,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi cập nhật đánh giá",
        error: error.message,
      });
    }
  }
}

export default DanhGiaController;