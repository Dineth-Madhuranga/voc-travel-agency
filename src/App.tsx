import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight, Check, ChevronDown, Clock3, Compass, Facebook, Instagram, Leaf,
  LockKeyhole, Mail, MapPin, Menu, MessageCircle, Mountain, Phone, Search, Send,
  ShieldCheck, Sparkles, Star, TreePine, Users, X, Youtube, RefreshCw
} from 'lucide-react';
type Inquiry = {
  id: string;
  kind: 'booking' | 'contact';
  package_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  arrival_date: string | null;
  travelers: number | null;
  message: string | null;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
};

type Modal = 'booking' | 'contact' | null;

const images = {
  hero: 'https://images.pexels.com/photos/16200320/pexels-photo-16200320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  train: 'https://images.pexels.com/photos/321569/pexels-photo-321569.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  beach: 'https://images.pexels.com/photos/11629009/pexels-photo-11629009.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  elephant: 'https://images.pexels.com/photos/322482/pexels-photo-322482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  temple: 'https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const packages = [
  { id: 'heritage', number: '01', title: 'Roots of Ceylon & Indigenous Heritage', tag: 'Culture & Indigenous', duration: '10 days / 9 nights', image: '/images/IMG_1682.JPG.jpeg', description: "Meet the living heart of the island through ancient cities, sacred sites and a genuine visit with the Vedda community of Dambana.", highlights: ['Sigiriya & Polonnaruwa', 'Vedda forest immersion', 'Kandy cultural triangle'], bestFor: 'History lovers and curious travelers' },
  { id: 'adventure', number: '02', title: 'Island Thrills & Mountain Peaks', tag: 'Adventure & Nature', duration: '08 days / 07 nights', image: '/images/secondimage.jpg', description: 'Trade the ordinary for white-water rivers, cool cloud forests, hidden waterfalls and the unforgettable Ella train journey.', highlights: ['Kitulgala rafting', "World’s End hike", 'Ella zipline & trekking'], bestFor: 'Hikers, explorers and adrenaline seekers' },
  { id: 'wildlife', number: '03', title: 'Wild Ceylon: Giants & Predators', tag: 'Wildlife & Eco Safari', duration: '09 days / 08 nights', image: '/images/IMG_2877.JPG.jpeg', description: 'Follow the island’s wild pulse through national parks, searching for leopards, elephants, sloth bears and endemic birds.', highlights: ['Wilpattu & Minneriya', 'Udawalawe elephants', 'Yala leopard safari'], bestFor: 'Wildlife lovers and photographers' },
  { id: 'wellness', number: '04', title: 'Mindful Serenity & Herbal Healing', tag: 'Wellness & Ayurveda', duration: '07 days / 06 nights', image: '/images/IMG_1682.JPG.jpeg', description: 'A restorative journey of Ayurveda, sunrise yoga, herbal rituals and nourishing island cuisine in tranquil surroundings.', highlights: ['Resident Ayurvedic doctor', 'Daily healing rituals', 'Kandy meditation'], bestFor: 'Wellness seekers and couples' },
  { id: 'coastal', number: '05', title: 'Tropical Coastal Romance', tag: 'Luxury Beach & Honeymoon', duration: '08 days / 07 nights', image: images.beach, description: 'Slow down on golden beaches with private cruises, UNESCO heritage walks and intimate dinners by the Indian Ocean.', highlights: ['Galle Dutch Fort', 'Whale watching', 'Private sunset cruise'], bestFor: 'Honeymooners and luxury travelers' },
  { id: 'ultimate', number: '06', title: 'The Ultimate Pearl of Ceylon', tag: 'Grand Island Explorer', duration: '14 days / 13 nights', image: '/images/IMG_1680.JPG.jpeg', description: 'The complete island story: indigenous encounters, tea country, epic train rides, wildlife, heritage and the sea.', highlights: ['Cultural triangle', 'Tea country by train', 'Yala to Galle coast'], bestFor: 'First-time visitors and long stays' },
];

const experiences = [
  { icon: Users, title: 'Dambana village visit', text: 'Listen to stories, learn traditional craft and walk with local knowledge keepers.' },
  { icon: Mountain, title: 'Tea-country rail', text: 'Wind through emerald highlands on one of the world’s most beautiful train rides.' },
  { icon: TreePine, title: 'Wildlife with purpose', text: 'Travel gently, support conservation and see Sri Lanka’s giants in their home.' },
];

function useScrollTo() {
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 72;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function App() {
  const [modal, setModal] = useState<Modal>(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [admin, setAdmin] = useState(window.location.pathname === '/admin');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [parallax, setParallax] = useState(0);
  const scrollTo = useScrollTo();

  useEffect(() => {
    const handlePopState = () => setAdmin(window.location.pathname === '/admin');
    window.addEventListener('popstate', handlePopState);
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled(y > 40);
          setParallax(y * 0.35);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('popstate', handlePopState); window.removeEventListener('scroll', onScroll); };
  }, []);

  const openBooking = (packageName = '') => { setSelectedPackage(packageName); setModal('booking'); };
  if (admin) return <AdminPage onExit={() => { window.history.pushState(null, '', '/'); setAdmin(false); }} />;

  return (
    <div className="site-shell">
      <header className={`nav-wrap ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <nav className="nav container">
          <a className="brand" href="#top" aria-label="Voice of Indigenous Travel home">
            <img src="/images/logo.png" alt="Voice of Indigenous" style={{ height: '60px' }} />
          </a>
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#journey" onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollTo('journey'); }}>Our story</a>
            <a href="#packages" onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollTo('packages'); }}>Journeys</a>
            <a href="#experiences" onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollTo('experiences'); }}>Experiences</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollTo('contact'); }}>Contact</a>
            <button className="button button-small" onClick={() => openBooking()}>Plan my trip <ArrowRight size={15} /></button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <video className="hero-video" autoPlay loop muted playsInline style={{ transform: `scale(1.15) translateY(${parallax}px)` }}>
            <source src="/videos/herovideo.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
          <div className="hero-content container">
            <div className="eyebrow light"><span /> Travel deeper · live more</div>
            <h1>Where the island<br /><em>speaks for itself.</em></h1>
            <p>Authentic journeys through Sri Lanka’s living heritage, wild landscapes and generous local spirit.</p>
            <div className="hero-actions"><button className="button button-gold" onClick={() => scrollTo('packages')}>Explore journeys <ArrowRight size={17} /></button><button className="text-link light-link" onClick={() => openBooking()}>Build my island story <span>↗</span></button></div>
          </div>

        </section>

        <section className="intro section container" id="journey">
          <Reveal><div className="intro-art"><img src="/images/IMG_2735.JPG.jpeg" alt="Voice of Indigenous Journey" /><span className="vertical-label">A LIVING ISLAND</span></div></Reveal>
          <Reveal delay={150}><div className="intro-copy"><div className="eyebrow"><span /> The Voice of Indigenous</div><h2>Not just a place<br /><em>to visit.</em></h2><p className="lead">Sri Lanka is a story still being written — in forest paths, family kitchens, ancient rituals and the smiles of people who call this island home.</p><p>We create thoughtful, small-scale journeys that take you beyond the checklist. Our trips connect you with local hosts, indigenous knowledge and the landscapes that make Ceylon unforgettable.</p><button className="text-link" onClick={() => openBooking()}>Meet the island on its terms <ArrowRight size={16} /></button></div></Reveal>
        </section>

        <section className="statement"><div className="statement-image" /><div className="statement-overlay" /><Reveal><div className="container statement-inner"><div className="statement-eyebrow">Made for the curious</div><p>Come as a<br />traveller.<br /><span className="italic-text">Leave as a friend.</span></p></div></Reveal></section>

        <section className="section packages-section" id="packages"><div className="container"><Reveal><div className="section-heading"><div><div className="eyebrow"><span /> Curated journeys</div><h2>Six ways to feel<br /><em>the soul of Ceylon.</em></h2></div><p>From first light in the highlands to salt air on the south coast, choose the pace and feeling that calls to you.</p></div></Reveal><div className="package-grid">{packages.map((item, index) => <Reveal key={item.id} delay={index * 100}><PackageCard item={item} featured={index === 0} onBook={() => openBooking(item.title)} /></Reveal>)}</div></div></section>

        <section className="experience-section section" id="experiences"><div className="container"><Reveal><div className="experience-heading"><div className="eyebrow light"><span /> Go beyond the itinerary</div><h2>Small moments.<br /><em>Big meaning.</em></h2><p>Travel becomes memorable when you leave space for the unexpected. These are the encounters our guests carry home.</p></div></Reveal><div className="experience-list">{experiences.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 120}><div className="experience-item"><span className="experience-number">0{i + 1}</span><Icon size={23} strokeWidth={1.4} /><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={18} /></div></Reveal>)}</div></div></section>

        <section className="promise section container"><Reveal><div className="promise-photo"><img src={images.elephant} alt="Elephants in the Sri Lankan wild" /><div className="photo-caption"><span>We leave a lighter footprint</span><small>Slow travel · local hosts · living heritage</small></div></div></Reveal><Reveal delay={150}><div className="promise-copy"><div className="eyebrow"><span /> Our promise</div><h2>See more.<br /><em>Take less.</em></h2><p className="lead">We believe an exceptional journey should enrich the places it touches.</p><div className="promise-points"><div><Check size={15} /><span>Local guides, local livelihoods</span></div><div><Check size={15} /><span>Respect for culture and tradition</span></div><div><Check size={15} /><span>Wildlife and nature, protected</span></div></div><button className="button button-dark" onClick={() => setModal('contact')}>Talk to our travel experts <ArrowRight size={16} /></button></div></Reveal></section>

        <ContactSection />
      </main>

      <footer className="footer"><div className="container footer-grid"><div><a className="brand footer-brand" href="#top"><img src="/images/logo.png" alt="Voice of Indigenous" style={{ height: '60px' }} /></a><p>Travel with meaning.<br />Return with a story.</p></div><div><h4>Explore</h4><a href="#packages">Journeys</a><a href="#experiences">Experiences</a><a href="#journey">Our story</a></div><div><h4>Connect</h4><a href="mailto:infovoiceylontravels@gmail.com">Email us</a><a href="tel:0766724916">0766724916</a><span style={{ display: 'block', color: 'var(--ink)', marginTop: '0.5rem', fontSize: '0.85rem' }}>193/Katugastota, Kandy</span></div><div><h4>Follow the journey</h4><div className="socials"><a href="#contact"><Instagram size={17} /></a><a href="https://www.facebook.com/share/19T8uZUnjn/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><Facebook size={17} /></a><a href="#contact"><Youtube size={17} /></a></div></div></div><div className="footer-bottom container"><p className="footer-note">© {new Date().getFullYear()} Voice of Indigenous. All rights reserved.</p></div></footer>
      {modal && <InquiryModal type={modal} selectedPackage={selectedPackage} onClose={() => setModal(null)} />}
    </div>
  );
}

function PackageCard({ item, featured, onBook }: { item: typeof packages[number]; featured: boolean; onBook: () => void }) {
  return <article className={`package-card ${featured ? 'featured' : ''}`}><div className="package-image"><img src={item.image} alt={item.title} loading="lazy" /><span className="package-number">{item.number}</span><span className="package-tag">{item.tag}</span></div><div className="package-body"><div className="package-meta"><Clock3 size={14} /> {item.duration}</div><h3>{item.title}</h3><p>{item.description}</p><div className="highlight-list">{item.highlights.map((point) => <span key={point}><Check size={13} /> {point}</span>)}</div><div className="package-footer"><small>Best for <b>{item.bestFor}</b></small><button className="icon-button" onClick={onBook} aria-label={`Book ${item.title}`}><ArrowRight size={17} /></button></div></div></article>;
}

function InquiryModal({ type, selectedPackage, onClose }: { type: 'booking' | 'contact'; selectedPackage: string; onClose: () => void }) {
  const isBooking = type === 'booking';
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', arrival_date: '', travelers: '2', message: '', package_name: selectedPackage });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, kind: type, travelers: isBooking ? Number(form.travelers) : null };
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setSaving(false); setSent(true);
    } catch (cause) {
      console.error('inquiry submission failed', cause);
      setError('We could not send that just now. Please try again or email us directly.');
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-panel"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>{sent ? <div className="success-state"><span className="success-icon"><Check /></span><div className="eyebrow"><span /> Message received</div><h2>Your island story<br /><em>starts here.</em></h2><p>Thank you, {form.name.split(' ')[0] || 'traveler'}. Our travel team will be in touch soon with thoughtful next steps.</p><button className="button button-dark" onClick={onClose}>Back to the journey <ArrowRight size={16} /></button></div> : <><div className="modal-kicker"><Compass size={16} /> {isBooking ? 'Plan a private journey' : 'Say hello'}</div><h2>{isBooking ? <>Let’s make it<br /><em>personal.</em></> : <>Tell us what’s<br /><em>on your mind.</em></>}</h2><p className="modal-intro">{isBooking ? 'Share a few details and our travel designers will begin shaping your Sri Lanka.' : 'We’d love to hear from you. Ask a question, share an idea or simply say hello.'}</p><form onSubmit={submit}><div className="form-grid"><label>Full name<input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" /></label><label>Phone / WhatsApp<input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555 000 000" /></label>{isBooking && <label>Arrival date<input required type="date" value={form.arrival_date} onChange={(e) => update('arrival_date', e.target.value)} /></label>}{isBooking && <label>Travelers<select value={form.travelers} onChange={(e) => update('travelers', e.target.value)}><option value="1">1 traveler</option><option value="2">2 travelers</option><option value="3">3 travelers</option><option value="4">4 travelers</option><option value="5">5+ travelers</option></select></label>}{isBooking && <label>Journey of interest<select value={form.package_name} onChange={(e) => update('package_name', e.target.value)}><option value="">I’m not sure yet</option>{packages.map((item) => <option key={item.id} value={item.title}>{item.title}</option>)}</select></label>}</div><label>{isBooking ? 'What would make this trip yours?' : 'Your message'}<textarea required={!isBooking} rows={4} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder={isBooking ? 'Tell us what you are dreaming of...' : 'How can we help?'} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark form-submit" disabled={saving}>{saving ? 'Sending...' : isBooking ? 'Send my enquiry' : 'Send message'} <Send size={16} /></button><small className="privacy-note"><ShieldCheck size={13} /> Your details are only used to plan your journey.</small></form></>}</div></div>;
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', arrival_date: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kind: 'contact', status: 'new' }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setSent(true);
    } catch (cause) {
      console.error('contact submission failed', cause);
      setError('We could not send that just now. Please try again or email us directly.');
    } finally {
      setSaving(false);
    }
  };

  return <section className="contact-section" id="contact"><div className="container contact-layout"><Reveal><div className="contact-copy"><div className="eyebrow"><span /> Start a conversation</div><h2>Your island<br />story<br /><em>starts here.</em></h2><p>Tell us what pulls you towards Sri Lanka. We will come back with a thoughtful first sketch for your journey.</p><a className="contact-email" href="mailto:infovoiceylontravels@gmail.com">infovoiceylontravels@gmail.com <ArrowRight size={15} /></a></div></Reveal><Reveal delay={150}><div className="contact-form-wrap">{sent ? <div className="contact-success"><span className="success-icon"><Check /></span><h3>Thank you for reaching out.</h3><p>Our travel team will be in touch soon with the first sketch of your journey.</p><button className="text-link" onClick={() => { setSent(false); setForm({ name: '', email: '', arrival_date: '', message: '' }); }}>Send another enquiry <ArrowRight size={15} /></button></div> : <form className="contact-form" onSubmit={submit}><label><span>Your name</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></label><label><span>Email address</span><input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email address" /></label><label><span>When would you like to travel?</span><input type="date" value={form.arrival_date} onChange={(e) => update('arrival_date', e.target.value)} /></label><label><span>What would make this journey yours?</span><textarea required rows={3} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Tell us a little about what you are dreaming of..." /></label>{error && <p className="form-error">{error}</p>}<button className="contact-submit" disabled={saving}>{saving ? 'Sending...' : 'Send enquiry'} <Send size={17} /></button></form>}</div></Reveal></div></section>;
}

function AdminPage({ onExit }: { onExit: () => void }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [authError, setAuthError] = useState(''); const [inquiries, setInquiries] = useState<Inquiry[]>([]); const [filter, setFilter] = useState<'all' | Inquiry['status']>('all');
  
  useEffect(() => { if (token) loadInquiries(); }, [token]);
  
  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401) signOut();
        throw new Error('Failed to load');
      }
      const data = await res.json();
      setInquiries(data);
    } catch (err) { console.error(err); }
  };
  
  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setAuthError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error('Sign-in failed');
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch (err) {
      setAuthError('That sign-in did not work. Check your details and try again.');
    }
  };
  
  const signOut = () => { localStorage.removeItem('adminToken'); setToken(null); };
  
  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) setInquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    } catch (err) { console.error(err); }
  };
  
  const visible = useMemo(() => filter === 'all' ? inquiries : inquiries.filter((item) => item.status === filter), [filter, inquiries]);
  
  if (authLoading) return <div className="admin-loading">Opening the private inbox...</div>;
  if (!token) return <div className="admin-login"><div className="admin-login-card"><button className="back-home" onClick={onExit}>← Back to website</button><img src="/images/logo.png" alt="Voice of Indigenous" style={{ height: '64px', margin: '0 auto 1.5rem', display: 'block' }} /><h1>Admin <em>Inbox</em></h1><p>Sign in to view new journey enquiries and messages.</p><form onSubmit={signIn}><label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{authError && <p className="form-error">{authError}</p>}<button className="button button-dark form-submit">Open inbox <LockKeyhole size={15} /></button></form></div></div>;
  return <div className="admin-shell"><aside className="admin-sidebar"><a className="brand" href="#top"><img src="/images/logo.png" alt="Logo" style={{ height: '36px' }} /><span>Voice of <b>Indigenous</b><small>Staff workspace</small></span></a><div className="admin-nav"><span className="active"><Mail size={16} /> Enquiries</span><button onClick={onExit}><ArrowRight size={16} /> View website</button></div><div className="admin-sidebar-bottom"><span>Admin</span><button onClick={signOut}>Sign out</button></div></aside><main className="admin-main"><div className="admin-top"><div><h1>Good morning, <em>Admin.</em></h1></div><button className="button button-dark" aria-label="Refresh inbox" onClick={() => loadInquiries()}><RefreshCw size={16} /></button></div><div className="admin-stats"><div><small>All enquiries</small><strong>{inquiries.length}</strong></div><div><small>Needs attention</small><strong>{inquiries.filter((i) => i.status === 'new').length}</strong></div><div><small>Bookings</small><strong>{inquiries.filter((i) => i.kind === 'booking').length}</strong></div><div><small>Messages</small><strong>{inquiries.filter((i) => i.kind === 'contact').length}</strong></div></div><div className="inbox-toolbar"><h2>Latest enquiries</h2><div className="filter-tabs">{(['all', 'new', 'contacted', 'closed'] as const).map((item) => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="inquiry-list">{visible.length === 0 ? <div className="empty-inbox"><Mail size={25} /><h3>No enquiries here yet</h3><p>New trip requests will appear in this inbox.</p></div> : visible.map((item) => <article className="inquiry-row" key={item.id}><div className={`inquiry-badge ${item.kind}`}>{item.kind === 'booking' ? 'Booking' : 'Message'}</div><div className="inquiry-main"><div className="inquiry-title"><h3>{item.name}</h3><span>{new Date(item.created_at).toLocaleDateString()}</span></div><p>{item.package_name || item.message || 'No details provided.'}</p><div className="inquiry-details"><a href={`mailto:${item.email}`}><Mail size={13} /> {item.email}</a>{item.phone && <a href={`tel:${item.phone}`}><Phone size={13} /> {item.phone}</a>}{item.arrival_date && <span><MapPin size={13} /> Arriving {item.arrival_date}</span>}</div></div><select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as Inquiry['status'])}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></article>)}</div></main></div>;
}

export default App;
