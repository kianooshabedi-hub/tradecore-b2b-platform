// js/data/adminStore.js

const ADMIN_STORE_KEY = 'tradecore_admin_data';

const defaultAdminData = {
    auditLogs: [
        { id: 'log-1', adminId: 'super-admin', action: 'SYSTEM_INIT', entityType: 'System', entityId: 'all', description: 'سیستم مدیریت مرکزی راه‌اندازی شد', timestamp: new Date().toISOString() }
    ],
    reports: [],
    settings: {
        // 1. عمومی
        platformName: 'TradeCore B2B',
        contactEmail: 'support@tradecore.local',
        contactPhone: '021-12345678',
        defaultLang: 'fa',
        currency: 'IRR',
        timezone: 'Asia/Tehran',
        maintenanceMode: false,
        // 2. کاربران و شرکت‌ها
        allowNewRegistrations: true,
        requireCompanyApproval: true,
        requireProductApproval: true,
        allowBuyerReg: true,
        allowSupplierReg: true,
        // 3. Marketplace
        marketplaceEnabled: true,
        publicProducts: true,
        publicCompanies: true,
        searchEnabled: true,
        featuredEnabled: true,
        // 4. RFQ و ارتباطات
        rfqEnabled: true,
        messagingEnabled: true,
        multiSupplierRfq: true,
        systemNotifications: true,
        // 5. اشتراک و پرداخت
        subSystemEnabled: true,
        paywallEnabled: true,
        onlinePayments: false,
        trialEnabled: false,
        trialDuration: 14,
        // 6. امنیت
        emailVerification: false,
        phoneVerification: true,
        twoFactorAuth: false,
        sessionDuration: 24,
        maxFailedLogins: 5
    }
};

export const AdminStore = {
    getData: () => {
        const data = localStorage.getItem(ADMIN_STORE_KEY);
        if (!data) {
            localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(defaultAdminData));
            return defaultAdminData;
        }
        const parsed = JSON.parse(data);
        // 🌟 ترکیب هوشمندانه تنظیمات پیش‌فرض با دیتاهای قدیمی برای جلوگیری از ارور
        parsed.settings = { ...defaultAdminData.settings, ...(parsed.settings || {}) };
        return parsed;
    },
    
    saveData: (data) => {
        localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(data));
    },

    addAuditLog: (action, entityType, entityId, description) => {
        const data = AdminStore.getData();
        const newLog = {
            id: 'log-' + Date.now(),
            adminId: 'super-admin',
            action,
            entityType,
            entityId,
            description,
            timestamp: new Date().toISOString()
        };
        data.auditLogs.unshift(newLog);
        AdminStore.saveData(data);
    },

    getAuditLogs: () => {
        return AdminStore.getData().auditLogs;
    }
};