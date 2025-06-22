export const API_ENDPOINTS = {
  // Buyers
  BUYER_REGISTER: '/auth/buyers/register/',
  BUYER_LOGIN: '/auth/buyers/login/',
  BUYER_PROFILE: '/auth/buyers/profile/',
  BUYER_ADDRESSES: '/auth/buyers/addresses/',
  TOKEN_REFRESH: '/auth/token/refresh/',
  
  // Sellers  
  SELLERS: '/sellers/',
  SELLER_DETAIL: (id) => `/sellers/${id}/`,
  SELLER_REGISTER: '/sellers/register/',
  SELLER_LOGIN: '/sellers/login/',
  SELLER_PROFILE: '/sellers/profile/',
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id) => `/products/${id}/`,
  CATEGORIES: '/products/categories/',
  FEATURED_PRODUCTS: '/products/featured/',
  TRENDING_PRODUCTS: '/products/trending/',
  PRODUCT_SEARCH: '/products/search/',
  
  // Orders
  ORDERS: '/orders/orders/',
  ORDER_DETAIL: (id) => `/orders/orders/${id}/`,
  CREATE_ORDER: '/orders/orders/',
  LOGISTICS_PROVIDERS: '/orders/logistics/',
  PAYMENT_METHODS: '/orders/payment-methods/',
  
  // Payments
  PAYMENTS: '/payments/payments/',
  CREATE_PAYMENT: '/payments/payments/',
  REFUNDS: '/payments/refunds/',
  
  // Signatures
  GENERATE_KEYPAIR: '/signatures/crypto/generate_keypair/',
  SIGN_MESSAGE: '/signatures/crypto/sign_message/',
  VERIFY_SIGNATURE: '/signatures/crypto/verify_signature/',
  SIGNATURE_LOGS: '/signatures/logs/',
  CERTIFICATE_AUTHORITIES: '/signatures/ca/',
};