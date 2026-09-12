// js/data/supportStore.js

const SUPPORT_KEY = 'tradecore_support_tickets';

export const SupportStore = {
    // دریافت تمام تیکت‌ها (در ابتدا آرایه خالی است)
    getTickets: () => {
        const data = localStorage.getItem(SUPPORT_KEY);
        if (!data) {
            localStorage.setItem(SUPPORT_KEY, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    },
    
    // ذخیره تغییرات تیکت‌ها
    saveTickets: (tickets) => {
        localStorage.setItem(SUPPORT_KEY, JSON.stringify(tickets));
    }
};