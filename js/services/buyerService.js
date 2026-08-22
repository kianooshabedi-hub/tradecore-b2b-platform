// js/services/buyerService.js

import { AppStore } from '../data/appStore.js';
import { ProductService } from './productService.js';
import { businesses } from '../data/businesses.js'; // اضافه شدن دیتابیس شرکت‌ها

export const BuyerService = {
  getProfile: async () => {
    return AppStore.getActiveUserProfile();
  },

  getDashboardSummary: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const activeUserId = AppStore.getActiveUserId();
    const allRfqs = AppStore.getAllRfqs();
    
    const mySentRfqs = allRfqs.filter(rfq => rfq.buyerId === activeUserId);

    const populatedRfqs = await Promise.all(mySentRfqs.map(async (rfq) => {
      const product = await ProductService.getProductById(rfq.productId);
      const supplier = businesses.find(b => b.id === rfq.supplierId); // پیدا کردن اسم شرکت فروشنده
      return { 
        ...rfq, 
        productName: product ? product.name : 'محصول نامشخص',
        supplierName: supplier ? supplier.name : 'شرکت نامشخص'
      };
    }));

    return { rfqsCount: mySentRfqs.length, rfqs: populatedRfqs };
  },

  submitRfq: async (productId, supplierId, message) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const activeUserId = AppStore.getActiveUserId();
    const today = new Date().toISOString().split('T')[0];
    
    const newRfq = {
      id: 'rfq-' + Math.floor(Math.random() * 10000),
      productId: productId,
      buyerId: activeUserId,
      supplierId: supplierId,
      date: today,
      status: 'pending',
      message: message
    };
    AppStore.addRfq(newRfq);
    return true;
  }
};