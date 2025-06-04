import SanPham from "../models/SanPham.js";
import { v2 as cloudinary } from 'cloudinary';
import { io } from "../server.js";

class SanPhamController {
  // API lấy danh sách sản phẩm
  async apiList(req, res) {
    try {
      const sanPhams = await SanPham.find().exec();
      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: sanPhams,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

  // API xóa sản phẩm
  async apiDelete(req, res) {
    try {
      const id = req.params.id;
      const deletedSanPham = await SanPham.findByIdAndDelete(id);
      
      // Phát sự kiện socket khi xóa sản phẩm
      io.emit("productDeleted", { id });
      
      res.status(200).json({
        message: "Xóa sản phẩm thành công",
        data: deletedSanPham,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi xóa sản phẩm",
        error: error.message,
      });
    }
  }

  // API lấy chi tiết sản phẩm
  async apiDetail(req, res) {
    try {
      const { id } = req.params;
      const sanPham = await SanPham.findById(id).exec();

      if (!sanPham) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: sanPham,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu sản phẩm",
        error: error.message,
      });
    }
  }

  // API tạo sản phẩm
  async apiCreate(req, res) {
    try {
      const newSanPham = await SanPham.create(req.body);
      // Phát sự kiện socket tới tất cả client khi sản phẩm được tạo
      io.emit("productCreated", newSanPham);
      res.status(201).json({
        message: "Thêm sản phẩm thành công!",
        data: newSanPham,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi tạo sản phẩm!",
        error: error.message,
      });
    }
  }

  // API cập nhật sản phẩm
  async apiUpdate(req, res) {
    try {
      const id = req.params.id;
      const updatedSanPham = await SanPham.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedSanPham) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      // Phát sự kiện socket tới tất cả client
      io.emit("productUpdated", updatedSanPham);

      res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        data: updatedSanPham,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi cập nhật sản phẩm!",
        error: error.message,
      });
    }
  }

  // API cập nhật trạng thái sản phẩm
  async apiUpdateStatus(req, res) {
    try {
      const id = req.params.id;
      const { TrangThai } = req.body;

      const updatedSanPham = await SanPham.findByIdAndUpdate(
        id,
        { TrangThai },
        { new: true }
      );

      if (!updatedSanPham) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      // Phát sự kiện socket khi cập nhật trạng thái
      io.emit("productStatusUpdated", updatedSanPham);

      res.status(200).json({
        message: "Cập nhật trạng thái thành công!",
        data: updatedSanPham,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi cập nhật trạng thái sản phẩm",
        error: error.message,
      });
    }
  }

  // API upload ảnh
  async apiUpload(req, res) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      console.log('Received file:', req.files.image);

      const { image } = req.files;
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: 'phone_store',
        resource_type: 'auto'
      });

      console.log('Cloudinary upload result:', result);

      res.json({
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during upload',
        error: error.message
      });
    }
  }
}

export default SanPhamController;