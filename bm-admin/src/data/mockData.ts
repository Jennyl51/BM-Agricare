export const invoices = [
    {
      id: "INV-1001",
      retailer: "Retailer A",
      product: "Novatec 25kg",
      quantity: 12,
      points: 240,
      status: "Pending",
      submittedAt: "2026-05-06 10:30 AM",
    },
    {
      id: "INV-1002",
      retailer: "Retailer B",
      product: "Growel M+",
      quantity: 8,
      points: 160,
      status: "Pending",
      submittedAt: "2026-05-06 12:15 PM",
    },
    {
      id: "INV-1003",
      retailer: "Retailer C",
      product: "Gowin",
      quantity: 5,
      points: 100,
      status: "Approved",
      submittedAt: "2026-05-05 4:20 PM",
    },
  ];
  
  export const retailers = [
    { id: "RET-001", name: "Retailer A", region: "North", tier: "Silver", points: 1200 },
    { id: "RET-002", name: "Retailer B", region: "South", tier: "Gold", points: 2600 },
    { id: "RET-003", name: "Retailer C", region: "Central", tier: "Silver", points: 900 },
  ];
  
  export const rewards = [
    { id: "RWD-001", name: "BM Gift Set", points: 500, tier: "Silver", stock: 30 },
    { id: "RWD-002", name: "Fertilizer Discount Voucher", points: 1000, tier: "Gold", stock: 15 },
    { id: "RWD-003", name: "Premium Tool Kit", points: 2000, tier: "Gold", stock: 8 },
  ];