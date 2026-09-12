// js/data/featuredStore.js

const FEATURED_KEY = 'tradecore_featured_data';

const defaultData = {
    companies: [], // آرایه‌ای از آیدی شرکت‌های ویژه
    products: [],  // آرایه‌ای از آیدی محصولات ویژه
    usageStats: {} // ساختار: { 'biz-id': { month: '2026-09', companiesUsed: 1, productsUsed: 2 } }
};

export const FeaturedStore = {
    getData: () => {
        try {
            const data = localStorage.getItem(FEATURED_KEY);
            return data ? JSON.parse(data) : defaultData;
        } catch (error) {
            console.error("Error reading featured data:", error);
            return defaultData;
        }
    },

    saveData: (data) => {
        localStorage.setItem(FEATURED_KEY, JSON.stringify(data));
    }
};