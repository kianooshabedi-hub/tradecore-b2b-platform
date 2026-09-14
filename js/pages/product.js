// js/pages/product.js

import { renderFooter } from '../components/footer.js';
import { renderHeader } from '../components/header.js';
import { ProductService } from '../services/productService.js';
import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';
import { MessageService } from '../services/messageService.js'; 
import { AnalyticsService } from '../services/analyticsService.js';
import { ReviewComponent } from '../components/reviewComponent.js';

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if(headerElement) headerElement.innerHTML = renderHeader();
    
    const footerElement = document.querySelector('footer') || document.getElementById('main-footer');
    if(footerElement) footerElement.innerHTML = renderFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'pn-01'; 

    currentProduct = await ProductService.getProductById(productId);
    if (!currentProduct) {
        document.body.innerHTML += '<h2 style="text-align:center; margin-top:50px; color: red;">محصول یافت نشد.</h2>';
        return;
    }

    const activeUserId = AppStore.getActiveUserId();

    // 🌟 قانون جدید: جلوگیری از ثبت بازدید (View) برای خود فروشنده (Owner) 🌟
    if (currentProduct.supplierId !== activeUserId) {
        AnalyticsService.trackProductView(currentProduct.id, currentProduct.categoryId);
    }

    const supplier = businesses.find(b => b.id === currentProduct.supplierId) || {};
    const favProducts = AppStore.getFavProducts();
    const isFavorite = favProducts.includes(currentProduct.id);

    renderProduct(currentProduct, supplier, isFavorite);

    const mainContainer = document.getElementById('product-detail-container') || document.querySelector('main');
    const reviewDiv = document.createElement('div');
    reviewDiv.id = 'product-reviews-container';
    reviewDiv.className = 'container';
    reviewDiv.style.marginBottom = '5rem';
    mainContainer.appendChild(reviewDiv);
    
    await ReviewComponent.init('product-reviews-container', 'product', currentProduct.id);
});

// 🌟 تابع اختصاصی برای دکمه مقایسه با محدودیت ۵ تایی
window.toggleSingleProdCompare = (btn) => {
    if (!currentProduct) return;
    
    const currentList = AppStore.getFavProducts();
    const isCurrentlyAdded = currentList.includes(currentProduct.id);

    // کنترل محدودیت 5 تایی
    if (!isCurrentlyAdded && currentList.length >= 5) {
        alert('حداکثر ۵ محصول برای مقایسه همزمان قابل انتخاب است. جهت مقایسه محصول جدید، ابتدا یکی از محصولات لیست را حذف کنید.');
        return;
    }

    AppStore.toggleFavProduct(currentProduct.id);
    const isAdded = AppStore.getFavProducts().includes(currentProduct.id);
    
    if (isAdded) {
        btn.style.background = '#1e293b';
        btn.style.color = '#fff';
        btn.style.borderColor = '#1e293b';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-left:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> حذف از مقایسه';
    } else {
        btn.style.background = 'transparent';
        btn.style.color = '#475569';
        btn.style.borderColor = '#cbd5e1';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-left:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> افزودن به مقایسه';
    }
};

function renderProduct(product, supplier, isFavorite) {
    let specsHtml = '';
    // بررسی اگر از سیستم جدید استفاده شده باشد
    if (product.technicalAttributes && product.technicalAttributes.length > 0) {
        specsHtml = product.technicalAttributes.map(attr => `
            <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #475569;">${attr.attributeName}:</span>
                <span style="color: #64748b; text-align: left;" dir="ltr">${attr.value} ${attr.unitName || ''}</span>
            </div>
        `).join('');
    } 
    // بک‌آپ برای ساختار قدیمی
    else if (product.specifications) {
        specsHtml = Object.entries(product.specifications).map(([key, value]) => `
            <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #475569;">${key}:</span>
                <span style="color: #64748b; text-align: left;" dir="ltr">${value}</span>
            </div>
        `).join('');
    }

    const compareList = AppStore.getFavProducts();
    const isCompared = compareList.includes(product.id);

    const content = `
        <div class="container" style="margin-top: 3rem; margin-bottom: 3rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
                
                <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem; display: flex; justify-content: center;">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 8px;">
                </div>

                <div>
                    <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: #1e293b;">${product.name}</h1>
                    <div style="display: flex; gap: 10px; margin-bottom: 1.5rem;">
                        <span style="background: #eff6ff; color: #2563eb; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;">برند: ${product.brand || 'عمومی'}</span>
                        <span style="background: #f1f5f9; color: #64748b; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${product.country || 'ایران'}</span>
                    </div>
                    
                    <p style="color: #475569; line-height: 1.8; font-size: 1.05rem; margin-bottom: 2rem;">
                        ${product.shortDescription || 'توضیحات کوتاه برای این محصول ثبت نشده است.'}
                    </p>

                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <img src="${supplier.logo || 'images/default-logo.png'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #cbd5e1;">
                                <div>
                                    <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 5px;">${supplier.name}</h3>
                                    <p style="font-size: 0.85rem; color: #64748b; display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${supplier.city || 'ایران'}</p>
                                </div>
                            </div>
                            <a href="business.html?id=${supplier.id}" class="btn btn-outline" style="font-size: 0.85rem; padding: 6px 12px;">پروفایل شرکت</a>
                        </div>
                        
                        <div id="rfq-section" style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <button id="btn-open-rfq-modal" class="btn btn-primary" style="flex: 2; padding: 12px; font-size: 1rem;" onclick="openMultiRfqModal()">درخواست خرید (RFQ) و استعلام</button>
                            <button class="btn btn-outline" style="flex: 1; padding: 12px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--color-primary); border-color: var(--color-primary);" onclick="startDirectChat('${supplier.id}', '${supplier.name}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> چت مستقیم
                            </button>
                        </div>

                        <!-- 🌟 دکمه مقایسه و علاقه‌مندی‌ها دقیقاً در کنار هم 🌟 -->
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button id="btn-favorite-product" class="btn btn-outline" style="flex: 1; font-weight: bold; transition: all 0.3s ease; border-color: ${isFavorite ? '#eab308' : '#cbd5e1'}; color: ${isFavorite ? '#eab308' : '#475569'}; background: ${isFavorite ? '#fefce8' : 'transparent'}; display: flex; justify-content: center; align-items: center; padding: 10px;" onclick="toggleFavoriteProduct(this)">
                                ${isFavorite ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> در علاقه‌مندی‌ها' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> افزودن به علاقه‌مندی‌ها'}
                            </button>

                            <button onclick="window.toggleSingleProdCompare(this)" class="btn btn-outline" style="flex: 1; font-weight: bold; transition: all 0.3s ease; border-color: ${isCompared ? '#1e293b' : '#cbd5e1'}; color: ${isCompared ? '#fff' : '#475569'}; background: ${isCompared ? '#1e293b' : 'transparent'}; display: flex; justify-content: center; align-items: center; padding: 10px;">
                                ${isCompared ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-left:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> حذف از مقایسه' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-left:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> افزودن به مقایسه'}
                            </button>
                        </div>
                    </div>

                    <h3 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.2rem;">مشخصات فنی</h3>
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        ${specsHtml || '<p style="padding: 1rem; color: #64748b;">مشخصاتی ثبت نشده است.</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('product-detail-container') || document.querySelector('main');
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

window.toggleFavoriteProduct = (btn) => {
    if (!currentProduct) return;
    const activeUserId = AppStore.getActiveUserId();
    
    if (activeUserId === currentProduct.supplierId) {
        alert('شما نمی‌توانید محصول شرکت خودتان را نشان (Save) کنید!');
        return;
    }

    const isAdded = AppStore.toggleFavProduct(currentProduct.id);
    
    if (isAdded) {
        AnalyticsService.trackInteraction('Product Saved', 'Product', currentProduct.id, currentProduct.categoryId);
    }

    if (isAdded) {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> در علاقه‌مندی‌ها ذخیره شد';
        btn.style.borderColor = '#eab308'; 
        btn.style.color = '#eab308';
        btn.style.background = '#fefce8';
    } else {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> افزودن به علاقه‌مندی‌ها';
        btn.style.borderColor = '#cbd5e1'; 
        btn.style.color = '#475569';
        btn.style.background = 'transparent';
    }
};

window.openMultiRfqModal = () => {
    if (!currentProduct) return;
    
    const activeUserId = AppStore.getActiveUserId();
    if (activeUserId === currentProduct.supplierId) {
        alert('شما نمی‌توانید برای شرکت خودتان استعلام بفرستید!');
        return;
    }

    AnalyticsService.trackInteraction('RFQ Started', 'Product', currentProduct.id, currentProduct.categoryId);

    const shortlist = AppStore.getSupplierShortlist();
    const currentSupplier = businesses.find(b => b.id === currentProduct.supplierId);
    
    let shortlistHtml = '';
    if (shortlist.length > 0) {
        shortlistHtml = shortlist.map(id => {
            if(id === currentSupplier.id) return ''; 
            const biz = businesses.find(b => b.id === id);
            if(!biz) return '';
            return `
                <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" class="rfq-supplier-cb" value="${biz.id}">
                    <div style="font-weight: 600; font-size: 0.9rem;">${biz.name} <span style="font-weight: normal; color: #64748b; font-size: 0.8rem;">(از لیست کوتاه شما)</span></div>
                </label>
            `;
        }).join('');
    }

    const modalHtml = `
      <div id="multi-rfq-modal" class="modal-overlay" style="align-items: flex-start; padding-top: 5vh; overflow-y: auto;">
        <div class="modal-content" style="max-width: 600px; width: 100%;">
          <div class="modal-header">
            <h3>ثبت درخواست خرید (RFQ)</h3>
            <button class="btn-close" onclick="document.getElementById('multi-rfq-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--color-border); display: flex; gap: 15px; align-items: center;">
                <img src="${currentProduct.image}" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;">
                <div>
                    <strong style="display:block; color: var(--color-text-main); font-size: 1.1rem;">${currentProduct.name}</strong>
                    <span style="font-size: 0.85rem; color: var(--color-text-muted);">کد: ${currentProduct.id.toUpperCase()}</span>
                </div>
            </div>
            
            <label style="font-weight: 600; display:block; margin-bottom:5px;">گیرندگان استعلام (تأمین‌کنندگان)</label>
            <div style="margin-bottom: 1.5rem;">
                <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" class="rfq-supplier-cb" value="${currentSupplier.id}" checked disabled>
                    <div style="font-weight: 600; color: #1e40af; font-size: 0.9rem;">${currentSupplier.name} <span style="font-weight: normal; font-size: 0.8rem;">(فروشنده اصلی)</span></div>
                </label>
                ${shortlistHtml ? `<p style="font-size: 0.85rem; color: #64748b; margin: 10px 0 5px;">همچنین ارسال به شرکت‌های لیست کوتاه:</p>` + shortlistHtml : ''}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 1.5rem;">
                <div>
                    <label style="font-weight: 600; display:block; margin-bottom:5px;">مقدار / تعداد مجاز *</label>
                    <input type="text" id="rfq-quantity" class="form-input" placeholder="مثلا: 100 عدد یا 5 تن" required>
                </div>
                <div>
                    <label style="font-weight: 600; display:block; margin-bottom:5px;">قیمت هدف (اختیاری)</label>
                    <input type="text" class="form-input" placeholder="مثلا: 2,500,000 تومان">
                </div>
            </div>

            <label style="font-weight: 600; display:block; margin-bottom:5px;">پیام و شرایط تحویل *</label>
            <textarea id="rfq-message" class="form-input" rows="4" placeholder="جزئیات درخواست، محل تحویل و زمان‌بندی را اینجا بنویسید..."></textarea>
            
            <button class="btn btn-primary btn-full" style="margin-top: 1.5rem;" onclick="submitMultiRfqFunc(event)">ارسال همزمان استعلام</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitMultiRfqFunc = async (event) => {
    const qty = document.getElementById('rfq-quantity').value;
    const msg = document.getElementById('rfq-message').value;
    
    if (!qty.trim() || !msg.trim()) { 
        alert('لطفاً مقدار درخواستی و متن پیام را کامل کنید.'); 
        return; 
    }

    AnalyticsService.trackInteraction('RFQ Submitted', 'Product', currentProduct.id, currentProduct.categoryId, { quantity: qty });

    const supplierCheckboxes = document.querySelectorAll('.rfq-supplier-cb');
    const selectedSupplierIds = [];
    supplierCheckboxes.forEach(cb => {
        if(cb.checked || cb.disabled) selectedSupplierIds.push(cb.value);
    });

    event.target.textContent = 'در حال ارسال گروهی...';
    event.target.disabled = true;

    await BuyerService.submitRfq(currentProduct.id, selectedSupplierIds, msg, qty);
    
    document.getElementById('multi-rfq-modal').remove();
    
    const rfqSection = document.getElementById('rfq-section');
    rfqSection.innerHTML = `
        <div style="background: #ecfdf5; padding: 1.5rem; border-radius: 8px; border: 1px dashed #10b981; text-align: center;">
            <h4 style="color: #059669; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 
                درخواست شما با موفقیت برای ${selectedSupplierIds.length} شرکت ارسال شد!
            </h4>
            <p style="color: #047857; font-size: 0.9rem; margin-bottom: 1rem;">منتظر دریافت پیش‌فاکتور و پاسخ تأمین‌کنندگان باشید.</p>
            <a href="buyer-panel.html" class="btn btn-outline" style="font-size: 0.9rem; font-weight: bold; border-color: #10b981; color: #047857;">پیگیری در پنل خریدار</a>
        </div>
    `;
};