// js/data/reviewStore.js

const REVIEWS_KEY = 'tradecore_reviews';

export const ReviewStore = {
    getAllReviews: () => {
        try {
            const data = localStorage.getItem(REVIEWS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error parsing reviews:", error);
            return [];
        }
    },
    
    saveAllReviews: (reviews) => {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    },
    
    addReview: (review) => {
        const reviews = ReviewStore.getAllReviews();
        reviews.push(review);
        ReviewStore.saveAllReviews(reviews);
    },
    
    updateReview: (updatedReview) => {
        const reviews = ReviewStore.getAllReviews();
        const index = reviews.findIndex(r => r.id === updatedReview.id);
        if (index !== -1) {
            reviews[index] = updatedReview;
            ReviewStore.saveAllReviews(reviews);
        }
    },
    
    deleteReview: (id) => {
        let reviews = ReviewStore.getAllReviews();
        reviews = reviews.filter(r => r.id !== id);
        ReviewStore.saveAllReviews(reviews);
    }
};