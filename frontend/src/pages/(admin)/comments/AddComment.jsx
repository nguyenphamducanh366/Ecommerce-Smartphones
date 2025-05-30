import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Form, Input, Button, Rate } from "antd";
import { createComment } from "../../../service/api";

const AddComment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await createComment(values);
      message.success("Thêm bình luận thành công");
      navigate("/admin/comments"); // Chuyển hướng về trang danh sách bình luận
    } catch (error) {
      console.error(error);
      message.error("Thêm bình luận thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div>
      <h1 className="h3 mb-2 text-gray-800">Thêm Bình Luận</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Thêm bình luận mới</h6>
        </div>
        <div className="card-body">
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="MaSP"
              label="Mã Sản Phẩm"
              rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm" }]}
            >
              <Input placeholder="Nhập mã sản phẩm" />
            </Form.Item>

            <Form.Item
              name="Email"
              label="Email"
              rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="NoiDung"
              label="Nội Dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            >
              <Input.TextArea placeholder="Nhập nội dung" rows={4} />
            </Form.Item>

            <Form.Item
              name="DanhGia"
              label="Đánh Giá"
              rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm bình luận
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddComment;