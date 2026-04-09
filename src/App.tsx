import React, { useState, useEffect } from 'react';
import { SiteConfig, Post, Course } from './types';
import { DEFAULT_CONFIG, INITIAL_POSTS, INITIAL_COURSES } from './constants';
import { Menu, X, Instagram, Facebook, Youtube, Phone, Mail, MapPin, ChevronRight, Edit3, LayoutDashboard, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from './components/AdminDashboard';
import Timetable from './components/Timetable';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('site_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with DEFAULT_CONFIG to ensure new properties (like schedule) exist
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('site_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('site_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('site_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('site_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('site_courses', JSON.stringify(courses));
  }, [courses]);

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const message = formData.get('message');
    
    const mailtoUrl = `mailto:ayj113@nate.com?subject=[상담신청] ${name}님&body=이름: ${name}%0D%0A연락처: ${phone}%0D%0A내용: ${message}`;
    window.location.href = mailtoUrl;
    
    toast.success("이메일 앱이 열립니다. 내용을 확인 후 전송해 주세요!");
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: config.fontFamily }}>
      <Toaster position="top-right" />
      
      {/* Admin Toggle Button (Floating) */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-white hover:bg-gray-50"
        onClick={toggleAdmin}
      >
        {isAdmin ? <Eye className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </Button>

      {isAdmin ? (
        <AdminDashboard 
          config={config} 
          setConfig={setConfig} 
          posts={posts} 
          setPosts={setPosts}
          courses={courses}
          setCourses={setCourses}
          onClose={() => setIsAdmin(false)}
        />
      ) : (
        <div className="flex flex-col">
          {/* Navigation */}
          <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20 items-center">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400 shadow-sm bg-white flex items-center justify-center p-1"
                  >
                    <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">{config.name}</span>
                    <span className="text-[10px] font-medium text-yellow-600 tracking-widest mt-1">NIHONGO TALK</span>
                  </div>
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">교습소 소개</a>
                  <a href="#courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">교육 과정</a>
                  <a href="#timetable" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">시간표</a>
                  <a href="#posts" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">치바 쇼츠</a>
                  <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">문의하기</a>
                  <Button style={{ backgroundColor: config.primaryColor, color: '#000' }} className="font-semibold">
                    상담 예약
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
                    {isMenuOpen ? <X /> : <Menu />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-6 space-y-1">
                    <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">교습소 소개</a>
                    <a href="#courses" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">교육 과정</a>
                    <a href="#timetable" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">시간표</a>
                    <a href="#posts" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">치바 쇼츠</a>
                    <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">문의하기</a>
                    <div className="pt-4">
                      <Button className="w-full" style={{ backgroundColor: config.primaryColor, color: '#000' }}>상담 예약</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-4 px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${config.primaryColor}20`, color: '#000', border: `1px solid ${config.primaryColor}` }}>
                    Native Japanese Conversation
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                    {config.heroTitle}
                  </h1>
                  <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                    {config.heroSubtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" style={{ backgroundColor: config.primaryColor, color: '#000' }} className="px-8 font-bold shadow-lg shadow-yellow-200">
                      체험레슨
                    </Button>
                    <Button size="lg" variant="outline" className="px-8 border-gray-200">
                      상담 신청
                    </Button>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="mt-12 lg:mt-0 relative"
                >
                  {/* Shiba Mascot - Static Position */}
                  <div className="absolute -top-12 -left-8 z-20 hidden md:block">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center p-2">
                      <img src={config.logoUrl} alt="Chiba Mascot" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                      src={config.heroImageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop"} 
                      alt="Japanese Lesson" 
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features / About */}
          <section id="about" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 니혼톡인가요?</h2>
                <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "100% 원어민 강사진", desc: "검증된 실력과 열정을 가진 일본어 원어민 강사진이 직접 지도합니다.", icon: <Edit3 className="w-6 h-6" /> },
                  { title: "맞춤형 커리큘럼", desc: "학습자의 수준과 목적에 맞는 최적화된 학습 경로를 제공합니다.", icon: <LayoutDashboard className="w-6 h-6" /> },
                  { title: "실전 중심 회화", desc: "단순 암기가 아닌, 실제 상황에서 바로 사용할 수 있는 표현을 익힙니다.", icon: <Phone className="w-6 h-6" /> }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${config.primaryColor}15`, color: '#000' }}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Timetable Section - Moved here */}
          <section id="timetable" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                  Schedule
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{config.scheduleMonth} 수업 시간표</h2>
                <p className="text-gray-600">직장인분들을 위한 최적의 시간대! 나에게 맞는 시간을 확인해 보세요.</p>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden p-2 sm:p-6">
                <Timetable month={config.scheduleMonth} schedule={config.schedule} />
              </div>
            </div>
          </section>

          {/* YouTube Shorts / Community - Moved after Timetable */}
          <section id="posts" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-red-100 text-red-600 border border-red-200">
                  YouTube Shorts
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">니혼톡 1분 일본어 쇼츠</h2>
                <p className="text-gray-600">니혼톡 유튜브 채널에서 가장 인기 있는 쇼츠 영상들을 확인해보세요!</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { id: "p9PaqsqWIFI", title: "일본어 회화 꿀팁 #1", thumbnail: "https://i.ytimg.com/vi/p9PaqsqWIFI/hqdefault.jpg" },
                  { id: "mRgX_r0C9_U", title: "원어민이 쓰는 실전 표현", thumbnail: "https://i.ytimg.com/vi/mRgX_r0C9_U/hqdefault.jpg" },
                  { id: "ciSyKEeV34o", title: "니혼톡과 함께하는 1분 일본어", thumbnail: "https://i.ytimg.com/vi/ciSyKEeV34o/hqdefault.jpg" },
                  { id: "sF33d3V7lxQ", title: "일본 여행 필수 문장", thumbnail: "https://i.ytimg.com/vi/sF33d3V7lxQ/hqdefault.jpg" }
                ].map((short, i) => (
                  <motion.a 
                    key={short.id}
                    href={`https://www.youtube.com/shorts/${short.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -8, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                  >
                    <img 
                      src={short.thumbnail} 
                      alt={short.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                        <Youtube className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                        {short.title}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => window.open(config.youtubeUrl, '_blank')}
                >
                  <Youtube className="w-5 h-5 mr-2" /> 유튜브 채널 구경하기
                </Button>
              </div>
            </div>
          </section>

          {/* Instructor Section */}
          {config.instructor && (
            <section id="instructor" className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative mb-12 lg:mb-0"
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:mx-0">
                      <img 
                        src={config.instructor.imageUrl} 
                        alt={config.instructor.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    {/* Decorative badge */}
                    <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-black px-6 py-4 rounded-2xl shadow-xl z-10 hidden sm:block">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Native Instructor</p>
                      <p className="text-xl font-black">{config.instructor.name}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      Instructor Profile
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{config.instructor.name}</h2>
                    <p className="text-xl font-medium text-blue-600 mb-6">{config.instructor.role}</p>
                    
                    <div className="space-y-6">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {config.instructor.bio}
                      </p>
                      
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                          주요 약력 및 경력
                        </h4>
                        <ul className="space-y-3">
                          {config.instructor.experience.map((exp, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              </div>
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-10">
                      <Button size="lg" style={{ backgroundColor: config.primaryColor, color: '#000' }} className="px-8 font-bold shadow-lg shadow-yellow-200">
                        강사님께 직접 문의하기
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          )}

          {/* Courses */}
          <section id="courses" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">교육 과정</h2>
                  <p className="text-gray-600">당신에게 꼭 맞는 코스를 선택하세요.</p>
                </div>
                <Button variant="ghost" className="hidden sm:flex items-center gap-1 group">
                  전체 보기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={course.imageUrl} 
                        alt={course.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{course.duration}</span>
                        <span className="font-bold text-lg" style={{ color: '#000' }}>{course.price}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">상세 정보</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="lg:grid lg:grid-cols-2">
                  <div className="p-10 lg:p-16 text-white">
                    <h2 className="text-3xl font-bold mb-8">지금 바로 상담받으세요</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">전화 문의</p>
                          <p className="text-lg font-medium">{config.contactPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">이메일 문의</p>
                          <p className="text-lg font-medium">{config.contactEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">오시는 길</p>
                          <p className="text-lg font-medium">{config.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 flex gap-4">
                      <a href={config.socialLinks.instagram} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a href={config.socialLinks.facebook} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="bg-white p-10 lg:p-16">
                    <form className="space-y-4" onSubmit={handleContactSubmit}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">이름</label>
                          <input name="name" type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all" placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">연락처</label>
                          <input name="phone" type="tel" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all" placeholder="010-0000-0000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">문의 내용</label>
                        <textarea name="message" rows={4} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all resize-none" placeholder="상담받고 싶은 내용을 적어주세요."></textarea>
                      </div>
                      <Button type="submit" className="w-full py-6 text-lg font-bold" style={{ backgroundColor: config.primaryColor, color: '#000' }}>
                        상담 신청하기
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 bg-white flex items-center justify-center p-1">
                      <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-gray-900">{config.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-[200px] text-center md:text-left">
                    치바와 함께 즐겁게 배우는 일본어 회화 교습소 니혼톡입니다.
                  </p>
                </div>
                <div className="flex gap-8 text-sm text-gray-500">
                  <a href="#" className="hover:text-gray-900">이용약관</a>
                  <a href="#" className="hover:text-gray-900">개인정보처리방침</a>
                  <a href="#" className="hover:text-gray-900">강사 채용</a>
                </div>
                <p className="text-sm text-gray-400">© 2024 {config.name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
