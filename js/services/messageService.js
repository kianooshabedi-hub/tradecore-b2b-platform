// js/services/messageService.js

import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';

export const MessageService = {
    
    // دریافت تمام چت‌های کاربر فعال
    getMyConversations: async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Mock latency
        const userId = AppStore.getActiveUserId();
        const allConvs = AppStore.getAllConversations();
        
        return allConvs.filter(c => c.participants.includes(userId)).map(conv => {
            const otherUserId = conv.participants.find(p => p !== userId);
            const otherUser = businesses.find(b => b.id === otherUserId);
            return {
                ...conv,
                otherUserName: otherUser ? otherUser.name : 'کاربر حذف شده',
                otherUserLogo: otherUser ? otherUser.logo : 'images/default-logo.png',
                unreadCount: conv.messages.filter(m => m.senderId !== userId && !m.isRead).length
            };
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    // ایجاد یک چت جدید (مثلاً بعد از تایید پروپوزال)
    createConversation: async (participantIds, subject, relatedId = null) => {
        const convs = AppStore.getAllConversations();
        const newConv = {
            id: 'conv-' + Date.now(),
            participants: participantIds,
            subject: subject,
            relatedId: relatedId,
            updatedAt: new Date().toISOString(),
            messages: []
        };
        convs.push(newConv);
        AppStore.saveConversations(convs);
        return newConv;
    },

    // ارسال پیام در یک چت
    sendMessage: async (convId, text) => {
        const senderId = AppStore.getActiveUserId();
        const convs = AppStore.getAllConversations();
        const conv = convs.find(c => c.id === convId);
        
        if (conv) {
            const newMsg = {
                id: 'msg-' + Date.now(),
                senderId: senderId,
                text: text,
                timestamp: new Date().toISOString(),
                isRead: false
            };
            conv.messages.push(newMsg);
            conv.updatedAt = newMsg.timestamp;
            AppStore.saveConversations(convs);

            // ارسال نوتیفیکیشن به طرف مقابل
            const receiverId = conv.participants.find(p => p !== senderId);
            AppStore.addNotification(receiverId, `پیام جدید درباره: ${conv.subject}`, 'message', '#messages');

            return newMsg;
        }
        return null;
    }
};