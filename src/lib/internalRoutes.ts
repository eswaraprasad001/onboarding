import { BookOpen, ClipboardList, ExternalLink, /* FileSignature, */ FileText, LayoutDashboard, Target } from 'lucide-react';
import { ViewId } from '@/types';

export interface InternalRoute {
  id: ViewId;
  href: string;
  label: string;
  title: string;
  tabLabel: string;
  icon: typeof LayoutDashboard;
}

export interface ExternalNavLink {
  id: string;
  href: string;
  label: string;
  icon: typeof ExternalLink;
}

export const INTERNAL_ROUTES: InternalRoute[] = [
  {
    id: 'dashboard',
    href: '/app',
    label: 'Dashboard',
    title: 'Dashboard',
    tabLabel: 'Home',
    icon: LayoutDashboard,
  },
  {
    id: 'onboarding',
    href: '/app/onboarding',
    label: 'Onboarding Steps',
    title: 'Onboarding Steps',
    tabLabel: 'Steps',
    icon: ClipboardList,
  },
  {
    id: 'templates',
    href: '/app/templates',
    label: 'Templates',
    title: 'Template Library',
    tabLabel: 'Templates',
    icon: FileText,
  },
  {
    id: 'knowledge',
    href: '/app/knowledge',
    label: 'Knowledge Hub',
    title: 'Knowledge Hub',
    tabLabel: 'Knowledge',
    icon: BookOpen,
  },
  {
    id: 'playbook',
    href: '/app/playbook',
    label: 'Solution Owner Playbook',
    title: 'Solution Owner Playbook',
    tabLabel: 'Playbook',
    icon: Target,
  },
  // PCR Writer hidden from nav
  // {
  //   id: 'pcr-writer',
  //   href: '/app/pcr-writer',
  //   label: 'PCR Writer',
  //   title: 'PCR Writer',
  //   tabLabel: 'PCR',
  //   icon: FileSignature,
  // },
];

export const USEFUL_LINKS: ExternalNavLink[] = [
  {
    id: 'changepoint',
    href: 'https://changepoint.presidio.com/',
    label: 'Changepoint',
    icon: ExternalLink,
  },
  {
    id: 'digital-delivery-global',
    href: 'https://presidio-my.sharepoint.com/my?remoteItem=%7B%22mp%22%3A%7B%22listFullUrl%22%3A%22https%3A%2F%2Fpresidio%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fmhehl%5Fpresidio%5Fcom%2FDocuments%22%2C%22rootFolder%22%3A%22%2Fpersonal%2Fmhehl%5Fpresidio%5Fcom%2FDocuments%2FDigital%2Ddelivery%20%28Global%29%20%2D%20Solution%20Ownership%22%2C%22webAbsoluteUrl%22%3A%22https%3A%2F%2Fpresidio%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fmhehl%5Fpresidio%5Fcom%22%7D%2C%22rsi%22%3A%7B%22webAbsoluteUrl%22%3A%22https%3A%2F%2Fpresidio%2Esharepoint%2Ecom%2Fteams%2F365%2Dteam%2Ddigital%2Ddelivery%22%2C%22listFullUrl%22%3A%22https%3A%2F%2Fpresidio%2Esharepoint%2Ecom%2Fteams%2F365%2Dteam%2Ddigital%2Ddelivery%2FShared%20Documents%22%2C%22rootFolder%22%3A%22%2Fteams%2F365%2Dteam%2Ddigital%2Ddelivery%2FShared%20Documents%2FSolution%20Ownership%22%7D%7D&View=0',
    label: 'Digital Delivery Global',
    icon: ExternalLink,
  },
];

const INTERNAL_ROUTE_BY_ID: Record<ViewId, InternalRoute> = Object.fromEntries(
  INTERNAL_ROUTES.map((route) => [route.id, route])
) as Record<ViewId, InternalRoute>;

export function getInternalRouteById(id: ViewId): InternalRoute {
  return INTERNAL_ROUTE_BY_ID[id];
}

export function getCurrentViewFromPathname(pathname: string): ViewId {
  if (pathname.startsWith('/app/onboarding')) return 'onboarding';
  if (pathname.startsWith('/app/templates')) return 'templates';
  if (pathname.startsWith('/app/knowledge')) return 'knowledge';
  if (pathname.startsWith('/app/playbook')) return 'playbook';
  if (pathname.startsWith('/app/pcr-writer')) return 'pcr-writer';
  return 'dashboard';
}
