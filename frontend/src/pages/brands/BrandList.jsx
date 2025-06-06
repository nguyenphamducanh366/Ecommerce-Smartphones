import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { message } from "antd";
import { deleteBrand, fetchBrands } from "../../../service/api";
import { Table, Button, Form } from "react-bootstrap";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBrands()
      .then((res) => setBrands(res.data.data))
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {  
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {  
      try {  
        const response = await deleteBrand(id);  
    
        if (response && response.status === 200) {  
          setBrands(brands.filter((brand) => brand._id !== id));  
          message.success("Xóa thành công!");  
        }  
      } catch (error) {  
        if (error.response && error.response.data && error.response.data.message) {  
          // Hiển thị thông báo lỗi từ backend  
          message.error(error.response.data.message);  
        } else {  
          message.error("Xóa thất bại!");  
        }  
      }  
    }  
  }; 
  

  // Lọc thương hiệu theo tìm kiếm
  const filteredBrands = brands.filter((brand) =>
    brand.TenTH.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset về trang 1 nếu có tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Xử lý phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Danh sách thương hiệu</h2>
      <div className="d-flex justify-content-between mb-3">
        {/* Ô tìm kiếm thương hiệu */}
        <Form.Control
          type="text"
          placeholder="Tìm kiếm thương hiệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-50"
        />
        <Link to="/admin/brands/add">
          <Button variant="primary">Thêm mới</Button>
        </Link>
      </div>

      {/* Bảng danh sách thương hiệu */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Hình ảnh</th>
            <th>Tên thương hiệu</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((brand, index) => (
            <tr key={brand._id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>
                <img
                  src={brand.HinhAnh}
                  alt={brand.TenTH}
                  width="100px"
                  className="img-thumbnail"
                />
              </td>
              <td>{brand.TenTH}</td>
              <td>
                <Link to={`/admin/brands/detail/${brand._id}`}>
                  <Button variant="info" className="me-2 btn-sm">Xem</Button>
                </Link>
                <Link to={`/admin/brands/edit/${brand._id}`}>
                  <Button variant="warning" className="me-2 btn-sm">Sửa</Button>
                </Link>
                <Button
                  variant="danger"
                  className="btn-sm"
                  onClick={() => handleDelete(brand._id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Phân trang */}
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Trước
        </Button>
        <span className="mx-3 align-self-center">
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};

export default BrandList;
