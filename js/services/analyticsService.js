// js/services/analyticsService.js

import { AnalyticsStore } from '../data/analyticsStore.js';
import { AppStore } from '../data/appStore.js';
import { products } from '../data/products.js';
import { categories } from '../data/categories.js';

// تابع کمکی برای فیلتر کردن رویدادها بر اساس زمان
function filterEventsByDate(events, dateRange) {
    if (!dateRange || dateRange === 'all') return events;
    
    const now = new Date().getTime();
    if (typeof dateRange === 'number') {
        const cutoff = now - (dateRange * 24 * 60 * 60 * 1000);
        return events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    } else if (dateRange.from && dateRange.to) {
        const fromTime = new Date(dateRange.from).getTime();
        const toTime = new Date(dateRange.to).getTime() + 86400000; // تا پایان آن روز
        return events.filter(e => {
            const t = new Date(e.timestamp).getTime();
            return t >= fromTime && t <= toTime;
        });
    }
    return events;
}

export const AnalyticsService = {
    
    track: async (eventType, targetType, targetId, categoryId = null, metadata = {}) => {
        const activeProfile = AppStore.getActiveUserProfile();
        const userCountry = activeProfile ? activeProfile.country : 'ایران (مهمان)';
        const userId = AppStore.getActiveUserId() || 'guest';

        const event = {
            eventId: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
            eventType,
            userId,
            sessionId: AnalyticsStore.getSessionId(),
            targetType,
            targetId,
            categoryId,
            country: userCountry,
            timestamp: new Date().toISOString(),
            metadata
        };

        AnalyticsStore.saveEvent(event);
        return event;
    },

    trackSearch: async (query, resultsCount, categoryId = null) => {
        return await AnalyticsService.track('Search', 'Keyword', query, categoryId, { resultsCount });
    },

    trackProductView: async (productId, categoryId, source = 'direct') => {
        return await AnalyticsService.track('Product Viewed', 'Product', productId, categoryId, { source });
    },

    trackBusinessView: async (businessId, source = 'direct') => {
        return await AnalyticsService.track('Business Viewed', 'Business', businessId, null, { source });
    },

    trackInteraction: async (type, targetType, targetId, categoryId = null, extraMeta = {}) => {
        return await AnalyticsService.track(type, targetType, targetId, categoryId, extraMeta);
    },

    // ==========================================
    // 2. MARKET INTELLIGENCE (با پشتیبانی از فیلتر ترکیبی زمان و صنعت)
    // ==========================================

    getMarketOverview: async (categoryId = 'all', dateRange = 'all') => {
        let events = AnalyticsStore.getEvents() || [];
        events = filterEventsByDate(events, dateRange);

        if (categoryId !== 'all') {
            events = events.filter(e => e.categoryId === categoryId);
        }

        const totalSearches = events.filter(e => e.eventType === 'Search').length;
        const totalProductViews = events.filter(e => e.eventType === 'Product Viewed').length;
        const totalRfqs = events.filter(e => e.eventType && e.eventType.includes('RFQ')).length;
        const activeCountriesCount = new Set(events.filter(e => e.country).map(e => e.country)).size;

        return { totalSearches, totalProductViews, totalRfqs, activeCountriesCount };
    },

    getTrendingSearches: async (categoryId = 'all', dateRange = 'all') => {
        let events = AnalyticsStore.getEvents() || [];
        events = filterEventsByDate(events, dateRange); // فیلتر زمانی

        const searches = events.filter(e => e.eventType === 'Search');
        const counts = {};
        searches.forEach(s => {
            if(!s.targetId) return;
            const keyword = s.targetId.toLowerCase().trim();
            counts[keyword] = (counts[keyword] || 0) + 1;
        });

        let trending = Object.entries(counts).map(([keyword, count]) => ({ keyword, count }));

        // 🌟 اعمال الگوریتم "برچسب‌گذاری بر اساس نتایج (Result-based Tagging)" 🌟
        if (categoryId !== 'all') {
            trending = trending.filter(item => {
                // جستجو در محصولاتی که این کلمه کلیدی را دارند
                const matchingProducts = products.filter(p => 
                    p.name.toLowerCase().includes(item.keyword) || 
                    (p.shortDescription && p.shortDescription.toLowerCase().includes(item.keyword))
                );
                
                if (matchingProducts.length === 0) return false;

                // محاسبه اینکه چه درصدی از این محصولات متعلق به دسته انتخابی است
                const categoryMatches = matchingProducts.filter(p => p.categoryId === categoryId).length;
                const ratio = categoryMatches / matchingProducts.length;

                // اگر بیش از 50% محصولات یافت شده در این کلمه متعلق به این صنعت باشند، کلمه تایید می‌شود
                return ratio >= 0.5; 
            });
        }

        return trending.sort((a, b) => b.count - a.count).slice(0, 10);
    },

    getMarketOpportunities: async (categoryId = 'all', dateRange = 'all') => {
        let events = AnalyticsStore.getEvents() || [];
        events = filterEventsByDate(events, dateRange); // فیلتر زمانی

        const opportunities = [];
        let targetCategories = categories || [];

        if (categoryId !== 'all') {
            targetCategories = targetCategories.filter(c => c.id === categoryId);
        }

        targetCategories.forEach(cat => {
            const supplyCount = (products || []).filter(p => p.categoryId === cat.id && p.status === 'active').length;
            const catEvents = events.filter(e => e.categoryId === cat.id);
            let demandScore = 0;
            
            catEvents.forEach(e => {
                if (e.eventType === 'Product Viewed') demandScore += 1;
                if (e.eventType === 'Product Saved') demandScore += 3;
                if (e.eventType === 'RFQ Started' || e.eventType === 'RFQ Submitted') demandScore += 20; // امتیاز RFQ = 20
            });

            let status = 'Low Opportunity';
            let statusLabel = 'فرصت پایین';
            let color = '#94a3b8';

            const safeSupply = supplyCount === 0 ? 1 : supplyCount;
            const ratio = demandScore / safeSupply;

            if (demandScore === 0 && supplyCount === 0) {
                status = 'Emerging'; statusLabel = 'نیازمند داده (خالی)'; color = '#cbd5e1';
            } else if (demandScore > 0 && supplyCount === 0) {
                status = 'High Opportunity'; statusLabel = 'فرصت عالی (بدون عرضه)'; color = '#10b981';
            } else if (ratio >= 5) {
                status = 'High Opportunity'; statusLabel = 'فرصت عالی (تقاضای بالا)'; color = '#10b981';
            } else if (ratio >= 2) {
                status = 'Growing'; statusLabel = 'در حال رشد'; color = '#3b82f6';
            } else if (supplyCount > 5 && ratio < 1) {
                status = 'Competitive'; statusLabel = 'رقابتی (اشباع)'; color = '#ef4444';
            } else {
                status = 'Balanced'; statusLabel = 'متعادل'; color = '#f59e0b';
            }

            opportunities.push({
                categoryId: cat.id,
                categoryName: cat.name,
                supply: supplyCount,
                demandScore,
                ratio: ratio.toFixed(2),
                status,
                statusLabel,
                color
            });
        });

        return opportunities.sort((a, b) => b.demandScore - a.demandScore);
    },

    getDemandByCountry: async (categoryId = 'all', dateRange = 'all') => {
        let events = AnalyticsStore.getEvents() || [];
        events = filterEventsByDate(events, dateRange); // فیلتر زمانی

        if (categoryId !== 'all') {
            events = events.filter(e => e.categoryId === categoryId);
        }

        const highValueEvents = events.filter(e => e.eventType && (e.eventType.includes('RFQ') || e.eventType.includes('Contact')));
        const countryCounts = {};
        
        highValueEvents.forEach(e => {
            if(!e.country) return;
            countryCounts[e.country] = (countryCounts[e.country] || 0) + 1;
        });

        return Object.entries(countryCounts)
            .map(([country, score]) => ({ country, score }))
            .sort((a, b) => b.score - a.score);
    }
};