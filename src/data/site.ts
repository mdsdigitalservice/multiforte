import wordpress from './wordpress.json';
export interface NavLink { label: string; href: string }
export const navigation: NavLink[] = wordpress.navigation;
export const site = {
  name: wordpress.siteTitle,
  description: wordpress.siteDescription,
  origin: 'https://www.multiforteseguranca.com.br',
  logo: '/images/imgi_1_logo_multiforte_branca.webp',
};
