// js/services/featuredContentService.js

import { FeaturedStore } from '../data/featuredStore.js';
import { businesses } from '../data/businesses.js';
import { products } from '../data/products.js';
import { categories } from '../data/categories.js';
import { AnalyticsService } from './analyticsService.js';

export const FeaturedContentService = {
    
    getFeaturedCompanies: async () => {
        const data = FeaturedStore.getData();
        return data.companies
            .map(id => businesses.find(b => b.id === id))
            .filter(Boolean); 
    },

    getFeaturedProducts: async () => {
        const data = FeaturedStore.getData();
        return data.products
            .map(id => {
                const p = products.find(prod => prod.id === id);
                if (!p) return null;
                // اتصال ایمن نام شرکت به محصول
                const supplier = businesses.find(b => b.id === p.supplierId);
                const category = categories.find(c => c.id === p.categoryId);
                return { 
                    ...p, 
                    supplierName: supplier ? supplier.name : 'نامشخص',
                    categoryName: category ? category.name : 'دسته‌بندی نامشخص'
                };
            })
            .filter(Boolean);
    },

    // ایجاد یک سهمیه بی‌نهایت و آزاد برای ادمین جهت تست
    getQuotaStatus: (bizId) => {
        return {
            tier: 'Unlimited',
            remaining: { companies: 999, products: 999 }
        };
    },

    addFeaturedCompany: async (bizId) => {
        const data = FeaturedStore.getData();
        if (data.companies.includes(bizId)) throw new Error("این شرکت در حال حاضر در لیست ویژه قرار دارد.");

        data.companies.unshift(bizId);
        FeaturedStore.saveData(data);
        return true;
    },

    removeFeaturedCompany: async (bizId) => {
        const data = FeaturedStore.getData();
        data.companies = data.companies.filter(id => id !== bizId);
        FeaturedStore.saveData(data);
    },

    addFeaturedProduct: async (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error("محصول یافت نشد");

        const data = FeaturedStore.getData();
        if (data.products.includes(productId)) throw new Error("این محصول در حال حاضر ویژه است.");

        data.products.unshift(productId);
        FeaturedStore.saveData(data);
        return true;
    },

    removeFeaturedProduct: async (productId) => {
        const data = FeaturedStore.getData();
        data.products = data.products.filter(id => id !== productId);
        FeaturedStore.saveData(data);
    },

    trackView: (type, id) => {
        AnalyticsService.trackInteraction(`Featured ${type} Viewed`, type, id);
    },
    
    trackClick: (type, id) => {
        AnalyticsService.trackInteraction(`Featured ${type} Clicked`, type, id);
    }
};