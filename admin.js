// admin.js - Admin Panel JavaScript

class AdminPanel {
  constructor() {
    this.isAuthenticated = false;
    this.currentProducts = {};
    this.currentSettings = {};
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }
  
  setupEventListeners() {
    // Modal controls
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });
    
    // Admin login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
    }
    
    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
    }
  }
  
  async loadInitialData() {
    try {
      // Load products
      await this.loadProducts();
      
      // Load settings
      await this.loadSettings();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Utils.showError('Gagal memuat data awal');
    }
  }
  
  async loadProducts() {
    try {
      const response = await api.get(CONFIG.ENDPOINTS.GET_PRODUCTS);
      
      if (response.success) {
        this.currentProducts = response.data;
        this.updateProductsDisplay();
      } else {
        Utils.showError(response.message || 'Gagal memuat produk');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Utils.showError('Gagal memuat produk');
    }
  }
  
  async loadSettings() {
    try {
      const response = await api.get(CONFIG.ENDPOINTS.GET_SETTINGS);
      
      if (response.success) {
        this.currentSettings = response.data;
        this.updateSettingsDisplay();
      } else {
        Utils.showError(response.message || 'Gagal memuat pengaturan');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Utils.showError('Gagal memuat pengaturan');
    }
  }
  
  updateProductsDisplay() {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    
    // Create category cards
    Object.entries(CONFIG.CATEGORY_CONFIG).forEach(([categoryName, categoryConfig]) => {
      const products = this.currentProducts[categoryName] || [];
      
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      
      const productsHtml = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${Utils.formatPrice(product.price)}</div>
          <div class="product-description">${product.description}</div>
          <div class="product-actions">
            <button class="btn-edit" onclick="adminPanel.editProduct('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" onclick="adminPanel.deleteProduct('${product.id}')">
              <i class="fas fa-trash"></i>
            </button>
            <button class="buy-btn" onclick="adminPanel.buyProduct('${product.name}', ${product.price})">
              <i class="fas fa-shopping-cart"></i> Beli
            </button>
          </div>
        </div>
      `).join('');
      
      categoryCard.innerHTML = `
        <div class="category-icon" style="background: ${categoryConfig.color}">
          <i class="${categoryConfig.icon}"></i>
        </div>
        <div class="category-title">${categoryName}</div>
        <div class="category-desc">${categoryConfig.description}</div>
        <div class="category-actions">
          <button class="btn-add" onclick="adminPanel.showAddProductModal('${categoryName}')">
            <i class="fas fa-plus"></i> Tambah Produk
          </button>
        </div>
        <div class="product-grid">
          ${productsHtml}
        </div>
      `;
      
      categoryGrid.appendChild(categoryCard);
    });
  }
  
  updateSettingsDisplay() {
    // Update settings form if exists
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      Object.entries(this.currentSettings).forEach(([key, value]) => {
        const input = settingsForm.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = value;
        }
      });
    }
  }
  
  openAdminPanel() {
    if (!this.isAuthenticated) {
      this.showLoginModal();
    } else {
      this.showAdminModal();
    }
  }
  
  showLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (!modal) {
      this.createLoginModal();
    }
    document.getElementById('adminLoginModal').style.display = 'block';
  }
  
  createLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Login Admin</h2>
          <span class="close" onclick="adminPanel.closeModal(document.getElementById('adminLoginModal'))">&times;</span>
        </div>
        <form id="adminLoginForm">
          <div class="form-group">
            <label for="adminPassword">Password:</label>
            <input type="password" id="adminPassword" name="password" required>
          </div>
          <button type="submit" class="btn-primary">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup form listener
    const form = modal.querySelector('#adminLoginForm');
    form.addEventListener('submit', (e) => this.handleLogin(e));
  }
  
  async handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    
    try {
      const response = await api.post(CONFIG.ENDPOINTS.AUTHENTICATE_ADMIN, { password });
      
      if (response.success) {
        this.isAuthenticated = true;
        this.closeModal(document.getElementById('adminLoginModal'));
        this.showAdminModal();
        Utils.showSuccess('Login berhasil!');
      } else {
        Utils.showError(response.message || CONFIG.MESSAGES.INVALID_PASSWORD);
      }
    } catch (error) {
      console.error('Login error:', error);
      Utils.showError('Gagal login');
    }
  }
  
  showAdminModal() {
    const modal = document.getElementById('adminModal');
    if (!modal) {
      this.createAdminModal();
    }
    document.getElementById('adminModal').style.display = 'block';
  }
  
  createAdminModal() {
    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content admin-modal-content">
        <div class="modal-header">
          <h2>Admin Panel</h2>
          <span class="close" onclick="adminPanel.closeModal(document.getElementById('adminModal'))">&times;</span>
        </div>
        
        <div class="admin-tabs">
          <button class="tab-button active" onclick="adminPanel.showTab('products')">
            <i class="fas fa-box"></i> Produk
          </button>
          <button class="tab-button" onclick="adminPanel.showTab('orders')">
            <i class="fas fa-shopping-cart"></i> Pesanan
          </button>
          <button class="tab-button" onclick="adminPanel.showTab('settings')">
            <i class="fas fa-cog"></i> Pengaturan
          </button>
        </div>
        
        <div class="admin-content">
          <div id="products-tab" class="tab-content active">
            <h3>Kelola Produk</h3>
            <div id="adminProductGrid"></div>
          </div>
          
          <div id="orders-tab" class="tab-content">
            <h3>Kelola Pesanan</h3>
            <div id="adminOrderList"></div>
          </div>
          
          <div id="settings-tab" class="tab-content">
            <h3>Pengaturan</h3>
            <form id="settingsForm">
              <div class="form-group">
                <label for="storeName">Nama Toko:</label>
                <input type="text" id="storeName" name="Store Name" required>
              </div>
              <div class="form-group">
                <label for="whatsappNumber">Nomor WhatsApp:</label>
                <input type="text" id="whatsappNumber" name="WhatsApp Number" required>
              </div>
              <div class="form-group">
                <label for="contactEmail">Email Kontak:</label>
                <input type="email" id="contactEmail" name="Contact Email" required>
              </div>
              <div class="form-group">
                <label for="adminPassword">Password Admin:</label>
                <input type="password" id="adminPassword" name="Admin Password" required>
              </div>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i> Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup form listeners
    const settingsForm = modal.querySelector('#settingsForm');
    settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
    
    // Load initial data
    this.updateAdminProductGrid();
    this.updateSettingsDisplay();
  }
  
  showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load tab-specific data
    if (tabName === 'products') {
      this.updateAdminProductGrid();
    } else if (tabName === 'orders') {
      this.loadOrders();
    }
  }
  
  updateAdminProductGrid() {
    const grid = document.getElementById('adminProductGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Object.entries(CONFIG.CATEGORY_CONFIG).forEach(([categoryName, categoryConfig]) => {
      const products = this.currentProducts[categoryName] || [];
      
      const categorySection = document.createElement('div');
      categorySection.className = 'admin-category-section';
      categorySection.innerHTML = `
        <div class="admin-category-header">
          <h4><i class="${categoryConfig.icon}"></i> ${categoryName}</h4>
          <button class="btn-add" onclick="adminPanel.showAddProductModal('${categoryName}')">
            <i class="fas fa-plus"></i> Tambah Produk
          </button>
        </div>
        <div class="admin-product-list" id="products-${categoryName.replace(/\s+/g, '-')}">
          ${products.map(product => `
            <div class="admin-product-item" data-product-id="${product.id}">
              <div class="product-info">
                <strong>${product.name}</strong>
                <span class="price">${Utils.formatPrice(product.price)}</span>
                <p class="description">${product.description}</p>
                <small class="created-date">Dibuat: ${Utils.formatDate(product.createdDate)}</small>
              </div>
              <div class="product-actions">
                <button class="btn-edit" onclick="adminPanel.editProduct('${product.id}')">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="adminPanel.deleteProduct('${product.id}')">
                  <i class="fas fa-trash"></i> Hapus
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      grid.appendChild(categorySection);
    });
  }
  
  showAddProductModal(category = '') {
    this.showProductModal('add', null, category);
  }
  
  editProduct(productId) {
    // Find product in categories
    let product = null;
    let productCategory = '';
    
    Object.entries(this.currentProducts).forEach(([category, products]) => {
      const found = products.find(p => p.id === productId);
      if (found) {
        product = found;
        productCategory = category;
      }
    });
    
    if (product) {
      this.showProductModal('edit', product, productCategory);
    }
  }
  
  showProductModal(mode, product = null, category = '') {
    const modal = document.getElementById('productModal');
    if (!modal) {
      this.createProductModal();
    }
    
    const form = document.getElementById('productForm');
    const title = document.querySelector('#productModal .modal-header h2');
    
    if (mode === 'edit' && product) {
      title.textContent = 'Edit Produk';
      form.category.value = category;
      form.productName.value = product.name;
      form.price.value = product.price;
      form.description.value = product.description;
      form.dataset.productId = product.id;
      form.dataset.mode = 'edit';
    } else {
      title.textContent = 'Tambah Produk';
      form.reset();
      form.category.value = category;
      form.dataset.productId = '';
      form.dataset.mode = 'add';
    }
    
    document.getElementById('productModal').style.display = 'block';
  }
  
  createProductModal() {
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Tambah Produk</h2>
          <span class="close" onclick="adminPanel.closeModal(document.getElementById('productModal'))">&times;</span>
        </div>
        
        <form id="productForm">
          <div class="form-group">
            <label for="category">Kategori:</label>
            <select id="category" name="category" required>
              <option value="">Pilih Kategori</option>
              ${Object.keys(CONFIG.CATEGORY_CONFIG).map(cat => `
                <option value="${cat}">${cat}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="productName">Nama Produk:</label>
            <input type="text" id="productName" name="productName" required>
          </div>
          
          <div class="form-group">
            <label for="price">Harga:</label>
            <input type="number" id="price" name="price" required min="0">
          </div>
          
          <div class="form-group">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Simpan
            </button>
            <button type="button" class="btn-secondary" onclick="adminPanel.closeModal(document.getElementById('productModal'))">
              <i class="fas fa-times"></i> Batal
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup form listener
    const form = modal.querySelector('#productForm');
    form.addEventListener('submit', (e) => this.handleProductSubmit(e));
  }
  
  async handleProductSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const mode = form.dataset.mode;
    const productId = form.dataset.productId;
    
    const productData = {
      category: formData.get('category'),
      name: formData.get('productName'),
      price: parseInt(formData.get('price')),
      description: formData.get('description')
    };
    
    if (mode === 'edit') {
      productData.id = productId;
    }
    
    try {
      const endpoint = mode === 'edit' ? CONFIG.ENDPOINTS.UPDATE_PRODUCT : CONFIG.ENDPOINTS.ADD_PRODUCT;
      const response = await api.post(endpoint, productData);
      
      if (response.success) {
        Utils.showSuccess(mode === 'edit' ? CONFIG.MESSAGES.PRODUCT_UPDATED : CONFIG.MESSAGES.PRODUCT_ADDED);
        this.closeModal(document.getElementById('productModal'));
        await this.loadProducts();
      } else {
        Utils.showError(response.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Product submit error:', error);
      Utils.showError('Gagal menyimpan produk');
    }
  }
  
  async deleteProduct(productId) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }
    
    try {
      const response = await api.post(CONFIG.ENDPOINTS.DELETE_PRODUCT, { id: productId });
      
      if (response.success) {
        Utils.showSuccess(CONFIG.MESSAGES.PRODUCT_DELETED);
        await this.loadProducts();
      } else {
        Utils.showError(response.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      Utils.showError('Gagal menghapus produk');
    }
  }
  
  async handleSettingsSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updates = [];
    
    for (let [key, value] of formData.entries()) {
      updates.push({ setting: key, value: value });
    }
    
    try {
      for (const update of updates) {
        const response = await api.post(CONFIG.ENDPOINTS.UPDATE_SETTINGS, update);
        if (!response.success) {
          throw new Error(`Gagal update ${update.setting}: ${response.message}`);
        }
      }
      
      Utils.showSuccess('Pengaturan berhasil disimpan!');
      await this.loadSettings();
      
    } catch (error) {
      console.error('Settings update error:', error);
      Utils.showError(error.message || 'Gagal menyimpan pengaturan');
    }
  }
  
  async loadOrders() {
    // This would load orders from the spreadsheet
    const orderList = document.getElementById('adminOrderList');
    if (!orderList) return;
    
    orderList.innerHTML = `
      <div class="orders-placeholder">
        <i class="fas fa-shopping-cart fa-3x"></i>
        <p>Fitur kelola pesanan akan segera hadir!</p>
        <p>Saat ini pesanan dapat dilihat langsung di WhatsApp.</p>
      </div>
    `;
  }
  
  buyProduct(productName, price) {
    const whatsappNumber = this.currentSettings['WhatsApp Number'] || CONFIG.DEFAULT_WHATSAPP;
    const message = `Halo, saya ingin membeli ${productName} dengan harga ${Utils.formatPrice(price)}`;
    const whatsappUrl = Utils.generateWhatsAppURL(whatsappNumber, message);
    window.open(whatsappUrl, '_blank');
  }
  
  closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      
      // Reset forms
      const forms = modal.querySelectorAll('form');
      forms.forEach(form => form.reset());
    }
  }
  
  logout() {
    this.isAuthenticated = false;
    this.closeModal(document.getElementById('adminModal'));
    Utils.showSuccess('Logout berhasil!');
  }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Global functions for HTML onclick events
window.openAdminPanel = () => adminPanel.openAdminPanel();
window.closeAdminPanel = () => adminPanel.closeModal(document.getElementById('adminModal'));

// Add CSS for admin panel
const adminStyles = `
<style>
.admin-modal-content {
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

.admin-tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 2rem;
}

.tab-button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  color: #333;
  background: #f8f9fa;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.admin-category-section {
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.admin-category-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.admin-category-header h4 {
  margin: 0;
  color: #333;
}

.admin-product-list {
  padding: 1rem;
}

.admin-product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s ease;
}

.admin-product-item:hover {
  background: #f8f9fa;
}

.admin-product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-info strong {
  display: block;
  color: #333;
  margin-bottom: 0.25rem;
}

.product-info .price {
  color: #667eea;
  font-weight: bold;
  font-size: 1.1rem;
}

.product-info .description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.product-info .created-date {
  color: #999;
  font-size: 0.8rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete, .btn-add {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-edit:hover {
  background: #218838;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-add {
  background: #667eea;
  color: white;
}

.btn-add:hover {
  background: #5a6fd8;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.orders-placeholder {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.orders-placeholder i {
  color: #ccc;
  margin-bottom: 1rem;
}

.message {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .product-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .admin-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    border-radius: 0;
  }
  
  .tab-button.active {
    border-bottom-color: #e9ecef;
    background: #667eea;
    color: white;
  }
}
</style>
`;

// Inject admin styles
document.head.insertAdjacentHTML('beforeend', adminStyles);
