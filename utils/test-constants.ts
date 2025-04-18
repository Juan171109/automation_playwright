/**
 * Common constants used across tests
 */

// Page URLs
export const PAGE_URLS = {
    LOGIN: '/index.html',
    SHOP: '/shop.html',
    BASKET: '/basket.html'
  };
  
  // Timeouts
  export const TIMEOUTS = {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 10000
  };
  
  // Alert messages
  export const ALERT_MESSAGES = {
    PRODUCT_ADDED: (productName: string) => `${productName} added to basket!`,
    BASKET_CLEARED: 'Basket cleared!'
  };
  
  // Error messages
  export const ERROR_MESSAGES = {
    INVALID_LOGIN: 'Invalid username or password'
  };
  
  // Text content
  export const TEXT_CONTENT = {
    EMPTY_BASKET: 'Your basket is empty.',
    TOTAL_PREFIX: 'Total: $'
  };
  
  // LocalStorage keys
  export const STORAGE_KEYS = {
    BASKET: 'basket'
  };
  
  // Expected product count
  export const PRODUCT_COUNT = 6;