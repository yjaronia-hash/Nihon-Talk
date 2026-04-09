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
}
