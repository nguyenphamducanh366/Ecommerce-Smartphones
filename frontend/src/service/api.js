import axios from "axios";
const API_URL = `http://localhost:5000/api`;

// thương hiệu
export const fetchBrands = async () => axios.get(`${API_URL}/thuonghieus`);
export const createBrand = async (data) =>
  axios.post(`${API_URL}/thuonghieus`, data);
export const updateBrand = async (id, data) =>
  axios.put(`${API_URL}/thuonghieus/${id}`, data);
export const deleteBrand = async (id) =>
  axios.delete(`${API_URL}/thuonghieus/${id}`);
export const getBrandById = async (id) =>
  axios.get(`${API_URL}/thuonghieus/${id}`);

// api danh muc
export const fetchCategories = async () => axios.get(`${API_URL}/danhmucs`);
export const createCategory = async (data) =>
  axios.post(`${API_URL}/danhmucs`, data, {
    headers: { "Content-Type": "application/json" },
  });
export const updateCategory = async (id, data) =>
  axios.put(`${API_URL}/danhmucs/${id}`, data);
export const deleteCategory = async (id) =>
  axios.delete(`${API_URL}/danhmucs/${id}`);
export const fetchCategoryById = async (id) =>
  axios.get(`${API_URL}/danhmucs/${id}`);

// users
export const loginUsers = async (data) =>
  axios.post(`${API_URL}/users/login`, data);
export const signupUsers = async (data) =>
  axios.post(`${API_URL}/users/signup`, data);
export const updateUser = async (id, data) =>
  axios.put(`${API_URL}/users/${id}`, data);
export const updatePassword = async (id, data) =>
  axios.put(`${API_URL}/users/update-password/${id}`, data);
export const fetchUsers = async () => axios.get(`${API_URL}/users`);
export const deleteUser = async (id) => axios.delete(`${API_URL}/users/${id}`);
export const getUserById = async (id) => axios.get(`${API_URL}/users/${id}`);
export const forgotPassword = async (data) =>
  axios.post(`${API_URL}/users/forgot-password`, data);
export const resetPassword = async (data) =>
  axios.post(`${API_URL}/users/reset-password`, data);

// hoadon
export const createOrder = async (data) =>
  axios.post(`${API_URL}/hoadons`, data);
export const fetchOrders = async () =>
  axios.get(`${API_URL}/hoadons?timestamp=${Date.now()}`);
export const fetchOrdersByUserId = async (userId) =>
  axios.get(`${API_URL}/hoadons/user/${userId}?timestamp=${Date.now()}`);
export const getOrderById = async (id) => axios.get(`${API_URL}/hoadons/${id}`);
export const updateOrder = async (id, data) =>
  axios.put(`${API_URL}/hoadons/${id}`, data);
export const deleteOrder = async (id) =>
  axios.delete(`${API_URL}/hoadons/${id}`);
export const createVNPayPayment = async (data) =>
  axios.post(`${API_URL}/hoadons/create-vnpay-payment`, data);
export const handleVNPayReturn = async (queryParams) =>
  axios.get(`${API_URL}/hoadons/vnpay-return`, { params: queryParams });
// Thêm API lấy thống kê doanh thu
export const fetchThongKeDoanhThu = async () =>
  axios.get(`${API_URL}/hoadons/thongke/doanhthu`);

// Comments
export const fetchComments = async () => axios.get(`${API_URL}/comments`);
export const deleteComment = async (id) =>
  axios.delete(`${API_URL}/comments/${id}`);
export const fetchCommentById = async (id) =>
  axios.get(`${API_URL}/comments/${id}`);
export const createComment = async (data) =>
  axios.post(`${API_URL}/comments`, data);
export const replyComment = async (id, replyData) =>
  axios.put(`${API_URL}/comments/${id}/reply`, replyData);
export const approveComment = async (id) =>
  axios.put(`${API_URL}/comments/${id}/approve`);

// chitiethoadon
export const fetchChitiethoadons = async () =>
  axios.get(`${API_URL}/chitiethoadons`);

// sanpham mobile
export const uploadImage = async (data) =>
  axios.post(`${API_URL}/upload`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const fetchProducts = async () => axios.get(`${API_URL}/sanphams`);
export const createProducts = async (data) =>
  axios.post(`${API_URL}/sanphams`, data);
export const updateProducts = async (id, data) =>
  axios.put(`${API_URL}/sanphams/${id}`, data);
export const deleteProducts = async (id) =>
  axios.delete(`${API_URL}/sanphams/${id}`);
export const getProducts = async (id) => axios.get(`${API_URL}/sanphams/${id}`);
export const updateProductStatus = async (id, statusData) =>
  axios.put(`${API_URL}/sanphams/${id}/status`, statusData);

// promotions
export const fetchPromotion = async () => axios.get(`${API_URL}/promotions`);
export const deletePromotion = async (id) =>
  axios.delete(`${API_URL}/promotions/${id}`);
export const createPromotion = async (data) =>
  axios.post(`${API_URL}/promotions`, data);
export const updatePromotion = async (id, data) =>
  axios.put(`${API_URL}/promotions/${id}`, data);
export const getDetailPromotion = async (id) =>
  axios.get(`${API_URL}/promotions/${id}`);
export const updateVoucherStatus = async (voucherId, status) => {
  try {
    const response = await axios.put(`${API_URL}/promotions/${voucherId}`, {
      TrangThai: status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi cập nhật trạng thái voucher"
    );
  }
};

export const fetchDanhGias = async () => axios.get(`${API_URL}/danhgias`);
export const deleteDanhGia = async (id) =>
  axios.delete(`${API_URL}/danhgias/${id}`);
export const createDanhGia = async (data) =>
  axios.post(`${API_URL}/danhgias`, data);
export const updateDanhGia = async (id, data) =>
  axios.put(`${API_URL}/danhgias/${id}`, data);
export const fetchBanners = async () => axios.get(`${API_URL}/banners`);
export const createBanner = async (data) =>
  axios.post(`${API_URL}/banners`, data);
export const updateBanner = async (id, data) =>
  axios.put(`${API_URL}/banners/${id}`, data);
export const deleteBanner = async (id) =>
  axios.delete(`${API_URL}/banners/${id}`);
export const getBannerById = async (id) =>
  axios.get(`${API_URL}/banners/${id}`);
