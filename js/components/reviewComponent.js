// js/components/reviewComponent.js

import { ReviewService } from '../services/reviewService.js';
import { AppStore } from '../data/appStore.js';
import { AnalyticsService } from '../services/analyticsService.js';

export const ReviewComponent = {
    state: {
        containerId: null,
        targetType: null,
        targetId: null,
        sortBy: 'newest',
        userReview: null
    },

    init: async (containerId, targetType, targetId) => {
        ReviewComponent.state.containerId = containerId;
        ReviewComponent.state.targetType = targetType;
        ReviewComponent.state.targetId = targetId;

        AnalyticsService.trackInteraction('Review Viewed', targetType, targetId);
        await ReviewComponent.render();
    },

    changeSort: async (sortValue) => {
        ReviewComponent.state.sortBy = sortValue;
        await ReviewComponent.render();
    },

    render: async () => {
        const { containerId, targetType, targetId, sortBy } = ReviewComponent.state;
        const container = document.getElementById(containerId);
        if (!container) return;

        const userId = AppStore.getActiveUserId();
        
        const stats = await ReviewService.getReviewStats(targetType, targetId);
        const reviews = await ReviewService.getReviews(targetType, targetId, 'approved', sortBy);
        
        ReviewComponent.state.userReview = await ReviewService.getUserReview(userId, targetType, targetId);
        const userReviewHtml = ReviewComponent.renderForm();

        container.innerHTML = `
            <div style="background: white; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 2px 4px rgba(0,0,0,0.02); padding: 2rem; margin-top: 2rem;">
                <h3 style="font-size: 1.4rem; margin-bottom: 1.5rem; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">نظرات و امتیازات</h3>
                
                ${ReviewComponent.renderSummary(stats)}
                ${userReviewHtml}
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; color: #1e293b;">لیست نظرات (${stats.total})</h4>
                    <select class="form-input" style="width: auto; padding: 4px 12px; font-size: 0.85rem; border-radius: 20px; background-color: #f8fafc;" onchange="window.ReviewComponentAPI.changeSort(this.value)">
                        <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>جدیدترین</option>
                        <option value="highest" ${sortBy === 'highest' ? 'selected' : ''}>بالاترین امتیاز</option>
                        <option value="lowest" ${sortBy === 'lowest' ? 'selected' : ''}>پایین‌ترین امتیاز</option>
                    </select>
                </div>

                <div id="review-list">
                    ${reviews.length > 0 ? reviews.map(r => ReviewComponent.renderReviewItem(r)).join('') : '<div style="text-align:center; color:#94a3b8; padding: 2rem;">اولین نفری باشید که نظر خود را ثبت می‌کنید!</div>'}
                </div>
            </div>
        `;

        window.ReviewComponentAPI = {
            changeSort: ReviewComponent.changeSort,
            submit: ReviewComponent.submitReview,
            delete: ReviewComponent.deleteReview,
            editMode: ReviewComponent.enableEditMode,
            setRating: ReviewComponent.setRatingStar
        };
    },

    renderSummary: (stats) => {
        if (stats.total === 0) return '';
        
        let barsHtml = '';
        for(let i = 5; i >= 1; i--) {
            const count = stats.distribution[i];
            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
            barsHtml += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px; font-size: 0.85rem;">
                    <span style="width: 40px; color: #64748b;">${i} ستاره</span>
                    <div style="flex: 1; background: #f1f5f9; height: 8px; border-radius: 10px; overflow: hidden;">
                        <div style="background: #f59e0b; height: 100%; width: ${percent}%;"></div>
                    </div>
                    <span style="width: 30px; text-align: left; color: #64748b;">${count}</span>
                </div>
            `;
        }

        return `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <div style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 3rem; font-weight: 900; color: #0f172a;">${stats.average}</div>
                    <div style="color: #f59e0b; font-size: 1.2rem; margin-bottom: 5px;">
                        ${'★'.repeat(Math.round(stats.average))}${'☆'.repeat(5 - Math.round(stats.average))}
                    </div>
                    <div style="color: #64748b; font-size: 0.85rem;">بر اساس ${stats.total} رأی</div>
                </div>
                <div>${barsHtml}</div>
            </div>
        `;
    },

    renderForm: () => {
        const review = ReviewComponent.state.userReview;
        
        if (review && review.status === 'pending') {
            return `
                <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h4 style="color: #d97706; margin-top: 0;">نظر شما در حال بررسی است</h4>
                    <p style="font-size: 0.9rem; color: #92400e; margin-bottom: 10px;">پس از تایید مدیر، نظر شما در سایت منتشر خواهد شد.</p>
                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 10px;" onclick="window.ReviewComponentAPI.delete('${review.id}')">حذف نظر</button>
                </div>
            `;
        }

        if (review && review.status === 'rejected') {
            return `
                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h4 style="color: #dc2626; margin-top: 0;">نظر شما رد شد</h4>
                    <p style="font-size: 0.9rem; color: #991b1b;">دلیل: ${review.rejectionReason || 'عدم رعایت قوانین سایت'}</p>
                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 10px; margin-top: 10px;" onclick="window.ReviewComponentAPI.editMode()">ویرایش مجدد</button>
                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 10px; margin-top: 10px; color: #ef4444; border-color: #ef4444;" onclick="window.ReviewComponentAPI.delete('${review.id}')">حذف نظر</button>
                </div>
            `;
        }

        if (review && !window.miEditMode) {
             return `
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 10px;">شما قبلاً نظر خود را ثبت کرده‌اید</h4>
                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 10px;" onclick="window.ReviewComponentAPI.editMode()">ویرایش نظر من</button>
                </div>
            `;
        }

        const isEdit = !!review;
        const currentRating = isEdit ? review.rating : 5;
        const currentTitle = isEdit ? review.title : '';
        const currentComment = isEdit ? review.comment : '';

        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += `<span class="review-star" data-val="${i}" onclick="window.ReviewComponentAPI.setRating(${i})" style="font-size: 1.8rem; cursor: pointer; color: ${i <= currentRating ? '#f59e0b' : '#cbd5e1'}; transition: 0.2s;">★</span>`;
        }

        return `
            <div style="background: white; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="margin-top: 0; margin-bottom: 15px; color: #0f172a;">${isEdit ? 'ویرایش نظر' : 'ثبت نظر و امتیاز جدید'}</h4>
                
                <input type="hidden" id="rc-review-id" value="${isEdit ? review.id : ''}">
                <input type="hidden" id="rc-rating-val" value="${currentRating}">
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 5px;">امتیاز شما *</label>
                    <div id="rc-stars-container" style="user-select: none;">${starsHtml}</div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 5px;">عنوان نظر *</label>
                    <input type="text" id="rc-title" class="form-input" placeholder="یک عنوان کوتاه برای نظر خود بنویسید" value="${currentTitle}">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 5px;">متن نظر *</label>
                    <textarea id="rc-comment" class="form-input" rows="4" placeholder="تجربه یا بررسی خود را اینجا بنویسید...">${currentComment}</textarea>
                </div>

                <div style="text-align: left;">
                    ${isEdit ? `<button class="btn btn-outline" style="margin-left: 10px;" onclick="window.ReviewComponentAPI.changeSort(window.ReviewComponent.state.sortBy)">لغو</button>` : ''}
                    <button class="btn btn-primary" onclick="window.ReviewComponentAPI.submit()">${isEdit ? 'ثبت ویرایش' : 'ثبت نهایی'}</button>
                </div>
            </div>
        `;
    },

    renderReviewItem: (r) => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const dateStr = new Date(r.createdAt).toLocaleDateString('fa-IR');
        
        return `
            <div style="padding: 1.5rem 0; border-bottom: 1px solid #f1f5f9;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #475569;">
                            ${r.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${r.userName}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem;" dir="ltr">${dateStr}</div>
                        </div>
                    </div>
                    <div style="color: #f59e0b; font-size: 1.1rem; letter-spacing: 2px;">${stars}</div>
                </div>
                <h5 style="margin: 0 0 8px 0; font-size: 1rem; color: #0f172a;">${r.title}</h5>
                <p style="margin: 0; font-size: 0.95rem; color: #475569; line-height: 1.6;">${r.comment}</p>
            </div>
        `;
    },

    setRatingStar: (val) => {
        document.getElementById('rc-rating-val').value = val;
        const stars = document.querySelectorAll('#rc-stars-container .review-star');
        stars.forEach((star, idx) => {
            star.style.color = (idx < val) ? '#f59e0b' : '#cbd5e1';
        });
    },

    enableEditMode: () => {
        window.miEditMode = true;
        ReviewComponent.render();
        window.miEditMode = false; 
    },

    submitReview: async () => {
        const id = document.getElementById('rc-review-id')?.value;
        const rating = document.getElementById('rc-rating-val').value;
        const title = document.getElementById('rc-title').value;
        const comment = document.getElementById('rc-comment').value;

        if(!title || !comment) {
            return alert('لطفاً عنوان و متن نظر را وارد کنید.');
        }

        try {
            if (id) {
                await ReviewService.updateReview(id, rating, title, comment);
                alert("نظر شما با موفقیت ویرایش شد و در انتظار تایید مدیریت است.");
            } else {
                await ReviewService.submitReview(ReviewComponent.state.targetType, ReviewComponent.state.targetId, rating, title, comment);
                alert("نظر شما ثبت شد و پس از تایید مدیریت نمایش داده می‌شود.");
            }
            await ReviewComponent.render();
        } catch (error) {
            alert(error.message);
        }
    },

    deleteReview: async (id) => {
        if(confirm('آیا از حذف این نظر اطمینان دارید؟')) {
            try {
                await ReviewService.deleteReview(id);
                await ReviewComponent.render();
            } catch (error) {
                alert(error.message);
            }
        }
    }
};

window.ReviewComponent = ReviewComponent;