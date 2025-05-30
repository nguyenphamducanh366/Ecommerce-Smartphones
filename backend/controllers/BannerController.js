// controllers/BannerController.js
import Banner from "../models/Banner.js";
import { io } from "../server.js";

class BannerController {
  // Liệt kê tất cả banner
  async bannerList(req, res) {
    try {
      const banners = await Banner.find();
      res.status(200).json(banners);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Thêm banner
  async bannerCreate(req, res) {
    try {
      const data = req.body;
      const newBanner = await Banner.create(data);
      res.status(200).json({
        message: "Thêm banner thành công",
        data: newBanner,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi thêm banner",
        error: error.message,
      });
    }
  }

  // Chi tiết banner
  async bannerDetail(req, res) {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: "Không lấy được dữ liệu" });
      }
      res.status(200).json({ data: banner });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Cập nhật banner
  async bannerUpdate(req, res) {
    try {
      const data = req.body;
      const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
      });
      if (!banner) {
        return res.status(404).json({ message: "Không tìm thấy banner" });
      }
      // Phát tín hiệu qua Socket.IO khi banner được cập nhật
      io.emit("bannerUpdated", banner);
      res.status(200).json({
        message: "Cập nhật banner thành công",
        data: banner,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi cập nhật banner",
        error: error.message,
      });
    }
  }

  // Xóa banner
  async bannerDelete(req, res) {
    try {
      const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
      if (!deletedBanner) {
        return res.status(404).json({ message: "Không tìm thấy banner" });
      }
      res.status(200).json({ message: "Yeeee, xóa thành công dồi" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default BannerController;