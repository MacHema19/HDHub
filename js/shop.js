class DataService {
  async getData() {
    const response = await fetch('data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load data.json');
    return response.json();
  }
}
class ThemeManager {
  constructor() { this.key = 'hds-theme'; this.root = document.documentElement; }
  init() { this.set(localStorage.getItem(this.key) || 'light'); }
  set(theme) {
    this.root.dataset.theme = theme;
    localStorage.setItem(this.key, theme);
    document.querySelectorAll('[data-theme-icon]').forEach(el => el.textContent = theme === 'dark' ? '☀️' : '🌙');
  }
  toggle() { this.set(this.root.dataset.theme === 'dark' ? 'light' : 'dark'); }
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
      this.cart = this.loadCart();
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
    const { business, portfolio, clientWebDesign } = this.data;
    const currencySymbols = { MYR: 'RM', USD: '$', SGD: 'S$', AUD: 'A$', EUR: '€', GBP: '£' };
    const currencyOptions = this.data.shop.currencies.map(c => `<option value="${c}" ${c === this.currency ? 'selected' : ''}>${currencySymbols[c] || c}</option>`).join('');
    const clientLinks = clientWebDesign.projects.map(project => `<a href="${project.liveUrl || project.localPage || `client-web-design.html?id=${project.id}`}">${project.name}</a>`).join('');
    return `<header class="header"><div class="container nav">
      <a href="index.html#home" class="logo" aria-label="${business.name} home"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${business.name}</strong><small>${business.tagline}</small></span></a>
      <nav class="nav-links" data-nav-links>
        <a href="index.html#home">Home</a>
        <div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Services ▾</button><div class="dropdown-menu"><a href="index.html#services">Service Categories</a><a href="shop.html">Packages</a><a href="index.html#growth-engine">Growth Engine</a></div></div>
        <a href="index.html#services">Solutions</a>
        <div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Client Work ▾</button><div class="dropdown-menu">${clientLinks}</div></div>
        <a class="active" href="shop.html">Shop</a><a href="index.html#about">About</a><div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Contact ▾</button><div class="dropdown-menu"><a href="index.html#contact">Contact</a><a href="careers.html">Careers</a></div></div>
      </nav>
      <div class="nav-actions"><button class="theme-switch" type="button" data-theme-toggle aria-label="Toggle theme"><span class="theme-switch-control"><span class="theme-switch-thumb" data-theme-icon>🌙</span></span></button><a class="btn btn-primary btn-small" href="index.html#booking">Book a Call</a>${window.HDSI18n?.controlHtml?.() || ""}<label class="nav-currency-control" aria-label="Currency"><span class="sr-only">Currency</span><select data-currency-select>${currencyOptions}</select></label><button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button></div>
    </div></header>`;
  }
  filters() {
    return [
      ['all','All Services'], ['web','Web & Development'], ['marketing','Marketing & Growth'], ['automation','Automation & AI'], ['data','Data & Analytics'], ['cloud','Cloud & DevOps'], ['testing','Testing & Quality'], ['design','Design & Branding'], ['training','Training & Consulting'], ['managed','Managed Services'], ['bundles','Bundles']
    ];
  }
  shopHtml() {
    const filters = this.filters().map(([id,label]) => `<button class="shop-filter-chip ${id === 'all' ? 'active' : ''}" type="button" role="tab" aria-selected="${id === 'all'}" data-shop-filter="${id}">${label}</button>`).join('');
    const popular = this.getPopularPackages().map((p, index) => this.packageHtml(p, index === 1 || p.badge === 'FEATURED')).join('');
    const services = this.getServiceCards().map(p => this.serviceHtml(p)).join('');
    return `<main class="shop-page-main">
      <section class="shop-page-hero shop-page-hero-compact"><div class="container">
        <span class="eyebrow">${this.data.shop.eyebrow}</span>
        <h1>Packages & Services</h1>
        <p>${this.data.shop.subtext}</p>
        <div class="shop-filter-slider" aria-label="Package and service filters"><button class="shop-filter-arrow" type="button" data-filter-slide="prev" aria-label="Previous service types">‹</button><div class="shop-filter-row" data-filter-row role="tablist">${filters}</div><button class="shop-filter-arrow" type="button" data-filter-slide="next" aria-label="Next service types">›</button></div>
      </div></section>
      <section class="section shop-catalog-section" id="shop-services"><div class="container shop-catalog">
        <div class="shop-block-head" data-shop-section="popular"><h2 data-shop-popular-title>Most Popular Packages</h2></div>
        <div class="popular-package-grid" data-shop-grid="popular">${popular}</div>
        <div class="shop-block-head shop-services-head" data-shop-section="services"><h2 data-shop-services-title>All Services</h2></div>
        <div class="shop-service-grid" data-shop-grid="services">${services}</div>
        <div class="shop-view-all-wrap"><button class="btn btn-ghost btn-small" type="button" data-shop-filter="all">View All Services</button></div>
        <div class="shop-benefit-strip">
          ${this.benefitHtml('secure','🛡','100% Secure','Safe & trusted payment')}
          ${this.benefitHtml('delivery','🚚','Fast Delivery','On-time project delivery')}
          ${this.benefitHtml('consult','🎧','Free Consultation','Expert advice for you')}
          ${this.benefitHtml('support','☎','Support 24/7','We are here to help')}
        </div>
      </div></section></main>
      <button class="cart-float" type="button" data-cart-float hidden aria-label="Open cart"><span aria-hidden="true">🛒</span><span class="cart-float-count" data-cart-float-count>0</span></button>`;
  }
  packageHtml(product, featured=false) {
    const suitable = product.suitable?.length ? `<p class="package-suitable">Suitable for: ${product.suitable.join(', ')}</p>` : '';
    const features = product.features.slice(0,8).map(f => `<li>${f}</li>`).join('');
    return `<article class="shop-package-card ${featured ? 'featured' : ''}" data-shop-category="${product.filter}">
      ${product.badge ? `<span class="popular-ribbon">${product.badge}</span>` : ''}
      <div class="package-card-head"><span class="package-icon" aria-hidden="true">${product.icon || '✨'}</span><div><h3>${product.title}</h3><p>${product.description}</p></div></div>
      ${suitable}<div class="package-price" data-product-price="${product.id}"></div><span class="payment-note">${product.price?.cadence || product.duration}</span><ul>${features}</ul>
      <button class="btn shop-choose-btn" type="button" data-add-to-cart="${product.id}">${product.price?.type === 'quote' ? 'Request Quote' : 'Choose Package'}</button>
    </article>`;
  }
  serviceHtml(product) {
    const features = product.features.slice(0,3).map(f => `<li>${f}</li>`).join('');
    return `<article class="shop-service-card" data-shop-category="${product.filter}"><span class="shop-service-icon" aria-hidden="true">${product.icon || '✨'}</span><div class="shop-service-copy"><span class="shop-service-group">${product.group}</span><h3>${product.title}</h3><p>${product.description}</p></div><ul>${features}</ul><strong data-service-price="${product.id}">${this.priceText(product)}</strong><button class="btn shop-service-btn" type="button" data-add-to-cart="${product.id}">${product.price?.type === 'quote' ? 'Request Quote' : 'Choose'}</button></article>`;
  }
  benefitHtml(tone, icon, title, text) { return `<article class="shop-benefit-item"><span class="shop-benefit-icon benefit-icon-${tone}" aria-hidden="true">${icon}</span><div><strong>${title}</strong><small>${text}</small></div></article>`; }
  footerHtml() { const b=this.data.business; return `<footer class="footer"><div class="container footer-grid"><div><a href="index.html#home" class="logo"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${b.name}</strong><small>${b.tagline}</small></span></a><p>AI-powered digital marketing and tech consultancy for websites, automation, cloud, training and business growth.</p></div><div><h4>Services</h4><a href="index.html#services">All Services</a><a href="shop.html">Shop Packages</a></div><div><h4>Company</h4><a href="index.html#about">About Us</a><a href="index.html#portfolio">Impact Vault</a><a href="careers.html">Careers</a></div><div><h4>Contact</h4><a href="tel:${b.phonePlain}">${b.phone}</a><a href="mailto:${b.email}">${b.email}</a><a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener">WhatsApp Us</a></div></div></footer>`; }
  render() { this.root.innerHTML = `${this.headerHtml()}${this.shopHtml()}${this.footerHtml()}`; }
  bindEvents() {
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => this.theme.toggle());
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
      if (!open) document.querySelectorAll('.nav-dropdown.open').forEach(d => { d.classList.remove('open'); d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false'); });
    };
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.addEventListener('click', e => { e.stopPropagation(); setMenuState(!navLinks?.classList.contains('open')); });
    const closeMobileMenu = () => setMenuState(false);
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMobileMenu));
    document.addEventListener('click', e => { if (navLinks?.classList.contains('open') && !e.target.closest('[data-nav-links]') && !e.target.closest('[data-menu-toggle]')) setMenuState(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuState(false); });
    this.bindDropdowns();
    document.querySelector('[data-currency-select]')?.addEventListener('change', e => { this.currency = e.target.value; localStorage.setItem(this.currencyKey, this.currency); this.updateShop(); });
    document.querySelectorAll('[data-shop-filter]').forEach(btn => btn.addEventListener('click', () => this.filterShop(btn.dataset.shopFilter)));
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => btn.addEventListener('click', () => this.addToCart(btn.dataset.addToCart)));
    document.querySelectorAll('[data-filter-slide]').forEach(btn => btn.addEventListener('click', () => this.scrollFilterTabs(btn.dataset.filterSlide)));
    document.querySelector('[data-cart-float]')?.addEventListener('click', () => { window.location.href='cart.html'; });
  }
  bindDropdowns() {
    const close = () => document.querySelectorAll('.nav-dropdown.open').forEach(d => { d.classList.remove('open'); d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false'); });
    document.querySelectorAll('.nav-dropdown').forEach(d => d.querySelector('.dropdown-trigger')?.addEventListener('click', e => { e.stopPropagation(); const open=!d.classList.contains('open'); close(); d.classList.toggle('open', open); d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', String(open)); }));
    document.addEventListener('click', e => { if (!e.target.closest('.nav-dropdown')) close(); });
  }
  products() { return this.data.shop.products || []; }
  getProduct(id) { return this.products().find(p => p.id === id); }
  getPopularPackages() { return ['landing-page-basic','wordpress-development','bundle-complete-growth','ecommerce-website'].map(id => this.getProduct(id)).filter(Boolean); }
  getServiceCards() { const popular = new Set(this.getPopularPackages().map(p => p.id)); return this.products().filter(p => !popular.has(p.id)); }
  exchangeRate() { return this.data.shop.exchangeRates?.[this.currency] || 1; }
  convertMYR(amount) { return Math.round(amount * this.exchangeRate()); }
  formatMoney(amount) { return new Intl.NumberFormat('en-US', { style:'currency', currency:this.currency, maximumFractionDigits:0 }).format(amount); }
  formatMYR(amount) { return this.formatMoney(this.convertMYR(amount)); }
  priceText(product) {
    const p=product.price||{};
    if (p.type==='quote') return 'Ask for Quotation';
    if (p.type==='from') return `From ${this.formatMYR(p.amount)}`;
    if (p.type==='range' || p.type==='rangePlus') return `${this.formatMYR(p.min)} - ${this.formatMYR(p.max)}${p.type==='rangePlus'?'+':''}`;
    if (p.type==='setupMonthly') return `${this.formatMYR(p.setup)} setup + ${this.formatMYR(p.monthly)}/month`;
    if (p.type==='monthly') return `${this.formatMYR(p.amount)}/month`;
    if (p.type==='amount') return this.formatMYR(p.amount);
    return this.formatMoney(this.productAmount(product));
  }
  moneyParts(amount) { const m=this.formatMYR(amount).replace(/\s/g,' ').match(/^([^0-9]*)([0-9][0-9,]*)$/); return m ? { prefix:m[1].trim(), value:m[2] } : { prefix:'', value:this.formatMYR(amount) }; }
  priceHtml(product) {
    const p=product.price||{};
    if (p.type==='quote') return '<strong class="price-quote">Ask for Quotation</strong>';
    if (p.type==='from') { const a=this.moneyParts(p.amount); return `<span>From ${a.prefix}</span><strong>${a.value}</strong>`; }
    if (p.type==='range' || p.type==='rangePlus') { const a=this.moneyParts(p.min), b=this.moneyParts(p.max); return `<span>${a.prefix}</span><strong>${a.value} - ${b.value}${p.type==='rangePlus'?'+':''}</strong>`; }
    if (p.type==='setupMonthly') { const a=this.moneyParts(p.setup), b=this.moneyParts(p.monthly); return `<span>${a.prefix}</span><strong>${a.value}</strong><small>setup + ${b.prefix} ${b.value}/month</small>`; }
    if (p.type==='monthly') { const a=this.moneyParts(p.amount); return `<span>${a.prefix}</span><strong>${a.value}</strong><small>/month</small>`; }
    if (p.type==='amount') { const a=this.moneyParts(p.amount); return `<span>${a.prefix}</span><strong>${a.value}</strong>`; }
    return `<strong>${this.priceText(product)}</strong>`;
  }
  productAmount(product) { const p=product.price||{}; if (p.type==='quote') return 0; return this.convertMYR(p.amount || p.setup || p.min || 0); }
  loadCart() { try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]'); } catch { return []; } }
  saveCart() { localStorage.setItem(this.storageKey, JSON.stringify(this.cart)); }
  addToCart(id) { const item=this.cart.find(i => i.id===id); if (item) item.quantity += 1; else this.cart.push({id, quantity:1}); this.saveCart(); this.renderCart(); window.location.href='cart.html'; }
  updateShop() { document.querySelectorAll('[data-product-price]').forEach(el => { const p=this.getProduct(el.dataset.productPrice); if (p) el.innerHTML=this.priceHtml(p); }); document.querySelectorAll('[data-service-price]').forEach(el => { const p=this.getProduct(el.dataset.servicePrice); if (p) el.textContent=this.priceText(p); }); this.renderCart(); }
  filterShop(filter='all') {
    const label=this.filters().find(f => f[0]===filter)?.[1] || 'All Services';
    document.querySelectorAll('[data-shop-filter]').forEach(btn => { const active=btn.dataset.shopFilter===filter; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', String(active)); if (active) btn.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' }); });
    document.querySelectorAll('[data-shop-category]').forEach(card => { card.hidden = filter !== 'all' && card.dataset.shopCategory !== filter; });
    const popularGrid=document.querySelector('[data-shop-grid="popular"]'), servicesGrid=document.querySelector('[data-shop-grid="services"]');
    const popularVisible=popularGrid ? [...popularGrid.children].some(c => !c.hidden) : false; const servicesVisible=servicesGrid ? [...servicesGrid.children].some(c => !c.hidden) : false;
    document.querySelector('[data-shop-section="popular"]')?.toggleAttribute('hidden', !popularVisible); popularGrid?.toggleAttribute('hidden', !popularVisible);
    document.querySelector('[data-shop-section="services"]')?.toggleAttribute('hidden', !servicesVisible); servicesGrid?.toggleAttribute('hidden', !servicesVisible);
    document.querySelector('[data-shop-popular-title]').textContent = filter === 'all' ? 'Most Popular Packages' : `${label} Packages`;
    document.querySelector('[data-shop-services-title]').textContent = filter === 'all' ? 'All Services' : `${label} Services`;
  }
  scrollFilterTabs(direction) { const row=document.querySelector('[data-filter-row]'); if (!row) return; row.scrollBy({ left:(direction==='prev'?-1:1) * Math.max(240, row.clientWidth*.72), behavior:'smooth' }); }
  renderCart() { const n=this.cart.reduce((s,i)=>s+i.quantity,0); document.querySelector('[data-cart-float]')?.toggleAttribute('hidden', n===0); const count=document.querySelector('[data-cart-float-count]'); if (count) count.textContent=String(n); }
}
new ShopPage('shop-app').init();
