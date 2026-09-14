// js/services/adminService.js

import { AppStore } from '../data/appStore.js';
import { AdminStore } from '../data/adminStore.js';
import { businesses } from '../data/businesses.js';
import { products } from '../data/products.js';

export const AdminService = {
    // احراز هویت ادمین (Mock)
    verifyAdminAccess: () => {
        // در نسخه واقعی بررسی 토کن JWT انجام می‌شود
        // فعلاً فرض می‌کنیم سوپر ادمین وارد شده است
        return true;
    },

    // دریافت آمار کلان داشبورد
    getDashboardStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const allRfqs = AppStore.getAllRfqs();
        const allTenders = AppStore.getAllTenders();
        const allDeals = AppStore.getAllDeals();

        let totalProposals = 0;
        allTenders.forEach(t => { if(t.proposals) totalProposals += t.proposals.length; });

        return {
            companies: {
                total: businesses.length,
                verified: businesses.filter(b => b.status === 'verified').length,
                pending: businesses.filter(b => b.status === 'pending').length,
                suspended: businesses.filter(b => b.status === 'suspended').length,
            },
            products: {
                total: products.length,
                active: products.filter(p => p.status === 'active').length,
                pending: products.filter(p => p.status === 'pending').length,
            },
            transactions: {
                rfqs: allRfqs.length,
                tenders: allTenders.length,
                proposals: totalProposals,
                activeDeals: allDeals.filter(d => d.status === 'active').length
            },
            system: {
                activeSubscriptions: businesses.filter(b => b.subscriptionTier !== 'free').length
            }
        };
    },

    // مدیریت شرکت‌ها
    getAllCompanies: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...businesses]; // در نسخه واقعی: fetch('/api/admin/companies')
    },

    changeCompanyStatus: async (companyId, newStatus, reason = '') => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const biz = businesses.find(b => b.id === companyId);
        if (biz) {
            const oldStatus = biz.status;
            biz.status = newStatus;
            
            // ثبت در لاگ امنیتی سیستم
            AdminStore.addAuditLog(
                'UPDATE_COMPANY_STATUS', 
                'Company', 
                companyId, 
                `تغییر وضعیت از ${oldStatus} به ${newStatus} ${reason ? `- دلیل: ${reason}` : ''}`
            );
            return true;
        }
        return false;
    },

    // مدیریت محصولات
    getAllProducts: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return products.map(p => {
            const supplier = businesses.find(b => b.id === p.supplierId);
            return { ...p, supplierName: supplier ? supplier.name : 'نامشخص' };
        });
    },

    changeProductStatus: async (productId, newStatus) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const prod = products.find(p => p.id === productId);
        if (prod) {
            prod.status = newStatus;
            AdminStore.addAuditLog('UPDATE_PRODUCT_STATUS', 'Product', productId, `تغییر وضعیت به ${newStatus}`);
            return true;
        }
        return false;
    },

    // دریافت لاگ‌های سیستم
    getActivityLogs: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return AdminStore.getAuditLogs();
    },
    // دریافت تنظیمات پلتفرم
    getPlatformSettings: async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return AdminStore.getData().settings;
    },

    // ذخیره و آپدیت تنظیمات
    savePlatformSettings: async (newSettings) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = AdminStore.getData();
        data.settings = { ...data.settings, ...newSettings };
        AdminStore.saveData(data);
        
        AdminStore.addAuditLog('UPDATE_SETTINGS', 'System', 'all', 'پیکربندی هسته پلتفرم به‌روزرسانی شد');
        return true;
    }
};