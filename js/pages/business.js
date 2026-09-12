// js/pages/business.js

import { renderFooter } from '../components/footer.js';
import { renderHeader } from '../components/header.js';
import { businesses } from '../data/businesses.js';
import { ProductService } from '../services/productService.js';
import { AppStore } from '../data/appStore.js';
import { MessageService } from '../services/messageService.js';
import { ArticleService } from '../services/articleService.js'; 
import { AnalyticsService } from '../services/analyticsService.js';
import { ReviewComponent } from '../components/reviewComponent.js';

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if(headerElement) {
        headerElement.innerHTML = renderHeader();
    }
    const footerElement = document.querySelector('footer') || document.getElementById('main-footer');
    if(footerElement) footerElement.innerHTML = renderFooter();
    
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('id') || 'biz-1'; 

    const business = businesses.find(b => b.id === businessId);
    if (!business) {
        document.body.innerHTML += '<h2 style="text-align:center; margin-top:50px;">شرکت یافت نشد.</h2>';
        return;
    }

    const activeUserId = AppStore.getActiveUserId();

    // 🌟 قانون جدید: جلوگیری از ثبت بازدید پروفایل توسط خود مالک 🌟
    if (activeUserId !== business.id) {
        AnalyticsService.trackBusinessView(business.id);
    }

    const companyProducts = await ProductService.getProductsBySupplierId(businessId);
    const companyArticles = await ArticleService.getCompanyArticles(businessId, true); 
    
    const favBusinesses = AppStore.getFavBusinesses();
    const isFavorite = favBusinesses.includes(business.id);

    renderBusinessProfile(business, companyProducts, isFavorite, companyArticles);
    setupBusinessEvents(business);

    const mainContainer = document.getElementById('business-container') || document.querySelector('main');
    const reviewDiv = document.createElement('div');
    reviewDiv.id = 'company-reviews-container';
    reviewDiv.className = 'container';
    reviewDiv.style.marginBottom = '5rem';
    mainContainer.appendChild(reviewDiv);
    
    await ReviewComponent.init('company-reviews-container', 'company', business.id);
});

function renderBusinessProfile(business, products, isFavorite, companyArticles) {
    const starFilled = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const starOutline = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const locIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const checkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    const content = `
        <div class="container" style="margin-top: 2rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="${business.logo || 'images/default-logo.png'}" alt="${business.name}" style="width: 100px; height: 100px; border-radius: 12px; border: 2px solid #f1f5f9; object-fit: cover;">
                    <div>
                        <h1 style="font-size: 1.8rem; color: #0f172a; margin-bottom: 5px;">${business.name}</h1>
                        <p style="color: #64748b; font-size: 1rem; margin-bottom: 10px;">${business.englishName || ''}</p>
                        <span style="display: inline-flex; align-items: center; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem;">${locIcon} ${business.city}، ${business.country}</span>
                        <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; margin-right: 5px;">صنعت: ${business.industry}</span>
                    </div>
                </div>
                
                <div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" style="display: inline-flex; align-items: center; justify-content: center; font-weight: bold; width: 240px; transition: all 0.3s ease;" onclick="startDirectChat('${business.id}', '${business.name}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> گفتگوی مستقیم
                    </button>
                    <button id="btn-favorite-business" class="btn btn-outline" style="display: inline-flex; align-items: center; justify-content: center; font-weight: bold; width: 240px; transition: all 0.3s ease; border-color: ${isFavorite ? '#eab308' : '#cbd5e1'}; color: ${isFavorite ? '#eab308' : '#475569'}; background: ${isFavorite ? '#fefce8' : 'transparent'};">
                        ${isFavorite ? starFilled + ' شرکت نشان شد' : starOutline + ' افزودن شرکت به نشان‌شده‌ها'}
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
                <div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                        <h3 style="margin-bottom: 1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">درباره شرکت</h3>
                        <p style="color: #475569; line-height: 1.8; font-size: 0.95rem;">${business.description}</p>
                    </div>
                    
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                        <h3 style="margin-bottom: 1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">گواهینامه‌ها و استانداردها</h3>
                        <ul style="list-style: none; padding: 0; color: #475569; font-size: 0.95rem;">
                            ${business.certifications ? business.certifications.map(c => `<li style="display: flex; align-items: center; margin-bottom: 8px;">${checkIcon} ${c}</li>`).join('') : '<li style="color: #94a3b8;">ثبت نشده</li>'}
                        </ul>
                    </div>

                    ${companyArticles && companyArticles.length > 0 ? `
                        <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                            <h3 style="margin-bottom: 1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">مقالات و دانش فنی (${companyArticles.length})</h3>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                              ${companyArticles.map(art => `
                                <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; transition: transform 0.3s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                  ${art.coverImage ? `<div style="height: 120px; overflow: hidden; border-bottom: 1px solid #e2e8f0;"><img src="${art.coverImage}" style="width: 100%; height: 100%; object-fit: cover;"></div>` : ''}
                                  <div style="padding: 1rem;">
                                    <h4 style="font-size: 0.95rem; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                        <a href="article-detail.html?id=${art.id}" style="color:#0f172a; text-decoration:none;">${art.title}</a>
                                    </h4>
                                    <div style="text-align: left;">
                                        <a href="article-detail.html?id=${art.id}" style="font-size: 0.8rem; color: var(--color-primary); font-weight: bold; text-decoration: none;">مطالعه مقاله ➔</a>
                                    </div>
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div>
                    <h2 style="font-size: 1.5rem; color: #0f172a; margin-bottom: 1.5rem;">محصولات این شرکت (${products.length})</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                        ${products.map(p => `
                            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 160px; object-fit: cover; border-bottom: 1px solid #e2e8f0;">
                                <div style="padding: 1rem;">
                                    <h4 style="font-size: 1rem; color: #1e293b; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h4>
                                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">${p.brand || 'بدون برند'}</p>
                                    <a href="product.html?id=${p.id}" class="btn btn-outline btn-full" style="font-size: 0.85rem; padding: 6px;">جزئیات و استعلام</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>
        </div>
    `;

    const container = document.getElementById('business-container') || document.querySelector('main');
    if(container) container.innerHTML = content;
}

window.startDirectChat = async (targetBizId, targetBizName) => {
    const activeUserId = AppStore.getActiveUserId();
    if (activeUserId === targetBizId) {
        alert('شما نمی‌توانید با شرکت خودتان چت کنید!');
        return;
    }

    const canSendMessage = AppStore.checkFeatureAccess('send_message');
    if (!canSendMessage) {
        alert('برای ارسال پیام مستقیم به شرکت‌ها، نیاز به ارتقای اشتراک دارید. لطفاً از منوی هدر اقدام کنید.');
        window.location.href = 'pricing.html';
        return;
    }

    const convs = await MessageService.getMyConversations();
    let existingConv = convs.find(c => 
        c.participants.includes(targetBizId) && 
        c.participants.includes(activeUserId) && 
        c.participants.length === 2
    );

    let convId;
    if (existingConv) {
        convId = existingConv.id;
    } else {
        const newConv = await MessageService.createConversation(
            [activeUserId, targetBizId],
            `گفتگوی مستقیم با ${targetBizName}`,
            'direct'
        );
        convId = newConv.id;
    }

    localStorage.setItem('tradecore_open_chat', convId);

    const profile = AppStore.getActiveUserProfile();
    if (profile && profile.roles.includes('buyer')) {
        window.location.href = 'buyer-panel.html';
    } else {
        window.location.href = 'seller-panel.html';
    }
};

function setupBusinessEvents(business) {
    document.getElementById('btn-favorite-business')?.addEventListener('click', (e) => {
        const activeUserId = AppStore.getActiveUserId();
        
        // 🌟 قانون جدید: جلوگیری از نشان کردن پروفایل خود 🌟
        if (activeUserId === business.id) {
            alert('شما نمی‌توانید پروفایل شرکت خودتان را نشان (Save) کنید!');
            return;
        }

        const isAdded = AppStore.toggleFavBusiness(business.id);
        const btn = e.target.closest('button');
        
        if (isAdded) {
            AnalyticsService.trackInteraction('Business Saved', 'Business', business.id);
        }

        const starFilled = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        const starOutline = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

        if (isAdded) {
            btn.innerHTML = starFilled + ' شرکت نشان شد';
            btn.style.borderColor = '#eab308'; 
            btn.style.color = '#eab308';
            btn.style.background = '#fefce8';
        } else {
            btn.innerHTML = starOutline + ' افزودن شرکت به نشان‌شده‌ها';
            btn.style.borderColor = '#cbd5e1'; 
            btn.style.color = '#475569';
            btn.style.background = 'transparent';
        }
    });
}