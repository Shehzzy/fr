import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoutes from './components/ProtectedRoutes';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import UserManagement from './pages/usermanagement/UserManagement';
import NotFound from './components/NotFound';
import { ToastContainer } from 'react-toastify';
import ViewUser from './pages/usermanagement/ViewUser';
import TermsAndCondition from './pages/TermsAndCondition';
import Support from './pages/Support';
import HomeEdit from './pages/contentmanagement/HomeEdit';
import BlogList from './pages/contentmanagement/BlogList';
import CreateBlog from './pages/contentmanagement/CreateBlog';
import EditBlog from './pages/contentmanagement/EditBlog';
import PrivacyPolicyEdit from './pages/contentmanagement/PrivacyPolicyEdit';
import AdminMetaManager from './pages/contentmanagement/AdminMetaManager';
import RankingPanel from './pages/contentmanagement/RankingPanel';
import CreatePromoCode from './pages/contentmanagement/CreatePromoCode';
import CouponList from './pages/contentmanagement/CouponList';
import CouponWriting from './pages/CouponWriting';
import CouponWritings from './pages/CouponWritings';

function RoutesComponent() {
  return (
    <HashRouter>
      <ToastContainer />
      <Routes>
        <Route path='*' element={<NotFound />} />
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgotpassword' element={<ForgetPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/terms-and-conditions' element={<TermsAndCondition />} />
        {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
        <Route path='/support' element={<Support />} />

        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path='/user-management' element={<UserManagement />} />
          <Route path='/view-user' element={<ViewUser />} />
          {/* <Route path="/coupon" element={<Coupon />} /> */}
          {/* <Route path="/add-coupon" element={<AddCoupon />} /> */}

          <Route path='/content/home' element={<HomeEdit />} />
          <Route path='/admin/blogs' exact element={<BlogList />} />
          <Route path='/admin/create-blog' element={<CreateBlog />} />
          <Route path='/admin/edit-blog/:slug' element={<EditBlog />} />
          <Route path='/admin/privacy-policy' element={<PrivacyPolicyEdit />} />
          <Route path='/admin/meta-manager' element={<AdminMetaManager />} />
          <Route path='/admin/ranking-admin' element={<RankingPanel />} />
          <Route path='/admin/create-coupon' element={<CreatePromoCode />} />
          <Route path='/coupons' element={<CouponList />} />
          <Route path='/coupon-writing' element={<CouponWriting />} />
          <Route path='/coupon-writings' element={<CouponWritings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default RoutesComponent;
