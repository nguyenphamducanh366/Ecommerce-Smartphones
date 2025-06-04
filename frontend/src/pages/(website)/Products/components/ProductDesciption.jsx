import React from "react";
import { Link } from "react-router-dom";

const relatedProducts = [
  {
    id: 1,
    name: "Google Pixel",
    variant: "(128GB, Black)",
    image: "product_img_1.png",
    price: 1100,
    oldPrice: 1400,
    discount: "20% off",
  },
  {
    id: 2,
    name: "HTC U Ultra",
    variant: "(64GB, Blue)",
    image: "product_img_2.png",
    price: 1200,
    oldPrice: 1700,
    discount: "10% off",
  },
  {
    id: 3,
    name: "Samsung Galaxy Note 8",
    variant: "",
    image: "product_img_3.png",
    price: 1500,
    oldPrice: 2000,
    discount: "40% off",
  },
  {
    id: 4,
    name: "Vivo V5 Plus",
    variant: "(Matte Black)",
    image: "product_img_4.png",
    price: 1500,
    oldPrice: 2000,
    discount: "15% off",
  },
];

const ProductDescription = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="w-full">
        <div className="box-head mb-6">
          <h3 className="text-xl font-semibold">Sản phẩm liên quan</h3>
        </div>
        <div className="box">
          <div className="box-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-block border p-4 rounded-lg shadow-lg flex flex-col h-full transition-transform duration-300 hover:scale-105"
                >
                  <div className="product-img mb-4">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={`./src/./img/${product.image}`}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </Link>
                  </div>
                  <div className="product-content">
                    <h5>
                      <Link
                        to={`/product/${product.id}`}
                        className="product-title text-lg font-medium hover:text-blue-500"
                      >
                        {product.name} <strong>{product.variant}</strong>
                      </Link>
                    </h5>
                    <div className="product-meta flex items-center space-x-2 my-2">
                      <span className="product-price text-xl text-orange-500">
                        ${product.price}
                      </span>
                      <span className="discounted-price text-gray-500 line-through">
                        ${product.oldPrice}
                      </span>
                      <span className="offer-price text-red-500 text-sm">
                        {product.discount}
                      </span>
                    </div>
                    <div className="shopping-btn flex items-center space-x-2 mt-4">
                      <button className="product-btn btn-like text-red-500 hover:text-red-700">
                        <i className="fa fa-heart" />
                      </button>
                      <button className="product-btn btn-cart text-blue-500 hover:text-blue-700">
                        <i className="fa fa-shopping-cart" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
