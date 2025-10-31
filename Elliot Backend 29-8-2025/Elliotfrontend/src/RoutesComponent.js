import React, { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Registration from './pages/Registration';
import Home from './pages/Home';
import Compare from './pages/Compare';
import WeightedScore from './pages/WeightedScore';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import OtpVerification from './pages/OtpVerification';
import BlogDetail from './pages/BlogDetail';
import BlogListing from './pages/BlogListing';
import Subscription from './pages/Subscription';
import PaymentHistroy from './pages/PaymentHistroy';
import PaymentForm from './pages/PaymentForm';

import PrivateRoute from './components/PrivateRoute';
import { UserProvider } from './context/UserContext';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Average from './pages/Average';
import PaymentStatus from './pages/PaymentStatus';
import CancelPage from './pages/CancelPage';
import PopularComparison from './pages/PopularComparison';
import CouponShower from './components/CouponShower';
import VegasADP from './pages/VegasADP';

function RoutesComponent({ canvas }) {
  const location = useLocation();

  const publicRoutes = useRoutes([
    // ✅ Public Routes
    { path: '/', element: <Home /> },
    { path: '/privacy-policy', element: <PrivacyPolicy /> },
    { path: '/login', element: <Login /> },
    { path: '/forgotpassword', element: <ForgetPassword /> },
    { path: '/reset-password', element: <ResetPassword /> },
    { path: '/registration', element: <Registration /> },
    { path: '/otp-verification', element: <OtpVerification /> },
    { path: '/blog-detail/:slug', element: <BlogDetail /> },
    { path: '/blogs', element: <BlogListing /> },
    { path: '/vegas-rankings', element: <Average /> },
    { path: '/vegas-adp', element: <VegasADP /> },
    { path: '/popular-comparison', element: <PopularComparison /> },
    {
      path: '/compare',
      element: (
          <Compare />
      ),
    }
  ]);

  // 🔐 Protected Routes
  const protectedRoutes = useRoutes([
    {
      path: '/change-password',
      element: (
        <PrivateRoute>
          <ChangePassword />
        </PrivateRoute>
      ),
    },
    {
      path: '/cancel',
      element: (
        <PrivateRoute>
          <CancelPage />
        </PrivateRoute>
      ),
    },
    {
      path: '/success',
      element: (
        <PrivateRoute>
          <PaymentStatus />
        </PrivateRoute>
      ),
    },
    {
      path: '/weighted-score/*',
      element: (
        <PrivateRoute>
          <WeightedScore />
        </PrivateRoute>
      ),
    },
    {
      path: '/profile',
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },
    {
      path: '/edit-profile',
      element: (
        <PrivateRoute>
          <EditProfile />
        </PrivateRoute>
      ),
    },
    {
      path: '/subscription',
      element: (
        <PrivateRoute>
          <Subscription />
        </PrivateRoute>
      ),
    },
    {
      path: '/payment-histroy',
      element: (
        <PrivateRoute>
          <PaymentHistroy />
        </PrivateRoute>
      ),
    },
    {
      path: '/make-payment',
      element: (
        <PrivateRoute>
          <PaymentForm />
        </PrivateRoute>
      ),
    },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <UserProvider>
      {publicRoutes}
      {protectedRoutes}
    </UserProvider>
  );
}

export default RoutesComponent;
