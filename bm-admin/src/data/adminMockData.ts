export const summaryCards = {
    pendingInvoices: 10,
    totalInvoices: 368,
    totalRetailers: 2054,
    rewardRequests: 10,
    totalSales: 128450,
    pointsIssued: 84200,
  };
  
  export const products = [
    {
      product_id: 1,
      product_name: "Entec",
      brand: "Entec",
      category: "Stabilized Mineral Fertilizer",
      point_factor: 10,
      description:
        "Stabilized mineral fertilizer designed for optimal nitrogen efficiency, long-lasting nitrogen availability, enhanced nutrient uptake, and improved yield.",
      benefits: [
        "Optimized nitrogen stability",
        "Enhanced nutrient uptake",
        "Environmental protection",
        "Higher yield and profitability",
      ],
      is_active: true,
    },
    {
      product_id: 2,
      product_name: "Nitrophoska",
      brand: "Nitrophoska",
      category: "All-in-One Granule Fertilizer",
      point_factor: 12,
      description:
        "All-in-one granule fertilizer solution for durian, providing balanced NPK, secondary nutrients, and micronutrients in every granule.",
      benefits: [
        "Balanced all-in-one granules",
        "Superior root-zone delivery",
        "High nutrient efficiency",
        "Yield and quality maximization",
      ],
      is_active: true,
    },
    {
      product_id: 3,
      product_name: "Fertiganic",
      brand: "Fertiganic",
      category: "Organic Fertilizer",
      point_factor: 15,
      description:
        "Advanced organic nutrition enriched with natural minerals and biostimulation for stronger crop growth and nutrient uptake.",
      benefits: [
        "High organic content",
        "Over 70 essential minerals",
        "Biological regulator technology",
        "Easy handling and fast dissolution",
      ],
      is_active: true,
    },
  ];
  
  export const invoices = [
    {
      invoice_id: 1001,
      retailer_id: 201,
      retailer_name: "Retailer One",
      region: "West",
      tier: "silver",
      status: "Pending",
      created_at: "2026-05-01",
      total_sales: 1200,
      points: 120,
      items: [{ product_name: "Entec", quantity: 12, price_at_purchase: 100 }],
    },
    {
      invoice_id: 1002,
      retailer_id: 202,
      retailer_name: "Retailer Two",
      region: "West",
      tier: "gold",
      status: "Approved",
      created_at: "2026-05-02",
      total_sales: 1800,
      points: 216,
      items: [{ product_name: "Nitrophoska", quantity: 15, price_at_purchase: 120 }],
    },
    {
      invoice_id: 1003,
      retailer_id: 203,
      retailer_name: "Retailer Three",
      region: "North",
      tier: "bronze",
      status: "Rejected",
      created_at: "2026-05-03",
      total_sales: 900,
      points: 0,
      items: [{ product_name: "Fertiganic", quantity: 6, price_at_purchase: 150 }],
    },
    {
      invoice_id: 1004,
      retailer_id: 204,
      retailer_name: "Retailer Four",
      region: "South",
      tier: "silver",
      status: "Approved",
      created_at: "2026-05-04",
      total_sales: 2400,
      points: 240,
      items: [{ product_name: "Entec", quantity: 24, price_at_purchase: 100 }],
    },
  ];
  
  export const retailers = [
    {
      user_id: 201,
      name: "Retailer One",
      phone_number: "5103330001",
      tier: "silver",
      total_points: 500,
      assigned_tce_id: 101,
      region: "West",
      total_sales: 12000,
      invoice_count: 18,
    },
    {
      user_id: 202,
      name: "Retailer Two",
      phone_number: "5103330002",
      tier: "gold",
      total_points: 1800,
      assigned_tce_id: 101,
      region: "West",
      total_sales: 24500,
      invoice_count: 30,
    },
    {
      user_id: 203,
      name: "Retailer Three",
      phone_number: "5103330003",
      tier: "bronze",
      total_points: 300,
      assigned_tce_id: 102,
      region: "North",
      total_sales: 7800,
      invoice_count: 12,
    },
    {
      user_id: 204,
      name: "Retailer Four",
      phone_number: "5103330004",
      tier: "silver",
      total_points: 900,
      assigned_tce_id: 102,
      region: "South",
      total_sales: 15200,
      invoice_count: 21,
    },
    {
      user_id: 205,
      name: "Retailer Five",
      phone_number: "5103330005",
      tier: "gold",
      total_points: 2100,
      assigned_tce_id: 103,
      region: "East",
      total_sales: 30100,
      invoice_count: 35,
    },
  ];
  
  export const rewards = [
    {
      gift_id: 1,
      name: "Coffee Mug",
      points_required: 300,
      min_tier: "silver",
      stock_quantity: 100,
    },
    {
      gift_id: 2,
      name: "Bluetooth Speaker",
      points_required: 1200,
      min_tier: "silver",
      stock_quantity: 40,
    },
    {
      gift_id: 3,
      name: "Smart Watch",
      points_required: 2500,
      min_tier: "gold",
      stock_quantity: 20,
    },
  ];
  
  export const rewardRequests = [
    {
      order_id: 1,
      retailer_name: "Retailer One",
      gift_name: "Coffee Mug",
      status: "Delivered",
    },
    {
      order_id: 2,
      retailer_name: "Retailer Two",
      gift_name: "Bluetooth Speaker",
      status: "Out for Delivery",
    },
    {
      order_id: 3,
      retailer_name: "Retailer Five",
      gift_name: "Smart Watch",
      status: "Requested",
    },
  ];
  
  export const salesOverTime = {
    week: [
      { date: "Mon", Entec: 1200, Nitrophoska: 900, Fertiganic: 600 },
      { date: "Tue", Entec: 1500, Nitrophoska: 1000, Fertiganic: 700 },
      { date: "Wed", Entec: 1000, Nitrophoska: 1400, Fertiganic: 800 },
      { date: "Thu", Entec: 1800, Nitrophoska: 1300, Fertiganic: 900 },
      { date: "Fri", Entec: 2200, Nitrophoska: 1600, Fertiganic: 1200 },
    ],
    month: [
      { date: "Week 1", Entec: 7500, Nitrophoska: 5200, Fertiganic: 3400 },
      { date: "Week 2", Entec: 8200, Nitrophoska: 6100, Fertiganic: 4200 },
      { date: "Week 3", Entec: 9000, Nitrophoska: 7000, Fertiganic: 4800 },
      { date: "Week 4", Entec: 10400, Nitrophoska: 7600, Fertiganic: 5300 },
    ],
    year: [
      { date: "Jan", Entec: 22000, Nitrophoska: 18000, Fertiganic: 12000 },
      { date: "Feb", Entec: 26000, Nitrophoska: 21000, Fertiganic: 15000 },
      { date: "Mar", Entec: 30000, Nitrophoska: 24000, Fertiganic: 18000 },
      { date: "Apr", Entec: 34000, Nitrophoska: 28000, Fertiganic: 21000 },
      { date: "May", Entec: 39000, Nitrophoska: 31000, Fertiganic: 24000 },
    ],
  };
  
  export const tierCompositionByRegion = [
    { region: "West", bronze: 20, silver: 45, gold: 25, premium: 10 },
    { region: "North", bronze: 35, silver: 40, gold: 20, premium: 5 },
    { region: "South", bronze: 25, silver: 50, gold: 15, premium: 10 },
    { region: "East", bronze: 15, silver: 35, gold: 35, premium: 15 },
  ];