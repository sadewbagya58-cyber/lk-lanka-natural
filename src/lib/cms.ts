import { prisma } from './prisma';

export interface CmsSectionData {
  id: string;
  heading: string | null;
  content: string;
  sectionType: string;
  sortOrder: number;
  isVisible: boolean;
  metadata: string | null;
  updatedAt: Date;
}

export interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  metaTitle: string | null;
  status: string;
  sections: CmsSectionData[];
  updatedAt: Date;
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: Date;
}

/**
 * Fetches a CMS page with its visible sections ordered by sortOrder.
 * Returns null if the page doesn't exist or DB is unavailable.
 */
export async function getCmsPage(slug: string): Promise<CmsPageData | null> {
  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!page) return null;
    return {
      ...page,
      sections: page.sections.map((s) => ({
        id: s.id,
        heading: s.heading,
        content: s.content,
        sectionType: s.sectionType,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
        metadata: s.metadata,
        updatedAt: s.updatedAt,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Fetches all visible FAQ items ordered by category then sortOrder.
 */
export async function getFaqItems(): Promise<FaqItemData[]> {
  try {
    return await prisma.faqItem.findMany({
      where: { isVisible: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  } catch {
    return [];
  }
}

/** Default fallback titles per page slug */
export const PAGE_DEFAULTS: Record<string, { title: string; subtitle: string }> = {
  about: { title: 'About Us', subtitle: 'Sri Lanka\'s premier natural wellness marketplace.' },
  contact: { title: 'Help Center', subtitle: 'We\'re here to help. Reach out to our support team.' },
  faq: { title: 'Frequently Asked Questions', subtitle: 'Find answers to the most common questions.' },
  'shipping-policy': { title: 'Shipping & Delivery Policy', subtitle: 'Delivery information for Sri Lanka and international orders.' },
  'returns-refunds': { title: 'Returns & Refunds Policy', subtitle: 'Our guidelines for returns, exchanges, and refunds.' },
  'privacy-policy': { title: 'Privacy Policy', subtitle: 'How we collect, use, and protect your personal information.' },
  'terms-of-service': { title: 'Terms of Service', subtitle: 'The terms governing the use of KL Lanka Natural.' },
  'track-order': { title: 'Track Your Order', subtitle: 'Order tracking is coming soon. Contact us for updates.' },
};

/** Parses metadata JSON string safely */
export function parseMetadata(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
