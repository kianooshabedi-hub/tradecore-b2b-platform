// js/services/sellerService.js

import { SellerStore } from '../data/sellerStore.js';
import { businesses } from '../data/businesses.js';
import { AppStore } from '../data/appStore.js';
import { AnalyticsStore } from '../data/analyticsStore.js';
import { ProductService } from './productService.js';

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

    getDashboardSummary: async () => {
        const bizId = AppStore.getActiveUserId();
        const events = AnalyticsStore.getEvents() || [];
        const profileViews = events.filter(e => e.eventType === 'Business Viewed' && e.targetId === bizId).length;

        const myProducts = await ProductService.getProductsBySupplierId(bizId);
        const rfqs = AppStore.getAllRfqs().filter(r => r.supplierId === bizId);
        const deals = AppStore.getAllDeals().filter(d => d.mainSupplierId === bizId || (d.pitches && d.pitches.some(p => p.supplierId === bizId)));

        return {
            productsCount: myProducts.length,
            profileViews: profileViews,
            newRfqsCount: rfqs.filter(r => r.status === 'pending').length,
            newDealsCount: deals.filter(d => d.status === 'in_negotiation').length,
            sentProposalsCount: deals.length
        };
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
        let timeSeriesObj = {}; // 🌟 ذخیره اطلاعات روزانه برای نمودار

        myProducts.forEach(p => {
            productStats[p.id] = { id: p.id, name: p.name, views: 0, saves: 0 };
        });

        filteredEvents.forEach(e => {
            const isProfileView = e.eventType === 'Business Viewed' && e.targetId === bizId;
            const isProductView = e.eventType === 'Product Viewed' && myProductIds.includes(e.targetId);

            if (isProfileView || isProductView) {
                // استخراج تاریخ برای رسم نمودار
                const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
                if (!timeSeriesObj[dateStr]) timeSeriesObj[dateStr] = 0;
                timeSeriesObj[dateStr]++;

                // جمع کل
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

        // 🌟 مرتب‌سازی داده‌های نمودار بر اساس تاریخ
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
            chartData: chartData // 🌟 ارسال داده‌های نمودار به UI
        };
    }
};