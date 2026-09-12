// js/services/supportService.js

import { SupportStore } from '../data/supportStore.js';
import { businesses } from '../data/businesses.js';
import { AdminStore } from '../data/adminStore.js';

export const SupportService = {
    // ---- پنل کاربران (خریدار / فروشنده) ----
    
    // دریافت تیکت‌های یک کاربر خاص
    getUserTickets: async (userId) => {
        await new Promise(r => setTimeout(r, 100)); // شبیه‌سازی API
        const all = SupportStore.getTickets();
        return all.filter(t => t.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    // ایجاد تیکت جدید توسط کاربر
    createTicket: async (userId, subject, text) => {
        await new Promise(r => setTimeout(r, 150));
        const tickets = SupportStore.getTickets();
        const now = new Date().toISOString();
        const formattedDate = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

        const newTicket = {
            id: 'tkt-' + Date.now(),
            userId: userId,
            subject: subject,
            status: 'open', // وضعیت‌ها: open (در انتظار پاسخ), replied (پاسخ داده شده), closed (بسته شده)
            messages: [{
                id: 'msg-' + Date.now(),
                sender: 'user',
                text: text,
                date: formattedDate
            }],
            createdAt: now,
            updatedAt: now
        };

        tickets.push(newTicket);
        SupportStore.saveTickets(tickets);
        return newTicket;
    },

    // ---- مشترک (کاربر و ادمین) ----

    // اضافه کردن پیام/پاسخ به تیکت
    addReply: async (ticketId, text, isAdmin = false) => {
        await new Promise(r => setTimeout(r, 150));
        const tickets = SupportStore.getTickets();
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return false;
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('fa-IR') + ' - ' + now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

        ticket.messages.push({
            id: 'msg-' + Date.now(),
            sender: isAdmin ? 'admin' : 'user',
            text: text,
            date: formattedDate
        });

        // اگر کاربر پیام داد وضعیت میشه open، اگر ادمین داد میشه replied
        ticket.status = isAdmin ? 'replied' : 'open';
        ticket.updatedAt = now.toISOString();
        SupportStore.saveTickets(tickets);
        
        if (isAdmin) {
            AdminStore.addAuditLog('REPLY_TICKET', 'SupportTicket', ticketId, `پاسخ ادمین به تیکت: ${ticket.subject}`);
        }
        return true;
    },

    // ---- پنل ادمین ----

    // دریافت تمامی تیکت‌ها برای ادمین
    getAllTicketsForAdmin: async (statusFilter = 'all') => {
        await new Promise(r => setTimeout(r, 100));
        let tickets = SupportStore.getTickets();
        
        if (statusFilter !== 'all') {
            tickets = tickets.filter(t => t.status === statusFilter);
        }

        // اضافه کردن نام شرکتی که تیکت زده برای نمایش در پنل ادمین
        return tickets.map(t => {
            const comp = businesses.find(b => b.id === t.userId);
            return { ...t, companyName: comp ? comp.name : 'نامشخص' };
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    // بستن تیکت توسط ادمین
    closeTicket: async (ticketId) => {
        await new Promise(r => setTimeout(r, 100));
        const tickets = SupportStore.getTickets();
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return false;
        
        ticket.status = 'closed';
        ticket.updatedAt = new Date().toISOString();
        SupportStore.saveTickets(tickets);
        
        AdminStore.addAuditLog('CLOSE_TICKET', 'SupportTicket', ticketId, `بستن تیکت توسط ادمین: ${ticket.subject}`);
        return true;
    }
};