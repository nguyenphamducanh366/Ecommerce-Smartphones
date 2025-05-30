import Joi from "joi";

const promotionValidator = Joi.object({
  MaKM: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/)
    .min(3)
    .max(8)
    .required()
    .messages({
      "string.base": "Mã khuyến mãi phải là chuỗi ký tự",
      "string.empty": "Mã khuyến mãi không được để trống",
      "string.pattern.base":
        "Mã khuyến mãi phải có cả chữ và số, không được toàn số và không chứa ký tự đặc biệt",
      "string.min": "Mã khuyến mãi phải có ít nhất 3 ký tự",
      "string.max": "Mã khuyến mãi không được dài quá 8 ký tự",
      "any.required": "Mã khuyến mãi là trường bắt buộc",
    }),
  TenKM: Joi.string().required().messages({
    "string.base": "Tên khuyến mãi phải là chuỗi",
    "any.required": "Tên khuyến mãi là trường bắt buộc",
  }),
  LoaiKM: Joi.string().required().messages({
    "string.base": "Loại khuyến mãi phải là chuỗi",
    "any.required": "Loại khuyến mãi là trường bắt buộc",
  }),
  GiaTriKM: Joi.number().required().messages({
    "number.base": "Giá trị khuyến mãi phải là số",
    "any.required": "Giá trị khuyến mãi là trường bắt buộc",
  }),
  NgayBD: Joi.date().required().messages({
    "date.base": "Ngày bắt đầu phải là ngày hợp lệ",
    "any.required": "Ngày bắt đầu là trường bắt buộc",
  }),
  NgayKT: Joi.date().required().messages({
    "date.base": "Ngày kết thúc phải là ngày hợp lệ",
    "any.required": "Ngày kết thúc là trường bắt buộc",
  }),
  TrangThai: Joi.number().required().messages({
    "number.base": "Trạng thái phải là số",
    "any.required": "Trạng thái là trường bắt buộc",
  }),
}).unknown(true); // Cho phép các trường không xác định

export { promotionValidator };
