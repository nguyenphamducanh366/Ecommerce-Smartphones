import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
// import "../../index.css"

const LayoutWebsite = () => {
  return (
    <>
      <div>
        <Header />

        <Outlet />
        {/* footer */}
        <Footer />
        {/* /.footer */}
      </div>
    </>
  );
};

export default LayoutWebsite;
