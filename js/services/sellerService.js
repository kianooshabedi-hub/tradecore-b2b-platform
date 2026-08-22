// js/services/sellerService.js

import { AppStore } from '../data/appStore.js';
import { ProductService } from './productService.js';
import { businesses } from '../data/businesses.js'; 

export const SellerService = {
  getProfile: async () => {
    return AppStore.getActiveUserProfile();
  },

  getDashboardSummary: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const activeUserId = AppStore.getActiveUserId();
      const myProducts = await ProductService.getProductsBySupplierId(activeUserId);
      const allRfqs = AppStore.getAllRfqs();
      
      const incomingRfqs = allRfqs.filter(r => r.supplierId === activeUserId);

      const populatedRfqs = await Promise.all(incomingRfqs.map(async (rfq) => {
        const product = await ProductService.getProductById(rfq.productId);
        const buyer = businesses.find(b => b.id === rfq.buyerId); 
        return { 
          ...rfq, 
          productName: product ? product.name : 'محصول نامشخص',
          buyerName: buyer ? buyer.name : 'خریدار نامشخص'
        };
      }));

      return {
        productsCount: myProducts.length,
        newRfqsCount: incomingRfqs.filter(r => r.status === 'pending').length,
        profileViews: Math.floor(Math.random() * 500) + 100, 
        rfqs: populatedRfqs
      };
    } catch (error) {
      console.error(error);
      return { productsCount: 0, newRfqsCount: 0, profileViews: 0, rfqs: [] };
    }
  },

  // تابع ارسال پاسخ به خریدار
  replyToRfq: async (rfqId, replyMessage) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allRfqs = AppStore.getAllRfqs();
    const rfq = allRfqs.find(r => r.id === rfqId);
    
    if(rfq) {
      rfq.status = 'replied'; 
      rfq.reply = replyMessage; 
      rfq.replyDate = new Date().toISOString().split('T')[0]; 
      
      AppStore.updateRfq(rfq); 
      return true;
    }
    return false;
  }
};