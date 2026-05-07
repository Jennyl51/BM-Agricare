import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkTheme, lightTheme } from '@/constants/theme';

type Language = 'en' | 'vi' | 'th' | 'id' | 'ms' | 'zh' | 'es' | 'fr' | 'ko' | 'ja';

type AppContextValue = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  theme: typeof lightTheme | typeof darkTheme;
  language: Language;
  setLanguage: (value: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: { home: 'home', guides: 'guides', upload: 'upload', rewards: 'rewards', user: 'user', submitInvoice: 'Submit invoice', viewProducts: 'View products', noInvoices: 'No invoices yet', noPurchases: 'No recent purchases', darkMode: 'Dark mode', language: 'Language', settings: 'Settings', logout: 'Log out', about: 'About us', stats: 'Stats', invoices: 'Invoices' },
  vi: { home: 'trang chủ', guides: 'hướng dẫn', upload: 'tải lên', rewards: 'quà tặng', user: 'người dùng', submitInvoice: 'Gửi hóa đơn', viewProducts: 'Xem sản phẩm', noInvoices: 'Chưa có hóa đơn', noPurchases: 'Chưa có mua hàng', darkMode: 'Chế độ tối', language: 'Ngôn ngữ', settings: 'Cài đặt', logout: 'Đăng xuất', about: 'Về chúng tôi', stats: 'Thống kê', invoices: 'Hóa đơn' },
  th: { home: 'หน้าแรก', guides: 'คู่มือ', upload: 'อัปโหลด', rewards: 'รางวัล', user: 'ผู้ใช้', submitInvoice: 'ส่งใบแจ้งหนี้', viewProducts: 'ดูสินค้า', noInvoices: 'ยังไม่มีใบแจ้งหนี้', noPurchases: 'ยังไม่มีการซื้อ', darkMode: 'โหมดมืด', language: 'ภาษา', settings: 'ตั้งค่า', logout: 'ออกจากระบบ', about: 'เกี่ยวกับเรา', stats: 'สถิติ', invoices: 'ใบแจ้งหนี้' },
  id: { home: 'beranda', guides: 'panduan', upload: 'unggah', rewards: 'hadiah', user: 'profil', submitInvoice: 'Kirim faktur', viewProducts: 'Lihat produk', noInvoices: 'Belum ada faktur', noPurchases: 'Belum ada pembelian', darkMode: 'Mode gelap', language: 'Bahasa', settings: 'Pengaturan', logout: 'Keluar', about: 'Tentang kami', stats: 'Statistik', invoices: 'Faktur' },
  ms: { home: 'utama', guides: 'panduan', upload: 'muat naik', rewards: 'ganjaran', user: 'profil', submitInvoice: 'Hantar invois', viewProducts: 'Lihat produk', noInvoices: 'Tiada invois lagi', noPurchases: 'Tiada pembelian terkini', darkMode: 'Mod gelap', language: 'Bahasa', settings: 'Tetapan', logout: 'Log keluar', about: 'Tentang kami', stats: 'Statistik', invoices: 'Invois' },
  zh: { home: '首页', guides: '指南', upload: '上传', rewards: '奖励', user: '我的', submitInvoice: '提交发票', viewProducts: '查看产品', noInvoices: '暂无发票', noPurchases: '暂无购买记录', darkMode: '深色模式', language: '语言', settings: '设置', logout: '退出登录', about: '关于我们', stats: '统计', invoices: '发票' },
  es: { home: 'inicio', guides: 'guías', upload: 'subir', rewards: 'premios', user: 'perfil', submitInvoice: 'Enviar factura', viewProducts: 'Ver productos', noInvoices: 'Sin facturas todavía', noPurchases: 'Sin compras recientes', darkMode: 'Modo oscuro', language: 'Idioma', settings: 'Ajustes', logout: 'Cerrar sesión', about: 'Sobre nosotros', stats: 'Estadísticas', invoices: 'Facturas' },
  fr: { home: 'accueil', guides: 'guides', upload: 'envoyer', rewards: 'récompenses', user: 'profil', submitInvoice: 'Soumettre facture', viewProducts: 'Voir produits', noInvoices: 'Aucune facture', noPurchases: 'Aucun achat récent', darkMode: 'Mode sombre', language: 'Langue', settings: 'Réglages', logout: 'Déconnexion', about: 'À propos', stats: 'Stats', invoices: 'Factures' },
  ko: { home: '홈', guides: '가이드', upload: '업로드', rewards: '리워드', user: '사용자', submitInvoice: '청구서 제출', viewProducts: '제품 보기', noInvoices: '아직 청구서 없음', noPurchases: '최근 구매 없음', darkMode: '다크 모드', language: '언어', settings: '설정', logout: '로그아웃', about: '소개', stats: '통계', invoices: '청구서' },
  ja: { home: 'ホーム', guides: 'ガイド', upload: 'アップロード', rewards: '特典', user: 'ユーザー', submitInvoice: '請求書を送信', viewProducts: '商品を見る', noInvoices: '請求書はまだありません', noPurchases: '最近の購入はありません', darkMode: 'ダークモード', language: '言語', settings: '設定', logout: 'ログアウト', about: '私たちについて', stats: '統計', invoices: '請求書' },
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const theme: typeof lightTheme | typeof darkTheme = darkMode ? darkTheme : lightTheme;
  const value = useMemo(() => ({
    darkMode,
    setDarkMode,
    toggleDarkMode: () => setDarkMode((v) => !v),
    theme,
    language,
    setLanguage,
    t: (key: string) => translations[language]?.[key] || translations.en[key] || key,
  }), [darkMode, language, theme]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
