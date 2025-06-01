import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { updateUser, uploadImage, getUserById } from "../../../service/api";
import { Form, Input, Button, Upload, Radio, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const AccountPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          message.error("Lỗi, Không tìm thấy tài khoản người dùng");
          return;
        }

        const { id } = JSON.parse(storedUser);
        setUserId(id);

        const response = await getUserById(id);
        const userData = response.data;

        form.setFieldsValue(userData);
        setAvatar(userData.Avata);
      } catch (error) {
        message.error("Lỗi, Không tìm thấy data tài khoản người dùng");
      }
    };

    fetchUserData();
  }, [form]);

  const handleAvatarUpload = async ({ file }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await uploadImage(formData);
      setAvatar(response.data.imageUrl);
      message.success("Upload avatar thành công");
    } catch (error) {
      message.error("Upload avatar thất bại");
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateUser(userId, { ...values, Avata: avatar });

      const updatedUser = { ...values, id: userId, Avata: avatar };
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      confirmAlert({
        title: "Thành Công",
        message: "Update thành công",
        buttons: [
          {
            label: "OK",
            onClick: () => navigate(`/account-details/${userId}`),
          },
        ],
      });
    } catch (error) {
      message.error("Update thất bại");
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
                {form.getFieldValue("Email")}
              </span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account-details/${userId}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-user mr-2"></i>
                  <span>Thông tin tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account/${userId}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-edit mr-2"></i>
                  <span>Update tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-receipt/${userId}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-money-check mr-2"></i>
                  <span>Thông tin đơn hàng</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-reset-password/${userId}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-lock mr-2"></i>
                  <span>Thay đổi mật khẩu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Content */}
          <div className="w-3/4 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-light mb-6">Update Tài Khoản</h3>
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item label="Avatar">
                <Upload
                  accept="image/*"
                  beforeUpload={() => false}
                  onChange={handleAvatarUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                </Upload>
                {avatar && (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="mt-2"
                    style={{
                      maxWidth: "100px",
                      borderRadius: "10px",
                    }}
                  />
                )}
              </Form.Item>

              <Form.Item
                label="Họ và Tên"
                name="HoVaTen"
                rules={[{ required: true }]}
              >
                <Input placeholder="Mời Nhập Thông Tin  " />
              </Form.Item>

              <Form.Item
                label="Số Điện Thoại"
                name="SDT"
                rules={[
                  { required: true },
                  { pattern: /^[0-9]+$/, message: "Sai định dạng" },
                ]}
              >
                <Input placeholder="Mời Nhập Thông Tin  " />
              </Form.Item>

              <Form.Item label="Địa Chỉ" name="DiaChi">
                <Input placeholder="Mời Nhập Thông Tin " />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Cập Nhập
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
