// export const BASE_URL = 'http://localhost:4000';
export const BASE_URL = 'https://api.startsitem.com';

export const BASE_URL_ADMIN = `${BASE_URL}/Admin/api`;
export const BASE_URL_USER = `${BASE_URL}/User/api`;
export const BASE_URL_COMMON = `${BASE_URL}/api`;
export const BASE_URL_IMAGE = `${BASE_URL}/images/`;
export const BASE_URL_SPORTS_API = `${BASE_URL}/Sports/api`;
export const BASE_URL_PAYMENT = `${BASE_URL}/Payments/api`;

// ==========END-POINTS============
export const LOGIN = '/login';
export const REGISTER = '/sign-up';

export const FORGOT_PASSWORD = '/forgot-password';
export const RESET_PASSWORD = '/set-new-password';
export const CHANGE_PASSWORD = '/change-password';

export const USER_CHECK_OTP = '/check-otp';

export const VIEW_PROFILE = '/view-profile';
export const UPDATE_PROFILE = '/edit-profile';

export const LOGOUT = '/logout';

export const GET_BLOG = '/get-blog';
export const GET_BLOG_DETAIL = (id) => `/get-blog/${id}`;

export const RESEND_OTP = '/resend-otp';

//====================Sports Data API=====================
// export const GET_ALL_PLAYERS = "/players";
// export const CALCULATE_SCORE = "/calculate-score";

//=======================STRIPE====================

export const GET_PLANS = '/plans';
export const CREATE_PAYMENT = '/create-payment-intent';
export const GET_HISTORY = '/history';
export const CANCEL_SUBSCRIPTION = '/cancel-subscription';

//======================Privacy Policy======================
export const GET_PRIVACY_POLICY = '/privacy-policy';
