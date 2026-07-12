import React, { useState, useEffect } from 'react';
import { SiteConfig, Post, Course, Instructor } from './types';
import { DEFAULT_CONFIG, INITIAL_POSTS, INITIAL_COURSES } from './constants';
import { Menu, X, Instagram, Facebook, Youtube, Phone, Mail, MapPin, ChevronRight, Edit3, LayoutDashboard, Eye, BookOpen, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from './components/AdminDashboard';
import Timetable from './components/Timetable';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { db, auth, signInWithGoogle, logout } from './firebase';
import { doc, onSnapshot, setDoc, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_config');
      if (saved) {
        try {
          return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        } catch (e) {
          return DEFAULT_CONFIG;
        }
      }
    }
    return DEFAULT_CONFIG;
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_posts');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return INITIAL_POSTS;
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_courses');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return INITIAL_COURSES;
  });
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_instructors');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_CONFIG.instructors?.items || [];
  });
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; caption: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_gallery');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_CONFIG.gallery?.images || [];
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const isUserAdmin = user?.email === 'yjaronia@gmail.com';

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listeners
  useEffect(() => {
    // Config listener
    const unsubConfig = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteConfig;
        const newConfig = { ...DEFAULT_CONFIG, ...data };
        setConfig(newConfig);
        localStorage.setItem('site_config', JSON.stringify(data));
      } else {
        // Initialize with default if not exists
        setDoc(doc(db, 'settings', 'config'), DEFAULT_CONFIG).catch(e => console.warn("Seed config error:", e));
      }
      setIsDataReady(true);
    }, (error) => {
      console.warn("Firestore config snapshot error (likely quota exceeded), using localStorage:", error);
      const saved = localStorage.getItem('site_config');
      if (saved) {
        try {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
        } catch (e) {
          setConfig(DEFAULT_CONFIG);
        }
      }
      setIsDataReady(true);
    });

    // Posts listener
    const unsubPosts = onSnapshot(query(collection(db, 'content', 'posts', 'items'), orderBy('date', 'desc')), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      if (items.length > 0) {
        setPosts(items);
        localStorage.setItem('site_posts', JSON.stringify(items));
      } else if (INITIAL_POSTS.length > 0 && isUserAdmin) {
        // Seed initial posts if empty and user is admin
        INITIAL_POSTS.forEach(p => {
          setDoc(doc(db, 'content', 'posts', 'items', p.id), p).catch(e => console.warn("Seed post error:", e));
        });
      }
    }, (error) => {
      console.warn("Firestore posts snapshot error, using localStorage:", error);
      const saved = localStorage.getItem('site_posts');
      if (saved) {
        try {
          setPosts(JSON.parse(saved));
        } catch (e) {
          setPosts(INITIAL_POSTS);
        }
      }
    });

    // Courses listener
    const unsubCourses = onSnapshot(query(collection(db, 'content', 'courses', 'items'), orderBy('order', 'asc')), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
      if (items.length > 0) {
        setCourses(items);
        localStorage.setItem('site_courses', JSON.stringify(items));
      } else if (INITIAL_COURSES.length > 0 && isUserAdmin) {
        // Seed initial courses if empty and user is admin
        INITIAL_COURSES.forEach((c, index) => {
          setDoc(doc(db, 'content', 'courses', 'items', c.id), { ...c, order: index }).catch(e => console.warn("Seed course error:", e));
        });
      }
    }, (error) => {
      console.warn("Firestore courses snapshot error, using localStorage:", error);
      const saved = localStorage.getItem('site_courses');
      if (saved) {
        try {
          setCourses(JSON.parse(saved));
        } catch (e) {
          setCourses(INITIAL_COURSES);
        }
      }
    });

    // Instructors listener
    const unsubInstructors = onSnapshot(collection(db, 'content', 'instructors', 'items'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Instructor));
      if (items.length > 0) {
        setInstructors(items);
        localStorage.setItem('site_instructors', JSON.stringify(items));
      } else if (DEFAULT_CONFIG.instructors?.items && DEFAULT_CONFIG.instructors.items.length > 0 && isUserAdmin) {
        // Seed initial instructors if empty and user is admin
        DEFAULT_CONFIG.instructors.items.forEach(item => {
          setDoc(doc(db, 'content', 'instructors', 'items', item.id), item).catch(e => console.warn("Seed instructor error:", e));
        });
      }
    }, (error) => {
      console.warn("Firestore instructors snapshot error, using localStorage:", error);
      const saved = localStorage.getItem('site_instructors');
      if (saved) {
        try {
          setInstructors(JSON.parse(saved));
        } catch (e) {
          setInstructors(DEFAULT_CONFIG.instructors?.items || []);
        }
      }
    });

    // Gallery listener
    const unsubGallery = onSnapshot(collection(db, 'content', 'gallery', 'items'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      if (items.length > 0) {
        setGalleryImages(items);
        localStorage.setItem('site_gallery', JSON.stringify(items));
      } else if (DEFAULT_CONFIG.gallery?.images && DEFAULT_CONFIG.gallery.images.length > 0 && isUserAdmin) {
        // Seed initial gallery if empty and user is admin
        DEFAULT_CONFIG.gallery.images.forEach(img => {
          setDoc(doc(db, 'content', 'gallery', 'items', img.id), img).catch(e => console.warn("Seed gallery error:", e));
        });
      }
    }, (error) => {
      console.warn("Firestore gallery snapshot error, using localStorage:", error);
      const saved = localStorage.getItem('site_gallery');
      if (saved) {
        try {
          setGalleryImages(JSON.parse(saved));
        } catch (e) {
          setGalleryImages(DEFAULT_CONFIG.gallery?.images || []);
        }
      }
    });

    return () => {
      unsubConfig();
      unsubPosts();
      unsubCourses();
      unsubInstructors();
      unsubGallery();
    };
  }, [isUserAdmin]);

  // Merge separate collections into config
  const fullConfig = React.useMemo(() => ({
    ...config,
    instructors: {
      ...config.instructors,
      title: config.instructors?.title || DEFAULT_CONFIG.instructors?.title || "강사진 소개",
      items: instructors
    },
    gallery: {
      ...config.gallery,
      title: config.gallery?.title || DEFAULT_CONFIG.gallery?.title || "교습소 둘러보기",
      images: galleryImages
    }
  }), [config, instructors, galleryImages]);

  const toggleAdmin = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        toast.error("로그인에 실패했습니다.");
      }
    } else if (isUserAdmin) {
      setIsAdminMode(!isAdminMode);
    } else {
      toast.error("관리자 권한이 없습니다.");
    }
  };

  const handleUpdateConfig = async (newConfig: SiteConfig) => {
    // Optimistically update React state and localStorage
    const { instructors: newInstructors, gallery: newGallery, ...generalConfig } = newConfig;
    setConfig(newConfig);
    localStorage.setItem('site_config', JSON.stringify(generalConfig));
    if (newInstructors?.items) {
      setInstructors(newInstructors.items);
      localStorage.setItem('site_instructors', JSON.stringify(newInstructors.items));
    }
    if (newGallery?.images) {
      setGalleryImages(newGallery.images);
      localStorage.setItem('site_gallery', JSON.stringify(newGallery.images));
    }

    try {
      // 1. Save general config (without heavy items)
      // CRITICAL: We must NOT save the items/images arrays back to the main config document
      // as they are now managed in separate collections.
      const configToSave = {
        ...generalConfig,
        instructors: {
          title: newInstructors?.title || config.instructors?.title || "강사진 소개",
          items: [] // Keep this empty in the main doc
        },
        gallery: {
          title: newGallery?.title || config.gallery?.title || "교습소 둘러보기",
          images: [] // Keep this empty in the main doc
        }
      };
      await setDoc(doc(db, 'settings', 'config'), configToSave);

      // 2. Save instructors & handle deletions
      if (newInstructors?.items) {
        // Find deleted instructors
        const deletedInstructors = instructors.filter(old => !newInstructors.items.some(n => n.id === old.id));
        for (const item of deletedInstructors) {
          await deleteDoc(doc(db, 'content', 'instructors', 'items', item.id));
        }
        // Save/Update current ones
        for (const item of newInstructors.items) {
          await setDoc(doc(db, 'content', 'instructors', 'items', item.id), item);
        }
      }

      // 3. Save gallery images & handle deletions
      if (newGallery?.images) {
        // Find deleted images
        const deletedImages = galleryImages.filter(old => !newGallery.images.some(n => n.id === old.id));
        for (const image of deletedImages) {
          await deleteDoc(doc(db, 'content', 'gallery', 'items', image.id));
        }
        // Save/Update current ones
        for (const image of newGallery.images) {
          await setDoc(doc(db, 'content', 'gallery', 'items', image.id), image);
        }
      }

      toast.success("설정이 데이터베이스에 안전하게 저장되었습니다.");
    } catch (error) {
      console.error("Update Config Error:", error);
      const isQuotaError = error instanceof Error && (
        error.message.toLowerCase().includes('quota') || 
        error.message.toLowerCase().includes('resource-exhausted') ||
        error.message.toLowerCase().includes('limit exceeded')
      );
      
      if (isQuotaError) {
        toast.warning("⚠️ 일일 무료 데이터베이스 저장 용량이 초과되었습니다. 현재 변경한 사항은 브라우저(로컬 저장소)에 안전하게 임시 저장되었습니다!", {
          duration: 6000
        });
      } else {
        toast.error(`설정 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
  };

  const handleUpdatePosts = async (newPosts: Post[]) => {
    // Optimistically update React state and localStorage
    setPosts(newPosts);
    localStorage.setItem('site_posts', JSON.stringify(newPosts));

    try {
      // Sync all posts to Firestore
      for (const post of newPosts) {
        await setDoc(doc(db, 'content', 'posts', 'items', post.id), post);
      }
      toast.success("게시글이 데이터베이스에 저장되었습니다.");
    } catch (error) {
      console.error("Update Posts Error:", error);
      const isQuotaError = error instanceof Error && (
        error.message.toLowerCase().includes('quota') || 
        error.message.toLowerCase().includes('resource-exhausted') ||
        error.message.toLowerCase().includes('limit exceeded')
      );
      
      if (isQuotaError) {
        toast.warning("⚠️ 일일 무료 데이터베이스 저장 용량이 초과되었습니다. 현재 게시글 변경 사항은 브라우저(로컬 저장소)에 안전하게 임시 저장되었습니다!", {
          duration: 6000
        });
      } else {
        toast.error(`게시글 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
  };

  const handleUpdateCourses = async (newCourses: Course[]) => {
    // Optimistically update React state and localStorage
    setCourses(newCourses);
    localStorage.setItem('site_courses', JSON.stringify(newCourses));

    try {
      // Find deleted courses
      const deletedCourses = courses.filter(old => !newCourses.some(n => n.id === old.id));
      for (const course of deletedCourses) {
        await deleteDoc(doc(db, 'content', 'courses', 'items', course.id));
      }

      // Sync all current courses to Firestore with updated order
      for (let i = 0; i < newCourses.length; i++) {
        const course = { ...newCourses[i], order: i };
        await setDoc(doc(db, 'content', 'courses', 'items', course.id), course);
      }
      toast.success("교육 과정이 데이터베이스에 저장되었습니다.");
    } catch (error) {
      console.error("Update Courses Error:", error);
      const isQuotaError = error instanceof Error && (
        error.message.toLowerCase().includes('quota') || 
        error.message.toLowerCase().includes('resource-exhausted') ||
        error.message.toLowerCase().includes('limit exceeded')
      );
      
      if (isQuotaError) {
        toast.warning("⚠️ 일일 무료 데이터베이스 저장 용량이 초과되었습니다. 현재 교육 과정 변경 사항은 브라우저(로컬 저장소)에 안전하게 임시 저장되었습니다!", {
          duration: 6000
        });
      } else {
        toast.error(`과정 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
  };

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

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'about':
        return (
          <section id="about" key="about" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullConfig.features?.title || "왜 니혼톡인가요?"}</h2>
                <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: fullConfig.primaryColor }}></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(fullConfig.features?.items || [
                  { title: "100% 원어민 강사진", desc: "검증된 실력과 열정을 가진 일본어 원어민 강사진이 직접 지도합니다." },
                  { title: "맞춤형 커리큘럼", desc: "학습자의 수준과 목적에 맞는 최적화된 학습 경로를 제공합니다." },
                  { title: "실전 중심 회화", desc: "단순 암기가 아닌, 실제 상황에서 바로 사용할 수 있는 표현을 익힙니다." }
                ]).map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${fullConfig.primaryColor}15`, color: '#000' }}>
                      {i === 0 && <Edit3 className="w-6 h-6" />}
                      {i === 1 && <LayoutDashboard className="w-6 h-6" />}
                      {i === 2 && <Phone className="w-6 h-6" />}
                      {i > 2 && <BookOpen className="w-6 h-6" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'gallery':
        return (
          <section id="gallery" key="gallery" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullConfig.gallery?.title || "교습소 둘러보기"}</h2>
                <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: fullConfig.primaryColor }}></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(fullConfig.gallery?.images || []).map((image, i) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative aspect-video rounded-2xl overflow-hidden shadow-md group"
                  >
                    <img 
                      src={image.url} 
                      alt={image.caption} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white font-medium">{image.caption}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'instructors':
        const instructorItems = fullConfig.instructors?.items || [];
        const isSingle = instructorItems.length === 1;
        
        return (
          <section id="instructors" key="instructors" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullConfig.instructors?.title || "강사진 소개"}</h2>
                <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: fullConfig.primaryColor }}></div>
              </div>
              
              {isSingle ? (
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
                        src={instructorItems[0].imageUrl} 
                        alt={instructorItems[0].name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-black px-6 py-4 rounded-2xl shadow-xl z-10 hidden sm:block">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Native Instructor</p>
                      <p className="text-xl font-black">{instructorItems[0].name}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      Representative Instructor
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{instructorItems[0].name}</h2>
                    <p className="text-xl font-medium text-blue-600 mb-6">{instructorItems[0].role}</p>
                    
                    <div className="space-y-6">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {instructorItems[0].bio}
                      </p>
                      
                      {instructorItems[0].experience && instructorItems[0].experience.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                            주요 약력 및 경력
                          </h4>
                          <ul className="space-y-3">
                            {instructorItems[0].experience.filter(exp => exp.trim() !== '').map((exp, i) => (
                              <li key={i} className="flex items-start gap-3 text-gray-600">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                </div>
                                <span>{exp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-10">
                      <Button size="lg" style={{ backgroundColor: fullConfig.primaryColor, color: '#000' }} className="px-8 font-bold shadow-lg shadow-yellow-200">
                        강사님께 직접 문의하기
                      </Button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {instructorItems.map((instructor, i) => (
                    <motion.div
                      key={instructor.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={instructor.imageUrl} 
                          alt={instructor.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-8 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
                        <p className="text-sm font-medium text-yellow-600 mb-4">{instructor.role}</p>
                        <p className="text-gray-600 leading-relaxed">{instructor.bio}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      case 'timetable':
        return (
          <section id="timetable" key="timetable" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                  Schedule
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullConfig.scheduleMonth} 수업 시간표</h2>
                <p className="text-gray-600">직장인분들을 위한 최적의 시간대! 나에게 맞는 시간을 확인해 보세요.</p>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden p-2 sm:p-6">
                <Timetable month={fullConfig.scheduleMonth} schedule={fullConfig.schedule} timeSlots={fullConfig.timeSlots} />
              </div>
            </div>
          </section>
        );
      case 'posts':
        return (
          <section id="posts" key="posts" className="py-20 bg-gray-50">
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
        );
      case 'courses':
        return (
          <section id="courses" key="courses" className="py-20 bg-white">
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
        );
      case 'reviews':
        return (
          <section id="reviews" key="reviews" className="py-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                  Reviews
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">수강생 리얼 후기</h2>
                <p className="text-gray-600">실제 니혼톡에서 공부하신 수강생분들의 생생한 한마디를 만나보세요.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "이*진",
                    course: "입문 회화 클래스 수강생",
                    content: "친절하고 세밀하게 가르쳐주셔서 선생님 덕분에 정말 많은 도움 받았습니다. 왕초보라 시작할 때 두려움이 많았는데 일상 표현부터 하나하나 꼼꼼하게 짚어주셔서 재미있게 배웠어요. 감사하다는 말씀 꼭 드리고 싶어요!",
                    rating: 5,
                    date: "2024-05"
                  },
                  {
                    name: "김*성",
                    course: "JLPT 3급 클래스 수강생",
                    content: "동탄에 마땅히 일본어 배우러 갈 곳이 없어서 많이 고민하고 서칭해봤었는데, 가까운 곳에 니혼톡이 있어서 너무 좋습니다! 교습소도 아늑하고 쾌적해서 집중도 잘 되고, 퇴근 후에 가기에도 너무 가깝고 딱이에요.",
                    rating: 5,
                    date: "2024-05"
                  },
                  {
                    name: "최*우",
                    course: "1:1 비즈니스 클래스 수강생",
                    content: "매번 차를 타고 이동해야 해서 주차가 항상 스트레스였는데, 여기는 주차를 2시간 동안 넉넉하게 무료로 지원해줘서 주차 스트레스 없이 마음 편하게 공부할 수 있었습니다. 주차 공간도 여유로워서 퇴근 길 수업도 문제 없어요!",
                    rating: 5,
                    date: "2024-04"
                  },
                  {
                    name: "박*희",
                    course: "초.중급 회화 수강생",
                    content: "센세와 대화하는 시간이 매주 기다려집니다. 잘못된 발음이나 억양도 엄청 세밀하고 정확하게 피드백 해주시는 친절함에 감동 받았어요! 동탄 최고의 일본어 맛집 인정입니다.",
                    rating: 5,
                    date: "2024-04"
                  }
                ].map((review, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                  >
                    <div className="space-y-4">
                      {/* Rating stars */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      {/* Comment */}
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        "{review.content}"
                      </p>
                    </div>
                    
                    {/* User Info */}
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">{review.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">Verified Student</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{review.course}</p>
                      </div>
                      <span className="text-[10px] text-gray-300 font-mono">{review.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'contact':
        return (
          <section id="contact" key="contact" className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl p-10 lg:p-16 text-white">
                <h2 className="text-3xl font-bold mb-10 text-center">지금 바로 상담받으세요</h2>
                <div className="grid md:grid-cols-2 gap-10 items-start max-w-3xl mx-auto">
                  <div className="space-y-6">
                    <a href={`tel:${config.contactPhone}`} className="flex items-start gap-4 group hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">전화 문의</p>
                        <p className="text-lg font-medium">{config.contactPhone}</p>
                      </div>
                    </a>
                    <a href={`mailto:${config.contactEmail}`} className="flex items-start gap-4 group hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">이메일 문의</p>
                        <p className="text-lg font-medium">{config.contactEmail}</p>
                      </div>
                    </a>
                    <div className="mt-8 flex gap-4">
                      <a href="https://www.youtube.com/@%EB%8B%88%ED%98%BC%ED%86%A1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Youtube className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-sm text-gray-400 mb-1">오시는 길</p>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <p className="text-lg font-medium">{config.address}</p>
                        <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-[10px] py-0 px-2">주차가능</Badge>
                        <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-[10px] py-0 px-2">주차비 2시간 무료</Badge>
                      </div>
                      
                      {/* Simple Map Embed */}
                      <div className="rounded-2xl overflow-hidden h-48 w-full border border-white/10 shadow-inner group relative">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, filter: 'grayscale(0.1) invert(0.9) contrast(1.1) hue-rotate(180deg)' }} 
                          src={`https://maps.google.com/maps?q=${encodeURIComponent("경기도 화성시 동탄영천로 150 현대실리콘앨리")}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                          allowFullScreen
                          loading="lazy"
                          title="Location Map"
                        ></iframe>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-black text-[10px] px-2 py-1 rounded-md font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" /> 지도 크게 보기
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: config.fontFamily }}>
      <Toaster position="top-right" />
      
      {!isDataReady ? (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 bg-white shadow-xl flex items-center justify-center p-2 relative">
              <img 
                src={config.loadingLogoUrl || DEFAULT_CONFIG.loadingLogoUrl || DEFAULT_CONFIG.logoUrl} 
                alt="Chiba Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tracking-tight">NIHON TALK</span>
              <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="w-full h-full bg-yellow-400"
                />
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Admin Toggle Button (Floating) */}
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-white hover:bg-gray-50"
            onClick={toggleAdmin}
          >
            {isAdminMode ? <Eye className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
          </Button>

          {isAdminMode ? (
            <AdminDashboard 
              config={fullConfig} 
              setConfig={handleUpdateConfig} 
              posts={posts} 
              setPosts={handleUpdatePosts}
              courses={courses}
              setCourses={handleUpdateCourses}
              onClose={() => setIsAdminMode(false)}
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
                    <span className="text-[10px] font-medium text-yellow-600 tracking-widest mt-1">NIHON TALK</span>
                  </div>
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                  {["courses", "timetable", "posts", "instructors", "contact"].map(sectionId => {
                    const labels: Record<string, string> = {
                      courses: '교육 과정',
                      timetable: '시간표',
                      posts: '치바 쇼츠',
                      instructors: '강사 소개',
                      contact: '문의하기',
                    };
                    return (
                      <a key={sectionId} href={`#${sectionId}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors font-semibold">
                        {labels[sectionId]}
                      </a>
                    );
                  })}
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
                    {["courses", "timetable", "posts", "instructors", "contact"].map(sectionId => {
                      const labels: Record<string, string> = {
                        courses: '교육 과정',
                        timetable: '시간표',
                        posts: '치바 쇼츠',
                        instructors: '강사 소개',
                        contact: '문의하기',
                      };
                      return (
                        <a 
                          key={sectionId} 
                          href={`#${sectionId}`} 
                          onClick={() => setIsMenuOpen(false)} 
                          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md font-semibold"
                        >
                          {labels[sectionId]}
                        </a>
                      );
                    })}
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
                  <Badge className="mb-4 px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${fullConfig.primaryColor}20`, color: '#000', border: `1px solid ${fullConfig.primaryColor}` }}>
                    Native Japanese Conversation
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                    {fullConfig.heroTitle}
                  </h1>
                  <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                    {fullConfig.heroSubtitle}
                  </p>
                  {/* Hero button removed */}
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
                      <img src={fullConfig.logoUrl} alt="Chiba Mascot" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                      src={fullConfig.heroImageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop"} 
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

          {/* Render Dynamic Sections */}
          {(fullConfig.sectionOrder || ["courses", "about", "instructors", "gallery", "timetable", "posts", "contact"]).reduce<string[]>((acc, cur) => {
            acc.push(cur);
            if (cur === 'courses') acc.push('reviews');
            return acc;
          }, []).map(sectionId => renderSection(sectionId))}

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 bg-white flex items-center justify-center p-1">
                      <img src={fullConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-gray-900">{fullConfig.name}</span>
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
                <p className="text-sm text-gray-400">© 2024 {fullConfig.name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  )}
</div>
  );
}
