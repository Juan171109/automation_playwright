/**
 * Test data for the mock shop website
 */

/**
 * Expected product data from the shop
 */
export const expectedProducts = [
    { 
      productCode: 'P001', 
      description: 'Fresh Apples',
      price: 5.99,
      uom: 'kg',
      qty: 10
    },
    { 
      productCode: 'P002', 
      description: 'Organic Bananas',
      price: 3.49,
      uom: 'kg',
      qty: 15
    },
    { 
      productCode: 'P003', 
      description: 'Whole Wheat Bread',
      price: 1.99,
      uom: 'unit',
      qty: 20
    },
    { 
      productCode: 'P004', 
      description: 'Fresh Milk',
      price: 2.89,
      uom: 'liter',
      qty: 12
    },
    { 
      productCode: 'P005', 
      description: 'Chicken Breast',
      price: 6.49,
      uom: 'kg',
      qty: 8
    },
    { 
      productCode: 'P006', 
      description: 'Beef Mince',
      price: 4.99,
      uom: 'kg',
      qty: 10
    }
  ];
  
  /**
   * Test search terms for product filtering
   */
  export const searchTerms = {
    validProductCode: 'P001',
    validProductDescription: 'Fresh',
    invalidSearch: 'nonexistent',
    partialMatch: 'an'  // Should match "Organic Bananas"
  };
  
  /**
   * Test user credentials
   */
  export const userCredentials = {
    valid: {
      username: process.env.USERNAME || 'user1',
      password: process.env.PASSWORD || 'user1'
    },
    invalid: {
      username: 'invalid',
      password: 'wrong'
    }
  };