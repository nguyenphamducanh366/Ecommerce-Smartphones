import mongoose from "mongoose";
import thuonghieu from "../models/ThuongHieu.js";
import sanpham from "../models/SanPham.js";

// Khởi tạo class
class ThuongHieuController {
  // Lấy danh sách thương hiệu
  async apiList(req, res) {
    try {
      const thuongHieus = await thuonghieu.find();
      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: thuongHieus,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

 
  async apiDelete(req, res) {
    try {
      const id = req.params.id;
  
      // Kiểm tra ID có hợp lệ hay không
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "ID không hợp lệ.",
        });
      }
  
      
      const thuongHieu = await thuonghieu.findById(id);
  
      if (!thuongHieu) {
        return res.status(404).json({
          message: "Không tìm thấy thương hiệu.",
        });
      }
  
      // Kiểm tra xem có sản phẩm nào liên quan đến thương hiệu này với tổng số lượng > 0
      const relatedProducts = await sanpham.find({ TenTH: thuongHieu.TenTH });
  
      // Tính tổng số lượng của tất cả các sản phẩm liên quan
      const totalStock = relatedProducts.reduce((sum, product) => {
        return sum + (product.SoLuong1 || 0) + (product.SoLuong2 || 0) + (product.SoLuong3 || 0);
      }, 0);
  
      if (totalStock > 0) {
        return res.status(400).json({
          message: "Không thể xóa thương hiệu vì vẫn còn sản phẩm có số lượng lớn hơn 0 thuộc thương hiệu này.",
          totalStock,
        });
      }
  
      // Xóa thương hiệu
      const deletedThuongHieu = await thuonghieu.findByIdAndDelete(id);
  
      if (!deletedThuongHieu) {
        return res.status(404).json({
          message: "Không tìm thấy thương hiệu để xóa.",
        });
      }
  
      res.status(200).json({
        message: "Xóa thành công",
        data: deletedThuongHieu,
      });
    } catch (error) {
      console.error("Lỗi khi xóa thương hiệu:", error);
      res.status(500).json({
        message: "Lỗi khi xóa",
        error: error.message,
      });
    }
  }
  

  // Lấy chi tiết 1 thương hiệu
  async apiDetail(req, res) {
    try {
      const { id } = req.params;

      const thuongHieu = await thuonghieu.findById(id);

      if (!thuongHieu) {
        return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
      }

      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: thuongHieu,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

  // Tạo mới thương hiệu
  async apiCreate(req, res) {
    try {
      const { TenTH, HinhAnh, Mota } = req.body;

      const newThuongHieu = await thuonghieu.create({
        TenTH,
        HinhAnh,
        Mota,
      });

      res.status(201).json({
        message: "Thêm thương hiệu thành công!",
        data: newThuongHieu,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi tạo thương hiệu!",
        error: error.message,
      });
    }
  }

  // Cập nhật thương hiệu
  async apiUpdate(req, res) {
    try {
      const id = req.params.id;
      const { TenTH, HinhAnh, Mota } = req.body;

      const thuongHieu = await thuonghieu.findByIdAndUpdate(
        id,
        { TenTH, HinhAnh, Mota },
        { new: true }
      );

      res.status(200).json({
        message: "Cập nhật thương hiệu thành công!",
        data: thuongHieu,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi cập nhật!",
        error: error.message,
      });
    }
  }
}

export default ThuongHieuController;
