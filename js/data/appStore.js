// js/data/appStore.js

import { businesses } from './businesses.js';

const USER_KEY = 'tradecore_active_user';
const RFQ_KEY = 'tradecore_rfqs';
const FAV_PROD_KEY = 'tc_fav_prods';
const FAV_BIZ_KEY = 'tc_fav_biz';

export const AppStore = {
  getActiveUserId: () => localStorage.getItem(USER_KEY) || 'biz-1',
  
  setActiveUserId: (id) => localStorage.setItem(USER_KEY, id),
  
  getActiveUserProfile: () => {
    const id = AppStore.getActiveUserId();
    return businesses.find(b => b.id === id);
  },
  
  getAllRfqs: () => JSON.parse(localStorage.getItem(RFQ_KEY) || '[]'),
  
  addRfq: (rfq) => {
    const rfqs = AppStore.getAllRfqs();
    rfqs.unshift(rfq);
    localStorage.setItem(RFQ_KEY, JSON.stringify(rfqs));
  },
  
  updateRfq: (updatedRfq) => {
    const rfqs = AppStore.getAllRfqs();
    const index = rfqs.findIndex(r => r.id === updatedRfq.id);
    if (index !== -1) {
      rfqs[index] = updatedRfq;
      localStorage.setItem(RFQ_KEY, JSON.stringify(rfqs));
    }
  },

  // --- بخش علاقه‌مندی‌ها ---
  getFavProducts: () => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_PROD_KEY) || '{}');
    return allFavs[AppStore.getActiveUserId()] || [];
  },
  
  getFavBusinesses: () => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_BIZ_KEY) || '{}');
    return allFavs[AppStore.getActiveUserId()] || [];
  },
  
  toggleFavProduct: (prodId) => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_PROD_KEY) || '{}');
    const userId = AppStore.getActiveUserId();
    if (!allFavs[userId]) allFavs[userId] = [];
    
    const index = allFavs[userId].indexOf(prodId);
    if (index === -1) allFavs[userId].push(prodId);
    else allFavs[userId].splice(index, 1);
    
    localStorage.setItem(FAV_PROD_KEY, JSON.stringify(allFavs));
    return index === -1; // اگر اضافه شد true
  },
  
  toggleFavBusiness: (bizId) => {
    const allFavs = JSON.parse(localStorage.getItem(FAV_BIZ_KEY) || '{}');
    const userId = AppStore.getActiveUserId();
    if (!allFavs[userId]) allFavs[userId] = [];
    
    const index = allFavs[userId].indexOf(bizId);
    if (index === -1) allFavs[userId].push(bizId);
    else allFavs[userId].splice(index, 1);
    
    localStorage.setItem(FAV_BIZ_KEY, JSON.stringify(allFavs));
    return index === -1;
  }
};