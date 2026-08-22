// js/services/categoryService.js
// این لایه وظیفه مدیریت تمام درخواست‌های مربوط به دسته‌بندی‌ها را دارد

import { categories } from '../data/categories.js';

export const CategoryService = {
  /**
   * دریافت تمام دسته‌بندی‌های فعال
   * @returns {Promise<Array>} لیست دسته‌بندی‌ها
   */
  getAllCategories: async () => {
    try {
      // شبیه‌سازی تاخیر شبکه (Network Latency) برای اینکه حس واقعی بودن بده
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // فقط دسته‌بندی‌های فعال (active) رو برمی‌گردونیم
      return categories.filter(category => category.status === 'active');
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
      return [];
    }
  },

  /**
   * دریافت اطلاعات یک دسته‌بندی خاص بر اساس ID
   * @param {string} categoryId 
   * @returns {Promise<Object|null>}
   */
  getCategoryById: async (categoryId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return categories.find(cat => cat.id === categoryId) || null;
  }
};