import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema(
  {
    MaKM: { type: String, required: true, unique: true }, // Mã khuyến mãi
    TenKM: { type: String, required: true }, // Tên khuyến mãi
    LoaiKM: {
      type: String,
      required: true,
      enum: ["fixed", "percentage"], // fixed: số tiền, percentage: %
    },
    GiaTriKM: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          if (this.LoaiKM === "percentage") {
            return value >= 0 && value <= 100;
          }
          return value >= 0;
        },
        message: (props) => `Giá trị khuyến mãi không hợp lệ: ${props.value}`,
      },
    },
    GiaTriToiThieu: {
      type: Number,
      required: true,
      default: 10000000, // Đơn hàng tối thiểu mặc định 10 triệu
    },
    GiamToiDa: {
      type: Number,
      required: function () {
        return this.LoaiKM === "percentage";
      },
    },
    NgayBD: { type: Date, required: true },
    NgayKT: { type: Date, required: true },
    TrangThai: { type: Number, default: 2 }, // 1: đã sử dụng, 2: đang diễn ra
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", PromotionSchema, "Promotion");

export default Promotion;
