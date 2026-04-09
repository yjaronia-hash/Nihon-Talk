import { SiteConfig, Post, Course } from "./types";

export const DEFAULT_CONFIG: SiteConfig = {
  name: "니혼톡 (NihonTalk)",
  title: "원어민과 함께하는 진짜 일본어 회화",
  description: "일본어 원어민 강사진과 함께하는 1:1 맞춤형 회화 교습소입니다. 자연스러운 표현과 비즈니스 매너까지 완벽하게 마스터하세요.",
  heroTitle: "일본어, 이제 원어민처럼 말하세요",
  heroSubtitle: "니혼톡은 당신의 꿈을 응원합니다. 기초부터 비즈니스 회화까지, 가장 효율적인 학습 경로를 제시합니다.",
  primaryColor: "#FACC15", // Tailwind yellow-400
  fontFamily: "Inter, sans-serif",
  logoUrl: "https://files.oaiusercontent.com/file-K18u27f918u27f918u27f9?se=2026-04-09T03%3A23%3A39Z&sp=r&sv=24.8&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Dshiba.png&sig=placeholder_signature",
  contactEmail: "info@nihontalk.com",
  contactPhone: "02-123-4567",
  address: "서울특별시 강남구 테헤란로 123, 4층",
  socialLinks: {
    instagram: "https://instagram.com/nihontalk",
    facebook: "https://facebook.com/nihontalk",
    youtube: "https://www.youtube.com/@%EB%8B%88%ED%98%BC%ED%86%A1"
  },
  youtubeUrl: "https://www.youtube.com/@%EB%8B%88%ED%98%BC%ED%86%A1",
  heroImageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
  instructor: {
    name: "사토 유키 (Sato Yuki)",
    role: "대표 강사 / 원어민",
    bio: "10년 이상의 한국 내 일본어 교육 경력을 가진 베테랑 강사입니다. 수강생 개개인의 취득 목표와 수준에 맞춘 정교한 커리큘럼으로 빠른 실력 향상을 보장합니다.",
    experience: [
      "도쿄 외국어 대학교 졸업",
      "전) 대형 어학원 비즈니스 일본어 전임 강사",
      "JLPT 1급 만점자 다수 배출",
      "기업체 출강 및 통번역 경력 8년"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
  },
  scheduleMonth: "5월",
  schedule: [
    { id: "1", day: "월", timeSlot: "16:00-17:30", className: "JLPT 3급", isGroup: true, color: "#FFD8A8" },
    { id: "2", day: "월", timeSlot: "20:00-21:30", className: "JLPT 1급", isGroup: true, color: "#D3F9D8" },
    { id: "3", day: "화", timeSlot: "17:30-20:00", className: "초.중급", isGroup: false },
    { id: "4", day: "수", timeSlot: "10:00-12:00", className: "초.중급", isGroup: false },
    { id: "5", day: "수", timeSlot: "16:00-17:30", className: "JLPT 3급", isGroup: true, color: "#FFD8A8" },
    { id: "6", day: "수", timeSlot: "17:30-20:00", className: "초.중급", isGroup: false },
    { id: "7", day: "수", timeSlot: "20:00-21:30", className: "JLPT 3급 (독해)", isGroup: true, color: "#A5D8FF" },
    { id: "8", day: "목", timeSlot: "17:30-20:00", className: "초.중급", isGroup: false },
    { id: "9", day: "금", timeSlot: "10:00-12:00", className: "초.중급", isGroup: false },
    { id: "10", day: "금", timeSlot: "16:00-17:30", className: "초.중급", isGroup: false },
    { id: "11", day: "금", timeSlot: "20:00-21:30", className: "JLPT 1급", isGroup: true, color: "#D3F9D8" },
    { id: "12", day: "토", timeSlot: "11:30-13:00", className: "초.중급", isGroup: false },
    { id: "13", day: "토", timeSlot: "13:00-14:30", className: "프리토킹", isGroup: true, color: "#FFD8A8" },
    { id: "14", day: "토", timeSlot: "14:30-16:00", className: "초급", isGroup: false },
  ]
};

export const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    title: "시바견 '치바'와 함께 배우는 오늘의 일본어",
    excerpt: "니혼톡의 마스코트 치바가 알려주는 귀엽고 실용적인 일본어 한마디! 오늘은 어떤 표현일까요?",
    content: "안녕하세요! 니혼톡의 마스코트 치바입니다. \n\n오늘 배울 표현은 '카와이(귀엽다)'입니다! \n\n일본에서는 정말 자주 쓰이는 표현이죠? 여러분도 치바를 보고 '카와이!'라고 외쳐보세요!",
    date: "2024-03-20",
    imageUrl: "https://images.unsplash.com/photo-1591768793355-74d7c8360382?q=80&w=800&auto=format&fit=crop",
    category: "치바의 일본어",
    published: true
  },
  {
    id: "2",
    title: "비즈니스 일본어: 메일 작성 시 주의할 점",
    excerpt: "일본 기업과 협업할 때 가장 중요한 것은 예의입니다. 비즈니스 메일의 기본 형식을 배워보세요.",
    content: "비즈니스 메일에서는 경어 사용이 필수적입니다. \n\n- 오세와니 낫테 오리마스 (신세를 지고 있습니다)\n- 요로시쿠 오네가이 모시아게마스 (잘 부탁드립니다)\n...",
    date: "2024-03-15",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2959213?q=80&w=800&auto=format&fit=crop",
    category: "비즈니스",
    published: true
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "1",
    name: "입문 회화 클래스",
    description: "히라가나부터 시작하는 왕초보 탈출 코스. 일상 대화를 위한 기초 문법과 어휘를 학습합니다.",
    price: "250,000원",
    duration: "4주 (주 2회)",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "비즈니스 마스터 코스",
    description: "일본계 기업 취업 및 비즈니스 미팅을 위한 고급 회화 과정. 전문적인 표현과 문화를 익힙니다.",
    price: "400,000원",
    duration: "8주 (주 2회)",
    imageUrl: "https://images.unsplash.com/photo-1454165833767-027ffea9e778?q=80&w=400&auto=format&fit=crop"
  }
];
