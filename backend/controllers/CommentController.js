// controllers/CommentController.js
import binhluan from "../models/Comment.js";

class CommentController {
  // Liệt kê tất cả bình luận
  async cmtList(req, res) {
    try {
      const comments = await binhluan.find();
      res.status(200).json(comments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Thêm bình luận
  async cmtCreate(req, res) {
    try {
      const data = req.body;
      const newComment = await binhluan.create(data);
      res.status(200).json({
        message: "Thêm bình luận thành công",
        data: newComment,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi thêm bình luận",
        error: error.message,
      });
    }
  }

  // Chi tiết bình luận
  async cmtDetail(req, res) {
    try {
      const comment = await binhluan.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Không lấy được dữ liệu" });

      res.status(200).json({ data: comment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Xóa bình luận
  async cmtDelete(req, res) {
    try {
      const deletedComment = await binhluan.findByIdAndDelete(req.params.id);
      if (!deletedComment)
        return res.status(404).json({ message: "Không tìm thấy bình luận" });

      res.status(200).json({ message: "Yeeee, xóa thành công dồi" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Trả lời bình luận
  async cmtReply(req, res) {
    try {
      const { id } = req.params;
      const { Content, Date, AdminEmail } = req.body;

      const comment = await binhluan.findById(id);
      if (!comment) {
        return res.status(404).json({ message: "Không tìm thấy bình luận" });
      }

      comment.Reply = {
        Content,
        Date,
        AdminEmail,
      };

      const updatedComment = await comment.save();

      res.status(200).json({
        message: "Trả lời bình luận thành công",
        data: updatedComment,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi trả lời bình luận",
        error: error.message,
      });
    }
  }

  // Duyệt bình luận (Thêm mới)
  async cmtApprove(req, res) {
    try {
      const { id } = req.params;
      const comment = await binhluan.findById(id);
      if (!comment) {
        return res.status(404).json({ message: "Không tìm thấy bình luận" });
      }

      comment.isApproved = true;
      const updatedComment = await comment.save();

      res.status(200).json({
        message: "Duyệt bình luận thành công",
        data: updatedComment,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi duyệt bình luận",
        error: error.message,
      });
    }
  }
}

export default CommentController;