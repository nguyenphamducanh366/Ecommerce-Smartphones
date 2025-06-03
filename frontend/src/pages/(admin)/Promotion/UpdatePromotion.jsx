import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getDetailPromotion, updatePromotion } from "../../../service/api";
import dayjs from "dayjs";

const { Option } = Select;

const EditPromotion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const loaiKM = Form.useWatch("LoaiKM", form);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const { data } = await getDetailPromotion(id);
        const promotion = data.data;

        form.setFieldsValue({
          MaKM: promotion.MaKM,
          TenKM: promotion.TenKM,
          LoaiKM: promotion.LoaiKM,
          GiaTriKM: promotion.GiaTriKM,
          GiaTriToiThieu: promotion.GiaTriToiThieu,
          GiamToiDa: promotion.GiamToiDa,
          NgayBD: dayjs(promotion.NgayBD),
          NgayKT: dayjs(promotion.NgayKT),
          TrangThai: promotion.TrangThai,
        });
      } catch (error) {
        message.error("Không thể tải dữ liệu khuyến mãi.");
      }
    };

    if (id) fetchPromotion();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      const formattedData = {
        ...values,
        NgayBD: values.NgayBD.format("YYYY-MM-DD"),
        NgayKT: values.NgayKT.format("YYYY-MM-DD"),
      };

      await updatePromotion(id, formattedData);
      message.success("Cập nhật khuyến mãi thành công!");
      navigate("/admin/vouchers");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi khi cập nhật khuyến mãi."
      );
      console.error(
        "Có lỗi khi cập nhật khuyến mãi:",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="container">
      <h1 className="h3 text-gray-800 mb-4">Chỉnh Sửa Khuyến Mãi</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          TrangThai: undefined,
          LoaiKM: undefined,
        }}
      >
        <Form.Item
          label="Mã Khuyến Mãi"
          name="MaKM"
          rules={[
            { required: true, message: "Mã khuyến mãi là trường bắt buộc" },
            { min: 3, message: "Mã khuyến mãi phải có ít nhất 3 ký tự" },
            { max: 20, message: "Mã khuyến mãi không được dài quá 20 ký tự" },
          ]}
        >
          <Input placeholder="Nhập mã khuyến mãi" />
        </Form.Item>

        <Form.Item
          label="Tên Khuyến Mãi"
          name="TenKM"
          rules={[
            { required: true, message: "Tên khuyến mãi là trường bắt buộc" },
          ]}
        >
          <Input placeholder="Nhập tên khuyến mãi" />
        </Form.Item>

        <Form.Item
          label="Loại Khuyến Mãi"
          name="LoaiKM"
          rules={[
            { required: true, message: "Loại khuyến mãi là trường bắt buộc" },
          ]}
        >
          <Select placeholder="Chọn loại khuyến mãi">
            <Option value="fixed">Giảm số tiền cố định</Option>
            <Option value="percentage">Giảm theo %</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Giá Trị Khuyến Mãi"
          name="GiaTriKM"
          dependencies={["LoaiKM"]}
          rules={[
            {
              required: true,
              message: "Giá trị khuyến mãi là trường bắt buộc",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const loaiKM = getFieldValue("LoaiKM");
                if (value === undefined)
                  return Promise.reject("Vui lòng nhập giá trị");
                if (value <= 0)
                  return Promise.reject("Giá trị không được âm hoặc 0");
                if (loaiKM === "percentage") {
                  if (!Number.isInteger(value))
                    return Promise.reject(
                      "Không được nhập số thập phân khi giảm theo kiểu %"
                    );
                  if (value > 100) return Promise.reject("Không lớn hơn 100%");
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập giá trị khuyến mãi"
          />
        </Form.Item>
        <Form.Item
          label="Giá Trị Tối Thiểu"
          name="GiaTriToiThieu"
          rules={[
            { required: true, message: "Giá trị tối thiểu là trường bắt buộc" },
            {
              type: "number",
              min: 0,
              message: "Giá trị tối thiểu không được âm",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập giá trị tối thiểu đơn hàng"
          />
        </Form.Item>

        {/* Kiểm tra nếu Loại Khuyến Mãi không phải là 'fixed', mới hiển thị trường Giảm Tối Đa */}
        {loaiKM !== "fixed" && (
          <Form.Item
            label="Giảm Tối Đa"
            name="GiamToiDa"
            rules={[
              { required: true, message: "Giảm tối đa là trường bắt buộc" },
              { type: "number", min: 0, message: "Giảm tối đa không được âm" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập số tiền giảm tối đa"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Ngày Bắt Đầu"
          name="NgayBD"
          rules={[
            { required: true, message: "Ngày bắt đầu là trường bắt buộc" },
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Ngày Kết Thúc"
          name="NgayKT"
          dependencies={["NgayBD"]}
          rules={[
            { required: true, message: "Ngày kết thúc là trường bắt buộc" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue("NgayBD");
                if (!startDate)
                  return Promise.reject("Vui lòng chọn Ngày Bắt Đầu trước");
                if (value && value.isBefore(startDate, "day")) {
                  return Promise.reject(
                    "Ngày Kết Thúc phải lớn hơn hoặc bằng Ngày Bắt Đầu"
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Trạng Thái"
          name="TrangThai"
          rules={[{ required: true, message: "Trạng thái là trường bắt buộc" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value={1}>🔴Đã sử dụng</Option>
            <Option value={2}>🔵Đang diễn ra</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Lưu Thay Đổi
          </Button>
          <Button
            style={{ marginLeft: "8px" }}
            onClick={() => navigate("/admin/vouchers")}
          >
            Quay Lại
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditPromotion;
