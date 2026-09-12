// js/services/searchService.js

import { products } from '../data/products.js';
import { businesses } from '../data/businesses.js';
import { categories } from '../data/categories.js';

export const SearchService = {
    
    // ==========================================
    // ۱. سیستم پیشنهادات زنده (Auto-Suggestions)
    // ==========================================
    getSuggestions: async (query) => {
        if (!query || query.trim().length < 2) return { products: [], companies: [], categories: [] };
        
        const q = query.toLowerCase().trim();
        
        // پیدا کردن دسته‌بندی‌های مرتبط (حداکثر ۳ مورد)
        const matchedCategories = categories
            .filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
            .slice(0, 3);

        // پیدا کردن شرکت‌های مرتبط (حداکثر ۳ مورد)
        const matchedCompanies = businesses
            .filter(b => 
                b.name.toLowerCase().includes(q) || 
                (b.englishName && b.englishName.toLowerCase().includes(q)) ||
                (b.brand && b.brand.toLowerCase().includes(q))
            )
            .slice(0, 3);

        // پیدا کردن محصولات مرتبط با سیستم امتیازدهی ساده (حداکثر ۵ مورد)
        const matchedProducts = products
            .map(p => {
                let score = 0;
                const pName = p.name.toLowerCase();
                const pBrand = p.brand ? p.brand.toLowerCase() : '';
                
                if (pName === q) score += 100; // تطابق دقیق نام
                else if (pName.startsWith(q)) score += 50; // شروع با کلمه
                else if (pName.includes(q)) score += 30; // شامل کلمه
                
                if (pBrand === q) score += 40; // تطابق برند
                
                return { ...p, relevanceScore: score };
            })
            .filter(p => p.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 5);

        return {
            categories: matchedCategories,
            companies: matchedCompanies,
            products: matchedProducts
        };
    },

    // ==========================================
    // ۲. جستجوی اصلی و ساختاریافته (Main Search)
    // ==========================================
    search: async (query, filters = {}, sortBy = 'relevance') => {
        const q = query ? query.toLowerCase().trim() : '';
        
        // --- الف) فیلتر و امتیازدهی محصولات ---
        let resultProducts = products.map(p => {
            let score = 0;
            if (q) {
                const pName = p.name.toLowerCase();
                const pBrand = p.brand ? p.brand.toLowerCase() : '';
                const pCat = p.categoryName ? p.categoryName.toLowerCase() : '';
                const pDesc = p.shortDescription ? p.shortDescription.toLowerCase() : '';

                if (pName === q) score += 100;
                else if (pName.includes(q)) score += 50;
                
                if (pBrand.includes(q)) score += 40;
                if (pCat.includes(q)) score += 30;
                if (pDesc.includes(q)) score += 10;
            } else {
                score = 1; // در صورت خالی بودن کوئری، همه نمایش داده شوند (برای کار با فیلترها)
            }
            return { ...p, relevanceScore: score };
        }).filter(p => p.relevanceScore > 0);

        // --- ب) اعمال فیلترهای ترکیبی (Faceted Filters) ---
        if (filters.category && filters.category !== 'all') {
            resultProducts = resultProducts.filter(p => p.categoryId === filters.category);
        }
        if (filters.supplier && filters.supplier !== 'all') {
            resultProducts = resultProducts.filter(p => p.supplierId === filters.supplier);
        }
        if (filters.country && filters.country !== 'all') {
            resultProducts = resultProducts.filter(p => p.country === filters.country);
        }

        // --- ج) مرتب‌سازی (Sorting) ---
        if (sortBy === 'relevance' && q) {
            resultProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
        } else if (sortBy === 'newest') {
            // چون تاریخ واقعی نداریم، بر اساس ID معکوس مرتب می‌کنیم (شبیه‌سازی جدیدترین)
            resultProducts.sort((a, b) => b.id.localeCompare(a.id));
        }

        // --- د) جستجوی شرکت‌ها (فقط اگر سرچ متنی وجود داشته باشد) ---
        let resultCompanies = [];
        if (q && Object.keys(filters).length === 0) {
            resultCompanies = businesses.filter(b => 
                b.name.toLowerCase().includes(q) || 
                (b.englishName && b.englishName.toLowerCase().includes(q)) ||
                (b.brand && b.brand.toLowerCase().includes(q)) ||
                (b.industry && b.industry.toLowerCase().includes(q))
            );
        }

        return {
            products: resultProducts,
            companies: resultCompanies,
            totalResults: resultProducts.length + resultCompanies.length
        };
    },

    // ==========================================
    // ۳. استخراج داده‌ها برای ساخت فیلترهای داینامیک
    // ==========================================
    getAvailableFilters: async (currentProducts) => {
        const brands = new Set();
        const countries = new Set();
        const suppliers = new Map();

        currentProducts.forEach(p => {
            if (p.brand) brands.add(p.brand);
            if (p.country) countries.add(p.country);
            if (p.supplierId && p.supplierName) {
                suppliers.set(p.supplierId, p.supplierName);
            }
        });

        return {
            brands: Array.from(brands),
            countries: Array.from(countries),
            suppliers: Array.from(suppliers.entries()).map(([id, name]) => ({ id, name }))
        };
    }
};