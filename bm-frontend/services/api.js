const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
const FORCE_LOCAL = process.env.EXPO_PUBLIC_FORCE_LOCAL === 'true';

const STORAGE_KEY = 'bm_agricare_local_store_v2';

const mockProducts = [
  { product_id: 'esta-kieserite', name: 'ESTA Kieserite', category: 'Straight Fertilizers', price: 120, points_factor: 20, image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=700&q=80', description: 'Magnesium and sulphur fertilizer for healthier crops.' },
  { product_id: 'nitrophoska', name: 'Nitrophoska', category: 'Compound Fertilizers', price: 100, points_factor: 18, image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80', description: 'Balanced nutrients for stronger roots and productive fields.' },
  { product_id: 'nova-tec-suprem', name: 'NovaTec Suprem', category: 'Premium Fertilizers', price: 155, points_factor: 22, image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=700&q=80', description: 'Premium stabilized nitrogen technology for crop performance.' },
  { product_id: 'blaukorn-premium', name: 'Blaukorn Premium', category: 'Crop Nutrition', price: 90, points_factor: 16, image_url: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=700&q=80', description: 'All-round crop nutrition for daily farm needs.' },
  { product_id: 'novatec-premium', name: 'NovaTec Premium', category: 'Seasonal', price: 135, points_factor: 21, image_url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80', description: 'Seasonal premium fertilizer recommendation.' },
];

const rewards = [
  { reward_id: 'r1', name: 'BM AgriCare Cap', description: 'Premium branded field cap.', points_needed: 500, tier_requirement: 'Gold', quantity_available: 23 },
  { reward_id: 'r2', name: 'Farm Tool Kit', description: 'Everyday tools for retailer partners.', points_needed: 1500, tier_requirement: 'Gold', quantity_available: 12 },
  { reward_id: 'r3', name: 'Training Voucher', description: 'Workshop voucher for product training.', points_needed: 2000, tier_requirement: 'Premium', quantity_available: 8 },
  { reward_id: 'r4', name: 'Premium Product Bundle', description: 'Demo pack with seasonal crop nutrition products.', points_needed: 3200, tier_requirement: 'Premium', quantity_available: 5 },
];

const guides = [
  { guideline_id: 'g1', title: 'How to Submit an Invoice Correctly', category: 'Products', body: 'Add each product name, enter the number of units, attach the invoice PDF, then review the approximate points before submitting.', thumbnail_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80', hotlink: '/points-transaction' },
  { guideline_id: 'g2', title: 'Reward Points and Tier Rules', category: 'News', body: 'Points are added after invoice review. Gold and Premium tiers unlock better rewards and product recommendations.', thumbnail_url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80', hotlink: '/rewards' },
  { guideline_id: 'g3', title: 'A Journey of Growth with Behn Meyer AgriCare', category: 'Articles', body: 'Learn how retailers, TCEs, and BM Admins work together to verify invoices and support farmers.', thumbnail_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80', hotlink: '/home-retailers' },
  { guideline_id: 'g4', title: 'Product Recommendations for the Season', category: 'Products', body: 'Explore products based on seasonal needs, point value per unit, and recent purchase history.', thumbnail_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80', hotlink: '/products-retailer' },
];

function storageAvailable() {
  try { return typeof localStorage !== 'undefined'; } catch { return false; }
}

function defaultStore() {
  return {
    activeUser: null,
    users: {
      'retailer@demo.com': { user_id: 'demo-retailer', username: 'retailer@demo.com', email: 'retailer@demo.com', password: 'password', name: 'Tin Bao Tran', phone_number: '+84 000 000', user_type: 'retailer', region: 'Tin Berry Farm | Mekong Delta', tier: 'Gold', total_points: 7809 },
      'tce@demo.com': { user_id: 'demo-tce', username: 'tce@demo.com', email: 'tce@demo.com', password: 'password', name: 'TCE Admin', phone_number: '+84 111 111', user_type: 'tce', region: 'Mekong Delta', tier: 'Staff', total_points: 0 },
    },
    invoicesByUser: { 'retailer@demo.com': [], 'tce@demo.com': [] },
    redemptionsByUser: { 'retailer@demo.com': [], 'tce@demo.com': [] },
    historyByUser: { 'retailer@demo.com': [], 'tce@demo.com': [] },
    invoiceDraftByUser: { 'retailer@demo.com': [], 'tce@demo.com': [] },
  };
}

function readStore() {
  if (!storageAvailable()) return defaultStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const d = defaultStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return d;
  }
  try {
    const parsed = JSON.parse(raw);
    const defaults = defaultStore();
    return {
      ...defaults,
      ...parsed,
      users: { ...defaults.users, ...(parsed.users || {}) },
      invoicesByUser: { ...defaults.invoicesByUser, ...(parsed.invoicesByUser || {}) },
      redemptionsByUser: { ...defaults.redemptionsByUser, ...(parsed.redemptionsByUser || {}) },
      historyByUser: { ...defaults.historyByUser, ...(parsed.historyByUser || {}) },
      invoiceDraftByUser: { ...defaults.invoiceDraftByUser, ...(parsed.invoiceDraftByUser || {}) },
    };
  } catch { return defaultStore(); }
}

function writeStore(store) {
  if (storageAvailable()) localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function currentKey(store) { return store.activeUser || 'retailer@demo.com'; }
function currentUser(store) { return store.users[currentKey(store)] || store.users['retailer@demo.com']; }

function enrichInvoice(inv) {
  const items = inv.items || [];
  const points = items.reduce((sum, item) => {
    const p = mockProducts.find((x) => x.product_id === item.product_id || x.name.toLowerCase() === String(item.name || '').toLowerCase());
    return sum + Number(item.quantity || 0) * Number(p?.points_factor || 10);
  }, 0);
  return { ...inv, points_awarded: inv.points_awarded ?? points, points, status: inv.status || inv.submission_status || 'pending', submission_status: inv.submission_status || inv.status || 'pending' };
}

function mockResponse(endpoint, method = 'GET', body = null) {
  const clean = endpoint.split('?')[0];
  const store = readStore();
  const key = currentKey(store);
  const user = currentUser(store);

  if (clean === '/auth/login' && method === 'POST') {
    const username = body?.username || body?.email || 'retailer@demo.com';
    const found = store.users[username] || store.users['retailer@demo.com'];
    store.activeUser = username in store.users ? username : 'retailer@demo.com';
    writeStore(store);
    return { access_token: 'local-demo-token', id_token: 'local-demo-id', refresh_token: 'local-demo-refresh', user_type: found.user_type || 'retailer', user: found };
  }
  if (clean === '/auth/signup' && method === 'POST') {
    const username = body?.username || body?.email || `user-${Date.now()}@demo.com`;
    store.users[username] = { user_id: `user-${Date.now()}`, username, email: body?.email || username, password: body?.password || 'password', name: body?.name || 'New Retailer', phone_number: body?.phone_number || '', user_type: body?.user_type || 'retailer', region: 'New Farm Location', tier: 'Starter', total_points: 0 };
    store.invoicesByUser[username] = [];
    store.redemptionsByUser[username] = [];
    store.historyByUser[username] = [];
    store.activeUser = username;
    writeStore(store);
    return { access_token: 'local-demo-token', id_token: 'local-demo-id', refresh_token: 'local-demo-refresh', user_type: body?.user_type || 'retailer', user: store.users[username] };
  }
  if (clean === '/users/me' && method === 'GET') {
    const invoices = (store.invoicesByUser[key] || []).map(enrichInvoice);
    const completed = invoices.filter((i) => i.status === 'completed').length;
    const pending = invoices.filter((i) => i.status !== 'completed').length;
    return { ...user, pending_invoices: pending, completed_invoices: completed, total_invoices: invoices.length };
  }
  if (clean === '/users/me' && method === 'PATCH') {
    store.users[key] = { ...user, ...body };
    writeStore(store);
    return store.users[key];
  }
  if (clean === '/products') return mockProducts;
  if (clean === '/guidelines' || clean === '/news') return guides;
  if (clean.startsWith('/guidelines/')) return guides.find((g) => String(g.guideline_id) === clean.split('/').pop()) || guides[0];
  if (clean === '/rewards') return rewards;
  if (clean === '/points/summary') {
    const nextTierPoints = user.tier === 'Premium' ? 0 : Math.max(0, 9000 - Number(user.total_points || 0));
    return { total_points: Number(user.total_points || 0), tier: user.tier || 'Starter', next_tier_points: nextTierPoints, lifetime_points: Number(user.total_points || 0) };
  }
  if (clean === '/points/history') return store.historyByUser[key] || [];
  if (clean === '/invoice-draft' && method === 'GET') return store.invoiceDraftByUser[key] || [];
  if (clean === '/invoice-draft' && method === 'POST') {
    store.invoiceDraftByUser[key] = Array.isArray(body?.items) ? body.items : [];
    writeStore(store);
    return store.invoiceDraftByUser[key];
  }
  if (clean === '/invoice-draft' && method === 'DELETE') {
    store.invoiceDraftByUser[key] = [];
    writeStore(store);
    return [];
  }
  if (clean === '/invoices' && method === 'GET') return (store.invoicesByUser[key] || []).map(enrichInvoice).sort((a, b) => new Date(b.invoice_timestamp).getTime() - new Date(a.invoice_timestamp).getTime());
  if (clean === '/invoices' && method === 'POST') {
    const invoice = enrichInvoice({ invoice_id: `local-${Date.now()}`, invoice_timestamp: body?.invoice_timestamp || new Date().toISOString(), submission_status: 'pending', status: 'pending', invoice_photo_url: body?.invoice_photo_url, gps_lat: body?.gps_lat, gps_lon: body?.gps_lon, items: body?.items || [] });
    store.invoicesByUser[key] = [invoice, ...(store.invoicesByUser[key] || [])];
    store.invoiceDraftByUser[key] = [];
    store.historyByUser[key] = [{ id: `h-${Date.now()}`, points_earned: 0, points_redeemed: 0, description: `Invoice ${invoice.invoice_id} submitted for review`, occurred_at: new Date().toISOString().slice(0, 10) }, ...(store.historyByUser[key] || [])];
    writeStore(store);
    return invoice;
  }
  if (clean === '/redemptions' && method === 'POST') {
    const rewardId = body?.items?.[0]?.reward_id;
    const reward = rewards.find((r) => r.reward_id === rewardId) || rewards[0];
    const qty = Number(body?.items?.[0]?.quantity || 1);
    const cost = reward.points_needed * qty;
    store.users[key] = { ...user, total_points: Math.max(0, Number(user.total_points || 0) - cost) };
    const redemption = { redemption_id: `red-${Date.now()}`, status: 'pending', reward_id: reward.reward_id, reward_name: reward.name, quantity: qty, points_redeemed: cost, occurred_at: new Date().toISOString() };
    store.redemptionsByUser[key] = [redemption, ...(store.redemptionsByUser[key] || [])];
    store.historyByUser[key] = [{ id: `h-${Date.now()}`, points_earned: 0, points_redeemed: cost, description: `Redeemed ${reward.name}`, occurred_at: new Date().toISOString().slice(0, 10) }, ...(store.historyByUser[key] || [])];
    writeStore(store);
    return redemption;
  }
  if (clean === '/redemptions/me') return store.redemptionsByUser[key] || [];
  if (clean === '/language/options') return ['en', 'vi', 'th', 'id', 'ms', 'zh', 'es', 'fr', 'ko', 'ja'];
  return null;
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  if (FORCE_LOCAL) return mockResponse(endpoint, method, body);
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 1600) : null;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
      signal: controller?.signal,
    });
    if (timer) clearTimeout(timer);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(data?.detail?.message || data?.detail || 'Request failed');
    return data;
  } catch (error) {
    const fallback = mockResponse(endpoint, method, body);
    if (fallback !== null) return fallback;
    throw error;
  }
}
