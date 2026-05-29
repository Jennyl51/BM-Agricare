export type RetailerInvoice = {
  id: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Flagged' | 'Rejected';
  total: number;
  points: number;
  items: { name: string; units: number; points: number }[];
};

export type RetailerReward = {
  id: string;
  title: string;
  status: 'Eligible' | 'Redeemed' | 'Shipping' | 'Locked';
  points: number;
  date?: string;
};

export type TCERetailer = {
  id: string;
  name: string;
  owner: string;
  tier: 'Starter' | 'Gold' | 'Emerald' | 'Diamond';
  region: string;
  address: string;
  phone: string;
  lastVisit: string;
  priority: 'High' | 'Medium' | 'Low';
  points: number;
  monthlySales: number;
  invoiceCount: number;
  pendingInvoices: number;
  rewardCount: number;
  notes: string;
  favoriteProducts: string[];
  invoices: RetailerInvoice[];
  rewards: RetailerReward[];
};

export const tceRetailers: TCERetailer[] = [
  {
    id: 'retailer-0137',
    name: 'Wholesaler #37',
    owner: 'Nguyen Anh',
    tier: 'Gold',
    region: 'Ta Nang, Lam Dong',
    address: '40 Phu Trong, Ta Nang, Lam Dong',
    phone: '+84 912 004 137',
    lastVisit: 'Today, 10:59 AM',
    priority: 'High',
    points: 7809,
    monthlySales: 18250,
    invoiceCount: 12,
    pendingInvoices: 2,
    rewardCount: 3,
    notes: 'Strong monthly Entec and Basfoliar volume. Check two pending invoices and remind retailer about gold tier redemption window.',
    favoriteProducts: ['Entec 25KG', 'Basfoliar Aktiv SL', 'Novatec Suprem'],
    invoices: [
      { id: 'INV-1357', date: 'Today', status: 'Pending', total: 4250, points: 640, items: [{ name: 'Entec 25KG', units: 4, points: 400 }, { name: 'Basfoliar Aktiv SL', units: 3, points: 240 }] },
      { id: 'INV-1321', date: 'May 18', status: 'Approved', total: 3800, points: 510, items: [{ name: 'Novatec Suprem', units: 3, points: 330 }, { name: 'Fruit-Ace', units: 2, points: 180 }] },
      { id: 'INV-1288', date: 'May 09', status: 'Approved', total: 2900, points: 370, items: [{ name: 'Entec 25KG', units: 2, points: 200 }, { name: 'Cocoa Mix', units: 2, points: 170 }] },
    ],
    rewards: [
      { id: 'RW-075', title: 'BM Field Jacket', status: 'Eligible', points: 3000 },
      { id: 'RW-052', title: 'Premium Fertilizer Kit', status: 'Redeemed', points: 2500, date: 'May 12' },
      { id: 'RW-044', title: 'Gold Tier Gift Box', status: 'Shipping', points: 1200, date: 'May 18' },
    ],
  },
  {
    id: 'retailer-076',
    name: 'An Yen Farm Supply',
    owner: 'Tran Linh',
    tier: 'Starter',
    region: 'Duc Trong',
    address: '12 Market Road, Duc Trong, Lam Dong',
    phone: '+84 901 330 076',
    lastVisit: 'Today, 11:06 AM',
    priority: 'Medium',
    points: 2140,
    monthlySales: 7600,
    invoiceCount: 6,
    pendingInvoices: 1,
    rewardCount: 1,
    notes: 'Newer retailer with frequent consultation requests. Recommend crop guide follow-up for citrus parasite treatment.',
    favoriteProducts: ['Fruit-Ace', 'Citrus Care Pack', 'Basfoliar Aktiv SL'],
    invoices: [
      { id: 'INV-1330', date: 'Yesterday', status: 'Approved', total: 1700, points: 230, items: [{ name: 'Fruit-Ace', units: 2, points: 180 }, { name: 'Citrus Care Pack', units: 1, points: 50 }] },
      { id: 'INV-1297', date: 'May 10', status: 'Pending', total: 920, points: 120, items: [{ name: 'Basfoliar Aktiv SL', units: 1, points: 80 }, { name: 'Corn Boost', units: 1, points: 40 }] },
    ],
    rewards: [
      { id: 'RW-019', title: 'Starter Training Voucher', status: 'Eligible', points: 1000 },
      { id: 'RW-031', title: 'Premium Sprayer', status: 'Locked', points: 3500 },
    ],
  },
  {
    id: 'retailer-2054',
    name: 'Bao Loc Agri Mart',
    owner: 'Pham Minh',
    tier: 'Emerald',
    region: 'Bao Loc',
    address: '88 Tea Hill Street, Bao Loc, Lam Dong',
    phone: '+84 988 502 054',
    lastVisit: 'May 20, 3:40 PM',
    priority: 'High',
    points: 12680,
    monthlySales: 24400,
    invoiceCount: 18,
    pendingInvoices: 3,
    rewardCount: 4,
    notes: 'High value retailer. One rejected invoice needs resubmission with clearer product labels and matching unit count.',
    favoriteProducts: ['Fruit-Ace', 'Novatec Suprem', 'Rice Booster'],
    invoices: [
      { id: 'INV-1349', date: 'Today', status: 'Flagged', total: 5100, points: 0, items: [{ name: 'Fruit-Ace', units: 8, points: 0 }] },
      { id: 'INV-1312', date: 'May 17', status: 'Approved', total: 6200, points: 840, items: [{ name: 'Novatec Suprem', units: 5, points: 550 }, { name: 'Rice Booster', units: 3, points: 290 }] },
      { id: 'INV-1277', date: 'May 07', status: 'Approved', total: 4500, points: 620, items: [{ name: 'Fruit-Ace', units: 4, points: 360 }, { name: 'Coconut Mix', units: 3, points: 260 }] },
    ],
    rewards: [
      { id: 'RW-102', title: 'Emerald Crop Demo Kit', status: 'Redeemed', points: 5000, date: 'May 01' },
      { id: 'RW-099', title: 'BM Cooler Bag', status: 'Shipping', points: 1800, date: 'May 19' },
      { id: 'RW-125', title: 'Diamond Field Trip', status: 'Locked', points: 18000 },
    ],
  },
  {
    id: 'retailer-0798',
    name: 'Da Lat Garden Center',
    owner: 'Le Bao',
    tier: 'Gold',
    region: 'Da Lat',
    address: '7 Flower Valley, Da Lat, Lam Dong',
    phone: '+84 933 710 798',
    lastVisit: 'May 19, 9:15 AM',
    priority: 'Low',
    points: 6920,
    monthlySales: 13900,
    invoiceCount: 10,
    pendingInvoices: 0,
    rewardCount: 2,
    notes: 'Clean invoice history. Good candidate for product education content and seasonal campaign push.',
    favoriteProducts: ['Basfoliar Aktiv SL', 'Cocoa Mix', 'Novatec Suprem'],
    invoices: [
      { id: 'INV-1359', date: 'Today', status: 'Approved', total: 3100, points: 420, items: [{ name: 'Novatec Suprem', units: 3, points: 330 }, { name: 'Basfoliar Aktiv SL', units: 1, points: 90 }] },
      { id: 'INV-1302', date: 'May 13', status: 'Approved', total: 2400, points: 310, items: [{ name: 'Cocoa Mix', units: 3, points: 210 }, { name: 'Basfoliar Aktiv SL', units: 1, points: 100 }] },
    ],
    rewards: [
      { id: 'RW-072', title: 'Gold Tier Gift Box', status: 'Eligible', points: 1200 },
      { id: 'RW-058', title: 'BM Product Display Stand', status: 'Redeemed', points: 2200, date: 'May 14' },
    ],
  },
];

export function getTCERetailer(id?: string | string[]) {
  const key = Array.isArray(id) ? id[0] : id;
  return tceRetailers.find((retailer) => retailer.id === key) || tceRetailers[0];
}
