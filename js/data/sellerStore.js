// js/data/sellerStore.js

const STORE_KEY = 'tradecore_seller_data';

const defaultData = {
  profile: { 
    id: 'biz-1', // متصل به همون شرکت پویا نگار
    companyName: 'صنایع بسته‌بندی پویا نگار', 
    contactPerson: 'واحد فروش و بازرگانی',
    email: 'sales@pouyanegar.local',
    role: 'both'
  }
};

export const SellerStore = {
  getData: () => {
    const data = localStorage.getItem(STORE_KEY);
    if (!data) {
      localStorage.setItem(STORE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  }
};