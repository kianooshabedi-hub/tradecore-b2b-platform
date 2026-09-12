// js/data/appStore.js

import { businesses } from './businesses.js';

const USER_KEY = 'tradecore_active_user';
const RFQ_KEY = 'tradecore_rfqs';
const FAV_PROD_KEY = 'tc_fav_prods';
const FAV_BIZ_KEY = 'tc_fav_biz';
const SHORTLIST_KEY = 'tc_shortlist'; // 🌟 اضافه شدن Shortlist
const DEALS_KEY = 'tradecore_deals'; 
const MESSAGES_KEY = 'tc_messages'; // 🌟 دیتابیس پیام‌ها
const NOTIFS_KEY = 'tc_notifications'; // 🌟 دیتابیس اعلان‌ها

businesses.forEach(biz => {
    if (!biz.roles) biz.roles = ['buyer', 'supplier'];
    if (!biz.subscriptionTier) biz.subscriptionTier = 'free'; 
    if (!biz.usageStats) biz.usageStats = { productsListed: 0, messagesSent: 0, contactsViewed: 0 };
    
    if (!biz.buyerProfile) biz.buyerProfile = { neededCategories: [], preferredCountries: [] };
    if (!biz.supplierProfile) biz.supplierProfile = { suppliedCategories: [], certifications: [], leadTime: '' };
    if (!biz.serviceProfile) biz.serviceProfile = { offeredServices: [], serviceAreas: [] };
    if (!biz.contact) biz.contact = { email: biz.email || '', phone: biz.phone || '', whatsapp: '', contactPerson: '' };
});

export const AppStore = {
  getActiveUserId: () => localStorage.getItem(USER_KEY) || 'biz-1',
  setActiveUserId: (id) => localStorage.setItem(USER_KEY, id),
  
  getActiveUserProfile: () => {
    const id = AppStore.getActiveUserId();
    return businesses.find(b => b.id === id);
  },

  checkFeatureAccess: (featureKey) => {
    const profile = AppStore.getActiveUserProfile();
    if (!profile) return false;
    const tier = profile.subscriptionTier || 'free';
    const stats = profile.usageStats || {};

    const tierLimits = {
        free: { maxProducts: 10, maxMessages: 5, canViewContacts: false },
        basic: { maxProducts: 50, maxMessages: 50, canViewContacts: true },
        pro: { maxProducts: 200, maxMessages: 500, canViewContacts: true },
        enterprise: { maxProducts: 999999, maxMessages: 999999, canViewContacts: true }
    };

    const myLimits = tierLimits[tier];
    if (featureKey === 'add_item') return stats.productsListed < myLimits.maxProducts;
    if (featureKey === 'send_message') return stats.messagesSent < myLimits.maxMessages;
    if (featureKey === 'view_contact') return myLimits.canViewContacts;

    return true;
  },
  
  getProfileCompletionStatus: () => {
    const profile = AppStore.getActiveUserProfile();
    if (!profile) return { percentage: 0, missingTasks: [] };
    let score = 0; let totalFields = 6; const missingTasks = [];
    if (profile.name) score++; else missingTasks.push('ثبت نام رسمی شرکت');
    if (profile.logo && !profile.logo.includes('default')) score++; else missingTasks.push('آپلود لوگوی شرکت');
    if (profile.description) score++; else missingTasks.push('نوشتن معرفی شرکت (درباره ما)');
    if (profile.contact && profile.contact.phone) score++; else missingTasks.push('ثبت شماره تماس شرکت');
    if (profile.industry) score++; else missingTasks.push('انتخاب صنعت و حوزه فعالیت');
    const isSupplierOrService = profile.roles.includes('supplier') || profile.roles.includes('service_provider');
    if (isSupplierOrService) { score++; } // Simplified for MVP logic
    return { percentage: Math.round((score / totalFields) * 100), missingTasks };
  },

  // --- RFQs ---
  getAllRfqs: () => JSON.parse(localStorage.getItem(RFQ_KEY) || '[]'),
  addRfq: (rfq) => {
    const rfqs = AppStore.getAllRfqs();
    rfqs.unshift(rfq);
    localStorage.setItem(RFQ_KEY, JSON.stringify(rfqs));
  },
  updateRfq: (updatedRfq) => {
    const rfqs = AppStore.getAllRfqs();
    const index = rfqs.findIndex(r => r.id === updatedRfq.id);
    if (index !== -1) { rfqs[index] = updatedRfq; localStorage.setItem(RFQ_KEY, JSON.stringify(rfqs)); }
  },

  // --- Lists (Favorites & Shortlist) ---
  getFavProducts: () => (JSON.parse(localStorage.getItem(FAV_PROD_KEY) || '{}')[AppStore.getActiveUserId()] || []),
  getFavBusinesses: () => (JSON.parse(localStorage.getItem(FAV_BIZ_KEY) || '{}')[AppStore.getActiveUserId()] || []),
  getSupplierShortlist: () => (JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '{}')[AppStore.getActiveUserId()] || []),
  
  toggleFavProduct: (prodId) => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_PROD_KEY) || '{}');
    const userId = AppStore.getActiveUserId();
    if (!allFavs[userId]) allFavs[userId] = [];
    const index = allFavs[userId].indexOf(prodId);
    if (index === -1) allFavs[userId].push(prodId); else allFavs[userId].splice(index, 1);
    localStorage.setItem(FAV_PROD_KEY, JSON.stringify(allFavs));
    return index === -1; 
  },
  toggleFavBusiness: (bizId) => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_BIZ_KEY) || '{}');
    const userId = AppStore.getActiveUserId();
    if (!allFavs[userId]) allFavs[userId] = [];
    const index = allFavs[userId].indexOf(bizId);
    if (index === -1) allFavs[userId].push(bizId); else allFavs[userId].splice(index, 1);
    localStorage.setItem(FAV_BIZ_KEY, JSON.stringify(allFavs));
    return index === -1;
  },
  toggleShortlist: (bizId) => {
    const allShortlists = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '{}');
    const userId = AppStore.getActiveUserId();
    if (!allShortlists[userId]) allShortlists[userId] = [];
    const index = allShortlists[userId].indexOf(bizId);
    // Limit Shortlist to 5 suppliers for comparison
    if (index === -1) {
        if(allShortlists[userId].length >= 5) return { added: false, error: 'حداکثر ۵ شرکت قابل افزودن به لیست مقایسه است.' };
        allShortlists[userId].push(bizId);
    } else {
        allShortlists[userId].splice(index, 1);
    }
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(allShortlists));
    return { added: index === -1, error: null };
  },

  // --- Tenders & Deals ---
  getAllTenders: () => JSON.parse(localStorage.getItem('tradecore_tenders') || '[]'),
  addTender: (tender) => {
    const tenders = AppStore.getAllTenders(); tenders.unshift(tender);
    localStorage.setItem('tradecore_tenders', JSON.stringify(tenders));
  },
  updateTender: (updatedTender) => {
    const tenders = AppStore.getAllTenders();
    const index = tenders.findIndex(t => t.id === updatedTender.id);
    if (index !== -1) { tenders[index] = updatedTender; localStorage.setItem('tradecore_tenders', JSON.stringify(tenders)); }
  },
  deleteTender: (tenderId) => {
    const tenders = AppStore.getAllTenders();
    localStorage.setItem('tradecore_tenders', JSON.stringify(tenders.filter(t => t.id !== tenderId)));
  },
  getAllDeals: () => JSON.parse(localStorage.getItem(DEALS_KEY) || '[]'),
  addDeal: (deal) => {
    if(!deal.pitches) deal.pitches = [];
    const deals = AppStore.getAllDeals(); deals.unshift(deal);
    localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
  },
  updateDeal: (updatedDeal) => {
    const deals = AppStore.getAllDeals();
    const index = deals.findIndex(d => d.id === updatedDeal.id);
    if (index !== -1) { deals[index] = updatedDeal; localStorage.setItem(DEALS_KEY, JSON.stringify(deals)); }
  },

  // 🌟 --- Messaging System (New) ---
  getAllConversations: () => JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]'),
  saveConversations: (convs) => localStorage.setItem(MESSAGES_KEY, JSON.stringify(convs)),

  // 🌟 --- Notification System (New) ---
  getUserNotifications: (userId) => {
      const allNotifs = JSON.parse(localStorage.getItem(NOTIFS_KEY) || '{}');
      return allNotifs[userId] || [];
  },
  addNotification: (userId, title, type = 'info', link = '#') => {
      const allNotifs = JSON.parse(localStorage.getItem(NOTIFS_KEY) || '{}');
      if (!allNotifs[userId]) allNotifs[userId] = [];
      allNotifs[userId].unshift({
          id: 'notif-' + Date.now(),
          title, type, link, isRead: false,
          date: new Date().toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(allNotifs));
  }
};