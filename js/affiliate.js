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

class AffiliatePage {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.dataService = new DataService();
    this.theme = new ThemeManager();
    this.apiBaseUrl = 'http://localhost:8014';
  }

  async init() {
    try {
      this.data = await this.dataService.getData();
      this.render();
      this.theme.init();
      this.bindEvents();
    } catch (error) {
      this.root.innerHTML = `<main class="container"><h1>Unable to load affiliate page</h1><p>${error.message}</p></main>`;
    }
  }

  headerHtml() {
    const { business, clientWebDesign } = this.data;
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
        <a href="shop.html">Shop</a><a class="active" href="affiliate.html">Affiliate</a><a href="index.html#about">About</a><div class="nav-dropdown"><button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">Contact ▾</button><div class="dropdown-menu"><a href="index.html#contact">Contact</a><a href="careers.html">Careers</a></div></div>
      <div class="mobile-menu-tools"><span class="mobile-menu-tools-title">Display</span><button class="mobile-theme-row" type="button" data-theme-toggle aria-label="Toggle theme"><span class="theme-switch-control"><span class="theme-switch-thumb" data-theme-icon>🌙</span></span><strong>Theme</strong></button></div></nav>
      <div class="nav-actions"><button class="theme-switch" type="button" data-theme-toggle aria-label="Toggle theme"><span class="theme-switch-control"><span class="theme-switch-thumb" data-theme-icon>🌙</span></span></button><a class="btn btn-primary btn-small" href="index.html#booking">Book a Call</a><button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button></div>
    </div></header>`;
  }

  heroVisualHtml() {
    return `<div class="affiliate-visual-card affiliate-visual-image-card" aria-label="Affiliate commission illustration">
      <img class="affiliate-visual-image" src="assets/affiliate-partner-program-v2.png" alt="Two HDS Consultancy affiliate partners celebrating commission earnings" loading="eager" />
    </div>`;
  }

  stepHtml(number, icon, title, text) {
    return `<article class="affiliate-step-card"><span class="affiliate-step-icon">${icon}</span><strong>${number}. ${title}</strong><p>${text}</p></article>`;
  }

  partnerCardHtml(icon, title, text) {
    return `<article class="affiliate-partner-card"><span>${icon}</span><h3>${title}</h3><p>${text}</p></article>`;
  }

  faqHtml(question, answer) {
    return `<details class="affiliate-faq-item"><summary>${question}</summary><p>${answer}</p></details>`;
  }

  mainHtml() {
    return `<main class="affiliate-page">
      <section class="affiliate-hero" id="affiliate-hero"><div class="container affiliate-hero-grid">
        <div class="affiliate-hero-copy">
          <span class="eyebrow">AFFILIATE PARTNER PROGRAM</span>
          <h1>Refer. Earn.<br><span class="gradient-text">Grow Together.</span></h1>
          <p>Join our Affiliate Partner Program and earn attractive commissions by referring businesses to HDS Consultancy.</p>
          <div class="affiliate-hero-badges">
            <span><b>♙</b><strong>Earn Up To 10%</strong><small>Attractive commission for every successful referral</small></span>
            <span><b>▣</b><strong>Easy & Transparent</strong><small>Simple process with clear tracking and reporting</small></span>
            <span><b>♧</b><strong>Trusted By Partners</strong><small>Join a growing network of successful partners</small></span>
          </div>
          <div class="hero-ctas affiliate-ctas"><a class="btn btn-primary" href="#affiliate-form">Join as Affiliate Partner →</a><a class="btn btn-ghost" href="#affiliate-how">How It Works ⓘ</a></div>
        </div>
        ${this.heroVisualHtml()}
      </div></section>

      <section class="section affiliate-how-section" id="affiliate-how"><div class="container affiliate-panel">
        <div class="section-title compact-title"><h2>How It Works</h2><p>Simple steps to start earning with HDS Consultancy</p></div>
        <div class="affiliate-steps">
          ${this.stepHtml(1, '♧', 'Join Program', 'Sign up and get your partner ID.')}
          ${this.stepHtml(2, '⌁', 'Refer Clients', 'Share your link or refer businesses directly.')}
          ${this.stepHtml(3, '▣', 'Client Converts', 'We handle the consultation, proposal and project delivery.')}
          ${this.stepHtml(4, '◇', 'You Earn', 'Commission is paid after customer payment is received.')}
        </div>
      </div></section>

      <section class="section affiliate-commission-form"><div class="container affiliate-two-col">
        <article class="affiliate-card affiliate-commission-card">
          <h2>Earn Attractive Commissions</h2>
          <p>The more you refer, the more you earn.</p>
          <div class="affiliate-table-wrap"><table class="affiliate-commission-table">
            <thead><tr><th>Project Value (RM)</th><th>Your Commission</th></tr></thead>
            <tbody>
              <tr><td>Up to RM1,000</td><td>10%</td></tr>
              <tr><td>RM1,001 – RM3,000</td><td>7%</td></tr>
              <tr><td>RM3,001 – RM8,000</td><td>5%</td></tr>
              <tr><td>RM8,001 – RM20,000</td><td>3%</td></tr>
              <tr><td>RM20,000+</td><td>1% – 2% <span>By Approval</span></td></tr>
            </tbody>
          </table></div>
          <p class="affiliate-note">Commission is calculated based on actual customer payment received, excluding refunds, third-party platform fees, payment gateway charges, ad spend, hosting, domain, software subscription, taxes and pass-through costs.</p>
          <div class="affiliate-reward-note"><span>🏆</span><div><strong>Higher Volume, Higher Rewards</strong><small>Unlock better partner tiers as you refer more successful clients.</small></div></div>
        </article>

        <article class="affiliate-card affiliate-form-card" id="affiliate-form">
          <h2>Join As A Partner</h2>
          <p>Start earning in minutes.</p>
          <form data-affiliate-form>
            <label>Full Name<input required name="name" type="text" placeholder="Enter your full name" /></label>
            <label>WhatsApp Number<div class="affiliate-phone-row"><select name="countryCode" aria-label="Country code"><option value="+60">🇲🇾 +60</option></select><input required name="phone" type="tel" placeholder="12 345 6789" /></div></label>
            <label>Email Address<input name="email" type="email" placeholder="hello@example.com" /></label>
            <label>Social Media Profile URL<input name="social" type="url" placeholder="https://..." /></label>
            <label>Partner Type<select name="partnerType"><option>Affiliate Partner</option><option>Referral Partner</option><option>Influencer / Content Creator</option><option>Freelancer / Designer</option><option>Digital Marketer</option><option>Existing Customer</option><option>Business Consultant</option><option>Other</option></select></label>
            <label>Message / Notes<textarea name="notes" rows="3" placeholder="Tell us how you plan to refer businesses"></textarea></label>
            <button class="btn btn-primary" type="submit">Join Now →</button>
            <p class="affiliate-success" data-affiliate-success hidden>Saving your affiliate request...</p>
          </form>
          <div class="affiliate-social-divider">Or continue with</div>
          <div class="affiliate-social-row">
            <!-- TODO: Connect Google OAuth when backend authentication is available. -->
            <button type="button">G Google</button>
            <!-- TODO: Connect Facebook OAuth when backend authentication is available. -->
            <button type="button">f Facebook</button>
            <!-- TODO: Connect TikTok OAuth when backend authentication is available. -->
            <button type="button">♪ TikTok</button>
          </div>
          <small class="affiliate-terms">By joining, you agree to our <a href="#affiliate-faq">Terms & Conditions</a>.</small>
        </article>
      </div></section>

      <section class="section affiliate-tracking"><div class="container">
        <div class="section-title"><span class="eyebrow">AFFILIATE TRACKING</span><h2>How Affiliate Tracking Works</h2><p>Simple tracking options for online and direct referrals.</p></div>
        <div class="affiliate-track-grid">
          <article><span>01</span><h3>Partner ID</h3><p>Each partner receives a unique Partner ID such as <strong>HDS-001</strong>.</p></article>
          <article><span>02</span><h3>Referral Link</h3><p>Future-ready affiliate link format:<br><strong>https://mindzlabz.com/?ref=HDS001</strong></p></article>
          <article><span>03</span><h3>Manual Lead Submission</h3><p>Partner can submit customer details directly via WhatsApp or form.</p></article>
        </div>
        <div class="affiliate-info-card">Commission is only payable after customer payment is received and verified.</div>
      </div></section>

      <section class="section affiliate-partners"><div class="container">
        <div class="section-title"><span class="eyebrow">PARTNER TYPES</span><h2>Who Can Join?</h2></div>
        <div class="affiliate-partner-grid">
          ${this.partnerCardHtml('🔗', 'Affiliate Partner', 'Promote packages using referral link and earn commission.')}
          ${this.partnerCardHtml('🤝', 'Referral Partner', 'Introduce business owners directly to HDS.')}
          ${this.partnerCardHtml('🎥', 'Influencer / Content Creator', 'Create TikTok, Facebook, Instagram or LinkedIn content.')}
          ${this.partnerCardHtml('🧑‍💻', 'Freelancer / Agency Partner', 'Refer clients that need services outside your scope.')}
          ${this.partnerCardHtml('⭐', 'Existing Customer', 'Refer business contacts and earn partner commission.')}
        </div>
      </div></section>

      <section class="section affiliate-faq" id="affiliate-faq"><div class="container">
        <div class="section-title"><span class="eyebrow">FAQ</span><h2>Affiliate Questions</h2></div>
        <div class="affiliate-faq-list">
          ${this.faqHtml('When will commission be paid?', 'After customer payment is received and verified.')}
          ${this.faqHtml('Do I get commission for custom quotation projects?', 'Yes, commission applies based on the approved commission tier and actual payment received.')}
          ${this.faqHtml('Do I need to pay to join?', 'No, joining the Referral Partner Program is free.')}
          ${this.faqHtml('Can I promote using TikTok, Facebook or WhatsApp?', 'Yes, partners can promote using social media, WhatsApp or direct referrals.')}
          ${this.faqHtml('Is commission recurring?', 'By default, commission is one-time unless agreed in writing for specific recurring campaigns.')}
        </div>
      </div></section>
    </main>`;
  }

  footerHtml() {
    const b = this.data.business;
    const icon = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.03 4.5A11.42 11.42 0 0 0 6.2 21.72L4.9 27.5l5.9-1.24A11.5 11.5 0 1 0 16.03 4.5Zm0 20.7c-1.83 0-3.6-.53-5.12-1.54l-.37-.24-3.08.65.68-3.01-.25-.39a9.16 9.16 0 1 1 8.14 4.53Zm5.03-6.84c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.42.12-.55.13-.13.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.28 0 1.34.98 2.64 1.11 2.82.14.18 1.93 2.94 4.67 4.12.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.52-.08 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.12-.25-.19-.52-.33Z"/></svg>';
    return `<footer class="footer"><div class="container footer-grid"><div><a href="index.html#home" class="logo"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${b.name}</strong><small>${b.tagline}</small></span></a><p>AI-powered digital marketing and tech consultancy for websites, automation, cloud, training and business growth.</p></div><div><h4>Services</h4><a href="index.html#services">All Services</a><a href="shop.html">Shop Packages</a></div><div><h4>Company</h4><a href="index.html#about">About Us</a><a href="affiliate.html">Affiliate</a><a href="careers.html">Careers</a></div><div><h4>Contact</h4><a href="tel:${b.phonePlain}">${b.phone}</a><a href="mailto:${b.email}">${b.email}</a><a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener">WhatsApp Us</a></div></div></footer><a class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat with HDS Consultancy on WhatsApp" href="https://wa.me/${b.whatsapp}?text=${encodeURIComponent('Hi HDS Consultancy, I would like to enquire about the Affiliate Partner Program.')}">${icon}</a>`;
  }

  render() {
    this.root.innerHTML = `${this.headerHtml()}${this.mainHtml()}${this.footerHtml()}`;
  }

  bindEvents() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => this.theme.toggle()));
    this.bindMobileMenu();
    this.bindDropdowns();
    document.querySelector('[data-affiliate-form]')?.addEventListener('submit', event => this.submitAffiliateForm(event));
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

  async submitAffiliateForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    if (!name || !phone) {
      form.reportValidity();
      return;
    }
    const whatsapp = `${data.get('countryCode') || '+60'} ${phone}`;
    const payload = {
      name,
      whatsapp,
      email: String(data.get('email') || '').trim() || null,
      partner_type: String(data.get('partnerType') || 'Affiliate Partner'),
      social_media: String(data.get('social') || '').trim() || null,
      notes: String(data.get('notes') || '').trim() || null
    };
    const success = document.querySelector('[data-affiliate-success]');
    success?.removeAttribute('hidden');
    if (success) success.textContent = 'Saving your affiliate request...';
    const affiliate = await this.saveAffiliate(payload, success);
    const message = [
      'Hi HDS Consultancy, I want to join the Affiliate Partner Program.',
      `Name: ${name}`,
      `WhatsApp: ${whatsapp}`,
      `Email: ${payload.email || ''}`,
      `Partner Type: ${payload.partner_type || ''}`,
      `Social Media: ${payload.social_media || ''}`,
      affiliate?.affiliate_id ? `Affiliate ID: ${affiliate.affiliate_id}` : '',
      affiliate?.referral_link ? `Referral Link: ${affiliate.referral_link}` : '',
      `Notes: ${payload.notes || ''}`
    ].filter(Boolean).join('\n');
    if (success) {
      success.textContent = affiliate
        ? `Affiliate ID generated: ${affiliate.affiliate_id}. Opening WhatsApp...`
        : 'Backend is not running, opening WhatsApp only...';
    }
    window.setTimeout(() => {
      window.open(`https://wa.me/60122919199?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    }, 450);
  }

  async saveAffiliate(payload, statusEl) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/affiliates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Affiliate API returned ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('Affiliate backend unavailable:', error);
      if (statusEl) {
        statusEl.textContent = 'Could not reach backend. WhatsApp will still open.';
      }
      return null;
    }
  }
}

new AffiliatePage('affiliate-app').init();
