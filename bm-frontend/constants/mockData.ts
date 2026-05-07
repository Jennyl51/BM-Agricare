export type Product = {
  product_id: string;
  name: string;
  category: string;
  image_url: string;
  points_factor: number;
  description: string;
};

export type Invoice = {
  invoice_id: string;
  title: string;
  date: string;
  status: 'pending' | 'in_process' | 'completed' | 'rejected';
  points: number;
  items: { product_id: string; name: string; quantity: number; price: number }[];
};

export const BM = {
  blue: '#003B7A',
  deepBlue: '#002F71',
  green: '#68BC45',
  softGreen: '#EAF6D9',
  teal: '#95D3D6',
  orange: '#F2A14A',
  cream: '#FFFDF6',
  ink: '#0A0908',
  muted: '#6B7280',
};

export const products: Product[] = [
  {
    product_id: 'esta-kieserite',
    name: 'ESTA Kieserite',
    category: 'Straight Fertilizers',
    points_factor: 20,
    image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=700&q=80',
    description: 'Magnesium and sulphur fertilizer for healthier crops.',
  },
  {
    product_id: 'nitrophoska',
    name: 'Nitrophoska',
    category: 'Compound Fertilizers',
    points_factor: 18,
    image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80',
    description: 'Balanced nutrient support for field productivity.',
  },
  {
    product_id: 'nova-tec-suprem',
    name: 'NovaTec Suprem',
    category: 'Premium Fertilizers',
    points_factor: 22,
    image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=700&q=80',
    description: 'Premium stabilized nitrogen technology.',
  },
  {
    product_id: 'blaukorn-premium',
    name: 'Blaukorn Premium',
    category: 'Crop Nutrition',
    points_factor: 16,
    image_url: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=700&q=80',
    description: 'All-round crop nutrition for daily farm needs.',
  },
];

export const invoices: Invoice[] = [
  {
    invoice_id: 'inv-1001',
    title: 'Sent Invoice',
    date: 'March 16, 2026 · 4:23pm',
    status: 'in_process',
    points: 560,
    items: [
      { product_id: 'esta-kieserite', name: 'ESTA Kieserite', quantity: 50, price: 120 },
      { product_id: 'nitrophoska', name: 'Nitrophoska', quantity: 25, price: 100 },
    ],
  },
  {
    invoice_id: 'inv-1002',
    title: 'Sent Invoice',
    date: 'March 13, 2026 · 9:10am',
    status: 'in_process',
    points: 420,
    items: [{ product_id: 'nova-tec-suprem', name: 'NovaTec Suprem', quantity: 30, price: 155 }],
  },
  {
    invoice_id: 'inv-1003',
    title: 'Sent Invoice',
    date: 'March 10, 2026 · 1:02pm',
    status: 'completed',
    points: 780,
    items: [{ product_id: 'blaukorn-premium', name: 'Blaukorn Premium', quantity: 45, price: 90 }],
  },
];

export const pointHistory = [
  { id: 'h1', label: 'ESTA Kieserite purchase', date: '04/01/2026', earned: 2000, redeemed: 0 },
  { id: 'h2', label: 'NovaTec invoice approved', date: '04/03/2026', earned: 650, redeemed: 0 },
  { id: 'h3', label: 'Redeemed cap reward', date: '04/05/2026', earned: 0, redeemed: 500 },
  { id: 'h4', label: 'Blaukorn Premium purchase', date: '04/06/2026', earned: 1180, redeemed: 0 },
];

export const rewards = [
  { reward_id: 'r1', name: 'BM AgriCare Cap', description: 'Premium branded field cap.', points_needed: 500, tier_requirement: 'Gold', quantity_available: 23 },
  { reward_id: 'r2', name: 'Farm Tool Kit', description: 'Everyday tools for retailer partners.', points_needed: 1500, tier_requirement: 'Gold', quantity_available: 12 },
  { reward_id: 'r3', name: 'Training Voucher', description: 'Workshop voucher for product training.', points_needed: 2000, tier_requirement: 'Premium', quantity_available: 8 },
];

export const guides = [
  {
    guideline_id: 'g1',
    title: 'Behn Meyer AgriCare Introduces Agri Analytics & Services',
    category: 'News',
    body: 'Learn how Agri Analytics helps retailers understand product usage, invoice submissions, and seasonal product recommendations.',
    thumbnail_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80',
  },
  {
    guideline_id: 'g2',
    title: 'A Journey of Growth and Association with Behn Meyer AgriCare',
    category: 'Articles',
    body: 'A short guide on how retailers can work with TCEs, upload invoices, and track loyalty points.',
    thumbnail_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80',
  },
  {
    guideline_id: 'g3',
    title: 'How to Submit an Invoice Correctly',
    category: 'Products',
    body: 'Check product names, quantities, timestamp, location, and attach a clear invoice PDF before submitting.',
    thumbnail_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80',
  },
  {
    guideline_id: 'g4',
    title: 'Reward Points and Tier Rules',
    category: 'News',
    body: 'Points are awarded after review. Gold and Premium tiers unlock better rewards and priority product recommendations.',
    thumbnail_url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80',
  },
];
