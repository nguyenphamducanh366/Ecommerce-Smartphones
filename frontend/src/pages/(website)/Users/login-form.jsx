import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { loginUsers } from '../../../service/api';

const LoginForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await loginUsers(values);
      
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      message.success('Đăng nhập thành công!');
      window.location.href = '/';
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 p-8 bg-white rounded-lg shadow-md">
        <h5 className="text-2xl font-bold mb-6">Đăng Nhập</h5>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="Email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            name="MatKhau"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu"
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

          <div className="mt-4 flex justify-between">
            <Link to="/signup" className="text-blue-500">Đăng ký tài khoản</Link>
            <Link to="/forgot-password" className="text-blue-500">Quên mật khẩu?</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;