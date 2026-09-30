import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight, Check, ChevronDown, Clock3, Compass, Facebook, Instagram, Leaf,
  LockKeyhole, Mail, MapPin, Menu, MessageCircle, Mountain, Phone, Search, Send,
  ShieldCheck, Sparkles, Star, TreePine, Users, X, Youtube, RefreshCw, BookOpen
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
  { id: 'wellness', number: '04', title: 'Mindful Serenity & Herbal Healing', tag: 'Wellness & Ayurveda', duration: '07 days / 06 nights', image: '/images/wellness-ayurveda.jpg', description: 'A restorative journey of Ayurveda, sunrise yoga, herbal rituals and nourishing island cuisine in tranquil surroundings.', highlights: ['Resident Ayurvedic doctor', 'Daily healing rituals', 'Kandy meditation'], bestFor: 'Wellness seekers and couples' },
  { id: 'coastal', number: '05', title: 'Tropical Coastal Romance', tag: 'Luxury Beach & Honeymoon', duration: '08 days / 07 nights', image: images.beach, description: 'Slow down on golden beaches with private cruises, UNESCO heritage walks and intimate dinners by the Indian Ocean.', highlights: ['Galle Dutch Fort', 'Whale watching', 'Private sunset cruise'], bestFor: 'Honeymooners and luxury travelers' },
  { id: 'ultimate', number: '06', title: 'The Ultimate Pearl of Ceylon', tag: 'Grand Island Explorer', duration: '14 days / 13 nights', image: '/images/IMG_1680.JPG.jpeg', description: 'The complete island story: indigenous encounters, tea country, epic train rides, wildlife, heritage and the sea.', highlights: ['Cultural triangle', 'Tea country by train', 'Yala to Galle coast'], bestFor: 'First-time visitors and long stays' },
  { id: 'ramayana', number: '07', title: '7-Day Legendary Ramayana Trail', tag: 'Spiritual & Pilgrimage', duration: '07 days / 06 nights', image: '/images/ramayana-trail.jpg', description: 'Experience the ancient epic in the tropical paradise of Sri Lanka. Discover sacred sites, historic temples and breathtaking landscapes linked to King Ravana, Lord Rama, Seetha Devi and Lord Hanuman.', highlights: ['100% Authentic Ramayana Sites', 'Pure Vegetarian & Jain Meals', 'Temple Puja Arrangements'], bestFor: 'Spiritual seekers, pilgrims & devotees', hasItinerary: true },
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
  const [ramayanaOpen, setRamayanaOpen] = useState(false);
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
            <a href="#gallery" onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollTo('gallery'); }}>Gallery</a>
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

        <section className="section packages-section" id="packages"><div className="container"><Reveal><div className="section-heading"><div><div className="eyebrow"><span /> Curated journeys</div><h2>Seven ways to feel<br /><em>the soul of Ceylon.</em></h2></div><p>From first light in the highlands to salt air on the south coast, choose the pace and feeling that calls to you.</p></div></Reveal><div className="package-grid">{packages.map((item, index) => <Reveal key={item.id} delay={index * 100}><PackageCard item={item} featured={index === 0} onBook={() => openBooking(item.title)} onItinerary={item.hasItinerary ? () => setRamayanaOpen(true) : undefined} /></Reveal>)}</div></div></section>

        <section className="experience-section section" id="experiences"><div className="container"><Reveal><div className="experience-heading"><div className="eyebrow light"><span /> Go beyond the itinerary</div><h2>Small moments.<br /><em>Big meaning.</em></h2><p>Travel becomes memorable when you leave space for the unexpected. These are the encounters our guests carry home.</p></div></Reveal><div className="experience-list">{experiences.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 120}><div className="experience-item"><span className="experience-number">0{i + 1}</span><Icon size={23} strokeWidth={1.4} /><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={18} /></div></Reveal>)}</div></div></section>

        <GallerySection />

        <section className="promise section container"><Reveal><div className="promise-photo"><img src={images.elephant} alt="Elephants in the Sri Lankan wild" /><div className="photo-caption"><span>We leave a lighter footprint</span><small>Slow travel · local hosts · living heritage</small></div></div></Reveal><Reveal delay={150}><div className="promise-copy"><div className="eyebrow"><span /> Our promise</div><h2>See more.<br /><em>Take less.</em></h2><p className="lead">We believe an exceptional journey should enrich the places it touches.</p><div className="promise-points"><div><Check size={15} /><span>Local guides, local livelihoods</span></div><div><Check size={15} /><span>Respect for culture and tradition</span></div><div><Check size={15} /><span>Wildlife and nature, protected</span></div></div><button className="button button-dark" onClick={() => setModal('contact')}>Talk to our travel experts <ArrowRight size={16} /></button></div></Reveal></section>

        <ContactSection />
      </main>

      <footer className="footer"><div className="container footer-grid"><div><a className="brand footer-brand" href="#top"><img src="/images/logo.png" alt="Voice of Indigenous" style={{ height: '60px' }} /></a><p>Travel with meaning.<br />Return with a story.</p></div><div><h4>Explore</h4><a href="#packages">Journeys</a><a href="#experiences">Experiences</a><a href="#journey">Our story</a></div><div><h4>Connect</h4><a href="mailto:infovoiceylontravels@gmail.com">Email us</a><a href="tel:0766724916">0766724916</a><span style={{ display: 'block', color: 'var(--ink)', marginTop: '0.5rem', fontSize: '0.85rem' }}>193/Katugastota, Kandy</span></div><div><h4>Follow the journey</h4><div className="socials"><a href="#contact"><Instagram size={17} /></a><a href="https://www.facebook.com/share/19T8uZUnjn/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><Facebook size={17} /></a><a href="#contact"><Youtube size={17} /></a></div></div></div><div className="footer-bottom container"><p className="footer-note">© {new Date().getFullYear()} Voice of Indigenous. All rights reserved.</p></div></footer>
      {modal && <InquiryModal type={modal} selectedPackage={selectedPackage} onClose={() => setModal(null)} />}
      {ramayanaOpen && <RamayanaItineraryModal onClose={() => setRamayanaOpen(false)} onBook={() => { setRamayanaOpen(false); openBooking('7-Day Legendary Ramayana Trail'); }} />}
    </div>
  );
}

/* ─── Gallery ─── */
const galleryItems = [
  { src: '/images/gallery/IMG-20260301-WA0067.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Highland Serenity' },
  { src: '/images/gallery/IMG-20260301-WA0058.jpg.jpeg', type: 'image' as const, category: 'culture',   caption: 'Cultural Roots' },
  { src: '/images/gallery/IMG-20260213-WA0008.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Island Wilderness' },
  { src: '/images/gallery/IMG-20260301-WA0057.jpg.jpeg', type: 'image' as const, category: 'wildlife',  caption: 'Wild Ceylon' },
  { src: '/images/gallery/IMG-20260306-WA0017.jpg.jpeg', type: 'image' as const, category: 'culture',   caption: 'Living Heritage' },
  { src: '/images/gallery/IMG-20260301-WA0059.jpg.jpeg', type: 'image' as const, category: 'wildlife',  caption: "Nature's Giants" },
  { src: '/images/gallery/IMG-20260301-WA0066.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Emerald Highlands' },
  { src: '/images/gallery/IMG-20260306-WA0002.jpg.jpeg', type: 'image' as const, category: 'culture',   caption: 'Sacred Moments' },
  { src: '/images/gallery/IMG-20260915-WA0012.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Golden Hour' },
  { src: '/images/gallery/IMG-20260915-WA0009.jpg.jpeg', type: 'image' as const, category: 'culture',   caption: 'Island Memories' },
  { src: '/images/gallery/IMG-20240920-WA0009.jpg.jpeg', type: 'image' as const, category: 'wildlife',  caption: 'Gentle Encounters' },
  { src: '/images/gallery/IMG-20260915-WA0003.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Coastal Light' },
  { src: '/images/gallery/IMG-20240728-WA0000.jpg.jpeg', type: 'image' as const, category: 'culture',   caption: 'Local Spirit' },
  { src: '/images/gallery/IMG-20260915-WA0013.jpg.jpeg', type: 'image' as const, category: 'landscape', caption: 'Timeless Ceylon' },
  { src: '/images/gallery/IMG_5338.JPG.jpeg',            type: 'image' as const, category: 'landscape', caption: 'Ceylon Moments' },
  { src: '/images/gallery/VID-20260915-WA0020.mp4',      type: 'video' as const, category: 'landscape', caption: 'Ceylon in Motion' },
];

const galleryCategories = ['all', 'landscape', 'wildlife', 'culture'] as const;
type GalleryCategory = typeof galleryCategories[number];

function GallerySection() {
  const [filter, setFilter] = useState<GalleryCategory>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'all' ? galleryItems : galleryItems.filter(g => g.category === filter);

  const openLb = (idx: number) => { setLightbox(idx); document.body.style.overflow = 'hidden'; };
  const closeLb = () => { setLightbox(null); document.body.style.overflow = ''; };
  const goPrev = (e?: MouseEvent) => { e?.stopPropagation(); setLightbox(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null); };
  const goNext = (e?: MouseEvent) => { e?.stopPropagation(); setLightbox(i => i !== null ? (i + 1) % filtered.length : null); };

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') closeLb();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, filtered.length]);

  const active = lightbox !== null ? filtered[lightbox] : null;

  return (
    <section className="gallery-section section" id="gallery">
      <div className="container">
        <Reveal>
          <div className="gallery-header">
            <div>
              <div className="eyebrow"><span /> Captured moments</div>
              <h2>Through the<br /><em>lens of Ceylon.</em></h2>
            </div>
            <p>Every frame a feeling — the people, places and wild beauty that make Sri Lanka unforgettable.</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="gallery-filters">
            {galleryCategories.map(cat => (
              <button
                key={cat}
                className={`gallery-filter-btn${filter === cat ? ' active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All photos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="gallery-masonry">
          {filtered.map((item, idx) => (
            <Reveal key={item.src + filter} delay={idx * 50}>
              <button
                className="gallery-tile"
                onClick={() => openLb(idx)}
                aria-label={`Open ${item.caption}`}
              >
                {item.type === 'video' ? (
                  <>
                    <video src={item.src} muted playsInline className="gallery-tile-media" />
                    <div className="gallery-tile-play-icon">▶</div>
                  </>
                ) : (
                  <img src={item.src} alt={item.caption} loading="lazy" className="gallery-tile-media" />
                )}
                <div className="gallery-tile-overlay">
                  <span className="gallery-tile-caption">{item.caption}</span>
                  <span className="gallery-tile-cat">{item.category}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightbox !== null && active && (
        <div className="gallery-lightbox" onClick={closeLb}>
          <button className="gallery-lb-close" onClick={closeLb} aria-label="Close lightbox">✕</button>
          <button className="gallery-lb-nav gallery-lb-prev" onClick={goPrev} aria-label="Previous">&#8249;</button>
          <div className="gallery-lb-content" onClick={e => e.stopPropagation()}>
            {active.type === 'video' ? (
              <video key={active.src} src={active.src} controls autoPlay className="gallery-lb-media" />
            ) : (
              <img key={active.src} src={active.src} alt={active.caption} className="gallery-lb-media" />
            )}
            <div className="gallery-lb-meta">
              <span className="gallery-lb-caption">{active.caption}</span>
              <span className="gallery-lb-count">{lightbox + 1} / {filtered.length}</span>
            </div>
          </div>
          <button className="gallery-lb-nav gallery-lb-next" onClick={goNext} aria-label="Next">&#8250;</button>
        </div>
      )}
    </section>
  );
}

function PackageCard({ item, featured, onBook, onItinerary }: { item: typeof packages[number]; featured: boolean; onBook: () => void; onItinerary?: () => void }) {
  return <article className={`package-card ${featured ? 'featured' : ''}`}><div className="package-image"><img src={item.image} alt={item.title} loading="lazy" /><span className="package-number">{item.number}</span><span className="package-tag">{item.tag}</span></div><div className="package-body"><div className="package-meta"><Clock3 size={14} /> {item.duration}</div><h3>{item.title}</h3><p>{item.description}</p><div className="highlight-list">{item.highlights.map((point) => <span key={point}><Check size={13} /> {point}</span>)}</div><div className="package-footer"><small>Best for <b>{item.bestFor}</b></small><div style={{ display: 'flex', gap: '0.5rem' }}>{onItinerary && <button className="icon-button" onClick={onItinerary} aria-label={`View ${item.title} itinerary`} title="View full itinerary"><BookOpen size={16} /></button>}<button className="icon-button" onClick={onBook} aria-label={`Book ${item.title}`}><ArrowRight size={17} /></button></div></div></div></article>;
}

const ramayanaItinerary = [
  {
    day: 'Day 1', title: 'Arrival & Journey to Chilaw & Kandy',
    items: [
      { label: 'Morning', text: 'Welcome at Bandaranaike International Airport (CMB) by our representative.' },
      { label: 'Visit', text: 'Munneswaram Temple (Chilaw) — the sacred place where Lord Rama prayed to Lord Shiva after defeating Ravana.' },
      { label: 'Visit', text: 'Manavari Temple — the first place where Lord Rama installed a Shiva Lingam (Ramalingam).' },
      { label: 'Evening', text: 'Travel to Kandy, check-in to hotel, and attend the Evening Puja at the Temple of the Sacred Tooth Relic.' },
      { label: 'Stay', text: 'Kandy' },
    ],
  },
  {
    day: 'Day 2', title: 'Kandy to Nuwara Eliya (Through the Sacred Hills)',
    items: [
      { label: 'Morning', text: 'Enjoy breakfast and visit the Royal Botanical Gardens, Peradeniya.' },
      { label: 'En Route', text: 'Sri Bhakta Hanuman Temple (Ramboda) — built by the Chinmaya Mission, located where Lord Hanuman searched for Seetha Devi.' },
      { label: 'En Route', text: 'Ramboda Waterfalls — scenic stop along the route.' },
      { label: 'En Route', text: 'Tea Factory & Plantation Tour — experience Sri Lanka\'s world-famous Ceylon Tea.' },
      { label: 'Evening', text: 'Explore Nuwara Eliya town (Little England) and Gregory Lake.' },
      { label: 'Stay', text: 'Nuwara Eliya' },
    ],
  },
  {
    day: 'Day 3', title: 'Exploring Seetha Eliya & Ashok Vatika',
    items: [
      { label: 'Morning', text: 'Seetha Amman Temple (Ashok Vatika) — the exact site where Seetha Devi was held captive by King Ravana. See the footprints believed to be of Lord Hanuman near the stream.' },
      { label: 'Morning', text: 'Hakgala Botanical Garden — believed to be part of the pleasure garden (Ashok Vatika) built by Ravana.' },
      { label: 'Afternoon', text: 'Visit Divurumpola Temple — the sacred place where Seetha Devi underwent the Agni Pariksha (test of purity).' },
      { label: 'Evening', text: 'Leisure time in Nuwara Eliya.' },
      { label: 'Stay', text: 'Nuwara Eliya' },
    ],
  },
  {
    day: 'Day 4', title: 'Nuwara Eliya to Ella & Kataragama',
    items: [
      { label: 'Morning', text: 'Drive towards Ella.' },
      { label: 'Visit', text: 'Ravana Cave & Ravana Ella Falls — legendary caves used by King Ravana and the iconic waterfall.' },
      { label: 'Afternoon', text: 'Proceed to Kataragama.' },
      { label: 'Evening', text: 'Attend the mystical evening Puja at Kataragama Sanctuary (Kataragama Devalaya), dedicated to Lord Murugan (Skanda), who was invoked by Lord Rama before the battle.' },
      { label: 'Stay', text: 'Kataragama / Tissamaharama' },
    ],
  },
  {
    day: 'Day 5', title: 'Kataragama to Galle & Bentota',
    items: [
      { label: 'Morning', text: 'Travel along the southern coastal line to Galle.' },
      { label: 'Visit', text: 'Rumasalla Hill (Unawatuna) — believed to be a piece of the Sanjeevani mountain dropped by Lord Hanuman when bringing medicinal herbs for Lakshmana.' },
      { label: 'Visit', text: 'Galle Dutch Fort — UNESCO World Heritage Site exploration.' },
      { label: 'Evening', text: 'Relax on the golden beaches of Bentota.' },
      { label: 'Stay', text: 'Bentota' },
    ],
  },
  {
    day: 'Day 6', title: 'Bentota to Colombo (City Tour & Temples)',
    items: [
      { label: 'Morning', text: 'Optional Water Sports or Madu River Boat Safari in Balapitiya.' },
      { label: 'Afternoon', text: 'Drive to Colombo.' },
      { label: 'Visit', text: 'Panchamuga Anjaneyar Temple (Dehiwala) — the world\'s first temple dedicated to the five-faced Hanuman.' },
      { label: 'Visit', text: 'Kelaniya Raja Maha Viharaya — the throne of King Vibhishana (Ravana\'s brother, who supported Lord Rama).' },
      { label: 'Evening', text: 'Colombo City Shopping & Sightseeing (Galle Face Green, Pettah Market).' },
      { label: 'Stay', text: 'Colombo' },
    ],
  },
  {
    day: 'Day 7', title: 'Departure',
    items: [
      { label: 'Morning', text: 'Breakfast at hotel.' },
      { label: 'Transfer', text: 'Transfer to Bandaranaike International Airport for departure with divine memories of the Ramayana Trail.' },
    ],
  },
];

function RamayanaItineraryModal({ onClose, onBook }: { onClose: () => void; onBook: () => void }) {
  const [activeDay, setActiveDay] = useState(0);
  return (
    <div className="modal-backdrop ramayana-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ramayana-modal">
        <div className="ramayana-hero">
          <img src="/images/ramayana-modal-hero.jpg" alt="Ramayana Trail Sri Lanka" />
          <div className="ramayana-hero-overlay" />
          <div className="ramayana-hero-content">
            <div className="eyebrow light"><span /> Spiritual &amp; Pilgrimage · 07 Days / 06 Nights</div>
            <h2>7-Day Legendary<br /><em>Ramayana Trail</em></h2>
            <p>Organized by Voice of Indigenous Ceylon Travel (Pvt) Ltd</p>
          </div>
        </div>
        <div className="ramayana-body">
          <div className="ramayana-highlights">
            <div className="ramayana-highlight-item"><Star size={16} /><span>100% Authentic Ramayana Sites</span></div>
            <div className="ramayana-highlight-item"><Leaf size={16} /><span>Pure Vegetarian &amp; Jain Meals</span></div>
            <div className="ramayana-highlight-item"><Sparkles size={16} /><span>Special Puja Arrangements</span></div>
            <div className="ramayana-highlight-item"><ShieldCheck size={16} /><span>Private &amp; Group Customizations</span></div>
          </div>
          <div className="ramayana-itinerary">
            <div className="ramayana-days-nav">
              {ramayanaItinerary.map((d, i) => (
                <button key={d.day} className={`ramayana-day-btn ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                  <span className="day-label">{d.day}</span>
                </button>
              ))}
            </div>
            <div className="ramayana-day-content">
              <h3>{ramayanaItinerary[activeDay].day}: {ramayanaItinerary[activeDay].title}</h3>
              <ul className="ramayana-day-list">
                {ramayanaItinerary[activeDay].items.map((item, i) => (
                  <li key={i}>
                    <span className="ramayana-item-label">{item.label}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              {activeDay < ramayanaItinerary.length - 1 && (
                <button className="ramayana-next" onClick={() => setActiveDay(activeDay + 1)}>Next: {ramayanaItinerary[activeDay + 1].day} <ArrowRight size={15} /></button>
              )}
            </div>
          </div>
          <div className="ramayana-inclusions">
            <h4>What's Included</h4>
            <ul>
              <li><Check size={14} /> Accommodation in 3★ / 4★ / 5★ Hotels with Breakfast &amp; Dinner</li>
              <li><Check size={14} /> Vegetarian / Jain Food options available</li>
              <li><Check size={14} /> Air-conditioned luxury transportation with English/Hindi speaking guide</li>
              <li><Check size={14} /> All entrance tickets to Ramayana sites in the itinerary</li>
              <li><Check size={14} /> Special Puja arrangements at key temples</li>
              <li><Check size={14} /> Airport pickup and drop-off</li>
            </ul>
          </div>
          <button className="button button-gold ramayana-book-btn" onClick={onBook}>Enquire about this journey <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
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
  const [token, setToken]           = useState(localStorage.getItem('adminToken'));
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [authError, setAuthError]   = useState('');
  const [inquiries, setInquiries]   = useState<Inquiry[]>([]);
  const [filter, setFilter]         = useState<'all' | Inquiry['status']>('all');
  const [page, setPage]             = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => { if (token) loadInquiries(); }, [token]);

  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 401) signOut(); throw new Error('Failed'); }
      setInquiries(await res.json());
    } catch (err) { console.error(err); }
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setAuthError(''); setAuthLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch { setAuthError('That sign-in did not work. Check your details and try again.'); }
    finally { setAuthLoading(false); }
  };

  const signOut = () => { localStorage.removeItem('adminToken'); setToken(null); };

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) setInquiries(cur => cur.map(i => i.id === id ? { ...i, status } : i));
    } catch (err) { console.error(err); }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setInquiries(cur => cur.filter(i => i.id !== id)); setDeleteConfirm(null); }
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter), [filter, inquiries]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  /* ── Login screen ── */
  if (!token) return (
    <div className="admin-login">
      <div className="admin-login-card">
        <button className="back-home" onClick={onExit}>← Back to website</button>
        <img src="/images/logo.png" alt="Voice of Ceylon Travels" style={{ height: '64px', margin: '0 auto 1.5rem', display: 'block' }} />
        <h1>Admin <em>Inbox</em></h1>
        <p>Sign in to view journey enquiries and messages.</p>
        <form onSubmit={signIn}>
          <label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {authError && <p className="form-error">{authError}</p>}
          <button className="button button-dark form-submit" disabled={authLoading}>
            {authLoading ? 'Signing in…' : <><span>Open inbox</span> <LockKeyhole size={15} /></>}
          </button>
        </form>
      </div>
    </div>
  );

  /* ── Dashboard ── */
  return (
    <div className="admin-shell">

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="admin-delete-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-delete-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete enquiry?</h3>
            <p>This action cannot be undone.</p>
            <div className="admin-delete-actions">
              <button className="admin-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-delete" onClick={() => deleteInquiry(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <a className="brand" href="#top">
          <img src="/images/logo.png" alt="Logo" style={{ height: '36px' }} />
          <span>Voice of <b>Ceylon</b><small>Staff workspace</small></span>
        </a>
        <div className="admin-nav">
          <span className="active"><Mail size={16} /> Enquiries</span>
          <button onClick={onExit}><ArrowRight size={16} /> View website</button>
        </div>
        <div className="admin-sidebar-bottom">
          <span>Admin</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div>
            <h1>Good morning, <em>Admin.</em></h1>
          </div>
          <button className="admin-refresh-btn" aria-label="Refresh inbox" onClick={() => loadInquiries()}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div><small>All enquiries</small><strong>{inquiries.length}</strong></div>
          <div><small>Needs attention</small><strong>{inquiries.filter(i => i.status === 'new').length}</strong></div>
          <div><small>Bookings</small><strong>{inquiries.filter(i => i.kind === 'booking').length}</strong></div>
          <div><small>Messages</small><strong>{inquiries.filter(i => i.kind === 'contact').length}</strong></div>
        </div>

        {/* Toolbar */}
        <div className="inbox-toolbar">
          <h2>Latest enquiries</h2>
          <div className="filter-tabs">
            {(['all', 'new', 'contacted', 'closed'] as const).map(s => (
              <button key={s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="inquiry-list">
          {visible.length === 0 ? (
            <div className="empty-inbox">
              <Mail size={25} />
              <h3>No enquiries here yet</h3>
              <p>New trip requests will appear in this inbox.</p>
            </div>
          ) : visible.map(item => (
            <article className="inquiry-row" key={item.id}>
              <div className={`inquiry-badge ${item.kind}`}>{item.kind === 'booking' ? 'Booking' : 'Message'}</div>
              <div className="inquiry-main">
                <div className="inquiry-title">
                  <h3>{item.name}</h3>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p>{item.package_name || item.message || 'No details provided.'}</p>
                <div className="inquiry-details">
                  <a href={`mailto:${item.email}`}><Mail size={13} /> {item.email}</a>
                  {item.phone && <a href={`tel:${item.phone}`}><Phone size={13} /> {item.phone}</a>}
                  {item.arrival_date && <span><MapPin size={13} /> Arriving {item.arrival_date}</span>}
                </div>
              </div>
              <div className="inquiry-actions">
                <select value={item.status} onChange={e => updateStatus(item.id, e.target.value as Inquiry['status'])}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
                <button className="inquiry-delete-btn" title="Delete enquiry" onClick={() => setDeleteConfirm(item.id)}>
                  <X size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="admin-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <div className="admin-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`admin-page-num${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
            <button className="admin-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
