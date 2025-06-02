// HoaDon.js
import mongoose from 'mongoose';

const HoaDonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    memory: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  additionalDiscount: { type: Number, default: 0 },
  shippingInfo: {
    name: String,
    phone: String,
    address: String
  },
  paymentStatus: {
    type: String,
    enum: ['Chờ xử lý', 'Đã Xác Nhận','Đang Giao', 'Giao Hàng Thành Công','Giao Hàng Thất Bại','Giao Hàng Lại','Hoàn thành','Huỷ Đơn'],
    default: 'Chờ xử lý'
  },
  checkPayment: {
    type: String,
    enum: ['Chưa Thanh Toán','Đã Thanh Toán','Yêu Cầu Hoàn Tiền','Đang Hoàn Tiền','Đã Hoàn Tiền'], 
    default: 'Chưa Thanh Toán'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'VNPay'],
    default: 'COD'
  },
  vnp_TransactionNo: String,
  vnp_ResponseCode: String,
  FeedBack: { 
    type: String,
    default: ''
  },
  cancelledBy: {  
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Nhân Viên Kiểm Đơn', 'User'],
      default: 'User'
    },
    name: String
  },
  cancellationDate: { 
    type: Date
  },
  deliveryDate: { 
    type: Date
  },
  transactionDate: { 
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const HoaDon = mongoose.model('HoaDon', HoaDonSchema);
export default HoaDon;
