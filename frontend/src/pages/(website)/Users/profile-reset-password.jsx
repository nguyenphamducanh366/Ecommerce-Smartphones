import React from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { updatePassword } from "../../../service/api";

const ProfileResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // Lấy thông tin user từ localStorage
  const storedUserData = localStorage.getItem("userData");
  const userData = storedUserData ? JSON.parse(storedUserData) : null;

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (!userData?.id) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      await updatePassword(userData.id, {
        MatKhau: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-1/4 bg-white p-4 rounded-lg shadow-md mr-4">
            <div className="flex items-center mb-4">
              <span className="text-black font-semibold">
                {userData?.Email}
              </span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account-details/${userData?.id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-user mr-2"></i>
                  <span>Thông tin tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account/${userData?.id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-edit mr-2"></i>
                  <span>Cập nhật tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-receipt/${userData?.id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-money-check mr-2"></i>
                  <span>Quản lý đơn hàng</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-reset-password/${userData?.id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-lock mr-2"></i>
                  <span>Thay Đổi mật khẩu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Content */}
          <div className="w-3/4 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-light mb-6">Đổi Mật Khẩu</h3>
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              validateTrigger="onBlur"
            >
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {loading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileResetPasswordPage;
