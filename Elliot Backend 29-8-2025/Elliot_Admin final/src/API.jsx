// export const BASE_URL = "http://localhost:4000";
export const BASE_URL = "https://api.startsitem.com";

export const BASE_URL_ADMIN = `${BASE_URL}/Admin/api`;
export const BASE_URL_USER = `${BASE_URL}/User/api`;
export const BASE_URL_COUPON = `${BASE_URL}/Payments/api`;

export const IMAGE_URL = `${BASE_URL}/images`;
export const BASE_URL_COMMON = `${BASE_URL}/api`;

// ==========END-POINTS============
export const LOGIN = "/login";

export const FORGOT_PASSWORD = "/forgot-password";
export const RESET_PASSWORD = "/set-new-password";
export const VALIDATE_LINK = "/validate-reset-link";

export const ADMIN_DETAILS = "/view-profile";
export const UPDATE_PROFILE = "/edit-profile";

export const UPLOAD_IMAGE = "/admin-image";

export const CHANGE_PASSWORD = "/change-password";
export const USER_COUNT = "/users/count";

export const GET_DASHBOARD_DETAILS = "/get-all-users";

export const DELETE_USER = (id) => `/delete-user/${id}`;

// ==========CONTENT MANAGEMENT END-POINTS============

export const GET_HOME_DATA = "/get-home";
export const UPDATE_HOME_DATA = "/update-home";

//===============BLOGS===========================

export const CREATE_BLOG = "/create-blog";
export const UPDATE_BLOG = "/update-blog";
export const GET_BLOG = "/get-blog";
export const DELETE_BLOG = "/delete-blog";
export const GET_BLOG_DETAIL = (slug) => `/get-blog/${slug}`;

//=======================Privacy Policy=======================
export const GET_PRIVACY_POLICY = "/privacy-policy";
export const UPDATE_PRIVACY_POLICY = "/update/privacy-policy";

//=======================Privacy Policy=======================
export const ADD_COUPON = "/add-coupon";
export const GET_COUPON = "/fetch-coupons";
export const DELETE_COUPON = "/delete-coupon";
