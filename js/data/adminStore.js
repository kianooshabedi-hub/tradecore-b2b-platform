// js/data/adminStore.js

const ADMIN_STORE_KEY = 'tradecore_admin_data';

const defaultAdminData = {
    auditLogs: [
        { id: 'log-1', adminId: 'super-admin', action: 'SYSTEM_INIT', entityType: 'System', entityId: 'all', description: 'سیستم مدیریت مرکزی راه‌اندازی شد', timestamp: new Date().toISOString() }
    ],
    reports: [],
    settings: {
        requireCompanyApproval: true,
        requireProductApproval: true,
        allowNewRegistrations: true
    }
};

export const AdminStore = {
    getData: () => {
        const data = localStorage.getItem(ADMIN_STORE_KEY);
        if (!data) {
            localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(defaultAdminData));
            return defaultAdminData;
        }
        return JSON.parse(data);
    },
    
    saveData: (data) => {
        localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(data));
    },

    addAuditLog: (action, entityType, entityId, description) => {
        const data = AdminStore.getData();
        const newLog = {
            id: 'log-' + Date.now(),
            adminId: 'super-admin', // در نسخه واقعی از توکن خوانده می‌شود
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