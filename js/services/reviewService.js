// js/services/reviewService.js

import { ReviewStore } from '../data/reviewStore.js';
import { AppStore } from '../data/appStore.js';
import { AnalyticsService } from './analyticsService.js';

export const ReviewService = {
    getReviews: async (targetType, targetId, status = 'approved', sortBy = 'newest') => {
        let reviews = ReviewStore.getAllReviews().filter(r => r.targetType === targetType && r.targetId === targetId);
        
        if (status !== 'all') {
            reviews = reviews.filter(r => r.status === status);
        }

        if (sortBy === 'newest') reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sortBy === 'highest') reviews.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'lowest') reviews.sort((a, b) => a.rating - b.rating);

        return reviews;
    },

    getUserReview: async (userId, targetType, targetId) => {
        return ReviewStore.getAllReviews().find(r => r.userId === userId && r.targetType === targetType && r.targetId === targetId);
    },

    getReviewStats: async (targetType, targetId) => {
        const reviews = ReviewStore.getAllReviews().filter(r => r.targetType === targetType && r.targetId === targetId && r.status === 'approved');
        const total = reviews.length;
        
        if (total === 0) return { average: 0, total: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0} };

        let sum = 0;
        const distribution = {1:0, 2:0, 3:0, 4:0, 5:0};
        
        reviews.forEach(r => {
            sum += r.rating;
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        return {
            average: (sum / total).toFixed(1),
            total,
            distribution
        };
    },

    submitReview: async (targetType, targetId, rating, title, comment) => {
        const activeUser = AppStore.getActiveUserProfile();
        if (!activeUser) throw new Error("برای ثبت نظر باید وارد حساب کاربری شوید.");

        const existing = await ReviewService.getUserReview(activeUser.id, targetType, targetId);
        if (existing) throw new Error("شما قبلاً برای این مورد نظر ثبت کرده‌اید. می‌توانید آن را ویرایش کنید.");

        const newReview = {
            id: 'rev_' + Date.now() + Math.random().toString(36).substr(2, 5),
            userId: activeUser.id,
            userName: activeUser.name,
            targetType,
            targetId,
            rating: Number(rating),
            title: title.trim(),
            comment: comment.trim(),
            status: 'pending',
            rejectionReason: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        ReviewStore.addReview(newReview);
        
        AnalyticsService.trackInteraction('Review Submitted', targetType, targetId, null, { rating });
        AnalyticsService.trackInteraction('Rating Submitted', targetType, targetId, null, { rating });
        
        return newReview;
    },

    updateReview: async (id, rating, title, comment) => {
        const userId = AppStore.getActiveUserId();
        const reviews = ReviewStore.getAllReviews();
        const review = reviews.find(r => r.id === id);
        
        if (!review) throw new Error("نظر یافت نشد.");
        if (review.userId !== userId) throw new Error("شما اجازه ویرایش این نظر را ندارید.");

        review.rating = Number(rating);
        review.title = title.trim();
        review.comment = comment.trim();
        review.status = 'pending'; 
        review.rejectionReason = null;
        review.updatedAt = new Date().toISOString();

        ReviewStore.updateReview(review);
        AnalyticsService.trackInteraction('Review Updated', review.targetType, review.targetId, null, { rating });
        
        return review;
    },

    deleteReview: async (id) => {
         const userId = AppStore.getActiveUserId();
         const review = ReviewStore.getAllReviews().find(r => r.id === id);
         if (!review) return;
         if (review.userId !== userId) throw new Error("شما اجازه حذف را ندارید.");
         
         ReviewStore.deleteReview(id);
    },

    getAllReviewsAdmin: async () => {
        return ReviewStore.getAllReviews().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    updateReviewStatus: async (id, status, rejectionReason = null) => {
        const reviews = ReviewStore.getAllReviews();
        const review = reviews.find(r => r.id === id);
        if (!review) throw new Error("نظر یافت نشد.");

        review.status = status;
        review.rejectionReason = rejectionReason;
        review.updatedAt = new Date().toISOString();

        ReviewStore.updateReview(review);
        return review;
    }
};