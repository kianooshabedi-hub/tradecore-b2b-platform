// js/data/buyerStore.js

const STORE_KEY = 'tradecore_buyer_data';

const defaultData = {
  profile: { 
    id: 'biz-1', // آیدی واقعی شرکت پویا نگار
    name: 'مهندس رضایی (مدیریت تامین)', 
    company: 'صنایع بسته‌بندی پویا نگار', 
    email: 'supply@pouyanegar.local',
    role: 'both' // نقش دوگانه (خریدار و فروشنده)
  },
  savedProducts: ['api-07', 'ev-12'], // ذخیره محصولات API و Evrin
  savedBusinesses: ['biz-3', 'biz-2'],
  rfqs: [
    { 
      id: 'rfq-2001', 
      productId: 'api-07', // درخواست خرید روغن هیدرولیک Tellus S4ME از شرکت API
      date: new Date().toISOString().split('T')[0], 
      status: 'pending', 
      message: 'با سلام، برای خطوط پرس قوطی‌سازی مجموعه پویا نگار، نیاز به 5 بشکه روغن هیدرولیک Tellus S4ME داریم. لطفا قیمت و شرایط ارسال به اصفهان را اعلام فرمایید.' 
    }
  ]
};

export const BuyerStore = {
  getData: () => {
    const data = localStorage.getItem(STORE_KEY);
    if (!data) {
      localStorage.setItem(STORE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  },
  
  saveData: (data) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  },
  
  addRfq: (rfq) => {
    const data = BuyerStore.getData();
    data.rfqs.unshift(rfq);
    BuyerStore.saveData(data);
  }
};