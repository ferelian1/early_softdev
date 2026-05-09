export interface SocialLinkAPI {
  id: string;
  label: string;
  href: string;
  icon: 'Github' | 'Instagram' | 'Twitter' | 'Globe' | 'Gamepad2' | 'Mail' | 'Linkedin' | 'Youtube';
  handle: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}
