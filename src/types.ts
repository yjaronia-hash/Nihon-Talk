export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  primaryColor: string;
  fontFamily: string;
  logoUrl: string;
  loadingLogoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  youtubeUrl: string;
  heroImageUrl?: string;
  instructor?: {
    name: string;
    role: string;
    bio: string;
    experience: string[];
    imageUrl: string;
  };
  scheduleMonth: string;
  schedule: ScheduleItem[];
  sectionOrder?: string[];
  features?: {
    title: string;
    items: { title: string; desc: string }[];
  };
  gallery?: {
    title: string;
    images: { id: string; url: string; caption: string }[];
  };
  instructors?: {
    title: string;
    items: Instructor[];
  };
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  experience?: string[];
}

export interface ScheduleItem {
  id: string;
  day: string;
  timeSlot: string;
  className: string;
  isGroup: boolean;
  color?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  category: string;
  published: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  order?: number;
}
