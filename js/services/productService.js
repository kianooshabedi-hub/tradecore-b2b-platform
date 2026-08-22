// js/services/productService.js

import { BusinessService } from './businessService.js';
import { products } from '../data/products.js';
import { CategoryService } from './categoryService.js';

// ۱. تابع دریافت محصولات پیشنهادی
async function getFeaturedProducts(limit = 8) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activeProducts = products.filter(p => p.status === 'active').slice(0, limit);
    
    const populatedProducts = await Promise.all(activeProducts.map(async (product) => {
      const categoryData = await CategoryService.getCategoryById(product.categoryId);
      const businessData = await BusinessService.getBusinessById(product.supplierId);
      
      return {
        ...product,
        categoryName: categoryData ? categoryData.name : 'دسته‌بندی نامشخص',
        supplierName: businessData ? businessData.name : 'تامین‌کننده نامشخص',
        supplierStatus: businessData ? businessData.status : 'standard'
      };
    }));
    return populatedProducts;
  } catch (error) {
    console.error("خطا در getFeaturedProducts:", error);
    return [];
  }
}

// ۲. تابع جستجوی محصولات
async function searchProducts(query) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!query || query.trim() === '') {
      return await getFeaturedProducts(); 
    }

    const lowerQuery = query.toLowerCase().trim();
    const activeProducts = products.filter(p => p.status === 'active');
    
    const matchedProducts = activeProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.shortDescription.toLowerCase().includes(lowerQuery)
    );

    const populatedProducts = await Promise.all(matchedProducts.map(async (product) => {
      const categoryData = await CategoryService.getCategoryById(product.categoryId);
      const businessData = await BusinessService.getBusinessById(product.supplierId);
      
      return {
        ...product,
        categoryName: categoryData ? categoryData.name : 'دسته‌بندی نامشخص',
        supplierName: businessData ? businessData.name : 'تامین‌کننده نامشخص',
        supplierStatus: businessData ? businessData.status : 'standard'
      };
    }));
    return populatedProducts;
  } catch (error) {
    console.error("خطا در searchProducts:", error);
    return [];
  }
}

// ۳. تابع دریافت یک محصول خاص با ID
async function getProductById(id) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    
    const product = products.find(p => p.id === id);
    if (!product) return null;

    const categoryData = await CategoryService.getCategoryById(product.categoryId);
    const businessData = await BusinessService.getBusinessById(product.supplierId);

    return {
      ...product,
      categoryName: categoryData ? categoryData.name : 'نامشخص',
      supplier: businessData || null
    };
  } catch (error) {
    console.error("خطا در دریافت اطلاعات محصول:", error);
    return null;
  }
}

// ۴. تابع دریافت محصولات یک شرکت خاص
async function getProductsBySupplierId(supplierId) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    
    const supplierProducts = products.filter(p => p.supplierId === supplierId && p.status === 'active');
    
    const populatedProducts = await Promise.all(supplierProducts.map(async (product) => {
      const categoryData = await CategoryService.getCategoryById(product.categoryId);
      return {
        ...product,
        categoryName: categoryData ? categoryData.name : 'دسته‌بندی نامشخص'
      };
    }));

    return populatedProducts;
  } catch (error) {
    console.error("خطا در دریافت محصولات شرکت:", error);
    return [];
  }
}

// فقط یک‌بار و در انتهای فایل، تمام توابع را با هم Export می‌کنیم:
export const ProductService = {
  getFeaturedProducts,
  searchProducts,
  getProductById,
  getProductsBySupplierId
};