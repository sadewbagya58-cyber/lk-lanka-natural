// ============================================================
// KL Lanka Natural — Central Business Configuration
// ============================================================

export const BUSINESS_CONFIG = {
  name: "KL Lanka Natural",
  owner: "Mohamed Wazeem Akram",
  address: "97/15H, Avissawella Road, Wellampitiya, Sri Lanka",
  phone: "0757726363",
  email: "kllanka234@gmail.com",
  
  // Marketplace Categories
  categories: [
    "Supplements",
    "Hardware",
    "Electronics",
    "Food",
    "Jewellery",
    "Fancy Items",
    "Stationery",
    "Other general products"
  ],

  // Delivery / Shipping rates in USD
  delivery: {
    sriLanka: {
      min: 1.20,
      max: 2.10,
      flat: 1.50, // Flat rate charged at checkout if not free delivery
      display: "$1.20 - $2.10 estimated"
    },
    international: {
      ratePerKg: 22.30,
      display: "$22.30 per KG"
    }
  },

  // Payment configuration
  payments: {
    cod: {
      name: "Cash on Delivery (COD)",
      availableInSL: true,
      availableInternational: false
    },
    card: {
      name: "Card Payment — Available",
      available: true
    }
  }
};
