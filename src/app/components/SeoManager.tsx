import { useEffect } from 'react';
import { useLocation } from 'react-router';

const SITE = 'https://izytechglobalservices.com';
const DEFAULT_IMAGE = `${SITE}/social/izy-tech-social-card.png`;

type SeoConfig = {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
};

const publicRoutes: Record<string, SeoConfig> = {
  '/': {
    title: 'Izy Tech Services | Solar & Technology Solutions Nigeria',
    description: 'Future-ready solar energy, CCTV & security, smart home automation, industrial wiring and technology solutions for homes and businesses across Nigeria.',
  },
  '/about': {
    title: 'About Izy Tech Services | Engineering & Energy Solutions',
    description: 'Meet Izy Technologies Global Services Limited, delivering practical energy, security, electrical and technology solutions from Port Harcourt across Nigeria.',
  },
  '/services': {
    title: 'Solar, CCTV, Smart Home & Electrical Services | Izy Tech',
    description: 'Explore Izy Tech Services for solar energy systems, industrial wiring, smart home automation, CCTV, access control and technology services.',
  },
  '/projects': {
    title: 'Our Projects | Izy Tech Services Nigeria',
    description: 'Explore selected Izy Tech Services projects across solar energy, electrical infrastructure, security, smart home automation and technology.',
  },
  '/testimonials': {
    title: 'Client Reviews | Izy Tech Services',
    description: 'Read client experiences and project feedback from Izy Tech Services customers across Nigeria.',
  },
  '/contact': {
    title: 'Contact Izy Tech Services | Project Enquiries & Site Assessment',
    description: 'Contact Izy Tech Services for solar, CCTV, electrical, smart home and technology project enquiries or to request a site assessment.',
  },
  '/store': {
    title: 'Energy & Technology Store | Izy Tech Services',
    description: 'Browse selected solar, energy and technology products from Izy Tech Services, select what you need, and request current pricing and availability.',
  },
  '/store/request': {
    title: 'Review Product Selection | Izy Tech Services',
    description: 'Review selected products and request current pricing, availability, configuration guidance and installation options from Izy Tech Services.',
    noIndex: true,
  },
  '/store/enquire': {
    title: 'Review Product Selection | Izy Tech Services',
    description: 'Review selected products and request current pricing and availability from Izy Tech Services.',
    noIndex: true,
  },
  '/cookies': {
    title: 'Cookie Policy | Izy Tech Services',
    description: 'Read how Izy Tech Services uses cookies and consent-based analytics on this website.',
  },
};

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function humanizeSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function configForPath(pathname: string): SeoConfig {
  if (pathname.startsWith('/admin') || pathname.startsWith('/dev') || pathname.startsWith('/assessment/')) {
    return {
      title: pathname.startsWith('/dev') ? 'Developer Command Centre | Izy Tech' : 'Admin | Izy Tech',
      description: 'Private Izy Tech Services workspace.',
      noIndex: true,
    };
  }

  if (pathname.startsWith('/projects/')) {
    const slug = pathname.split('/').filter(Boolean)[1] || '';
    const project = humanizeSlug(slug);
    return {
      title: `${project || 'Project'} | Izy Tech Services`,
      description: 'View this Izy Tech Services project and learn about the solution, project scope and delivery.',
    };
  }

  return publicRoutes[pathname] ?? {
    title: 'Izy Tech Services | Solar & Technology Solutions Nigeria',
    description: 'Future-ready solar energy, security, electrical and technology solutions across Nigeria.',
  };
}

export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = configForPath(pathname);
    const url = `${SITE}${pathname === '/' ? '/' : pathname}`;
    const image = config.image ?? DEFAULT_IMAGE;

    document.title = config.title;
    upsertMeta('meta[name="description"]', 'name', 'description', config.description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', config.noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', config.title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', config.description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
    upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'Izy Tech Services — Power the Future.');

    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', config.title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', config.description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    if (!config.noIndex) upsertCanonical(url);
  }, [pathname]);

  return null;
}
