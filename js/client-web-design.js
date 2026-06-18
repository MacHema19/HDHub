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
    const saved = localStorage.getItem(this.key) || 'light';
    this.set(saved);
  }
  set(theme) {
    this.root.dataset.theme = theme;
    localStorage.setItem(this.key, theme);
    document.querySelectorAll('[data-theme-icon]').forEach(el => el.textContent = theme === 'dark' ? '☀️' : '🌙');
  }
  toggle() { this.set(this.root.dataset.theme === 'dark' ? 'light' : 'dark'); }
}

class ClientDesignPage {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.theme = new ThemeManager();
    this.dataService = new DataService();
  }

  async init() {
    try {
      this.data = await this.dataService.getData();
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get('id');
      if (!requestedId) {
        window.location.replace('index.html#home');
        return;
      }
      const projects = this.data.clientWebDesign.projects;
      this.project = projects.find(project => project.id === requestedId);
      if (!this.project) {
        window.location.replace('index.html#home');
        return;
      }
      if (this.project?.liveUrl) {
        window.location.href = this.project.liveUrl;
        return;
      }
      this.render();
      this.theme.init();
      this.bindEvents();
    } catch (error) {
      this.root.innerHTML = `<main class="container"><h1>Unable to load client design</h1><p>${error.message}</p></main>`;
    }
  }

  projectLink(project) {
    return project.liveUrl || project.localPage || `client-web-design.html?id=${project.id}`;
  }

  fallbackLink(project) {
    return `client-web-design.html?id=${project.id}`;
  }

  render() {
    const { business, portfolio, clientWebDesign } = this.data;
    const projects = clientWebDesign.projects;
    const project = this.project;
    const menuItems = projects.map(item => `<a href="${this.projectLink(item)}">${item.name}</a>`).join('');
    const projectCards = projects.map(item => `
      <a class="client-mini-card ${item.id === project.id ? 'active' : ''}" href="${this.projectLink(item)}" data-fallback="${this.fallbackLink(item)}">
        <img src="${item.image}" alt="${item.name} preview" loading="lazy" />
        <span>${item.name}</span>
      </a>`).join('');
    const highlights = project.highlights.map(item => `<li>${item}</li>`).join('');
    this.root.innerHTML = `
      <header class="header">
        <div class="container nav">
          <a href="index.html#home" class="logo" aria-label="${business.name} home">
            <span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span>
            <span><strong>${business.name}</strong><small>${business.tagline}</small></span>
          </a>
          <nav class="nav-links" data-nav-links>
            <a href="index.html#home">Home</a>
            <a href="index.html#services">Services</a>
            <a href="index.html${portfolio.url}">${portfolio.label}</a>
            <div class="nav-dropdown">
              <button type="button" class="dropdown-trigger active" aria-haspopup="true" aria-expanded="false">${clientWebDesign.label} ▾</button>
              <div class="dropdown-menu">${menuItems}</div>
            </div>
            <a href="index.html#careers">Careers</a>
            <a href="index.html#contact">Contact</a>
          </nav>
          <div class="nav-actions">
            <button class="theme-toggle" data-theme-toggle aria-label="Toggle theme"><span data-theme-icon>🌙</span></button>
            <a class="btn btn-primary btn-small" href="index.html#booking">Book a Call</a>
            <button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button>
          </div>
        </div>
      </header>
      <main>
        <section class="client-landing-hero">
          <div class="container client-landing-grid">
            <div class="client-landing-copy">
              <span class="badge">${clientWebDesign.eyebrow}</span>
              <h1>${project.name} <span class="gradient-text">Website Design</span></h1>
              <p>${project.summary}</p>
              <div class="client-meta-row">
                <span>${project.type}</span>
                <span>${project.status}</span>
              </div>
              <div class="client-actions">
                <a class="btn btn-primary" href="index.html#booking">Request Similar Design →</a>
                <a class="btn btn-ghost" href="index.html">Back to HDS</a>
              </div>
            </div>
            <div class="client-landing-media">
              <img src="${project.image}" alt="${project.name} website design preview" />
            </div>
          </div>
        </section>
        <section class="section client-detail-section">
          <div class="container client-detail-grid">
            <div>
              <span class="eyebrow">SAVED LANDING PAGE</span>
              <h2>Design Direction & <span class="gradient-text">Migration Notes</span></h2>
              <p class="muted-copy">This local page is used while the live website URL is empty. Add a live URL in data.json later and visitors will be redirected to the external website automatically.</p>
              <ul class="client-detail-list">${highlights}</ul>
            </div>
            <div class="client-project-picker">
              <h3>Client Designs</h3>
              <div class="client-mini-grid">${projectCards}</div>
            </div>
          </div>
        </section>
      </main>
      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <a href="index.html#home" class="logo"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${business.name}</strong><small>${business.tagline}</small></span></a>
            <p>AI-powered digital marketing and tech consultancy for websites, automation, cloud, training and business growth.</p>
          </div>
          <div><h4>Services</h4><a href="index.html#services">All Services</a><a href="index.html#services">Web Solutions</a><a href="index.html#services">AI & Automation</a></div>
          <div><h4>Company</h4><a href="index.html#about">About Us</a><a href="index.html#services">Services</a><a href="index.html#portfolio">Impact Vault</a><a href="index.html#careers">Careers</a></div>
          <div><h4>Contact</h4><a href="tel:${business.phonePlain}">${business.phone}</a><a href="mailto:${business.email}">${business.email}</a><a href="https://wa.me/${business.whatsapp}" target="_blank" rel="noopener">WhatsApp Us</a></div>
        </div>
      </footer>`;
  }

  bindEvents() {
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => this.theme.toggle());
    document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => document.querySelector('[data-nav-links]')?.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.querySelector('[data-nav-links]')?.classList.remove('open')));
    this.bindDropdowns();
  }

  bindDropdowns() {
    const closeDropdowns = () => {
      document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
        dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    };
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.dropdown-trigger');
      trigger?.addEventListener('click', event => {
        event.stopPropagation();
        const shouldOpen = !dropdown.classList.contains('open');
        closeDropdowns();
        dropdown.classList.toggle('open', shouldOpen);
        trigger.setAttribute('aria-expanded', String(shouldOpen));
      });
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-dropdown')) closeDropdowns();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeDropdowns();
    });
  }
}

new ClientDesignPage('client-app').init();
