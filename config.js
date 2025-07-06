// config.js - Configuration file for XL/AXIS Store

// Google Apps Script Web App URL
// Replace with your actual deployed Google Apps Script URL
const CONFIG = {
  // Google Apps Script URL (replace with your actual URL)
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZp8MEoRNFJhgJ_ky75iB3rwWgyiiut72X0Vlv_F_Vr5022GZJfau9-Ceb1wX8Rh_lCw/exec',
  
  // Default WhatsApp number (will be updated from settings)
  DEFAULT_WHATSAPP: '6281234567890',
  
  // Store configuration
  STORE_CONFIG: {
    name: 'XL/AXIS Store',
    description: 'Kuota Internet XL/AXIS Termurah',
    currency: 'IDR',
    locale: 'id-ID'
  },
  
  // Category configuration with icons and descriptions
  CATEGORY_CONFIG: {
    'Official XL / AXIS': {
      icon: 'fas fa-star',
      description: 'Paket resmi dari XL/AXIS dengan garansi kualitas terbaik',
      color: '#FF6B6B'
    },
    'XL Circle': {
      icon: 'fas fa-circle',
      description: 'Paket khusus XL Circle dengan benefit eksklusif',
      color: '#4ECDC4'
    },
    'Paket Harian': {
      icon: 'fas fa-calendar-day',
      description: 'Paket kuota untuk kebutuhan harian Anda',
      color: '#45B7D1'
    },
    'Perpanjangan Masa Aktif': {
      icon: 'fas fa-clock',
      description: 'Perpanjang masa aktif kartu Anda tanpa tambahan kuota',
      color: '#F7B731'
    }
  },
  
  // API endpoints
  ENDPOINTS: {
    GET_PRODUCTS: 'getProducts',
    ADD_PRODUCT: 'addProduct',
    UPDATE_PRODUCT: 'updateProduct',
    DELETE_PRODUCT: 'deleteProduct',
    GET_SETTINGS: 'getSettings',
    UPDATE_SETTINGS: 'updateSettings',
    ADD_ORDER: 'addOrder',
    AUTHENTICATE_ADMIN: 'authenticateAdmin'
  },
  
  // Loading messages
  MESSAGES: {
    LOADING: 'Memuat data...',
    ERROR: 'Terjadi kesalahan. Silakan coba lagi.',
    SUCCESS: 'Berhasil!',
    PRODUCT_ADDED: 'Produk berhasil ditambahkan!',
    PRODUCT_UPDATED: 'Produk berhasil diperbarui!',
    PRODUCT_DELETED: 'Produk berhasil dihapus!',
    ORDER_PLACED: 'Pesanan berhasil dibuat!',
    INVALID_PASSWORD: 'Password salah!'
  }
};

// API Helper Class
class APIHelper {
  constructor() {
    this.baseURL = CONFIG.APPS_SCRIPT_URL;
  }
  
  async get(endpoint, params = {}) {
    try {
      const url = new URL(this.baseURL);
      url.searchParams.append('action', endpoint);
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('GET Error:', error);
      return { success: false, message: error.message };
    }
  }
  
  async post(endpoint, data = {}) {
    try {
      const formData = new FormData();
      formData.append('action', endpoint);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('POST Error:', error);
      return { success: false, message: error.message };
    }
  }
}

// Initialize API helper
const api = new APIHelper();

// Utility functions
const Utils = {
  // Format price to Indonesian Rupiah
  formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  },
  
  // Format date to Indonesian format
  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // Show loading spinner
  showLoading(element) {
    element.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>${CONFIG.MESSAGES.LOADING}</p>
      </div>
    `;
  },
  
  // Hide loading spinner
  hideLoading(element) {
    const loading = element.querySelector('.loading');
    if (loading) {
      loading.remove();
    }
  },
  
  // Show success message
  showSuccess(message) {
    this.showMessage(message, 'success');
  },
  
  // Show error message
  showError(message) {
    this.showMessage(message, 'error');
  },
  
  // Show message with type
  showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove();
      }
    }, 5000);
  },
  
  // Generate WhatsApp URL
  generateWhatsAppURL(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  },
  
  // Validate phone number
  validatePhone(phone) {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone);
  },
  
  // Clean phone number
  cleanPhone(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }
};

// Local Storage helper for caching
const Cache = {
  set(key, data, expiry = 300000) { // 5 minutes default
    const item = {
      data: data,
      timestamp: Date.now(),
      expiry: expiry
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, APIHelper, Utils, Cache };
}
