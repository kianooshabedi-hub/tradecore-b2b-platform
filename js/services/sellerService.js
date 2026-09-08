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

      const allTenders = AppStore.getAllTenders();
      let sentProposals = 0;
      allTenders.forEach(t => {
          if (t.proposals && t.proposals.some(p => p.supplierId === activeUserId)) {
              sentProposals++;
          }
      });

      // 🌟 محاسبه نوتیفیکیشن‌های پنل فروشنده
      const newRfqsCount = incomingRfqs.filter(r => r.status === 'pending').length;
      
      let newTendersCount = 0;
      const myCategoryIds = [...new Set(myProducts.map(p => p.categoryId))];
      allTenders.forEach(t => {
          if (t.buyerId !== activeUserId && t.status === 'active' && !t.proposals.some(p => p.supplierId === activeUserId)) {
              const tCats = Array.isArray(t.categoryId) ? t.categoryId : [t.categoryId];
              if(tCats.some(c => myCategoryIds.includes(c))) newTendersCount++;
          }
      });

      const profile = AppStore.getActiveUserProfile();
      let newDealsCount = 0;
      if (profile && profile.roles.includes('service_provider')) {
          const deals = AppStore.getAllDeals();
          newDealsCount = deals.filter(d => !d.pitches || !d.pitches.some(p => p.supplierId === activeUserId)).length;
      }

      return {
        productsCount: myProducts.length,
        newRfqsCount: newRfqsCount,
        sentProposalsCount: sentProposals, 
        profileViews: 0, 
        rfqs: populatedRfqs,
        newTendersCount: newTendersCount, // برای نوتیفیکیشن
        newDealsCount: newDealsCount // برای نوتیفیکیشن رادار
      };
    } catch (error) {
      console.error(error);
      return { productsCount: 0, newRfqsCount: 0, sentProposalsCount: 0, profileViews: 0, rfqs: [], newTendersCount:0, newDealsCount:0 };
    }
  },

  getAnalyticsData: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const activeUserId = AppStore.getActiveUserId();
      const myProducts = await ProductService.getProductsBySupplierId(activeUserId);

      const productViews = myProducts.map((p, index) => ({
          id: p.id,
          name: p.name,
          views: 0, 
          ageIndex: index 
      }));

      return {
          totalViews: 0,
          chartData: [0, 0, 0, 0, 0, 0, 0], 
          productViews: productViews
      };
  },

  replyToRfq: async (rfqId, replyMessage) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allRfqs = AppStore.getAllRfqs();
    const rfq = allRfqs.find(r => r.id === rfqId);
    if(rfq) {
      const now = new Date();
      const formattedDateTime = now.toLocaleString('fa-IR', {
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
      rfq.status = 'replied'; 
      rfq.reply = replyMessage; 
      rfq.replyDate = formattedDateTime; 
      AppStore.updateRfq(rfq); 
      return true;
    }
    return false;
  },

  getRelevantTenders: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activeUserId = AppStore.getActiveUserId();
    
    const myProducts = await ProductService.getProductsBySupplierId(activeUserId);
    const myCategoryIds = [...new Set(myProducts.map(p => p.categoryId))];
    const allTenders = AppStore.getAllTenders();
    
    const relevantTenders = allTenders.filter(t => {
        if (t.buyerId === activeUserId) return false;
        const tCats = Array.isArray(t.categoryId) ? t.categoryId : [t.categoryId];
        return tCats.some(c => myCategoryIds.includes(c));
    });

    const populatedTenders = relevantTenders.map(t => {
        const buyer = businesses.find(b => b.id === t.buyerId);
        return { ...t, buyerName: buyer ? buyer.name : 'خریدار نامشخص' };
    });

    return populatedTenders;
  },

  submitProposal: async (tenderId, message, price) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const activeUserId = AppStore.getActiveUserId();
    const allTenders = AppStore.getAllTenders();
    const tender = allTenders.find(t => t.id === tenderId);
    
    if (tender) {
        const now = new Date();
        const formattedDateTime = now.toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        
        tender.proposals.push({
            id: 'prop-' + Math.floor(Math.random() * 10000),
            supplierId: activeUserId,
            message: message,
            price: price,
            date: formattedDateTime
        });
        
        AppStore.updateTender(tender);
        return true;
    }
    return false;
  },

  getServiceOpportunities: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const activeUserId = AppStore.getActiveUserId();
      const profile = businesses.find(b => b.id === activeUserId);
      
      if (!profile || !profile.roles.includes('service_provider')) return [];

      const deals = AppStore.getAllDeals();
      return deals.map(d => {
          const b = businesses.find(x => x.id === d.buyerId);
          const s = businesses.find(x => x.id === d.mainSupplierId);
          return {
              ...d,
              buyerName: b ? b.name : 'نامشخص',
              supplierName: s ? s.name : 'نامشخص'
          };
      }).reverse(); // جدیدترین‌ها بالا
  },

  // 🌟 ثبت واقعی پیشنهاد خدمات در دیتابیس معامله
  submitServicePitch: async (dealId, type, message) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const activeUserId = AppStore.getActiveUserId();
      const deals = AppStore.getAllDeals();
      const deal = deals.find(d => d.id === dealId);
      
      if (deal) {
          if(!deal.pitches) deal.pitches = [];
          const now = new Date();
          const formattedDateTime = now.toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
          
          deal.pitches.push({
              id: 'pitch-' + Math.floor(Math.random() * 10000),
              supplierId: activeUserId,
              type: type,
              message: message,
              date: formattedDateTime,
              status: 'pending'
          });
          
          AppStore.updateDeal(deal);
          return true;
      }
      return false;
  }
};