import hoadon from "../models/HoaDon.js";
import SanPham from "../models/SanPham.js";
import crypto from "crypto";
import moment from "moment";
import { io } from "../server.js"; // Import io từ server.js

class HoaDonController {
  // Lấy danh sách hóa đơn
  async apiList(req, res) {
    try {
      const hoaDons = await hoadon.find();
      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: hoaDons,
      });
    } catch (error) {
      console.error("Error in apiList:", error.message);
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

  // Lấy chi tiết hóa đơn theo ID
  async apiDetail(req, res) {
    try {
      const id = req.params.id;
      const hoaDon = await hoadon.findById(id);
      if (!hoaDon) {
        return res.status(404).json({
          message: "Không tìm thấy hóa đơn",
        });
      }

      res.status(200).json({
        message: "Thành công",
        data: hoaDon,
      });
    } catch (error) {
      console.error("Error in apiDetail:", error.message);
      res.status(500).json({
        message: "Lỗi khi lấy chi tiết",
        error: error.message,
      });
    }
  }

  // Lấy danh sách hóa đơn theo user ID
  async apiListByUserId(req, res) {
    try {
      const userId = req.params.userId;
      const hoaDons = await hoadon.find({ userId: userId });
      res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: hoaDons,
      });
    } catch (error) {
      console.error("Error in apiListByUserId:", error.message);
      res.status(500).json({
        message: "Lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  }

  // Tạo hóa đơn mới
  async apiCreate(req, res) {
    try {
      if (!req.body.paymentStatus) {
        req.body.paymentStatus = "Chờ xử lý";
      }

      const { products } = req.body;
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          message: "Danh sách sản phẩm không hợp lệ",
        });
      }

      const productUpdates = [];

      for (const product of products) {
        const { productId, memory, quantity } = product;

        if (!productId || !memory || !quantity || quantity <= 0) {
          return res.status(400).json({
            message: "Thông tin sản phẩm không hợp lệ",
          });
        }

        const sanPham = await SanPham.findById(productId);
        if (!sanPham) {
          return res.status(404).json({
            message: `Không tìm thấy sản phẩm với ID ${productId}`,
          });
        }

        let quantityField = null;
        if (memory === sanPham.BoNhoTrong1) {
          quantityField = "SoLuong1";
        } else if (memory === sanPham.BoNhoTrong2) {
          quantityField = "SoLuong2";
        } else if (memory === sanPham.BoNhoTrong3) {
          quantityField = "SoLuong3";
        } else if (memory === sanPham.BoNhoTrong4) {
          quantityField = "SoLuong4";
        } else if (memory === sanPham.BoNhoTrong5) {
          quantityField = "SoLuong5";
        } else if (memory === sanPham.BoNhoTrong6) {
          quantityField = "SoLuong6";
        } else {
          return res.status(400).json({
            message: `Biến thể bộ nhớ ${memory} không hợp lệ cho sản phẩm ${sanPham.TenSP}`,
          });
        }

        const currentQuantity = sanPham[quantityField];
        if (currentQuantity < quantity) {
          return res.status(400).json({
            message: `Số lượng tồn kho không đủ cho sản phẩm ${sanPham.TenSP} (${memory})`,
          });
        }

        productUpdates.push({
          productId,
          quantityField,
          newQuantity: currentQuantity - quantity,
        });
      }

      for (const update of productUpdates) {
        await SanPham.findByIdAndUpdate(
          update.productId,
          { [update.quantityField]: update.newQuantity },
          { runValidators: true }
        );

        // Phát sự kiện Socket.IO để cập nhật số lượng sản phẩm
        io.emit("inventoryUpdated", {
          productId: update.productId,
          quantityField: update.quantityField,
          newQuantity: update.newQuantity,
        });
      }

      const newOrder = new hoadon(req.body);
      const savedOrder = await newOrder.save();

      // Phát sự kiện Socket.IO cho đơn hàng mới
      io.emit("orderCreated", {
        _id: savedOrder._id,
        userId: savedOrder.userId,
        createdAt: savedOrder.createdAt,
        paymentStatus: savedOrder.paymentStatus,
        shippingInfo: savedOrder.shippingInfo,
        total: savedOrder.total,
        paymentMethod: savedOrder.paymentMethod,
        products: savedOrder.products,
        checkPayment: savedOrder.checkPayment,
      });

      res.status(201).json({
        message: "Tạo hóa đơn thành công",
        data: savedOrder,
      });
    } catch (error) {
      console.error("Error in apiCreate:", error.message);
      res.status(400).json({
        message: "Lỗi khi tạo hóa đơn",
        error: error.message,
      });
    }
  }

  // Chỉnh sửa hóa đơn
  async apiEdit(req, res) {
    try {
      console.log("apiEdit called with params:", req.params, "body:", req.body);
      const id = req.params.id;
      const updates = req.body;

      const hoaDon = await hoadon.findById(id);
      if (!hoaDon) {
        console.log("Order not found:", id);
        return res.status(404).json({
          message: "Không tìm thấy hóa đơn để cập nhật",
        });
      }

      if (
        updates.paymentStatus === "Huỷ Đơn" &&
        ["Chờ xử lý", "Đã Xác Nhận"].includes(hoaDon.paymentStatus)
      ) {
        const { products } = hoaDon;
        if (products && Array.isArray(products)) {
          for (const product of products) {
            console.log(
              "Processing product:",
              product.productId,
              "memory:",
              product.memory
            );
            const { productId, memory, quantity } = product;

            const sanPham = await SanPham.findById(productId);
            if (!sanPham) {
              console.log("Product not found:", productId);
              return res.status(404).json({
                message: `Không tìm thấy sản phẩm với ID ${productId}`,
              });
            }

            let quantityField = null;
            if (memory === sanPham.BoNhoTrong1) {
              quantityField = "SoLuong1";
            } else if (memory === sanPham.BoNhoTrong2) {
              quantityField = "SoLuong2";
            } else if (memory === sanPham.BoNhoTrong3) {
              quantityField = "SoLuong3";
            } else if (memory === sanPham.BoNhoTrong4) {
              quantityField = "SoLuong4";
            } else if (memory === sanPham.BoNhoTrong5) {
              quantityField = "SoLuong5";
            } else if (memory === sanPham.BoNhoTrong6) {
              quantityField = "SoLuong6";
            } else {
              console.log(
                "Invalid memory variant:",
                memory,
                "for product:",
                sanPham.TenSP
              );
              return res.status(400).json({
                message: `Biến thể bộ nhớ ${memory} không hợp lệ cho sản phẩm ${sanPham.TenSP}`,
              });
            }

            const currentQuantity = sanPham[quantityField];
            const newQuantity = currentQuantity + quantity;
            console.log(
              "Updating product quantity:",
              productId,
              quantityField,
              "from",
              currentQuantity,
              "to",
              newQuantity
            );
            await SanPham.findByIdAndUpdate(
              productId,
              { [quantityField]: newQuantity },
              { runValidators: true }
            );

            // Phát sự kiện Socket.IO để cập nhật số lượng sản phẩm
            io.emit("inventoryUpdated", {
              productId,
              quantityField,
              newQuantity,
            });
          }
        }
      }

      console.log("Updating order with updates:", updates);
      const updatedHoaDon = await hoadon.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      // Phát sự kiện Socket.IO
      console.log(
        "Emitting orderStatusUpdated event for order:",
        updatedHoaDon._id
      );
      io.emit("orderStatusUpdated", {
        orderId: updatedHoaDon._id,
        paymentStatus: updatedHoaDon.paymentStatus,
        userId: updatedHoaDon.userId,
        cancelledBy: updatedHoaDon.cancelledBy,
        cancellationDate: updatedHoaDon.cancellationDate,
        FeedBack: updatedHoaDon.FeedBack,
      });

      res.status(200).json({
        message: "Cập nhật hóa đơn thành công",
        data: updatedHoaDon,
      });
    } catch (error) {
      console.error("Error in apiEdit:", error.message, error.stack);
      res.status(500).json({
        message: "Lỗi khi cập nhật hóa đơn",
        error: error.message,
      });
    }
  }

  // Xóa hóa đơn
  async apiDelete(req, res) {
    try {
      const id = req.params.id;
      const deletedHoaDon = await hoadon.findByIdAndDelete(id);

      if (!deletedHoaDon) {
        return res.status(404).json({
          message: "Không tìm thấy hóa đơn để xóa",
        });
      }

      res.status(200).json({
        message: "Xóa hóa đơn thành công",
        data: deletedHoaDon,
      });
    } catch (error) {
      console.error("Error in apiDelete:", error.message);
      res.status(500).json({
        message: "Lỗi khi xóa hóa đơn",
        error: error.message,
      });
    }
  }

  // Thống kê doanh thu
  async thongKeDoanhThu(req, res) {
    try {
      const matchCompletedOrders = {
        $match: {
          $or: [
            {
              paymentMethod: { $ne: "vnpay" },
              paymentStatus: "Giao Hàng Thành Công",
            },
            {
              paymentMethod: "vnpay",
              paymentStatus: { $in: ["Đã hoàn thành", "Hoàn thành"] },
            },
            { paymentStatus: "Hoàn thành" }, // Thêm trạng thái Hoàn thành
          ],
        },
      };

      // chỗ này để sửa ngày tính thời gian thực
      const startOfWeek = new Date(2025, 3, 14); // Thứ 2, ngày 14/4/2025
      const endOfWeek = new Date(2025, 3, 20, 23, 59, 59); // Chủ nhật, ngày 20/4/2025

      const doanhThuTheoNgay = await hoadon.aggregate([
        matchCompletedOrders,
        { $unwind: "$products" },
        {
          $group: {
            _id: {
              ngay: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              gio: { $hour: "$createdAt" },
            },
            tongDoanhThu: { $sum: "$total" },
            sanPhamDaBan: {
              $push: {
                TenSP: "$products.name",
                memory: "$products.memory",
                quantity: "$products.quantity",
                image: "$products.image",
                thoiGianBan: {
                  $dateToString: { format: "%H:%M:%S", date: "$createdAt" },
                },
              },
            },
          },
        },
        { $sort: { "_id.ngay": 1, "_id.gio": 1 } },
      ]);

      const doanhThuTheoTuan = await hoadon.aggregate([
        matchCompletedOrders,
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            tongDoanhThu: { $sum: "$total" },
          },
        },
      ]);

      const doanhThuTheoThang = await hoadon.aggregate([
        matchCompletedOrders,
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            tongDoanhThu: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const doanhThuTheoNam = await hoadon.aggregate([
        matchCompletedOrders,
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
            tongDoanhThu: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const tongDoanhThuTheoNgay = doanhThuTheoNgay.reduce(
        (acc, item) => acc + item.tongDoanhThu,
        0
      );
      const tongDoanhThuTheoTuan =
        doanhThuTheoTuan.length > 0 ? doanhThuTheoTuan[0].tongDoanhThu : 0;

      res.status(200).json({
        doanhThuTheoNgay,
        doanhThuTheoTuan,
        doanhThuTheoThang,
        doanhThuTheoNam,
        tongDoanhThuTheoNgay,
        tongDoanhThuTheoTuan,
      });
    } catch (error) {
      console.error("Error in thongKeDoanhThu:", error.message);
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo thanh toán VNPay
  async apiCreateVNPayPayment(req, res) {
    try {
      const { amount, orderId, orderInfo, returnUrl } = req.body;

      if (!amount || !orderId || !orderInfo || !returnUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (
        !process.env.VNP_TMNCODE ||
        !process.env.VNP_HASH_SECRET ||
        !process.env.VNP_URL
      ) {
        throw new Error("VNPay configuration is missing");
      }

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.ip ||
        req.connection.remoteAddress;

      const vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.VNP_TMNCODE,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_Amount: Math.floor(amount * 100),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      };

      const sortedParams = {};
      Object.keys(vnpParams)
        .sort()
        .forEach((key) => {
          sortedParams[key] = vnpParams[key];
        });

      const signData = new URLSearchParams(sortedParams).toString();

      const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
      const signed = hmac.update(signData).digest("hex");

      const finalParams = {
        ...sortedParams,
        vnp_SecureHash: signed,
      };

      const paymentUrl =
        process.env.VNP_URL +
        "?" +
        Object.keys(finalParams)
          .map((key) => `${key}=${encodeURIComponent(finalParams[key])}`)
          .join("&");

      res.status(200).json({
        message: "Payment URL generated successfully",
        paymentUrl,
      });
    } catch (error) {
      console.error("VNPay Error:", error);
      res.status(500).json({
        message: "Error creating VNPay payment",
        error: error.message,
      });
    }
  }

  // Xử lý kết quả trả về từ VNPay
  async apiHandleVNPayReturn(req, res) {
    try {
      const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = req.query;

      if (!vnp_TxnRef || !vnp_ResponseCode) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tham số bắt buộc từ VNPay",
        });
      }

      const order = await hoadon.findByIdAndUpdate(
        vnp_TxnRef,
        {
          paymentStatus: "Chờ xử lý",
          checkPayment:
            vnp_ResponseCode === "00" ? "Đã Thanh Toán" : "Chưa Thanh Toán",
          transactionDate: vnp_ResponseCode === "00" ? new Date() : "0",
          vnp_TransactionNo,
          vnp_ResponseCode,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Phát sự kiện Socket.IO
      console.log(
        "Emitting orderStatusUpdated event for VNPay return:",
        order._id
      );
      io.emit("orderStatusUpdated", {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        userId: order.userId,
        cancelledBy: order.cancelledBy,
        cancellationDate: order.cancellationDate,
        FeedBack: order.FeedBack,
      });

      res.json({
        success: true,
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    } catch (error) {
      console.error("VNPay return processing error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xử lý kết quả thanh toán",
        error: error.message,
      });
    }
  }
}

export default HoaDonController;
