export const API_ENDPOINTS = {
  // Buyers
  BUYER_REGISTER: '/api/buyers/register/',
  BUYER_LOGIN: '/api/buyers/login/',
  BUYER_PROFILE: '/api/buyers/profile/',
  BUYER_ADDRESSES: '/api/buyers/addresses/',
  TOKEN_REFRESH: '/api/auth/token/refresh/',

  // Sellers  
  SELLERS: '/api/sellers/',
  SELLER_DETAIL: (id) => `/api/sellers/${id}/`,
  SELLER_REGISTER: '/api/sellers/register/',
  SELLER_LOGIN: '/api/sellers/login/',
  SELLER_PROFILE: '/api/sellers/profile/',

  // Products
  PRODUCTS: '/api/products/',
  PRODUCT_DETAIL: (id) => `/api/products/${id}/`,
  CATEGORIES: '/api/products/categories/',
  FEATURED_PRODUCTS: '/api/products/featured/',
  TRENDING_PRODUCTS: '/api/products/trending/',
  PRODUCT_SEARCH: '/api/products/search/',

  // Orders
  ORDERS: '/api/orders/',
  ORDER_DETAIL: (id) => `/api/orders/${id}/`,
  CREATE_ORDER: '/api/orders/',
  LOGISTICS_PROVIDERS: '/api/orders/logistics/',
  PAYMENT_METHODS: '/api/orders/payment-methods/',

  // Payments
  PAYMENTS: '/api/payments/',
  CREATE_PAYMENT: '/api/payments/',
  REFUNDS: '/api/payments/refunds/',

  // Signatures
  GENERATE_KEYPAIR: '/api/signatures/crypto/generate_keypair/',
  SIGN_MESSAGE: '/api/signatures/crypto/sign_message/',
  VERIFY_SIGNATURE: '/api/signatures/crypto/verify_signature/',
  SIGNATURE_LOGS: '/api/signatures/logs/',
  CERTIFICATE_AUTHORITIES: '/api/signatures/ca/',
};