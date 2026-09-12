// js/data/analyticsStore.js

const ANALYTICS_KEY = 'tradecore_analytics_events';
const SESSION_KEY = 'tradecore_session_id';

const initSession = () => {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
        sid = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
        sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
};

export const AnalyticsStore = {
    getSessionId: initSession,

    getEvents: () => {
        try {
            const data = localStorage.getItem(ANALYTICS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error parsing events:", error);
            return [];
        }
    },

    saveEvent: (eventObj) => {
        const events = AnalyticsStore.getEvents();
        events.push(eventObj);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
    },

    clearEvents: () => {
        localStorage.removeItem(ANALYTICS_KEY);
    }
};