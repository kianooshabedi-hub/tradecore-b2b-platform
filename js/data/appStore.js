// js/data/appStore.js

import { businesses } from './businesses.js';

const USER_KEY = 'tradecore_active_user';
const RFQ_KEY = 'tradecore_rfqs';
const FAV_PROD_KEY = 'tc_fav_prods';
const FAV_BIZ_KEY = 'tc_fav_biz';

// 🌟 ارتقای ساختار داده‌های نمایشی برای پشتیبانی از معماری جدید
// در نسخه واقعی، این تغییرات روی دیتابیس اعمال می‌شود
businesses.forEach(biz => {
    // اگر شرکتی نقش نداشت، پیش‌فرض هم خریدار و هم تامین‌کننده باشد
    if (!biz.roles) biz.roles = ['buyer', 'supplier'];
    
    // تفکیک اطلاعات طبق معماری جدید (اگر از قبل نداشتند)
    if (!biz.buyerProfile) biz.buyerProfile = { neededCategories: [], preferredCountries: [] };
    if (!biz.supplierProfile) biz.supplierProfile = { suppliedCategories: [], certifications: [], leadTime: '' };
    if (!biz.contact) biz.contact = { email: biz.email || '', phone: biz.phone || '', whatsapp: '', contactPerson: '' };
});

export const AppStore = {
  getActiveUserId: () => localStorage.getItem(USER_KEY) || 'biz-1',
  
  setActiveUserId: (id) => localStorage.setItem(USER_KEY, id),
  
  getActiveUserProfile: () => {
    const id = AppStore.getActiveUserId();
    return businesses.find(b => b.id === id);
  },
  
  // 🌟 منطق جدید: محاسبه درصد تکمیل پروفایل شرکت
  getProfileCompletionStatus: () => {
    const profile = AppStore.getActiveUserProfile();
    if (!profile) return { percentage: 0, missingTasks: [] };

    let score = 0;
    const totalFields = 6;
    const missingTasks = [];

    if (profile.name) score++; 
    else missingTasks.push('ثبت نام رسمی شرکت');

    if (profile.logo && !profile.logo.includes('default')) score++; 
    else missingTasks.push('آپلود لوگوی شرکت');

    if (profile.description) score++; 
    else missingTasks.push('نوشتن معرفی شرکت (درباره ما)');

    if (profile.contact && profile.contact.phone) score++; 
    else missingTasks.push('ثبت شماره تماس شرکت');

    if (profile.industry) score++; 
    else missingTasks.push('انتخاب صنعت و حوزه فعالیت');

    // بررسی ثبت حداقل یک محصول برای تامین‌کنندگان
    const hasProducts = true; // در آینده از ProductService.getProductsBySupplierId چک می‌شود
    if (profile.roles.includes('supplier') && hasProducts) score++;
    else if (profile.roles.includes('supplier')) missingTasks.push('ثبت اولین محصول');

    const percentage = Math.round((score / totalFields) * 100);
    return { percentage, missingTasks };
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
    return index === -1; 
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