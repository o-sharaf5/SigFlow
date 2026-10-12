// Core data model for a signature. Everything the generator needs lives here,
// so state can be serialized to localStorage (drafts) or Supabase (saved profiles) as-is.

export type LayoutTemplate = 'modern' | 'compact' | 'minimal' | 'executive';
export type AvatarShape = 'square' | 'rounded' | 'circle';
export type FontWeight = 'normal' | 'bold';

/** Email-safe font stack — webfonts are stripped by Gmail/Outlook, so we stick to system faces. */
export type FontFamily =
  | 'Arial, Helvetica, sans-serif'
  | 'Helvetica, Arial, sans-serif'
  | "Georgia, 'Times New Roman', serif"
  | "'Trebuchet MS', Verdana, sans-serif"
  | "Verdana, Geneva, sans-serif"
  | "'Courier New', monospace";

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  instagram: string;
  facebook: string;
  website: string;
}

export interface AvatarSettings {
  url: string;
  shape: AvatarShape;
  /** Rendered size in px (also used as the crop window — square crop via object-fit). */
  size: number;
  /** Zoom applied when cropping a non-square source image, 1 = fit, up to 2.5. */
  zoom: number;
  /** Vertical offset of the crop, -50..50 (%). Lets users nudge faces inside the crop. */
  offsetY: number;
}

export interface StyleSettings {
  layout: LayoutTemplate;
  accentColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: FontFamily;
  showAvatar: boolean;
  showSocialIcons: boolean;
  showDivider: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  location: string;
}

export interface SignatureData {
  personal: PersonalInfo;
  social: SocialLinks;
  avatar: AvatarSettings;
  style: StyleSettings;
}

export const DEFAULT_SIGNATURE: SignatureData = {
  personal: {
    fullName: 'Omar Bennani',
    jobTitle: 'Senior Full-Stack Engineer',
    company: 'SigFlow Labs',
    phone: '+212 6 12 34 56 78',
    email: 'omar@sigflow.dev',
    location: 'Casablanca, Morocco',
  },
  social: {
    linkedin: 'https://linkedin.com/in/omar',
    github: 'https://github.com/omar',
    twitter: 'https://twitter.com/omar',
    instagram: '',
    facebook: '',
    website: 'https://sigflow.dev',
  },
  avatar: {
    url: 'https://i.pravatar.cc/300?img=12',
    shape: 'circle',
    size: 96,
    zoom: 1,
    offsetY: 0,
  },
  style: {
    layout: 'modern',
    accentColor: '#2563eb',
    textColor: '#1f2937',
    fontSize: 14,
    fontFamily: 'Arial, Helvetica, sans-serif',
    showAvatar: true,
    showSocialIcons: true,
    showDivider: true,
  },
};

/** Per-provider metadata used by the icon + label rendering in the preview/generator. */
export interface SocialProvider {
  key: keyof SocialLinks;
  label: string;
  /** Hand-drawn 24x24 path data so icons embed as inline SVG (email-safe, no CDN). */
  iconPath: string;
  brandColor: string;
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    brandColor: '#0A66C2',
    iconPath:
      'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45z',
  },
  {
    key: 'github',
    label: 'GitHub',
    brandColor: '#24292f',
    iconPath:
      'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    brandColor: '#1d9bf0',
    iconPath:
      'M18.9 1.15h3.68l-8.05 9.2L24 22.85h-7.41l-5.8-7.59-6.63 7.59H.47l8.61-9.84L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    brandColor: '#E1306C',
    iconPath:
      'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.4-.55.22-.94.48-1.35.89-.41.41-.67.8-.89 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.19.22.55.48.94.89 1.35.41.41.8.67 1.35.89.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.48 1.35-.89.41-.41.67-.8.89-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.19a3.6 3.6 0 0 0-.89-1.35 3.6 3.6 0 0 0-1.35-.89c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.76-.07zM12 6.97a5.03 5.03 0 1 0 0 10.06 5.03 5.03 0 0 0 0-10.06zm0 8.29a3.26 3.26 0 1 1 0-6.52 3.26 3.26 0 0 1 0 6.52zm5.24-8.47a1.18 1.18 0 1 0 0 2.35 1.18 1.18 0 0 0 0-2.35z',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    brandColor: '#1877F2',
    iconPath:
      'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.6V12.07h2.52V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 3.49h-2.34V24C19.61 23.1 24 18.1 24 12.07z',
  },
  {
    key: 'website',
    label: 'Website',
    brandColor: '#0f172a',
    iconPath:
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.06c.83 1.2 1.5 2.53 1.98 3.94h-3.96c.48-1.41 1.15-2.74 1.98-3.94zM4.07 14a7.95 7.95 0 0 1 0-4h3.41a16.7 16.7 0 0 0 0 4H4.07zm.99 2h2.95c.36 1.28.83 2.48 1.38 3.56A8.03 8.03 0 0 1 5.06 16zm2.95-8H5.06a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.01 8zM12 19.94c-.83-1.2-1.5-2.53-1.98-3.94h3.96A14.2 14.2 0 0 1 12 19.94zM14.34 14h-4.68a14.8 14.8 0 0 1 0-4h4.68a14.8 14.8 0 0 1 0 4zm.24 5.56c.55-1.08 1.02-2.28 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.52 14a16.7 16.7 0 0 0 0-4h3.41a7.95 7.95 0 0 1 0 4h-3.41z',
  },
];
