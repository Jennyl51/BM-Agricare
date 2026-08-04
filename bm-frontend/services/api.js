// const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

// export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
// const BACKEND_ONLY_ENDPOINTS = new Set(['/demo/rewards']);

// const AUTH_STORAGE_KEY = 'bm_agricare_auth_token_v2';

// // Set this to true only when you want to force local mock mode.
// const FORCE_LOCAL = process.env.EXPO_PUBLIC_FORCE_LOCAL === 'true';

// // During backend connection testing, keep this false.
// // If true, failed backend requests will silently use mock data.
// const ENABLE_MOCK_FALLBACK = process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK === 'true';

// function storageAvailable() {
//   try {
//     return typeof localStorage !== 'undefined';
//   } catch {
//     return false;
//   }
// }

// function getStoredToken() {
//   if (!storageAvailable()) return null;
//   return localStorage.getItem(AUTH_STORAGE_KEY);
// }

// export function saveAuthToken(token) {
//   if (storageAvailable() && token) {
//     localStorage.setItem(AUTH_STORAGE_KEY, token);
//   }
// }

// export function clearAuthToken() {
//   if (storageAvailable()) {
//     localStorage.removeItem(AUTH_STORAGE_KEY);
//   }
// }

// const mockRewards = [
//   {
//     reward_id: 'mock_reward_id_1',
//     rwd_id: 1,
//     name: 'Mock Reward (T-Shirt)',
//     description: 'Mock fallback reward.',
//     points_needed: 100,
//     quantity_available: 999,
//     tier_requirement: 'bronze',
//     related_product: null,
//     image_url: null,
//     is_pinned: false,
//     is_seasonal: false,
//     is_visible: true,
//   },
//   {
//     reward_id: 'mock_reward_id_2',
//     rwd_id: 2,
//     name: 'Mock Reward (Cap)',
//     description: 'Mock fallback reward.',
//     points_needed: 50,
//     quantity_available: null,
//     tier_requirement: 'bronze',
//     related_product: null,
//     image_url: null,
//     is_pinned: false,
//     is_seasonal: false,
//     is_visible: true,
//   },
// ];

// function mockResponse(endpoint, method = 'GET', body = null) {
//   const clean = endpoint.split('?')[0];

//   if (clean === '/demo/rewards' || clean === '/rewards') {
//     return mockRewards;
//   }

//   if (clean === '/auth/login' && method === 'POST') {
//     const token = body?.username === 'diamond' ? 'diamond-demo-token' : 'local-demo-token';
//     saveAuthToken(token);

//     return {
//       access_token: token,
//       id_token: `${token}-id`,
//       refresh_token: `${token}-refresh`,
//       user_type: body?.username === 'tce@demo.com' ? 'tce' : 'retailer',
//       user: {
//         username: body?.username || 'retailer@demo.com',
//         name: body?.username === 'diamond' ? 'Diamond Demo Retailer' : 'Demo Retailer',
//         tier: body?.username === 'diamond' ? 'Diamond' : 'Gold',
//         total_points: body?.username === 'diamond' ? 18500 : 7809,
//       },
//     };
//   }

//   return null;
// }

// function buildHeaders(extraHeaders = {}) {
//   const token = getStoredToken();

//   return {
//     'Content-Type': 'application/json',
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...extraHeaders,
//   };
// }

// // export async function apiRequest(endpoint, method = 'GET', body = null, options = {}) {
// //   const {
// //     timeoutMs = 8000,
// //     useAuth = true,
// //     allowMockFallback = ENABLE_MOCK_FALLBACK,
// //   } = options;

// //   if (FORCE_LOCAL) {
// //     const fallback = mockResponse(endpoint, method, body);
// //     if (fallback !== null) return fallback;
// //   }

// //   const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
// //   const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

// //   try {
// //     const token = useAuth ? getStoredToken() : null;

// //     const headers = {
// //       'Content-Type': 'application/json',
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //     };

// //     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
// //       method,
// //       headers,
// //       body: body ? JSON.stringify(body) : null,
// //       signal: controller?.signal,
// //     });

// //     if (timer) clearTimeout(timer);

// //     const text = await response.text();

// //     let data = null;
// //     try {
// //       data = text ? JSON.parse(text) : null;
// //     } catch {
// //       data = text;
// //     }

// //     if (!response.ok) {
// //       const message =
// //         data?.detail?.message ||
// //         data?.detail ||
// //         data?.error ||
// //         `Request failed with status ${response.status}`;

// //       throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
// //     }

// //     if ((endpoint === '/auth/login' || endpoint === '/auth/signup') && data?.access_token) {
// //       saveAuthToken(data.access_token);
// //     }

// //     return data;
// //   } catch (error) {
// //     if (timer) clearTimeout(timer);

// //     console.error(`[apiRequest] ${method} ${endpoint} failed:`, error);

// //     if (allowMockFallback) {
// //       const fallback = mockResponse(endpoint, method, body);
// //       if (fallback !== null) return fallback;
// //     }

// //     throw error;
// //   }
// // }
// export async function apiRequest(endpoint, method = 'GET', body = null, options = {}) {
//   const clean = endpoint.split('?')[0];

//   // Only this endpoint is forced to use the real backend for the demo.
//   // Everything else can stay mock/local so other pages do not break.
//   const mustUseBackend = clean === '/demo/rewards';

//   const {
//     timeoutMs = 8000,
//     useAuth = true,
//     allowMockFallback = mustUseBackend ? false : ENABLE_MOCK_FALLBACK,
//   } = options;

//   if (!mustUseBackend && FORCE_LOCAL) {
//     const fallback = mockResponse(endpoint, method, body);
//     if (fallback !== null) return fallback;
//   }

//   const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
//   const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

//   try {
//     const token = useAuth ? getStoredToken() : null;

//     const headers = {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : null,
//       signal: controller?.signal,
//     });

//     if (timer) clearTimeout(timer);

//     const text = await response.text();

//     let data = null;
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = text;
//     }

//     if (!response.ok) {
//       const message =
//         data?.detail?.message ||
//         data?.detail ||
//         data?.error ||
//         `Request failed with status ${response.status}`;

//       throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
//     }

//     if ((endpoint === '/auth/login' || endpoint === '/auth/signup') && data?.access_token) {
//       saveAuthToken(data.access_token);
//     }

//     return data;
//   } catch (error) {
//     if (timer) clearTimeout(timer);

//     console.error(`[apiRequest] ${method} ${endpoint} failed:`, error);

//     // Important: do NOT hide backend rewards failure behind mock data.
//     if (mustUseBackend) {
//       throw error;
//     }

//     if (allowMockFallback) {
//       const fallback = mockResponse(endpoint, method, body);
//       if (fallback !== null) return fallback;
//     }

//     throw error;
//   }
// }



// const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
// const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
// const FORCE_LOCAL = process.env.EXPO_PUBLIC_FORCE_LOCAL === 'true';

// const STORAGE_KEY = 'bm_agricare_local_store_v2';
// const AUTH_STORAGE_KEY = 'bm_agricare_auth_token_v2';

// const mockProducts = [
//   { product_id: 'esta-kieserite', name: 'ESTA Kieserite', category: 'Straight Fertilizers', price: 120, points_factor: 20, image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=700&q=80', description: 'Magnesium and sulphur fertilizer for healthier crops.' },
//   { product_id: 'nitrophoska', name: 'Nitrophoska', category: 'Compound Fertilizers', price: 100, points_factor: 18, image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80', description: 'Balanced nutrients for stronger roots and productive fields.' },
//   { product_id: 'nova-tec-suprem', name: 'NovaTec Suprem', category: 'Premium Fertilizers', price: 155, points_factor: 22, image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=700&q=80', description: 'Premium stabilized nitrogen technology for crop performance.' },
//   { product_id: 'blaukorn-premium', name: 'Blaukorn Premium', category: 'Crop Nutrition', price: 90, points_factor: 16, image_url: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=700&q=80', description: 'All-round crop nutrition for daily farm needs.' },
//   { product_id: 'novatec-premium', name: 'NovaTec Premium', category: 'Seasonal', price: 135, points_factor: 21, image_url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80', description: 'Seasonal premium fertilizer recommendation.' },
// ];

// const rewards = [
//   { reward_id: 'r1', name: 'BM AgriCare Cap', description: 'Premium branded field cap.', points_needed: 500, tier_requirement: 'Gold', quantity_available: 23 },
//   { reward_id: 'r2', name: 'Farm Tool Kit', description: 'Everyday tools for retailer partners.', points_needed: 1500, tier_requirement: 'Gold', quantity_available: 12 },
//   { reward_id: 'r3', name: 'Training Voucher', description: 'Workshop voucher for product training.', points_needed: 2000, tier_requirement: 'Premium', quantity_available: 8 },
//   { reward_id: 'r4', name: 'Premium Product Bundle', description: 'Demo pack with seasonal crop nutrition products.', points_needed: 3200, tier_requirement: 'Premium', quantity_available: 5 },
// ];

// const guides = [
//   { guideline_id: 'g1', title: 'How to Submit an Invoice Correctly', category: 'Products', body: 'Add each product name, enter the number of units, attach the invoice PDF, then review the approximate points before submitting.', thumbnail_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80', hotlink: '/points-transaction' },
//   { guideline_id: 'g2', title: 'Reward Points and Tier Rules', category: 'News', body: 'Points are added after invoice review. Gold and Premium tiers unlock better rewards and product recommendations.', thumbnail_url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80', hotlink: '/rewards' },
//   { guideline_id: 'g3', title: 'A Journey of Growth with Behn Meyer AgriCare', category: 'Articles', body: 'Learn how retailers, TCEs, and BM Admins work together to verify invoices and support farmers.', thumbnail_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80', hotlink: '/home-retailers' },
//   { guideline_id: 'g4', title: 'Product Recommendations for the Season', category: 'Products', body: 'Explore products based on seasonal needs, point value per unit, and recent purchase history.', thumbnail_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80', hotlink: '/products-retailer' },
// ];

// function storageAvailable() {
//   try { return typeof localStorage !== 'undefined'; } catch { return false; }
// }

// function defaultStore() {
//   return {
//     activeUser: null,
//     users: {
//       'retailer@demo.com': { user_id: 'demo-retailer', username: 'retailer@demo.com', email: 'retailer@demo.com', password: 'password', name: 'Tin Bao Tran', phone_number: '+84 000 000', user_type: 'retailer', region: 'Tin Berry Farm | Mekong Delta', tier: 'Gold', total_points: 7809 },
//       'diamond': { user_id: 'demo-diamond-retailer', username: 'diamond', email: 'diamond@bm-agricare.local', password: 'diamondtier', name: 'Diamond Demo Retailer', phone_number: '+84 888 888', user_type: 'retailer', region: 'Diamond Farm | Mekong Delta', tier: 'Diamond', total_points: 18500 },
//       'tce@demo.com': { user_id: 'demo-tce', username: 'tce@demo.com', email: 'tce@demo.com', password: 'password', name: 'TCE Admin', phone_number: '+84 111 111', user_type: 'tce', region: 'Mekong Delta', tier: 'Staff', total_points: 0 },
//     },
//     invoicesByUser: { 'retailer@demo.com': [], 'diamond': [], 'tce@demo.com': [] },
//     redemptionsByUser: { 'retailer@demo.com': [], 'diamond': [], 'tce@demo.com': [] },
//     historyByUser: { 'retailer@demo.com': [], 'diamond': [{ id: 'h-diamond-welcome', points_earned: 18500, points_redeemed: 0, description: 'Demo Diamond tier balance', occurred_at: '2026-05-21' }], 'tce@demo.com': [] },
//     invoiceDraftByUser: { 'retailer@demo.com': [], 'diamond': [], 'tce@demo.com': [] },
//   };
// }

// function readStore() {
//   if (!storageAvailable()) return defaultStore();
//   const raw = localStorage.getItem(STORAGE_KEY);
//   if (!raw) {
//     const d = defaultStore();
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
//     return d;
//   }
//   try {
//     const parsed = JSON.parse(raw);
//     const defaults = defaultStore();
//     return {
//       ...defaults,
//       ...parsed,
//       users: { ...defaults.users, ...(parsed.users || {}) },
//       invoicesByUser: { ...defaults.invoicesByUser, ...(parsed.invoicesByUser || {}) },
//       redemptionsByUser: { ...defaults.redemptionsByUser, ...(parsed.redemptionsByUser || {}) },
//       historyByUser: { ...defaults.historyByUser, ...(parsed.historyByUser || {}) },
//       invoiceDraftByUser: { ...defaults.invoiceDraftByUser, ...(parsed.invoiceDraftByUser || {}) },
//     };
//   } catch { return defaultStore(); }
// }

// function writeStore(store) {
//   if (storageAvailable()) localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
// }

// function currentKey(store) { return store.activeUser || 'retailer@demo.com'; }
// function currentUser(store) { return store.users[currentKey(store)] || store.users['retailer@demo.com']; }

// function enrichInvoice(inv) {
//   const items = inv.items || [];
//   const points = items.reduce((sum, item) => {
//     const p = mockProducts.find((x) => x.product_id === item.product_id || x.name.toLowerCase() === String(item.name || '').toLowerCase());
//     return sum + Number(item.quantity || 0) * Number(p?.points_factor || 10);
//   }, 0);
//   return { ...inv, points_awarded: inv.points_awarded ?? points, points, status: inv.status || inv.submission_status || 'pending', submission_status: inv.submission_status || inv.status || 'pending' };
// }

// function mockResponse(endpoint, method = 'GET', body = null) {
//   const clean = endpoint.split('?')[0];
//   const store = readStore();
//   const key = currentKey(store);
//   const user = currentUser(store);

//   if (clean === '/auth/login' && method === 'POST') {
//     const username = body?.username || body?.email || 'retailer@demo.com';
//     const found = store.users[username] || store.users['retailer@demo.com'];
//     if (username === 'diamond' && body?.password && body.password !== 'diamondtier') throw new Error('Invalid Diamond demo password. Use diamondtier.');
//     store.activeUser = username in store.users ? username : 'retailer@demo.com';
//     writeStore(store);
//     const token = store.activeUser === 'diamond' ? 'diamond-demo-token' : 'local-demo-token';
//     if (storageAvailable()) localStorage.setItem(AUTH_STORAGE_KEY, token);
//     return { access_token: token, id_token: `${token}-id`, refresh_token: `${token}-refresh`, user_type: found.user_type || 'retailer', user: found };
//   }
//   if (clean === '/auth/signup' && method === 'POST') {
//     const username = body?.username || body?.email || `user-${Date.now()}@demo.com`;
//     store.users[username] = {
//       user_id: `user-${Date.now()}`,
//       username,
//       email: body?.email || username,
//       password: body?.password || 'password',
//       name: body?.name || `${body?.first_name || ''} ${body?.last_name || ''}`.trim() || 'New Retailer',
//       first_name: body?.first_name || '',
//       last_name: body?.last_name || '',
//       phone_number: body?.phone_number || '',
//       user_type: body?.user_type || 'retailer',
//       store_name: body?.store_name || '',
//       store_location: body?.store_location || '',
//       region: body?.region || body?.store_location || 'New Farm Location',
//       accepts_terms: !!body?.accepts_terms,
//       receives_updates: !!body?.receives_updates,
//       profile_photo_status: body?.profile_photo_status || 'missing',
//       verified: body?.verified ?? true,
//       tier: body?.user_type === 'tce' ? 'Staff' : 'Starter',
//       total_points: 0
//     };
//     store.invoicesByUser[username] = [];
//     store.redemptionsByUser[username] = [];
//     store.historyByUser[username] = [];
//     store.activeUser = username;
//     writeStore(store);
//     return { access_token: 'local-demo-token', id_token: 'local-demo-id', refresh_token: 'local-demo-refresh', user_type: body?.user_type || 'retailer', user: store.users[username] };
//   }
//   if (clean === '/users/me' && method === 'GET') {
//     const invoices = (store.invoicesByUser[key] || []).map(enrichInvoice);
//     const completed = invoices.filter((i) => i.status === 'completed').length;
//     const pending = invoices.filter((i) => i.status !== 'completed').length;
//     return { ...user, pending_invoices: pending, completed_invoices: completed, total_invoices: invoices.length };
//   }
//   if (clean === '/users/me' && method === 'PATCH') {
//     store.users[key] = { ...user, ...body };
//     writeStore(store);
//     return store.users[key];
//   }
//   if (clean === '/products') return mockProducts;
//   if (clean === '/guidelines' || clean === '/news') return guides;
//   if (clean.startsWith('/guidelines/')) return guides.find((g) => String(g.guideline_id) === clean.split('/').pop()) || guides[0];
//   if (clean === '/rewards') return rewards;
//   if (clean === '/points/summary') {
//     const normalizedTier = String(user.tier || '').toLowerCase();
//     const nextTierPoints = normalizedTier === 'diamond' || normalizedTier === 'premium' ? 0 : Math.max(0, 9000 - Number(user.total_points || 0));
//     return { total_points: Number(user.total_points || 0), tier: user.tier || 'Starter', next_tier_points: nextTierPoints, lifetime_points: Number(user.total_points || 0) };
//   }
//   if (clean === '/points/history') return store.historyByUser[key] || [];
//   if (clean === '/invoice-draft' && method === 'GET') return store.invoiceDraftByUser[key] || [];
//   if (clean === '/invoice-draft' && method === 'POST') {
//     store.invoiceDraftByUser[key] = Array.isArray(body?.items) ? body.items : [];
//     writeStore(store);
//     return store.invoiceDraftByUser[key];
//   }
//   if (clean === '/invoice-draft' && method === 'DELETE') {
//     store.invoiceDraftByUser[key] = [];
//     writeStore(store);
//     return [];
//   }
//   if (clean === '/invoices' && method === 'GET') return (store.invoicesByUser[key] || []).map(enrichInvoice).sort((a, b) => new Date(b.invoice_timestamp).getTime() - new Date(a.invoice_timestamp).getTime());
//   if (clean === '/invoices' && method === 'POST') {
//     const invoice = enrichInvoice({ invoice_id: `local-${Date.now()}`, invoice_timestamp: body?.invoice_timestamp || new Date().toISOString(), submission_status: 'pending', status: 'pending', invoice_photo_url: body?.invoice_photo_url, gps_lat: body?.gps_lat, gps_lon: body?.gps_lon, items: body?.items || [] });
//     store.invoicesByUser[key] = [invoice, ...(store.invoicesByUser[key] || [])];
//     store.invoiceDraftByUser[key] = [];
//     store.historyByUser[key] = [{ id: `h-${Date.now()}`, points_earned: 0, points_redeemed: 0, description: `Invoice ${invoice.invoice_id} submitted for review`, occurred_at: new Date().toISOString().slice(0, 10) }, ...(store.historyByUser[key] || [])];
//     writeStore(store);
//     return invoice;
//   }
//   if (clean === '/redemptions' && method === 'POST') {
//     const rewardId = body?.items?.[0]?.reward_id;
//     const reward = rewards.find((r) => r.reward_id === rewardId) || rewards[0];
//     const qty = Number(body?.items?.[0]?.quantity || 1);
//     const cost = reward.points_needed * qty;
//     store.users[key] = { ...user, total_points: Math.max(0, Number(user.total_points || 0) - cost) };
//     const redemption = { redemption_id: `red-${Date.now()}`, status: 'pending', reward_id: reward.reward_id, reward_name: reward.name, quantity: qty, points_redeemed: cost, occurred_at: new Date().toISOString() };
//     store.redemptionsByUser[key] = [redemption, ...(store.redemptionsByUser[key] || [])];
//     store.historyByUser[key] = [{ id: `h-${Date.now()}`, points_earned: 0, points_redeemed: cost, description: `Redeemed ${reward.name}`, occurred_at: new Date().toISOString().slice(0, 10) }, ...(store.historyByUser[key] || [])];
//     writeStore(store);
//     return redemption;
//   }
//   if (clean === '/redemptions/me') return store.redemptionsByUser[key] || [];
//   if (clean === '/language/options') return ['en', 'vi', 'th', 'id', 'ms', 'zh', 'es', 'fr', 'ko', 'ja'];
//   return null;
// }

// export async function apiRequest(endpoint, method = 'GET', body = null) {
//   // Keep the Diamond demo fully deterministic even when a local backend is not running.
//   if (FORCE_LOCAL || (endpoint === '/auth/login' && body?.username === 'diamond')) return mockResponse(endpoint, method, body);
//   try {
//     const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
//     const timer = controller ? setTimeout(() => controller.abort(), 1600) : null;
//     const token = storageAvailable() ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
//     const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
//     const response = await fetch(`${BASE_URL}${endpoint}`, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : null,
//       signal: controller?.signal,
//     });
//     if (timer) clearTimeout(timer);
//     const text = await response.text();
//     const data = text ? JSON.parse(text) : null;
//     if (!response.ok) throw new Error(data?.detail?.message || data?.detail || 'Request failed');
//     if ((endpoint === '/auth/login' || endpoint === '/auth/signup') && data?.access_token && storageAvailable()) {
//       localStorage.setItem(AUTH_STORAGE_KEY, data.access_token);
//     }
//     return data;
//   } catch (error) {
//     const fallback = mockResponse(endpoint, method, body);
//     if (fallback !== null) return fallback;
//     throw error;
//   }
// }

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

export const API_BASE_URL = BASE_URL;

// Only these endpoints are forced to use real backend.
// Everything else can still fallback to mock/local data.
const BACKEND_ONLY_ENDPOINTS = new Set(['/demo/rewards', '/demo/guidelines', '/demo/news']);
const FORCE_LOCAL = process.env.EXPO_PUBLIC_FORCE_LOCAL === 'true';

const STORAGE_KEY = 'bm_agricare_local_store_v2';
const AUTH_STORAGE_KEY = 'bm_agricare_auth_token_v2';

const mockProducts = [
  {
    product_id: 'esta-kieserite',
    name: 'ESTA Kieserite',
    category: 'Straight Fertilizers',
    price: 120,
    points_factor: 20,
    image_url:
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=700&q=80',
    description: 'Magnesium and sulphur fertilizer for healthier crops.',
  },
  {
    product_id: 'nitrophoska',
    name: 'Nitrophoska',
    category: 'Compound Fertilizers',
    price: 100,
    points_factor: 18,
    image_url:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80',
    description: 'Balanced nutrients for stronger roots and productive fields.',
  },
  {
    product_id: 'nova-tec-suprem',
    name: 'NovaTec Suprem',
    category: 'Premium Fertilizers',
    price: 155,
    points_factor: 22,
    image_url:
      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=700&q=80',
    description: 'Premium stabilized nitrogen technology for crop performance.',
  },
  {
    product_id: 'blaukorn-premium',
    name: 'Blaukorn Premium',
    category: 'Crop Nutrition',
    price: 90,
    points_factor: 16,
    image_url:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=700&q=80',
    description: 'All-round crop nutrition for daily farm needs.',
  },
  {
    product_id: 'novatec-premium',
    name: 'NovaTec Premium',
    category: 'Seasonal',
    price: 135,
    points_factor: 21,
    image_url:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80',
    description: 'Seasonal premium fertilizer recommendation.',
  },
];

const rewards = [
  {
    reward_id: 'r1',
    name: 'BM AgriCare Cap',
    description: 'Premium branded field cap.',
    points_needed: 500,
    tier_requirement: 'Gold',
    quantity_available: 23,
  },
  {
    reward_id: 'r2',
    name: 'Farm Tool Kit',
    description: 'Everyday tools for retailer partners.',
    points_needed: 1500,
    tier_requirement: 'Gold',
    quantity_available: 12,
  },
  {
    reward_id: 'r3',
    name: 'Training Voucher',
    description: 'Workshop voucher for product training.',
    points_needed: 2000,
    tier_requirement: 'Premium',
    quantity_available: 8,
  },
  {
    reward_id: 'r4',
    name: 'Premium Product Bundle',
    description: 'Demo pack with seasonal crop nutrition products.',
    points_needed: 3200,
    tier_requirement: 'Premium',
    quantity_available: 5,
  },
];

const guides = [
  {
    guideline_id: 'g1',
    title: 'How to Submit an Invoice Correctly',
    category: 'Products',
    body:
      'Add each product name, enter the number of units, attach the invoice PDF, then review the approximate points before submitting.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80',
    hotlink: '/points-transaction',
  },
  {
    guideline_id: 'g2',
    title: 'Reward Points and Tier Rules',
    category: 'News',
    body:
      'Points are added after invoice review. Gold and Premium tiers unlock better rewards and product recommendations.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80',
    hotlink: '/rewards',
  },
  {
    guideline_id: 'g3',
    title: 'A Journey of Growth with Behn Meyer AgriCare',
    category: 'Articles',
    body:
      'Learn how retailers, TCEs, and BM Admins work together to verify invoices and support farmers.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80',
    hotlink: '/home-retailers',
  },
  {
    guideline_id: 'g4',
    title: 'Product Recommendations for the Season',
    category: 'Products',
    body:
      'Explore products based on seasonal needs, point value per unit, and recent purchase history.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80',
    hotlink: '/products-retailer',
  },
];

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function defaultStore() {
  return {
    activeUser: null,
    users: {
      'retailer@demo.com': {
        user_id: 'demo-retailer',
        username: 'retailer@demo.com',
        email: 'retailer@demo.com',
        password: 'password',
        name: 'Tin Bao Tran',
        phone_number: '+84 000 000',
        user_type: 'retailer',
        region: 'Tin Berry Farm | Mekong Delta',
        tier: 'Gold',
        total_points: 7809,
      },
      diamond: {
        user_id: 'demo-diamond-retailer',
        username: 'diamond',
        email: 'diamond@bm-agricare.local',
        password: 'diamondtier',
        name: 'Diamond Demo Retailer',
        phone_number: '+84 888 888',
        user_type: 'retailer',
        region: 'Diamond Farm | Mekong Delta',
        tier: 'Diamond',
        total_points: 18500,
      },
      'tce@demo.com': {
        user_id: 'demo-tce',
        username: 'tce@demo.com',
        email: 'tce@demo.com',
        password: 'password',
        name: 'TCE Admin',
        phone_number: '+84 111 111',
        user_type: 'tce',
        region: 'Mekong Delta',
        tier: 'Staff',
        total_points: 0,
      },
    },
    invoicesByUser: {
      'retailer@demo.com': [],
      diamond: [],
      'tce@demo.com': [],
    },
    redemptionsByUser: {
      'retailer@demo.com': [],
      diamond: [],
      'tce@demo.com': [],
    },
    historyByUser: {
      'retailer@demo.com': [],
      diamond: [
        {
          id: 'h-diamond-welcome',
          points_earned: 18500,
          points_redeemed: 0,
          description: 'Demo Diamond tier balance',
          occurred_at: '2026-05-21',
        },
      ],
      'tce@demo.com': [],
    },
    invoiceDraftByUser: {
      'retailer@demo.com': [],
      diamond: [],
      'tce@demo.com': [],
    },
  };
}

function readStore() {
  if (!storageAvailable()) return defaultStore();

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const defaults = defaultStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    const defaults = defaultStore();

    return {
      ...defaults,
      ...parsed,
      users: { ...defaults.users, ...(parsed.users || {}) },
      invoicesByUser: {
        ...defaults.invoicesByUser,
        ...(parsed.invoicesByUser || {}),
      },
      redemptionsByUser: {
        ...defaults.redemptionsByUser,
        ...(parsed.redemptionsByUser || {}),
      },
      historyByUser: {
        ...defaults.historyByUser,
        ...(parsed.historyByUser || {}),
      },
      invoiceDraftByUser: {
        ...defaults.invoiceDraftByUser,
        ...(parsed.invoiceDraftByUser || {}),
      },
    };
  } catch {
    return defaultStore();
  }
}

function writeStore(store) {
  if (storageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

function currentKey(store) {
  return store.activeUser || 'retailer@demo.com';
}

function currentUser(store) {
  return store.users[currentKey(store)] || store.users['retailer@demo.com'];
}

function enrichInvoice(inv) {
  const items = inv.items || [];

  const points = items.reduce((sum, item) => {
    const product = mockProducts.find(
      (x) =>
        x.product_id === item.product_id ||
        x.name.toLowerCase() === String(item.name || '').toLowerCase()
    );

    return sum + Number(item.quantity || 0) * Number(product?.points_factor || 10);
  }, 0);

  return {
    ...inv,
    points_awarded: inv.points_awarded ?? points,
    points,
    status: inv.status || inv.submission_status || 'pending',
    submission_status: inv.submission_status || inv.status || 'pending',
  };
}

function mockResponse(endpoint, method = 'GET', body = null) {
  const clean = endpoint.split('?')[0];
  const store = readStore();
  const key = currentKey(store);
  const user = currentUser(store);

  if (clean === '/auth/login' && method === 'POST') {
    const username = body?.username || body?.email || 'retailer@demo.com';
    const found = store.users[username] || store.users['retailer@demo.com'];

    if (username === 'diamond' && body?.password && body.password !== 'diamondtier') {
      throw new Error('Invalid Diamond demo password. Use diamondtier.');
    }

    store.activeUser = username in store.users ? username : 'retailer@demo.com';
    writeStore(store);

    const token = store.activeUser === 'diamond' ? 'diamond-demo-token' : 'local-demo-token';

    if (storageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
    }

    return {
      access_token: token,
      id_token: `${token}-id`,
      refresh_token: `${token}-refresh`,
      user_type: found.user_type || 'retailer',
      user: found,
    };
  }

  if (clean === '/auth/signup' && method === 'POST') {
    const username = body?.username || body?.email || `user-${Date.now()}@demo.com`;

    store.users[username] = {
      user_id: `user-${Date.now()}`,
      username,
      email: body?.email || username,
      password: body?.password || 'password',
      name:
        body?.name ||
        `${body?.first_name || ''} ${body?.last_name || ''}`.trim() ||
        'New Retailer',
      first_name: body?.first_name || '',
      last_name: body?.last_name || '',
      phone_number: body?.phone_number || '',
      user_type: body?.user_type || 'retailer',
      store_name: body?.store_name || '',
      store_location: body?.store_location || '',
      region: body?.region || body?.store_location || 'New Farm Location',
      accepts_terms: !!body?.accepts_terms,
      receives_updates: !!body?.receives_updates,
      profile_photo_status: body?.profile_photo_status || 'missing',
      verified: body?.verified ?? true,
      tier: body?.user_type === 'tce' ? 'Staff' : 'Starter',
      total_points: 0,
    };

    store.invoicesByUser[username] = [];
    store.redemptionsByUser[username] = [];
    store.historyByUser[username] = [];
    store.activeUser = username;

    writeStore(store);

    return {
      access_token: 'local-demo-token',
      id_token: 'local-demo-id',
      refresh_token: 'local-demo-refresh',
      user_type: body?.user_type || 'retailer',
      user: store.users[username],
    };
  }

  if (clean === '/users/me' && method === 'GET') {
    const invoices = (store.invoicesByUser[key] || []).map(enrichInvoice);
    const completed = invoices.filter((i) => i.status === 'completed').length;
    const pending = invoices.filter((i) => i.status !== 'completed').length;

    return {
      ...user,
      pending_invoices: pending,
      completed_invoices: completed,
      total_invoices: invoices.length,
    };
  }

  if (clean === '/users/me' && method === 'PATCH') {
    store.users[key] = { ...user, ...body };
    writeStore(store);
    return store.users[key];
  }

  if (clean === '/products') return mockProducts;

  if (clean === '/guidelines' || clean === '/news') return guides;

  if (clean.startsWith('/guidelines/')) {
    return guides.find((g) => String(g.guideline_id) === clean.split('/').pop()) || guides[0];
  }

  // Keep old mock rewards for /rewards only.
  // Real backend rewards should use /demo/rewards.
  if (clean === '/rewards') return rewards;

  if (clean === '/points/summary') {
    const normalizedTier = String(user.tier || '').toLowerCase();

    const nextTierPoints =
      normalizedTier === 'diamond' || normalizedTier === 'premium'
        ? 0
        : Math.max(0, 9000 - Number(user.total_points || 0));

    return {
      total_points: Number(user.total_points || 0),
      tier: user.tier || 'Starter',
      next_tier_points: nextTierPoints,
      lifetime_points: Number(user.total_points || 0),
    };
  }

  if (clean === '/points/history') return store.historyByUser[key] || [];

  if (clean === '/invoice-draft' && method === 'GET') {
    return store.invoiceDraftByUser[key] || [];
  }

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

  if (clean === '/invoices' && method === 'GET') {
    return (store.invoicesByUser[key] || [])
      .map(enrichInvoice)
      .sort(
        (a, b) =>
          new Date(b.invoice_timestamp).getTime() -
          new Date(a.invoice_timestamp).getTime()
      );
  }

  if (clean === '/invoices' && method === 'POST') {
    const invoice = enrichInvoice({
      invoice_id: `local-${Date.now()}`,
      invoice_timestamp: body?.invoice_timestamp || new Date().toISOString(),
      submission_status: 'pending',
      status: 'pending',
      invoice_photo_url: body?.invoice_photo_url,
      gps_lat: body?.gps_lat,
      gps_lon: body?.gps_lon,
      items: body?.items || [],
    });

    store.invoicesByUser[key] = [invoice, ...(store.invoicesByUser[key] || [])];
    store.invoiceDraftByUser[key] = [];

    store.historyByUser[key] = [
      {
        id: `h-${Date.now()}`,
        points_earned: 0,
        points_redeemed: 0,
        description: `Invoice ${invoice.invoice_id} submitted for review`,
        occurred_at: new Date().toISOString().slice(0, 10),
      },
      ...(store.historyByUser[key] || []),
    ];

    writeStore(store);
    return invoice;
  }

  if (clean === '/redemptions' && method === 'POST') {
    const rewardId = body?.items?.[0]?.reward_id;
    const reward = rewards.find((r) => r.reward_id === rewardId) || rewards[0];
    const qty = Number(body?.items?.[0]?.quantity || 1);
    const cost = reward.points_needed * qty;

    store.users[key] = {
      ...user,
      total_points: Math.max(0, Number(user.total_points || 0) - cost),
    };

    const redemption = {
      redemption_id: `red-${Date.now()}`,
      status: 'pending',
      reward_id: reward.reward_id,
      reward_name: reward.name,
      quantity: qty,
      points_redeemed: cost,
      occurred_at: new Date().toISOString(),
    };

    store.redemptionsByUser[key] = [redemption, ...(store.redemptionsByUser[key] || [])];

    store.historyByUser[key] = [
      {
        id: `h-${Date.now()}`,
        points_earned: 0,
        points_redeemed: cost,
        description: `Redeemed ${reward.name}`,
        occurred_at: new Date().toISOString().slice(0, 10),
      },
      ...(store.historyByUser[key] || []),
    ];

    writeStore(store);
    return redemption;
  }

  if (clean === '/redemptions/me') return store.redemptionsByUser[key] || [];

  if (clean === '/language/options') {
    return ['en', 'vi', 'th', 'id', 'ms', 'zh', 'es', 'fr', 'ko', 'ja'];
  }

  return null;
}

export async function apiRequest(endpoint, method = 'GET', body = null, options = {}) {
  const clean = endpoint.split('?')[0];
  const mustUseBackend = BACKEND_ONLY_ENDPOINTS.has(clean);

  const {
    timeoutMs = mustUseBackend ? 8000 : 1600,
    useAuth = true,
  } = options || {};

  if (!mustUseBackend && (FORCE_LOCAL || (endpoint === '/auth/login' && body?.username === 'diamond'))) {
    return mockResponse(endpoint, method, body);
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const token = useAuth && storageAvailable() ? localStorage.getItem(AUTH_STORAGE_KEY) : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller?.signal,
    });

    if (timer) clearTimeout(timer);

    const text = await response.text();

    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        data?.detail?.message ||
        data?.detail ||
        data?.error ||
        `Request failed with status ${response.status}`;

      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }

    if ((endpoint === '/auth/login' || endpoint === '/auth/signup') && data?.access_token && storageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEY, data.access_token);
    }

    return data;
  } catch (error) {
    if (timer) clearTimeout(timer);

    console.error(`[apiRequest] ${method} ${endpoint} failed:`, error);

    // Important: rewards demo must visibly fail if backend is not working,
    // so we know whether SQL/RDS rendering is actually connected.
    if (mustUseBackend) {
      throw error;
    }

    const fallback = mockResponse(endpoint, method, body);
    if (fallback !== null) return fallback;

    throw error;
  }
}
