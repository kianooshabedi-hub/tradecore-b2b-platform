// js/services/buyerService.js

import { AppStore } from '../data/appStore.js';
import { ProductService } from './productService.js';
import { businesses } from '../data/businesses.js';

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
      const supplier = businesses.find(b => b.id === rfq.supplierId); 
      return { 
        ...rfq, 
        productName: product ? product.name : 'محصول نامشخص',
        supplierName: supplier ? supplier.name : 'شرکت نامشخص'
      };
    }));

    const myTenders = AppStore.getAllTenders().filter(t => t.buyerId === activeUserId);
    const totalProposals = myTenders.reduce((acc, t) => acc + (t.proposals ? t.proposals.length : 0), 0);

    // 🌟 محاسبه پیشنهادات خدماتی (Pitches) ارسال شده برای معاملات این خریدار
    const myDeals = AppStore.getAllDeals().filter(d => d.buyerId === activeUserId);
    let totalServicePitches = 0;
    myDeals.forEach(d => {
        if (d.pitches) totalServicePitches += d.pitches.length;
    });

    return { 
      rfqsCount: mySentRfqs.length, 
      rfqs: populatedRfqs,
      tendersCount: myTenders.length,
      proposalsCount: totalProposals,
      servicePitchesCount: totalServicePitches
    };
  },

  submitRfq: async (productId, supplierId, message) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const activeUserId = AppStore.getActiveUserId();
    const now = new Date();
    const formattedDateTime = now.toLocaleString('fa-IR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    
    const newRfq = {
      id: 'rfq-' + Math.floor(Math.random() * 10000),
      productId: productId,
      buyerId: activeUserId,
      supplierId: supplierId,
      date: formattedDateTime,
      status: 'pending',
      message: message
    };
    AppStore.addRfq(newRfq);
    return true;
  },

  startNegotiationForRfq: async (rfqId) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const allRfqs = AppStore.getAllRfqs();
      const rfq = allRfqs.find(r => r.id === rfqId);
      
      if(rfq) {
          rfq.status = 'in_negotiation';
          AppStore.updateRfq(rfq);

          const product = await ProductService.getProductById(rfq.productId);
          const now = new Date();
          const formattedDateTime = now.toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
          
          AppStore.addDeal({
              id: 'deal-' + Math.floor(Math.random() * 10000),
              type: 'rfq',
              sourceId: rfq.id,
              buyerId: rfq.buyerId,
              mainSupplierId: rfq.supplierId,
              title: `تأمین ${product ? product.name : 'محصول'}`,
              quantity: 'بر اساس استعلام',
              date: formattedDateTime,
              status: 'active',
              pitches: []
          });
          return true;
      }
      return false;
  },

  getBuyerTenders: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activeUserId = AppStore.getActiveUserId();
    return AppStore.getAllTenders().filter(t => t.buyerId === activeUserId);
  },

  submitTender: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const activeUserId = AppStore.getActiveUserId();
    const now = new Date();
    const formattedDateTime = now.toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    
    const newTender = {
      id: data.id || 'tndr-' + Math.floor(Math.random() * 10000),
      buyerId: activeUserId,
      title: data.title,
      categoryId: data.categoryId,
      quantity: data.quantity,
      description: data.description,
      date: formattedDateTime,
      status: 'active', 
      proposals: data.proposals || [] 
    };

    if(data.id) {
        AppStore.updateTender(newTender);
    } else {
        AppStore.addTender(newTender);
    }
    return true;
  },

  deleteTender: async (tenderId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    AppStore.deleteTender(tenderId);
    return true;
  },

  acceptTenderProposal: async (tenderId, proposalId) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const allTenders = AppStore.getAllTenders();
      const tender = allTenders.find(t => t.id === tenderId);
      
      if(tender) {
          tender.status = 'in_negotiation'; 
          const proposal = tender.proposals.find(p => p.id === proposalId);
          AppStore.updateTender(tender);

          const now = new Date();
          const formattedDateTime = now.toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
          
          AppStore.addDeal({
              id: 'deal-' + Math.floor(Math.random() * 10000),
              type: 'tender',
              sourceId: tender.id,
              buyerId: tender.buyerId,
              mainSupplierId: proposal ? proposal.supplierId : 'نامشخص',
              title: `پروژه/مناقصه: ${tender.title}`,
              quantity: tender.quantity,
              date: formattedDateTime,
              status: 'active',
              pitches: []
          });
          return true;
      }
      return false;
  },

  // 🌟 تابع جدید: دریافت تمام پروپوزال‌های خدماتی که برای خریدار ارسال شده
  getIncomingServicePitches: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const activeUserId = AppStore.getActiveUserId();
      const deals = AppStore.getAllDeals().filter(d => d.buyerId === activeUserId);
      
      let allPitches = [];
      deals.forEach(deal => {
          if (deal.pitches && deal.pitches.length > 0) {
              deal.pitches.forEach(p => {
                  const supplier = businesses.find(b => b.id === p.supplierId);
                  allPitches.push({
                      ...p,
                      dealId: deal.id,
                      dealTitle: deal.title,
                      supplierName: supplier ? supplier.name : 'شرکت نامشخص'
                  });
              });
          }
      });
      return allPitches.reverse(); // جدیدترین‌ها اول
  }
};