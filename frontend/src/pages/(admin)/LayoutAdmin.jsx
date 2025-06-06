import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import './../../css/sb-admin-2.css'
const LayoutAdmin = () => {
  return (
    <>
      {/* Page Wrapper */}
      <div id="wrapper">
        <SideBar />
        {/* Content Wrapper */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* Main Content */}
          <div id="content">
            <TopBar />
            {/* Begin Page Content */}
            <div className="container-fluid">
              <Outlet />
            </div>
            {/* /.container-fluid */}
          </div>
          {/* End of Main Content */}
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default LayoutAdmin;
