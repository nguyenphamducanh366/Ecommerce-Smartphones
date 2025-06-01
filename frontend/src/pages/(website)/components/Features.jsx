import React from "react";

const Features = () => {
  return (
    <div className="bg-blue-500 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {[
            {
              icon: "fa-credit-card",
              title: "Thanh toán an toàn",
              desc: "Mang đến dịch vụ trải nghiệm thoải mái nhất, an toàn, tiện dụng, Mobistore!",
            },
            {
              icon: "fa-users",
              title: "Phản hồi 24/7",
              desc: "Trợ giúp liên lạc, tham khảo, tra cứu 24/7!",
            },
            {
              icon: "fa-rotate-left",
              title: "Đổi trả miễn phí",
              desc: "Miễn phí bảo hành đổi trả lên đến 365 ngày!",
            },
            {
              icon: "fa-dollar",
              title: "Giá tốt nhất",
              desc: "Giá thành tốt nhất trong thị trường. Cập nhật sản phẩm 24/7!",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center text-white"
            >
              <div className="bg-white text-blue-500 rounded-full p-6 mb-4 shadow-lg">
                <i className={`fa ${feature.icon} text-4xl`}></i>
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
