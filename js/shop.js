class DataService {
  async getData() {
    const response = await fetch('data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load data.json');
    return response.json();
  }
}

class ThemeManager {
  constructor() {
    this.key = 'hds-theme';
    this.root = document.documentElement;
  }

  init() {
    this.set(localStorage.getItem(this.key) || 'light');
  }

  set(theme) {
    this.root.dataset.theme = theme;
    localStorage.setItem(this.key, theme);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  }

  toggle() {
    this.set(this.root.dataset.theme === 'dark' ? 'light' : 'dark');
  }
}

class ShopPage {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.dataService = new DataService();
    this.theme = new ThemeManager();
    this.storageKey = 'hds-shop-cart';
    this.currencyKey = 'hds-shop-currency';
    this.currency = 'MYR';
    this.cart = [];
  }

  async init() {
    try {
      this.data = await this.dataService.getData();
      this.currency = localStorage.getItem(this.currencyKey) || this.data.shop.defaultCurrency || 'MYR';
      this.cart = this.loadCart().filter(item => this.getProduct(item.id));
      this.saveCart();
      this.render();
      this.theme.init();
      this.bindEvents();
      this.updateShop();
      window.HDSI18n?.init();
    } catch (error) {
      this.root.innerHTML = `<main class="container"><h1>Unable to load shop</h1><p>${error.message}</p></main>`;
    }
  }

  headerHtml() {
    const { business, clientWebDesign } = this.data;
    const currencySymbols = { MYR: 'RM', USD: '$', SGD: 'S$', AUD: 'A$', EUR: '€', GBP: '£' };
    const currencyOptions = this.data.shop.currencies
      .map(c => `<option value="${c}" ${c === this.currency ? 'selected' : ''}>${currencySymbols[c] || c}</option>`)
      .join('');
    const clientLinks = clientWebDesign.projects
      .map(project => `<a href="${project.liveUrl || project.localPage || `client-web-design.html?id=${project.id}`}">${project.name}</a>`)
      .join('');

    return `<header class="header"><div class="container nav">
      <a href="index.html#home" class="logo" aria-label="${business.name} home"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${business.name}</strong><small>${business.tagline}</small></span></a>
      <nav class="nav-links" data-nav-links>
        <a href="index.html#home">Home</a>
        <div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Services ▾</button><div class="dropdown-menu"><a href="index.html#services">Service Categories</a><a href="shop.html">Packages</a><a href="index.html#growth-engine">Growth Engine</a></div></div>
        <a href="index.html#services">Solutions</a>
        <div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Client Work ▾</button><div class="dropdown-menu">${clientLinks}</div></div>
        <a class="active" href="shop.html">Shop</a><a href="index.html#about">About</a><div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Contact ▾</button><div class="dropdown-menu"><a href="index.html#contact">Contact</a><a href="careers.html">Careers</a></div></div>
      <div class="mobile-menu-tools"><span class="mobile-menu-tools-title">Display</span><button class="mobile-theme-row" type="button" data-theme-toggle aria-label="Toggle theme"><span class="theme-switch-control"><span class="theme-switch-thumb" data-theme-icon>🌙</span></span><strong>Theme</strong></button>${window.HDSI18n?.controlHtml?.() || ''}</div></nav>
      <div class="nav-actions"><button class="theme-switch" type="button" data-theme-toggle aria-label="Toggle theme"><span class="theme-switch-control"><span class="theme-switch-thumb" data-theme-icon>🌙</span></span></button><a class="btn btn-primary btn-small" href="index.html#booking">Book a Call</a>${window.HDSI18n?.controlHtml?.() || ''}<label class="nav-currency-control" aria-label="Currency"><span class="sr-only">Currency</span><select data-currency-select>${currencyOptions}</select></label><button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button></div>
    </div></header>`;
  }

  filters() {
    return [
      ['all', 'All Services'],
      ['web', 'Web & Development'],
      ['marketing', 'Marketing & Growth'],
      ['automation', 'Automation & AI'],
      ['data', 'Data & Analytics'],
      ['cloud', 'Cloud & DevOps'],
      ['testing', 'Testing & QA']
    ];
  }

  shopHtml() {
    const filters = this.filters()
      .map(([id, label]) => `<button class="shop-filter-chip ${id === 'all' ? 'active' : ''}" type="button" role="tab" aria-selected="${id === 'all'}" data-shop-filter="${id}">${label}</button>`)
      .join('');
    const popular = this.getPopularPackages().map(p => this.pricingCardHtml(p, 'popular')).join('');
    const services = this.getServiceCards().map(p => this.pricingCardHtml(p, 'service')).join('');

    return `<main class="shop-page-main">
      <section class="shop-page-hero shop-page-hero-compact"><div class="container">
        <span class="eyebrow">${this.data.shop.eyebrow}</span>
        <h1>${this.data.shop.headline || 'Packages & Services'}</h1>
        <p>${this.data.shop.subtext}</p>
        <div class="shop-filter-slider" aria-label="Package and service filters"><button class="shop-filter-arrow" type="button" data-filter-slide="prev" aria-label="Previous service types">‹</button><div class="shop-filter-row" data-filter-row role="tablist">${filters}</div><button class="shop-filter-arrow" type="button" data-filter-slide="next" aria-label="Next service types">›</button></div>
      </div></section>
      <section class="section shop-catalog-section" id="shop-services"><div class="container shop-catalog">
        <div class="shop-block-head" data-shop-section="popular"><h2 data-shop-popular-title>Most Popular Packages</h2><p>Choose the right solution for your business needs.</p></div>
        <div class="popular-package-grid" data-shop-grid="popular">${popular}</div>
        <div class="shop-block-head shop-services-head" data-shop-section="services"><h2 data-shop-services-title>All Services</h2><p>Explore fixed packages, monthly support and custom enterprise solutions.</p></div>
        <div class="shop-service-grid" data-shop-grid="services">${services}</div>
        <div class="shop-view-all-wrap"><button class="btn btn-ghost btn-small" type="button" data-shop-filter="all">View All Services</button></div>
        <div class="shop-benefit-strip">
          ${this.benefitHtml('secure', '🛡️', '100% Secure Payment', 'Your payment is safe with us')}
          ${this.benefitHtml('delivery', '🚚', 'On-Time Delivery', 'We value your time and deadlines')}
          ${this.benefitHtml('consult', '🎧', 'Dedicated Support', "We're here to help you succeed")}
          ${this.benefitHtml('support', '💬', 'Free Consultation', 'Custom proposal before you commit')}
        </div>
      </div></section></main>
      <button class="cart-float" type="button" data-cart-float hidden aria-label="Open cart"><span aria-hidden="true">🛒</span><span class="cart-float-count" data-cart-float-count>0</span></button>`;
  }

  pricingCardHtml(product, variant) {
    const features = (product.features || []).map(f => `<li>${f}</li>`).join('');
    const suitable = (product.suitableFor || product.suitable || []).join(', ');
    const cardClasses = [
      'shop-pricing-card',
      variant === 'popular' ? 'shop-package-card' : 'shop-service-card',
      product.featured ? 'featured' : '',
      this.isCustom(product) ? 'custom-price-card' : ''
    ].filter(Boolean).join(' ');
    const cta = this.ctaHtml(product);

    return `<article class="${cardClasses}" data-shop-category="${product.filter}">
      ${product.badge ? `<span class="popular-ribbon">${product.badge}</span>` : ''}
      <div class="package-card-top">
        <span class="package-category-badge">${product.category}</span>
        <span class="package-icon" aria-hidden="true">${product.icon || '✨'}</span>
      </div>
      <h3>${product.title}</h3>
      <p class="package-description">${product.description}</p>
      ${suitable ? `<div class="package-suitable"><span aria-hidden="true">👥</span><p><strong>Suitable for:</strong> ${suitable}</p></div>` : ''}
      ${this.priceBlockHtml(product)}
      <ul class="package-feature-list">${features}</ul>
      ${cta}
    </article>`;
  }

  ctaHtml(product) {
    const text = product.ctaText || (this.isCustom(product) ? 'Chat on WhatsApp' : 'Choose Package');
    if (this.isCustom(product) || product.ctaType === 'whatsapp') {
      return `<a class="btn shop-choose-btn shop-whatsapp-btn" href="${this.whatsappLink(product)}" target="_blank" rel="noopener">${this.whatsappIcon()}${text}<span aria-hidden="true">→</span></a>`;
    }
    return `<button class="btn shop-choose-btn" type="button" data-add-to-cart="${product.id}">${text}<span aria-hidden="true">→</span></button>`;
  }

  priceBlockHtml(product) {
    if (this.isCustom(product)) {
      return `<div class="custom-pricing-box">
        <strong>Custom Pricing</strong>
        <span>${product.priceNote || 'Solutions start from RM5,000+'}</span>
        <div class="custom-quote-line">${this.whatsappIcon()}<b>Ask for Quotation</b></div>
        <p>Chat with us on WhatsApp for a customised proposal based on your requirements.</p>
      </div>`;
    }
    return `<div class="package-price" data-product-price="${product.id}"></div>`;
  }

  benefitHtml(tone, icon, title, text) {
    return `<article class="shop-benefit-item"><span class="shop-benefit-icon benefit-icon-${tone}" aria-hidden="true">${icon}</span><div><strong>${title}</strong><small>${text}</small></div></article>`;
  }

  footerHtml() {
    const b = this.data.business;
    return `<footer class="footer"><div class="container footer-grid"><div><a href="index.html#home" class="logo"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${b.name}</strong><small>${b.tagline}</small></span></a><p>AI-powered digital marketing and tech consultancy for websites, automation, cloud, training and business growth.</p></div><div><h4>Services</h4><a href="index.html#services">All Services</a><a href="shop.html">Shop Packages</a></div><div><h4>Company</h4><a href="index.html#about">About Us</a><a href="index.html#portfolio">Impact Vault</a><a href="careers.html">Careers</a></div><div><h4>Contact</h4><a href="tel:${b.phonePlain}">${b.phone}</a><a href="mailto:${b.email}">${b.email}</a><a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener">WhatsApp Us</a></div></div></footer>`;
  }

  render() {
    this.root.innerHTML = `${this.headerHtml()}${this.shopHtml()}${this.footerHtml()}`;
  }

  bindEvents() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => this.theme.toggle()));
    this.bindMobileMenu();
    this.bindDropdowns();
    document.querySelector('[data-currency-select]')?.addEventListener('change', e => {
      this.currency = e.target.value;
      localStorage.setItem(this.currencyKey, this.currency);
      this.updateShop();
    });
    document.querySelectorAll('[data-shop-filter]').forEach(btn => {
      btn.addEventListener('click', () => this.filterShop(btn.dataset.shopFilter));
    });
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', () => this.addToCart(btn.dataset.addToCart));
    });
    document.querySelectorAll('[data-filter-slide]').forEach(btn => {
      btn.addEventListener('click', () => this.scrollFilterTabs(btn.dataset.filterSlide));
    });
    document.querySelector('[data-cart-float]')?.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }

  bindMobileMenu() {
    const navLinks = document.querySelector('[data-nav-links]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const setMenuState = open => {
      navLinks?.classList.toggle('open', open);
      if (menuToggle) {
        menuToggle.textContent = open ? '×' : '☰';
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      document.body.classList.toggle('menu-open', open);
      if (!open) {
        document.querySelectorAll('.nav-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        });
      }
    };
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.addEventListener('click', e => {
      e.stopPropagation();
      setMenuState(!navLinks?.classList.contains('open'));
    });
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('click', e => {
      if (navLinks?.classList.contains('open') && !e.target.closest('[data-nav-links]') && !e.target.closest('[data-menu-toggle]')) setMenuState(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenuState(false);
    });
  }

  bindDropdowns() {
    const close = () => document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.nav-dropdown').forEach(d => {
      d.querySelector('.dropdown-trigger')?.addEventListener('click', e => {
        e.stopPropagation();
        const open = !d.classList.contains('open');
        close();
        d.classList.toggle('open', open);
        d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-dropdown')) close();
    });
  }

  products() {
    return this.data.shop.products || [];
  }

  getProduct(id) {
    return this.products().find(p => p.id === id);
  }

  getPopularPackages() {
    return ['landing-page', 'wordpress-development', 'complete-growth-engine', 'ecommerce-website']
      .map(id => this.getProduct(id))
      .filter(Boolean);
  }

  getServiceCards() {
    const popular = new Set(this.getPopularPackages().map(p => p.id));
    return this.products().filter(p => !popular.has(p.id));
  }

  isCustom(product) {
    return product.priceType === 'custom' || Number(product.price || 0) >= 5000;
  }

  exchangeRate() {
    return this.data.shop.exchangeRates?.[this.currency] || 1;
  }

  convertMYR(amount) {
    return Math.round(amount * this.exchangeRate());
  }

  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency, maximumFractionDigits: 0 }).format(amount);
  }

  formatMYR(amount) {
    return this.formatMoney(this.convertMYR(amount)).replace(/\s/g, ' ');
  }

  priceText(product) {
    if (this.isCustom(product)) return 'Custom Pricing';
    const amount = this.formatMYR(product.price || 0);
    if (product.priceType === 'monthly') return `${amount}/month`;
    return `${product.pricePrefix ? `${product.pricePrefix} ` : ''}${amount}${product.priceNote ? ` ${product.priceNote}` : ''}`;
  }

  priceHtml(product) {
    if (this.isCustom(product)) return '';
    const amount = this.formatMYR(product.price || 0);
    const cadence = product.priceType === 'monthly' ? '/month' : '';
    const prefix = product.pricePrefix ? `<span>${product.pricePrefix}</span>` : '';
    return `${prefix}<strong>${amount}</strong>${cadence ? `<small>${cadence}</small>` : ''}${product.priceNote ? `<em>${product.priceNote}</em>` : ''}`;
  }

  productAmount(product) {
    if (this.isCustom(product)) return 0;
    return this.convertMYR(product.price || 0);
  }

  whatsappLink(product) {
    const b = this.data.business;
    const message = encodeURIComponent(`Hi HDS Consultancy, I would like a quotation for ${product.title}.`);
    return `https://wa.me/${b.whatsapp}?text=${message}`;
  }

  whatsappIcon() {
    return `<svg class="wa-mini" aria-hidden="true" viewBox="0 0 32 32"><path fill="currentColor" d="M16.03 3.2A12.75 12.75 0 0 0 5.16 22.61L3.6 28.8l6.34-1.5A12.74 12.74 0 1 0 16.03 3.2Zm0 2.35a10.39 10.39 0 0 1 8.8 15.9 10.39 10.39 0 0 1-13.84 3.6l-.45-.25-3.78.9.93-3.62-.3-.48A10.39 10.39 0 0 1 16.03 5.55Zm-4.18 5.5c-.25 0-.65.1-1 .47-.34.37-1.32 1.29-1.32 3.14 0 1.85 1.35 3.64 1.54 3.89.19.25 2.6 4.16 6.43 5.66 3.18 1.25 3.84 1 4.53.94.7-.06 2.25-.92 2.56-1.8.32-.88.32-1.64.22-1.8-.09-.15-.34-.24-.72-.43-.37-.19-2.25-1.1-2.6-1.23-.34-.13-.59-.19-.84.19-.25.37-.97 1.23-1.19 1.48-.22.25-.44.28-.81.1-.38-.2-1.6-.6-3.04-1.9-1.12-1-1.88-2.25-2.1-2.62-.22-.38-.02-.58.17-.76.17-.17.37-.44.56-.66.19-.22.25-.37.37-.62.13-.25.06-.47-.03-.66-.1-.19-.84-2.03-1.16-2.78-.3-.73-.62-.62-.84-.63h-.72Z"/></svg>`;
  }

  loadCart() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
  }

  addToCart(id) {
    const item = this.cart.find(i => i.id === id);
    if (item) item.quantity += 1;
    else this.cart.push({ id, quantity: 1 });
    this.saveCart();
    this.renderCart();
    window.location.href = 'cart.html';
  }

  updateShop() {
    document.querySelectorAll('[data-product-price]').forEach(el => {
      const product = this.getProduct(el.dataset.productPrice);
      if (product) el.innerHTML = this.priceHtml(product);
    });
    this.renderCart();
  }

  filterShop(filter = 'all') {
    const label = this.filters().find(f => f[0] === filter)?.[1] || 'All Services';
    document.querySelectorAll('[data-shop-filter]').forEach(btn => {
      const active = btn.dataset.shopFilter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
      if (active) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    document.querySelectorAll('[data-shop-category]').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.shopCategory !== filter;
    });
    const popularGrid = document.querySelector('[data-shop-grid="popular"]');
    const servicesGrid = document.querySelector('[data-shop-grid="services"]');
    const popularVisible = popularGrid ? [...popularGrid.children].some(c => !c.hidden) : false;
    const servicesVisible = servicesGrid ? [...servicesGrid.children].some(c => !c.hidden) : false;

    document.querySelector('[data-shop-section="popular"]')?.toggleAttribute('hidden', !popularVisible);
    popularGrid?.toggleAttribute('hidden', !popularVisible);
    document.querySelector('[data-shop-section="services"]')?.toggleAttribute('hidden', !servicesVisible);
    servicesGrid?.toggleAttribute('hidden', !servicesVisible);
    document.querySelector('[data-shop-popular-title]').textContent = filter === 'all' ? 'Most Popular Packages' : `${label} Packages`;
    document.querySelector('[data-shop-services-title]').textContent = filter === 'all' ? 'All Services' : `${label} Services`;
  }

  scrollFilterTabs(direction) {
    const row = document.querySelector('[data-filter-row]');
    if (!row) return;
    row.scrollBy({ left: (direction === 'prev' ? -1 : 1) * Math.max(240, row.clientWidth * .72), behavior: 'smooth' });
  }

  renderCart() {
    const countValue = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('[data-cart-float]')?.toggleAttribute('hidden', countValue === 0);
    const count = document.querySelector('[data-cart-float-count]');
    if (count) count.textContent = String(countValue);
  }
}

new ShopPage('shop-app').init();
