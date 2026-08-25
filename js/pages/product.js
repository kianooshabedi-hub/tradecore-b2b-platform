// js/pages/product.js
import { renderFooter } from '../components/footer.js';
import { renderHeader } from '../components/header.js';
import { ProductService } from '../services/productService.js';
import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if(headerElement) {
      headerElement.innerHTML = renderHeader();
    }
    const footerElement = document.querySelector('footer') || document.getElementById('main-footer');
  if(footerElement) footerElement.innerHTML = renderFooter();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'pn-01'; 

    const product = await ProductService.getProductById(productId);
    if (!product) {
        document.body.innerHTML += '<h2 style="text-align:center; margin-top:50px; color: red;">محصول یافت نشد.</h2>';
        return;
    }

    const supplier = businesses.find(b => b.id === product.supplierId) || {};
    const favProducts = AppStore.getFavProducts();
    const isFavorite = favProducts.includes(product.id);

    renderProduct(product, supplier, isFavorite);
    setupEvents(product);
});

function renderProduct(product, supplier, isFavorite) {
    let specsHtml = '';
    if (product.specifications) {
        specsHtml = Object.entries(product.specifications).map(([key, value]) => `
            <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #475569;">${key}:</span>
                <span style="color: #64748b; text-align: left;" dir="ltr">${value}</span>
            </div>
        `).join('');
    }

    const content = `
        <div class="container" style="margin-top: 3rem; margin-bottom: 5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
                
                <!-- تصویر محصول -->
                <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem; display: flex; justify-content: center;">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 8px;">
                </div>

                <!-- اطلاعات محصول -->
                <div>
                    <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: #1e293b;">${product.name}</h1>
                    <div style="display: flex; gap: 10px; margin-bottom: 1.5rem;">
                        <span style="background: #eff6ff; color: #2563eb; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;">برند: ${product.brand || 'عمومی'}</span>
                        <span style="background: #f1f5f9; color: #64748b; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${product.country || 'ایران'}</span>
                    </div>
                    
                    <p style="color: #475569; line-height: 1.8; font-size: 1.05rem; margin-bottom: 2rem;">
                        ${product.shortDescription || 'توضیحات کوتاه برای این محصول ثبت نشده است.'}
                    </p>

                    <!-- باکس حرفه‌ای تأمین‌کننده -->
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <img src="${supplier.logo || 'images/default-logo.png'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #cbd5e1;">
                                <div>
                                    <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 5px;">${supplier.name}</h3>
                                    <p style="font-size: 0.85rem; color: #64748b; display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${supplier.city || 'ایران'}</p>
                                </div>
                            </div>
                            <a href="business.html?id=${supplier.id}" class="btn btn-outline" style="font-size: 0.85rem; padding: 6px 12px;">مشاهده پروفایل شرکت</a>
                        </div>
                        
                        <div id="rfq-section">
                            <textarea id="rfq-message" class="form-input" rows="3" placeholder="درخواست قیمت، پیش‌فاکتور یا سوال خود را اینجا بنویسید..." style="margin-bottom: 10px; background: #f8fafc;"></textarea>
                            <button id="btn-submit-rfq" class="btn btn-primary btn-full" style="padding: 12px; font-size: 1rem;">ارسال درخواست مستقیم (RFQ)</button>
                        </div>

                        <!-- دکمه علاقه‌مندی‌ها -->
                        <button id="btn-favorite-product" class="btn btn-outline btn-full" style="margin-top: 10px; font-weight: bold; transition: all 0.3s ease; border-color: ${isFavorite ? '#eab308' : '#cbd5e1'}; color: ${isFavorite ? '#eab308' : '#475569'}; background: ${isFavorite ? '#fefce8' : 'transparent'}; display: flex; justify-content: center; align-items: center;">
                            ${isFavorite ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> در علاقه‌مندی‌ها ذخیره شد' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> افزودن به علاقه‌مندی‌ها'}
                        </button>
                    </div>

                    <!-- جدول مشخصات فنی -->
                    <h3 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.2rem;">مشخصات فنی</h3>
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        ${specsHtml || '<p style="padding: 1rem; color: #64748b;">مشخصاتی ثبت نشده است.</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('product-container') || document.querySelector('main');
    if(container) container.innerHTML = content;
}

function setupEvents(product) {
    document.getElementById('btn-submit-rfq')?.addEventListener('click', async (e) => {
        const activeUserId = AppStore.getActiveUserId();
        if (activeUserId === product.supplierId) {
            alert('شما نمی‌توانید برای شرکت خودتان استعلام بفرستید!');
            return;
        }
        const message = document.getElementById('rfq-message').value;
        if (!message.trim()) { alert('لطفاً پیام استعلام را بنویسید.'); return; }
        
        e.target.textContent = 'در حال ارسال...';
        e.target.disabled = true;

        await BuyerService.submitRfq(product.id, product.supplierId, message);
        document.getElementById('rfq-section').innerHTML = `
            <div style="background: #ecfdf5; padding: 1rem; border-radius: 8px; border: 1px dashed #10b981; text-align: center;">
                <h4 style="color: #059669; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 6px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> درخواست با موفقیت ثبت شد!</h4>
                <a href="buyer-panel.html" style="font-size: 0.9rem; font-weight: bold; color: #047857; text-decoration: underline;">پیگیری در پنل خریدار</a>
            </div>
        `;
    });

    document.getElementById('btn-favorite-product')?.addEventListener('click', (e) => {
        const isAdded = AppStore.toggleFavProduct(product.id);
        const btn = e.target.closest('button');
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
    });
}