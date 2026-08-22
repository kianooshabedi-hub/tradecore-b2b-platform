// js/services/businessService.js

import { businesses } from '../data/businesses.js';

export const BusinessService = {
  /**
   * دریافت اطلاعات یک شرکت بر اساس ID
   * @param {string} businessId 
   * @returns {Promise<Object|null>}
   */
  getBusinessById: async (businessId) => {
    // شبیه‌سازی تاخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 100));
    return businesses.find(biz => biz.id === businessId) || null;
  }
};