import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Form, Input, Button } from 'antd';
import { loginUsers, updateUser, getUserById } from './../../service/api';

const AdminLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await loginUsers(values);

      if (response.data.token) {
        const user = response.data.user;
        const userDetails = await getUserById(user.id);
        
        if (userDetails.data.MaQuyen === 0) {
          confirmAlert({
            title: 'Lỗi',
            message: 'Chỉ có admin mới có thể đăng nhập',
            buttons: [{ label: 'OK', onClick: () => {} }]
          });
          return;
        }

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(user));

        await updateUser(user.id, { TrangThai: 1 });

        confirmAlert({
          title: 'Thành công',
          message: 'Đăng nhập thành công!',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                navigate('/admin/dashboard');
                window.location.reload();
              },
            },
          ],
        });
      }
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      confirmAlert({
        title: 'Lỗi',
        message: errorMessage,
        buttons: [{ label: 'OK', onClick: () => {} }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-1/2 p-8 bg-white rounded-lg shadow-md">
        <h5 className="text-2xl font-bold mb-6 text-black">Đăng Nhập Admin</h5>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="Email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<i className="fas fa-user text-gray-400" />}
              placeholder="Tài khoản Email"
            />
          </Form.Item>

          <Form.Item
            name="MatKhau"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<i className="fas fa-lock text-gray-400" />}
              placeholder="Mật khẩu"
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: setShowPassword
              }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            ĐĂNG NHẬP
          </Button>
        </Form>
      </div>
    </div>
  );  
};

export default AdminLogin;