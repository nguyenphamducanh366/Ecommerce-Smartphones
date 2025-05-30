import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import LayoutAdmin from "./pages/(admin)/LayoutAdmin";
import DashBoard from "./pages/(admin)/DashBoard";
import ProductsAdd from "./pages/(admin)/products/ProductsAdd";
import ProductsList from "./pages/(admin)/products/ProductsList";
import ProductsDetail from "./pages/(admin)/products/ProductsDetail";
import ProductsEdit from "./pages/(admin)/products/ProductsEdit";
import BrandList from "./pages/(admin)/brands/BrandList";
import BrandAdd from "./pages/(admin)/brands/BrandAdd";
import BrandEdit from "./pages/(admin)/brands/BrandEdit";
import BrandDetail from "./pages/(admin)/brands/BrandDetail";
import UserList from "./pages/(admin)/User/UserList";
import UserDetails from "./pages/(admin)/User/UserDetails";
import AdminListComment from "./pages/(admin)/comments/ListComments";
import AdminDetailComment from "./pages/(admin)/comments/DetailComment";
import OderDetail from "./pages/(admin)/orders/Oderdetail";
import OderList from "./pages/(admin)/orders/Oderlist";
import Promotion from "./pages/(admin)/Promotion/Promotion";
import UpdatePromotion from "./pages/(admin)/Promotion/UpdatePromotion";
import AddPromotion from "./pages/(admin)/Promotion/AddPromotion";
import LayoutWebsite from "./pages/(website)/LayoutWebsite";
import "font-awesome/css/font-awesome.min.css";
import HomePage from "./pages/(website)/HomePage";
import ProductList from "./pages/(website)/Products/ProductList";
import ProductDetail from "./pages/(website)/Products/ProductDetail";
import LoginForm from "./pages/(website)/Users/login-form";
import SignupForm from "./pages/(website)/Users/signup-form";
import ForgotPassword from "./pages/(website)/Users/forgot-password";
import ResetPassword from "./pages/(website)/Users/reset-password";
import AccountPage from "./pages/(website)/Users/account";
import ProfileResetPasswordPage from "./pages/(website)/Users/profile-reset-password";
import AccountDetails from "./pages/(website)/Users/account-details";
import ProfileReceipt from "./pages/(website)/Users/profile-receipt";
import ProfileReceiptDetails from "./pages/(website)/Users/profile-receipt-detail";
import Cart from "./pages/(website)/Cart/Cart";
import AboutList from "./pages/(website)/about/AboutList";
import Blogdefault from "./pages/(website)/Blog/Blogdefault";
import Blogsingle from "./pages/(website)/Blog/Blogsingle";
import List from "./pages/(website)/components/List";
import Checkcart from "./pages/(website)/Cart/Checkcart";
import AdminLogin from "./pages/(admin)/Admin-Login";
import DanhGia from "./pages/(admin)/danhgia/DanhGia";
import AddDanhgia from "./pages/(admin)/danhgia/AddDanhgia";
import ListContact from "./pages/(website)/contact/ListContact";
import { getUserById } from "./service/api";
import AddComment from "./pages/(admin)/comments/AddComment";
import OrderReturn from "./pages/(website)/Cart/OrderReturn";
import AddDanhGiaUser from "./pages/(website)/danhgia/AddDanhGiaUser";
import ListDanhGiaUser from "./pages/(website)/danhgia/ListDanhGiaUser";
import SpDaMua from "./pages/(website)/sanphamdamua/SpDaMua";
import Socket from "./pages/(website)/socket/Socket";
import ListBanner from "./pages/(admin)/banner/ListBanner";
import BannerAdd from "./pages/(admin)/banner/AddBanner";
import BannerEdit from "./pages/(admin)/banner/EditBanner";
function App() {
  const configRouter = createBrowserRouter([
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
    {
      element: <LayoutAdmin />,
      loader: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          return redirect("/admin/login");
        }
        const userData = localStorage.getItem("userData");
        if (!userData) {
          return redirect("/admin/login");
        }
        try {
          const user = JSON.parse(userData);
          const response = await getUserById(user.id);
          const userDetails = response.data;
          if (userDetails.MaQuyen === 0) {
            return redirect("/admin/login");
          }
          return null;
        } catch (error) {
          return redirect("/admin/login");
        }
      },
      children: [
        {
          path: "/adddanhgia",
          element: <AddDanhgia />,
        },
        {
          path: "/danhgia",
          element: <DanhGia />,
        },
        {
          path: "/admin/dashboard",
          element: <DashBoard />,
        },
        {
          path: "/admin/products/add",
          element: <ProductsAdd />,
        },
        {
          path: "/admin/products/edit/:id",
          element: <ProductsEdit />,
        },
        {
          path: "/admin/products/:id",
          element: <ProductsDetail />,
        },
        {
          path: "/admin/products",
          element: <ProductsList />,
        },
        {
          path: "/admin/banners/add",
          element: <BannerAdd />,
        },
        {
          path: "/admin/banners/edit/:id",
          element: <BannerEdit />,
        },
        {
          path: "/admin/banners",
          element: <ListBanner />,
        },
        {
          path: "/admin/brands",
          element: <BrandList />,
        },
        {
          path: "/admin/brands/add",
          element: <BrandAdd />,
        },
        {
          path: "/admin/brands/edit/:id",
          element: <BrandEdit />,
        },
        {
          path: "/admin/brands/detail/:id",
          element: <BrandDetail />,
        },
        {
          path: "/admin/accounts",
          element: <UserList />,
        },
        {
          path: "/admin/accounts-details/:id",
          element: <UserDetails />,
        },
        {
          path: "/admin/comments",
          element: <AdminListComment />,
        },
        {
          path: "/admin/comments/:id",
          element: <AdminDetailComment />,
        },
        {
          path: "/admin/orders",
          element: <OderList />,
        },
        {
          path: "/admin/orders/:id",
          element: <OderDetail />,
        },
        {
          path: "/admin/vouchers",
          element: <Promotion />,
        },
        {
          path: "/admin/vouchers/add",
          element: <AddPromotion />,
        },
        {
          path: "/admin/vouchers/edit/:id",
          element: <UpdatePromotion />,
        },
        {
          path: "/addcomment",
          element: <AddComment />,
        },
        {
          path: "/listbanner",
          element: <ListBanner />,
        },
      ],
    },
    {
      element: <LayoutWebsite />,
      children: [
        {
          path: "/list",
          element: <List />,
        },
        {
          path: "/sanphamdamua",
          element: <SpDaMua />,
        },
        {
          path: "/listdanhgiauser",
          element: <ListDanhGiaUser />,
        },
        {
          path: "/adddanhgiauser/:id",
          element: <AddDanhGiaUser />,
        },
        {
          path: "/checkcart",
          element: <Checkcart />,
        },
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/products",
          element: <ProductList />,
        },
        {
          path: "/products/product_detail/:id",
          element: <ProductDetail />,
        },
        {
          path: "/login",
          element: <LoginForm />,
        },
        {
          path: "/signup",
          element: <SignupForm />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "/reset-password",
          element: <ResetPassword />,
        },
        {
          path: "/account-details/:id",
          element: <AccountDetails />,
        },
        {
          path: "/account/:id",
          element: <AccountPage />,
        },
        {
          path: "/profile-receipt/:id",
          element: <ProfileReceipt />,
        },
        {
          path: "/profile-receipt-details/:id",
          element: <ProfileReceiptDetails />,
        },
        {
          path: "/profile-reset-password/:id",
          element: <ProfileResetPasswordPage />,
        },
        {
          path: "/cart",
          element: <Cart />,
        },
        {
          path: "/order-return",
          element: <OrderReturn />,
        },
        {
          path: "/about",
          element: <AboutList />,
        },
        {
          path: "/blog",
          element: <Blogdefault />,
        },
        {
          path: "/blog/:id",
          element: <Blogsingle />,
        },
        {
          path: "/contact",
          element: <ListContact />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={configRouter} />
    </>
  );
}

export default App;
