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

class WhatsAppService {
  constructor(number) { this.number = number; }
  link(message) {
    return `https://wa.me/${this.number}?text=${encodeURIComponent(message)}`;
  }
  open(message) {
    window.open(this.link(message), '_blank', 'noopener');
  }
}

class Component {
  constructor(data) { this.data = data; }
  html() { return ''; }
}

class Header extends Component {
  html() {
    const { business, portfolio, clientWebDesign } = this.data;
    return `
      <header class="header">
        <div class="container nav">
          <a href="#home" class="logo" aria-label="${business.name} home">
            <span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span>
            <span><strong>${business.name}</strong><small>${business.tagline}</small></span>
          </a>
          <nav class="nav-links" data-nav-links>
            <a class="active" href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="${portfolio.url}">${portfolio.label}</a>
            <div class="nav-dropdown">
              <button type="button" class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">${clientWebDesign.label} ▾</button>
              <div class="dropdown-menu">
                ${clientWebDesign.projects.map(project => `<a href="${project.liveUrl || project.localPage || `client-web-design.html?id=${project.id}`}">${project.name}</a>`).join('')}
              </div>
            </div>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </nav>
          <div class="nav-actions">
            <button class="theme-toggle" data-theme-toggle aria-label="Toggle theme"><span data-theme-icon>🌙</span></button>
            <a class="btn btn-primary btn-small" href="#booking">Book a Call</a>
            <button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button>
          </div>
        </div>
      </header>`;
  }
}

class Hero extends Component {
  html() {
    const { business, stats, heroMetrics } = this.data;
    const statCards = stats.map(s => `<div class="stat-card"><strong>${s.value}</strong><small>${s.label}</small></div>`).join('');
    const metrics = heroMetrics.map(m => `
      <div class="float-card ${m.position}">
        <small>${m.label}</small>
        <strong>${m.value}</strong>
        <span class="trend">${m.trend}</span>
      </div>`).join('');
    return `
      <section class="hero" id="home">
        <div class="container hero-grid">
          <div class="hero-copy">
            <span class="badge">✦ AI-DRIVEN. RESULTS FOCUSED.</span>
            <h1><span>AI-Powered</span><span class="gradient-text">Marketing.</span><span>Human Impact.</span></h1>
            <p>${business.subtitle}</p>
            <div class="hero-ctas">
              <a class="btn btn-primary" href="#services">Our Services →</a>
              <a class="btn btn-ghost" href="#booking">📅 Book a Free Strategy Call</a>
            </div>
            <div class="stats">${statCards}</div>
          </div>
          <div class="hero-visual" aria-label="AI marketing website illustration">
            <div class="orbit"></div>
            <img class="hero-avatar" src="assets/cartoon-transparent.png" alt="HDS Consultancy AI marketing avatar" />
            ${metrics}
            <div class="app-icon icon-ai">AI</div>
            <div class="app-icon icon-love">♡</div>
            <div class="app-icon icon-bot">🤖</div>
          </div>
        </div>
      </section>`;
  }
}

class Services extends Component {
  html() {
    const cards = this.data.services.map(s => `
      <article class="service-card">
        <div class="service-media">
          <img src="${s.image}" alt="${s.title} service visual" loading="lazy" />
          <span class="service-media-shine"></span>
        </div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <span class="category">${s.category}</span>
      </article>`).join('');
    return `
      <section class="section" id="services">
        <div class="container">
          <div class="section-title">
            <span class="eyebrow">WHAT WE DO</span>
            <h2>End-to-End <span class="gradient-text">Digital & AI</span> Solutions</h2>
            <p>Everything your business needs to launch, automate, market, test, integrate and scale in the digital age.</p>
          </div>
          <div class="service-grid">${cards}</div>
        </div>
      </section>`;
  }
}

class WhyUs extends Component {
  html() {
    return `
      <section class="section" id="about">
        <div class="container split-card">
          <div class="about-image-wrap"><img class="about-avatar" src="assets/cartoon-transparent.png" alt="HDS Consultancy avatar" /></div>
          <div>
            <span class="badge">WHY CHOOSE HDS CONSULTANCY</span>
            <h2>Smart Solutions. <span class="gradient-text">Real Results.</span></h2>
            <p class="muted-copy">We are more than a normal agency. HDS Consultancy blends AI, marketing, web design, automation, cloud and practical delivery experience to help business owners move faster without overcomplicating technology.</p>
            <div class="feature-list">
              <div class="feature-chip"><strong>AI-Powered</strong><small>Smarter automation for better results</small></div>
              <div class="feature-chip"><strong>Data-Driven</strong><small>Insights that guide growth decisions</small></div>
              <div class="feature-chip"><strong>Transparent</strong><small>Clear communication and practical delivery</small></div>
              <div class="feature-chip"><strong>Results-Focused</strong><small>Designed around ROI and business outcomes</small></div>
            </div>
            <a class="btn btn-primary" href="#contact">Learn More About Us →</a>
          </div>
        </div>
      </section>`;
  }
}

class Portfolio extends Component {
  html() {
    const { portfolio } = this.data;
    const cases = this.data.caseStudies.map(c => `
      <article class="case-card">
        <h3>${c.title}</h3>
        <strong>${c.metric}</strong>
        <p>${c.label}<br>${c.period}</p>
        <div class="spark"></div>
      </article>`).join('');
    return `
      <section class="section" id="portfolio">
        <div class="container">
          <div class="section-title">
            <span class="eyebrow">${portfolio.eyebrow}</span>
            <h2>${portfolio.title.split(' & ')[0]} & <span class="gradient-text">${portfolio.title.split(' & ')[1] || 'Growth Signals'}</span></h2>
            <p>${portfolio.subtitle}</p>
          </div>
          <div class="case-grid">${cases}</div>
        </div>
      </section>`;
  }
}


class Careers extends Component {
  html() {
    const { careers } = this.data;
    const benefits = careers.benefits.map(b => `<span>${b}</span>`).join('');
    const roles = careers.roles.map(r => `<option value="${r}">${r}</option>`).join('');
    return `
      <section class="section" id="careers">
        <div class="container career-panel">
          <div class="career-intro">
            <img class="career-avatar" src="assets/cartoon-transparent.png" alt="Join HDS Consultancy team" />
            <span class="badge">CAREERS</span>
            <h2>${careers.headline}</h2>
            <p>${careers.intro}</p>
            <div class="benefit-row">${benefits}</div>
          </div>
          <form class="form-card" data-career-form>
            <h3>Send Career Request</h3>
            <p class="form-note">This opens WhatsApp with your application details ready to send.</p>
            <label>Full Name<input required name="name" type="text" placeholder="Your name"></label>
            <label>Role Interested In<select required name="role"><option value="">Select a role</option>${roles}</select></label>
            <div class="two-fields">
              <label>Phone<input required name="phone" type="tel" placeholder="+60..."></label>
              <label>Email<input required name="email" type="email" placeholder="you@email.com"></label>
            </div>
            <label>Portfolio / LinkedIn<input name="portfolio" type="url" placeholder="https://..."></label>
            <label>Short Message<textarea required name="message" rows="3" placeholder="Tell us about your skills and availability"></textarea></label>
            <label>Resume / CV <span class="limit">max 5MB</span><input name="attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"></label>
            <button class="btn btn-primary" type="submit">Send to WhatsApp →</button>
          </form>
        </div>
      </section>`;
  }
}

class ContactBooking extends Component {
  html() {
    const { business, booking } = this.data;
    const encodedMap = encodeURIComponent(business.mapQuery);
    const serviceOptions = this.data.services.map(s => `<option value="${s.title}">${s.title}</option>`).join('');
    return `
      <section class="section" id="contact">
        <div class="container contact-grid contact-grid-two">
          <div class="location-map-card">
            <div class="info-card location-info-inline">
              <span class="badge">OUR LOCATION</span>
              <h2>Visit Us in Rawang</h2>
              <p><strong>${business.name}</strong><br>${business.location}</p>
              <p>📞 <a href="tel:${business.phonePlain}">${business.phone}</a><br>✉️ <a href="mailto:${business.email}">${business.email}</a></p>
              <a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodedMap}">Get Directions</a>
            </div>
            <div class="map-card map-card-inline">
              <iframe class="map-frame" title="Rawang Map" loading="lazy" src="${business.mapEmbed}"></iframe>
              <div class="map-pin"><span>⌖</span></div>
            </div>
          </div>
          <div class="booking-card" id="booking">
            <span class="badge">BOOK A CALL</span>
            <h2>${booking.headline}</h2>
            <p class="muted-copy small-copy">${booking.subtext}</p>
            <form data-booking-form>
              <div class="two-fields">
                <label>Name<input required name="name" type="text" placeholder="Your name"></label>
                <label>Phone<input required name="phone" type="tel" placeholder="+60..."></label>
              </div>
              <label>Email<input required name="email" type="email" placeholder="you@email.com"></label>
              <label>Service<select required name="service"><option value="">Select service</option>${serviceOptions}</select></label>
              <div class="two-fields">
                <label>Date<input required name="date" type="date"></label>
                <label>Time<select required name="time"><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>02:00 PM</option><option>03:00 PM</option><option>04:00 PM</option></select></label>
              </div>
              <label>Query / Details<textarea required name="message" rows="3" placeholder="Tell us what you need help with"></textarea></label>
              <label>Attachment <span class="limit">max ${booking.attachmentLimitMB}MB</span><input name="attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"></label>
              <div class="form-actions">
                <a class="btn btn-ghost" target="_blank" rel="noopener" href="${booking.calendarLink}">Open Google Calendar</a>
                <button class="btn btn-primary" type="submit">Submit to WhatsApp →</button>
              </div>
              <p class="booking-note">${booking.note}</p>
            </form>
          </div>
        </div>
      </section>`;
  }
}

class Footer extends Component {
  html() {
    const { business } = this.data;
    const socials = business.socials.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${s.icon}</a>`).join('');
    return `
      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <a href="#home" class="logo"><span class="logo-mark"><img class="logo-image" src="assets/cartoon-transparent.png" alt="" /></span><span><strong>${business.name}</strong><small>${business.tagline}</small></span></a>
            <p>AI-powered digital marketing and tech consultancy for websites, automation, cloud, training and business growth.</p>
            <div class="socials">${socials}</div>
          </div>
          <div><h4>Services</h4><a href="#services">All Services</a><a href="#services">Web Solutions</a><a href="#services">AI & Automation</a><a href="#services">Cloud Integration</a></div>
          <div><h4>Company</h4><a href="#about">About Us</a><a href="#services">Services</a><a href="#portfolio">Impact Vault</a><a href="#contact">Contact Us</a></div>
          <div><h4>Contact</h4><a href="tel:${business.phonePlain}">${business.phone}</a><a href="mailto:${business.email}">${business.email}</a><a href="https://wa.me/${business.whatsapp}" target="_blank" rel="noopener">WhatsApp Us</a></div>
        </div>
      </footer>
      <a class="whatsapp-float" target="_blank" rel="noopener" href="https://wa.me/${business.whatsapp}?text=${encodeURIComponent('Hi HDS Consultancy, I would like to enquire about your services.')}">💬</a>`;
  }
}

class App {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.theme = new ThemeManager();
    this.dataService = new DataService();
    this.maxFileSizeMB = 5;
  }
  async init() {
    try {
      this.data = await this.dataService.getData();
      this.whatsapp = new WhatsAppService(this.data.business.whatsapp);
      this.maxFileSizeMB = this.data.booking.attachmentLimitMB || 5;
      this.render();
      this.theme.init();
      this.bindEvents();
    } catch (error) {
      this.root.innerHTML = `<main class="container"><h1>Unable to load website</h1><p>${error.message}</p></main>`;
    }
  }
  render() {
    const components = [
      new Header(this.data), new Hero(this.data), new Services(this.data), new WhyUs(this.data),
      new Portfolio(this.data), new Careers(this.data), new ContactBooking(this.data), new Footer(this.data)
    ];
    this.root.innerHTML = components.map(c => c.html()).join('');
  }
  bindEvents() {
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => this.theme.toggle());
    document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => document.querySelector('[data-nav-links]')?.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.querySelector('[data-nav-links]')?.classList.remove('open')));
    this.bindDropdowns();
    document.querySelector('[data-booking-form]')?.addEventListener('submit', event => this.handleBooking(event));
    document.querySelector('[data-career-form]')?.addEventListener('submit', event => this.handleCareer(event));
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
  validateAttachment(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return { ok: true, fileText: 'No attachment selected' };
    const maxBytes = this.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return { ok: false, fileText: `File is larger than ${this.maxFileSizeMB}MB` };
    return { ok: true, fileText: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)` };
  }
  handleBooking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const attachment = this.validateAttachment(form.elements.attachment);
    if (!attachment.ok) return alert(attachment.fileText);
    const msg = `Hi HDS Consultancy, I would like to book a strategy call.%0A%0AName: ${data.name}%0APhone: ${data.phone}%0AEmail: ${data.email}%0AService: ${data.service}%0APreferred Date: ${data.date}%0APreferred Time: ${data.time}%0AQuery: ${data.message}%0AAttachment: ${attachment.fileText}%0A%0ANote: I will attach the file manually in WhatsApp if required.`;
    this.whatsapp.open(decodeURIComponent(msg));
  }
  handleCareer(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const attachment = this.validateAttachment(form.elements.attachment);
    if (!attachment.ok) return alert(attachment.fileText);
    const msg = `Hi HDS Consultancy, I would like to apply / send a career request.%0A%0AName: ${data.name}%0ARole: ${data.role}%0APhone: ${data.phone}%0AEmail: ${data.email}%0APortfolio/LinkedIn: ${data.portfolio || '-'}%0AMessage: ${data.message}%0AResume/CV: ${attachment.fileText}%0A%0ANote: I will attach the CV manually in WhatsApp if required.`;
    this.whatsapp.open(decodeURIComponent(msg));
  }
}

new App('app').init();
