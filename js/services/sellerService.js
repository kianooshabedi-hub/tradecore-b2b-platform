// js/services/sellerService.js

import { SellerStore } from '../data/sellerStore.js';
import { businesses } from '../data/businesses.js';
import { AppStore } from '../data/appStore.js';
import { AnalyticsStore } from '../data/analyticsStore.js';
import { ProductService } from './productService.js';
import { products } from '../data/products.js';

function filterEventsByDate(events, dateRange) {
    if (!dateRange || dateRange === 'all') return events;
    const now = new Date().getTime();
    if (typeof dateRange === 'number') {
        const cutoff = now - (dateRange * 24 * 60 * 60 * 1000);
        return events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    } else if (dateRange.from && dateRange.to) {
        const fromTime = new Date(dateRange.from).getTime();
        const toTime = new Date(dateRange.to).getTime() + 86400000;
        return events.filter(e => {
            const t = new Date(e.timestamp).getTime();
            return t >= fromTime && t <= toTime;
        });
    }
    return events;
}

export const SellerService = {
    getProfile: async () => {
        const bizId = AppStore.getActiveUserId();
        return businesses.find(b => b.id === bizId) || null;
    },

    markInboxAsRead: () => {
        const bizId = AppStore.getActiveUserId();
        const rfqs = AppStore.getAllRfqs().filter(r => r.supplierId === bizId && r.status === 'pending');
        const deals = AppStore.getAllDeals().filter(d => d.mainSupplierId === bizId && d.status === 'in_negotiation');
        localStorage.setItem('tc_last_seen_inbox', JSON.stringify({ rfqs: rfqs.length, deals: deals.length }));
    },

    getDashboardSummary: async () => {
        const bizId = AppStore.getActiveUserId();
        const events = AnalyticsStore.getEvents() || [];
        const profileViews = events.filter(e => e.eventType === 'Business Viewed' && e.targetId === bizId).length;

        const myProducts = await ProductService.getProductsBySupplierId(bizId);
        const rfqs = AppStore.getAllRfqs().filter(r => r.supplierId === bizId);
        
        const populatedRfqs = rfqs.map(r => {
            const buyer = businesses.find(b => b.id === r.buyerId);
            const prod = products.find(p => p.id === r.productId);
            return {
                ...r,
                buyerName: buyer ? buyer.name : 'خریدار نامشخص',
                productName: prod ? prod.name : 'محصول نامشخص'
            };
        });

        const deals = AppStore.getAllDeals().filter(d => d.mainSupplierId === bizId || (d.pitches && d.pitches.some(p => p.supplierId === bizId)));

        const pendingRfqs = rfqs.filter(r => r.status === 'pending').length;
        const negotiatingDeals = deals.filter(d => d.status === 'in_negotiation').length;

        let lastSeen = { rfqs: 0, deals: 0 };
        try { lastSeen = JSON.parse(localStorage.getItem('tc_last_seen_inbox')) || lastSeen; } catch(e){}

        return {
            productsCount: myProducts.length,
            profileViews: profileViews,
            newRfqsCount: Math.max(0, pendingRfqs - (lastSeen.rfqs || 0)),
            newDealsCount: Math.max(0, negotiatingDeals - (lastSeen.deals || 0)),
            sentProposalsCount: deals.length,
            rfqs: populatedRfqs
        };
    },

    getRelevantTenders: async () => {
        const allTenders = AppStore.getAllTenders();
        return allTenders.filter(t => t.status === 'active' || t.status === 'in_negotiation').map(t => {
            const buyer = businesses.find(b => b.id === t.buyerId);
            return { ...t, buyerName: buyer ? buyer.name : 'کارفرما نامشخص' };
        });
    },

    getServiceOpportunities: async () => {
        const activeUserId = AppStore.getActiveUserId();
        const allDeals = AppStore.getAllDeals();
        
        // 🌟 فیلتر هوشمند رادار:
        // ۱- خریدار نباید معامله خودش را در رادار ببیند.
        // ۲- فروشنده اصلی (برنده معامله) نباید معامله خودش را در رادار ببیند.
        // ۳- اگر برای یک مناقصه ۳ نفر انتخاب شده‌اند، فقط یک معامله (با showInRadar: true) در رادار می‌آید.
        return allDeals.filter(d => 
            (d.status === 'negotiating' || d.status === 'in_negotiation') && 
            d.showInRadar !== false &&
            d.buyerId !== activeUserId && 
            d.mainSupplierId !== activeUserId
        ).map(deal => {
            const buyer = businesses.find(b => b.id === deal.buyerId);
            return {
                ...deal,
                buyerName: buyer ? buyer.name : 'خریدار نامشخص'
            };
        });
    },

    replyToRfq: async (rfqId, replyMessage) => {
        const rfqs = AppStore.getAllRfqs();
        const rfq = rfqs.find(r => r.id === rfqId);
        if(rfq) {
            rfq.status = 'replied';
            rfq.reply = replyMessage;
            rfq.replyDate = new Date().toLocaleDateString('fa-IR');
            AppStore.updateRfq(rfq);
            AppStore.addNotification(rfq.buyerId, `پاسخ جدید برای استعلام دریافت شد`, 'success', '#rfqs');
        }
    },

    submitProposal: async (tenderId, msg, price) => {
        const tenders = AppStore.getAllTenders();
        const tender = tenders.find(t => t.id === tenderId);
        if(tender) {
            if(!tender.proposals) tender.proposals = [];
            tender.proposals.push({
                id: 'prop-' + Date.now(),
                supplierId: AppStore.getActiveUserId(),
                message: msg,
                price: price,
                status: 'pending',
                date: new Date().toLocaleDateString('fa-IR')
            });
            AppStore.updateTender(tender);
            AppStore.addNotification(tender.buyerId, `پیشنهاد جدید برای مناقصه ثبت شد`, 'info');
        }
    },

    submitServicePitch: async (dealId, type, msg) => {
        const deals = AppStore.getAllDeals();
        const deal = deals.find(d => d.id === dealId);
        if(deal) {
            if(!deal.pitches) deal.pitches = [];
            deal.pitches.push({
                id: 'pitch-' + Date.now(),
                supplierId: AppStore.getActiveUserId(),
                type: type,
                message: msg,
                date: new Date().toLocaleDateString('fa-IR')
            });
            AppStore.updateDeal(deal);
        }
    },

    getSellerAnalytics: async (dateRange = 'all') => {
        const bizId = AppStore.getActiveUserId();
        const myProducts = await ProductService.getProductsBySupplierId(bizId);
        const myProductIds = myProducts.map(p => p.id);

        let allEvents = AnalyticsStore.getEvents() || [];
        let filteredEvents = filterEventsByDate(allEvents, dateRange);

        let totalProfileViews = 0;
        let totalProductViews = 0;
        let productStats = {};
        let timeSeriesObj = {};

        myProducts.forEach(p => {
            productStats[p.id] = { id: p.id, name: p.name, views: 0, saves: 0 };
        });

        filteredEvents.forEach(e => {
            const isProfileView = e.eventType === 'Business Viewed' && e.targetId === bizId;
            const isProductView = e.eventType === 'Product Viewed' && myProductIds.includes(e.targetId);

            if (isProfileView || isProductView) {
                const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
                if (!timeSeriesObj[dateStr]) timeSeriesObj[dateStr] = 0;
                timeSeriesObj[dateStr]++;

                if (isProfileView) totalProfileViews++;
                if (isProductView) {
                    totalProductViews++;
                    if (productStats[e.targetId]) productStats[e.targetId].views++;
                }
            }

            if (e.eventType === 'Product Saved' && myProductIds.includes(e.targetId)) {
                if (productStats[e.targetId]) productStats[e.targetId].saves++;
            }
        });

        const sortedDates = Object.keys(timeSeriesObj).sort();
        const chartData = sortedDates.map(dateStr => {
            const pDate = new Date(dateStr).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            return { label: pDate, value: timeSeriesObj[dateStr] };
        });

        const sortedProducts = Object.values(productStats).sort((a, b) => b.views - a.views);

        return {
            totalProfileViews,
            totalProductViews,
            totalViews: totalProfileViews + totalProductViews,
            products: sortedProducts,
            chartData: chartData
        };
    },
    // 🌟 آپدیت پروفایل تجاری فروشنده
    updateProfile: async (profileData) => {
        await new Promise(resolve => setTimeout(resolve, 400)); // شبیه‌سازی شبکه
        const bizId = AppStore.getActiveUserId();
        const biz = businesses.find(b => b.id === bizId);
        
        if (biz) {
            // آپدیت فیلدهای اصلی
            Object.assign(biz, profileData);
            
            // در نسخه واقعی اینجا درخواست به API زده می‌شود و در دیتابیس ذخیره می‌گردد
            // AppStore.updateBusiness(biz); // اگر متدی برای آپدیت داشتیم
            return true;
        }
        throw new Error('شرکت یافت نشد.');
    }
};