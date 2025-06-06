import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import { handleVNPayReturn } from "../../../service/api";

const OrderReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processReturn = async () => {
      try {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
  
        const response = await handleVNPayReturn(params);
        
        if (response.data.success) {
          // Kiểm tra mã phản hồi VNPay
          if (params.vnp_ResponseCode === '00') {
            message.success('Thanh toán thành công!');
          } else {
            message.error(`Thanh toán không thành công hoặc đã huỷ `);
          }
          navigate(`/profile-receipt/${response.data.orderId}`);
        } else {
          message.error(response.data.message || 'Giao dịch thất bại');
          navigate('/');
        }
      } catch (error) {
        console.error('Lỗi xử lý thanh toán:', error);
        message.error('Lỗi hệ thống');
      }
    };
  
    processReturn();
  }, [navigate, searchParams]);

  return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
    </div>
  );
};

export default OrderReturn;
