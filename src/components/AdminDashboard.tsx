import React, { useState } from 'react';
import { SiteConfig, Post, Course, ScheduleItem } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, X, Image as ImageIcon, Settings, FileText, BookOpen, Palette, LayoutDashboard, RotateCcw, Calendar, User, ChevronUp, ChevronDown, Edit3, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from "sonner";

import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  config: SiteConfig;
  setConfig: (config: SiteConfig) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  onClose: () => void;
}

export default function AdminDashboard({ config, setConfig, posts, setPosts, courses, setCourses, onClose }: AdminDashboardProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [localPosts, setLocalPosts] = useState(posts);
  const [localCourses, setLocalCourses] = useState(courses);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Sync local state with props when they change (e.g. after Firestore load)
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  React.useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const DAYS = ['월', '화', '수', '목', '금', '토'];
  const DEFAULT_TIME_SLOTS = [
    "10:00-12:00",
    "11:30-13:00",
    "13:00-14:30",
    "14:30-16:00",
    "16:00-17:30",
    "17:30-19:00",
    "19:00-20:30",
    "20:00-21:30"
  ];

  const handleSaveConfig = async () => {
    try {
      // Clean up config before saving
      const cleanedConfig = { ...localConfig };
      
      // Ensure instructors experience is cleaned up (remove empty strings)
      if (cleanedConfig.instructors?.items) {
        cleanedConfig.instructors.items = cleanedConfig.instructors.items.map(item => ({
          ...item,
          experience: item.experience?.filter(exp => exp.trim() !== '') || []
        }));
      }

      console.log("Saving Config:", cleanedConfig);
      await setConfig(cleanedConfig);
      // toast.success is handled in App.tsx handleUpdateConfig
    } catch (error) {
      console.error("Config Save Error:", error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`설정 저장 실패: ${errorMessage}`);
      
      if (errorMessage.includes('too large')) {
        toast.error("데이터 크기가 너무 큽니다. 이미지를 더 작은 파일로 교체해 주세요.");
      }
    }
  };

  const handleSavePosts = async () => {
    await setPosts(localPosts);
  };

  const handleSaveCourses = async () => {
    await setCourses(localCourses);
  };

  const handleResetToDefaults = () => {
    // In iframe, confirm might be blocked, but let's try to make it work or just do it
    // Actually, let's just do it and show a toast if possible before reload
    localStorage.removeItem('site_config');
    localStorage.removeItem('site_posts');
    localStorage.removeItem('site_courses');
    toast.success("설정이 초기화되었습니다. 페이지를 새로고침합니다.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const addPost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: "새로운 게시글",
      excerpt: "게시글 요약을 입력하세요.",
      content: "내용을 입력하세요.",
      date: new Date().toISOString().split('T')[0],
      imageUrl: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=800&auto=format&fit=crop",
      category: "일반",
      published: false
    };
    setLocalPosts([newPost, ...localPosts]);
  };

  const deletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', 'posts', 'items', id));
      setLocalPosts(localPosts.filter(p => p.id !== id));
      toast.success("게시글이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setLocalPosts(localPosts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "새로운 과정",
      description: "과정 설명을 입력하세요.",
      price: "0원",
      duration: "4주",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop"
    };
    setLocalCourses([...localCourses, newCourse]);
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', 'courses', 'items', id));
      setLocalCourses(localCourses.filter(c => c.id !== id));
      toast.success("과정이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setLocalCourses(localCourses.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const moveCourse = (index: number, direction: 'up' | 'down') => {
    const newCourses = [...localCourses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newCourses.length) {
      [newCourses[index], newCourses[targetIndex]] = [newCourses[targetIndex], newCourses[index]];
      setLocalCourses(newCourses);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // ~800KB limit to stay safe with Firestore 1MB limit
        toast.error("이미지 크기가 너무 큽니다. 800KB 이하의 이미지를 사용해주세요.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const ALL_SECTIONS = ["courses", "about", "instructors", "gallery", "timetable", "posts", "contact"];
  const currentSectionOrder = React.useMemo(() => {
    const order = [...(localConfig.sectionOrder || ALL_SECTIONS)];
    // Ensure all sections are present
    ALL_SECTIONS.forEach(s => {
      if (!order.includes(s)) order.push(s);
    });
    return order;
  }, [localConfig.sectionOrder]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 text-white p-2 rounded-lg">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-xs text-gray-500">사이트 콘텐츠 및 디자인 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetToDefaults} className="text-gray-500 hover:text-red-600 border-gray-200">
            <RotateCcw className="w-4 h-4 mr-2" /> 초기화
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 shrink-0">
            <TabsList className="bg-transparent h-14 gap-6">
              <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <Settings className="w-4 h-4 mr-2" /> 일반 설정
              </TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <Palette className="w-4 h-4 mr-2" /> 디자인 & 테마
              </TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <FileText className="w-4 h-4 mr-2" /> 게시글 관리
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <BookOpen className="w-4 h-4 mr-2" /> 교육 과정
              </TabsTrigger>
              <TabsTrigger value="timetable" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <Calendar className="w-4 h-4 mr-2" /> 시간표 관리
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <Edit3 className="w-4 h-4 mr-2" /> 교습소 소개
              </TabsTrigger>
              <TabsTrigger value="instructors" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <User className="w-4 h-4 mr-2" /> 강사 소개
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <ImageIcon className="w-4 h-4 mr-2" /> 갤러리
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none h-full px-0 bg-transparent shadow-none">
                <LayoutDashboard className="w-4 h-4 mr-2" /> 섹션 순서
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              
              {/* Introduction (About) */}
              <TabsContent value="about" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>교습소 소개 관리</CardTitle>
                    <CardDescription>'왜 니혼톡인가요?' 섹션의 내용을 수정합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>섹션 제목</Label>
                      <Input 
                        value={localConfig.features?.title || ""} 
                        onChange={e => setLocalConfig({
                          ...localConfig, 
                          features: { ...(localConfig.features || { title: "", items: [] }), title: e.target.value }
                        })} 
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <Label>특징 리스트 (최대 3개)</Label>
                      {(localConfig.features?.items || []).map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge>특징 {index + 1}</Badge>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">제목</Label>
                            <Input 
                              value={item.title} 
                              onChange={e => {
                                const newItems = [...(localConfig.features?.items || [])];
                                newItems[index] = { ...item, title: e.target.value };
                                setLocalConfig({
                                  ...localConfig,
                                  features: { ...(localConfig.features || { title: "", items: [] }), items: newItems }
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">설명</Label>
                            <Textarea 
                              value={item.desc} 
                              onChange={e => {
                                const newItems = [...(localConfig.features?.items || [])];
                                newItems[index] = { ...item, desc: e.target.value };
                                setLocalConfig({
                                  ...localConfig,
                                  features: { ...(localConfig.features || { title: "", items: [] }), items: newItems }
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 소개 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Instructors */}
              <TabsContent value="instructors" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>강사진 관리</CardTitle>
                    <CardDescription>강사 정보를 추가하거나 수정합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>섹션 제목</Label>
                      <Input 
                        value={localConfig.instructors?.title || ""} 
                        onChange={e => setLocalConfig({
                          ...localConfig, 
                          instructors: { ...(localConfig.instructors || { title: "", items: [] }), title: e.target.value }
                        })} 
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      {(localConfig.instructors?.items || []).map((instructor, index) => (
                        <div key={instructor.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                          <div className="flex justify-between items-center">
                            <Badge>강사 {index + 1}</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => {
                                const newItems = localConfig.instructors?.items.filter(i => i.id !== instructor.id) || [];
                                setLocalConfig({
                                  ...localConfig,
                                  instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">이름</Label>
                              <Input 
                                value={instructor.name} 
                                onChange={e => {
                                  const newItems = [...(localConfig.instructors?.items || [])];
                                  newItems[index] = { ...instructor, name: e.target.value };
                                  setLocalConfig({
                                    ...localConfig,
                                    instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">직함</Label>
                              <Input 
                                value={instructor.role} 
                                onChange={e => {
                                  const newItems = [...(localConfig.instructors?.items || [])];
                                  newItems[index] = { ...instructor, role: e.target.value };
                                  setLocalConfig({
                                    ...localConfig,
                                    instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">사진</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={instructor.imageUrl} 
                                placeholder="이미지 URL 또는 파일 첨부"
                                onChange={e => {
                                  const newItems = [...(localConfig.instructors?.items || [])];
                                  newItems[index] = { ...instructor, imageUrl: e.target.value };
                                  setLocalConfig({
                                    ...localConfig,
                                    instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                  });
                                }}
                              />
                              <div className="relative">
                                <Button variant="outline" size="icon" className="shrink-0">
                                  <Upload className="w-4 h-4" />
                                </Button>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={e => handleFileUpload(e, (url) => {
                                    const newItems = [...(localConfig.instructors?.items || [])];
                                    newItems[index] = { ...instructor, imageUrl: url };
                                    setLocalConfig({
                                      ...localConfig,
                                      instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                    });
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">소개</Label>
                            <Textarea 
                              value={instructor.bio} 
                              onChange={e => {
                                const newItems = [...(localConfig.instructors?.items || [])];
                                newItems[index] = { ...instructor, bio: e.target.value };
                                setLocalConfig({
                                  ...localConfig,
                                  instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs">경력 사항</Label>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  const newItems = [...(localConfig.instructors?.items || [])];
                                  const currentExp = instructor.experience || [];
                                  newItems[index] = { ...instructor, experience: [...currentExp, ""] };
                                  setLocalConfig({
                                    ...localConfig,
                                    instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                  });
                                }}
                              >
                                <Plus className="w-3 h-3" /> 항목 추가
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {(instructor.experience || []).map((exp, expIndex) => (
                                <div key={expIndex} className="flex gap-2">
                                  <Input 
                                    value={exp} 
                                    placeholder="경력 내용을 입력하세요 (예: 도쿄 외국어 대학교 졸업)"
                                    onChange={e => {
                                      const newItems = [...(localConfig.instructors?.items || [])];
                                      const newExp = [...(instructor.experience || [])];
                                      newExp[expIndex] = e.target.value;
                                      newItems[index] = { ...instructor, experience: newExp };
                                      setLocalConfig({
                                        ...localConfig,
                                        instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                      });
                                    }}
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="shrink-0 text-gray-400 hover:text-red-500"
                                    onClick={() => {
                                      const newItems = [...(localConfig.instructors?.items || [])];
                                      const newExp = (instructor.experience || []).filter((_, i) => i !== expIndex);
                                      newItems[index] = { ...instructor, experience: newExp };
                                      setLocalConfig({
                                        ...localConfig,
                                        instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!instructor.experience || instructor.experience.length === 0) && (
                                <p className="text-xs text-gray-400 italic py-2">등록된 경력이 없습니다. 항목을 추가해 주세요.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed"
                        onClick={() => {
                          const newItem = {
                            id: Date.now().toString(),
                            name: "새 강사",
                            role: "직함",
                            bio: "소개 내용을 입력하세요.",
                            imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
                          };
                          const newItems = [...(localConfig.instructors?.items || []), newItem];
                          setLocalConfig({
                            ...localConfig,
                            instructors: { ...(localConfig.instructors || { title: "", items: [] }), items: newItems }
                          });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> 강사 추가
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 강사 정보 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Gallery */}
              <TabsContent value="gallery" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>갤러리 관리</CardTitle>
                    <CardDescription>교습소 내부 및 수업 사진을 관리합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>섹션 제목</Label>
                      <Input 
                        value={localConfig.gallery?.title || ""} 
                        onChange={e => setLocalConfig({
                          ...localConfig, 
                          gallery: { ...(localConfig.gallery || { title: "", images: [] }), title: e.target.value }
                        })} 
                      />
                    </div>
                    <Separator />
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(localConfig.gallery?.images || []).map((image, index) => (
                        <div key={image.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                          <div className="relative aspect-video rounded-lg overflow-hidden border">
                            <img src={image.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => {
                                const newImages = localConfig.gallery?.images.filter(img => img.id !== image.id) || [];
                                setLocalConfig({
                                  ...localConfig,
                                  gallery: { ...(localConfig.gallery || { title: "", images: [] }), images: newImages }
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">이미지</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={image.url} 
                                placeholder="이미지 URL 또는 파일 첨부"
                                onChange={e => {
                                  const newImages = [...(localConfig.gallery?.images || [])];
                                  newImages[index] = { ...image, url: e.target.value };
                                  setLocalConfig({
                                    ...localConfig,
                                    gallery: { ...(localConfig.gallery || { title: "", images: [] }), images: newImages }
                                  });
                                }}
                              />
                              <div className="relative">
                                <Button variant="outline" size="icon" className="shrink-0">
                                  <Upload className="w-4 h-4" />
                                </Button>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={e => handleFileUpload(e, (url) => {
                                    const newImages = [...(localConfig.gallery?.images || [])];
                                    newImages[index] = { ...image, url: url };
                                    setLocalConfig({
                                      ...localConfig,
                                      gallery: { ...(localConfig.gallery || { title: "", images: [] }), images: newImages }
                                    });
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">설명 (캡션)</Label>
                            <Input 
                              value={image.caption} 
                              onChange={e => {
                                const newImages = [...(localConfig.gallery?.images || [])];
                                newImages[index] = { ...image, caption: e.target.value };
                                setLocalConfig({
                                  ...localConfig,
                                  gallery: { ...(localConfig.gallery || { title: "", images: [] }), images: newImages }
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="aspect-video border-dashed flex flex-col gap-2"
                        onClick={() => {
                          const newImage = {
                            id: Date.now().toString(),
                            url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
                            caption: "새 이미지 설명"
                          };
                          const newImages = [...(localConfig.gallery?.images || []), newImage];
                          setLocalConfig({
                            ...localConfig,
                            gallery: { ...(localConfig.gallery || { title: "", images: [] }), images: newImages }
                          });
                        }}
                      >
                        <Plus className="w-6 h-6" />
                        <span>이미지 추가</span>
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 갤러리 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Layout & Order */}
              <TabsContent value="layout" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>섹션 순서 관리</CardTitle>
                    <CardDescription>사이트의 각 섹션이 나타나는 순서를 변경합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {currentSectionOrder.map((sectionId, index) => (
                        <div key={sectionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">
                              {sectionId === 'about' && '교습소 소개'}
                              {sectionId === 'courses' && '교육 과정'}
                              {sectionId === 'timetable' && '시간표'}
                              {sectionId === 'posts' && '치바 쇼츠'}
                              {sectionId === 'contact' && '문의하기'}
                              {sectionId === 'gallery' && '갤러리'}
                              {sectionId === 'instructors' && '강사 소개'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={index === 0}
                              onClick={() => {
                                const newOrder = [...currentSectionOrder];
                                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                setLocalConfig({...localConfig, sectionOrder: newOrder});
                              }}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={index === currentSectionOrder.length - 1}
                              onClick={() => {
                                const newOrder = [...currentSectionOrder];
                                [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                                setLocalConfig({...localConfig, sectionOrder: newOrder});
                              }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 순서 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* General Settings */}
              <TabsContent value="general" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
                    <CardDescription>사이트의 이름과 연락처 정보를 설정합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>사이트 이름</Label>
                        <Input value={localConfig.name} onChange={e => setLocalConfig({...localConfig, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>사이트 타이틀 (SEO)</Label>
                        <Input value={localConfig.title} onChange={e => setLocalConfig({...localConfig, title: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>사이트 설명</Label>
                      <Textarea value={localConfig.description} onChange={e => setLocalConfig({...localConfig, description: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>로고 이미지 (마스코트)</Label>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLocalConfig({...localConfig, logoUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                               }
                            }} 
                            className="cursor-pointer"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">파일을 선택하여 마스코트 '치바' 이미지를 변경하세요.</p>
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 shrink-0 bg-white flex items-center justify-center p-1">
                          <img src={localConfig.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>로딩 화면 로고 (선택 사항)</Label>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLocalConfig({...localConfig, loadingLogoUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="cursor-pointer"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">로딩 화면에서 보여줄 로고를 설정하세요. 설정하지 않으면 기본 로고가 사용됩니다.</p>
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 shrink-0 bg-white flex items-center justify-center p-1">
                          <img src={localConfig.loadingLogoUrl || localConfig.logoUrl} alt="Loading Logo Preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>유튜브 채널 URL (쇼츠 연동)</Label>
                      <Input value={localConfig.youtubeUrl} onChange={e => setLocalConfig({...localConfig, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/@channel" />
                    </div>
                    <Separator />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>이메일</Label>
                        <Input value={localConfig.contactEmail} onChange={e => setLocalConfig({...localConfig, contactEmail: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>전화번호</Label>
                        <Input value={localConfig.contactPhone} onChange={e => setLocalConfig({...localConfig, contactPhone: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>주소</Label>
                      <Input value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 설정 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Design & Theme */}
              <TabsContent value="design" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>히어로 섹션</CardTitle>
                    <CardDescription>첫 화면의 메인 문구를 수정합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>메인 타이틀</Label>
                      <Input value={localConfig.heroTitle} onChange={e => setLocalConfig({...localConfig, heroTitle: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>버튼 문구</Label>
                      <Input value={localConfig.heroButtonText} onChange={e => setLocalConfig({...localConfig, heroButtonText: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>서브 타이틀</Label>
                      <Textarea value={localConfig.heroSubtitle} onChange={e => setLocalConfig({...localConfig, heroSubtitle: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>메인 히어로 이미지</Label>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLocalConfig({...localConfig, heroImageUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="cursor-pointer"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">파일을 선택하여 첫 화면의 메인 이미지를 변경하세요.</p>
                        </div>
                        {localConfig.heroImageUrl && (
                          <div className="w-24 h-16 rounded border overflow-hidden shrink-0 bg-gray-100">
                            <img src={localConfig.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>테마 설정</CardTitle>
                    <CardDescription>사이트의 색상과 폰트를 관리합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <Label>포인트 컬러 (Hex)</Label>
                        <div className="flex gap-2">
                          <Input value={localConfig.primaryColor} onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} />
                          <div className="w-10 h-10 rounded border" style={{ backgroundColor: localConfig.primaryColor }}></div>
                        </div>
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>폰트 패밀리</Label>
                        <Input value={localConfig.fontFamily} onChange={e => setLocalConfig({...localConfig, fontFamily: e.target.value})} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 디자인 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Posts Management */}
              <TabsContent value="posts" className="mt-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">게시글 목록 ({localPosts.length})</h2>
                  <Button onClick={addPost} className="gap-2">
                    <Plus className="w-4 h-4" /> 새 게시글 추가
                  </Button>
                </div>
                
                {localPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <CardTitle className="text-base">{post.title || "제목 없음"}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <Label className="text-xs">공개 여부</Label>
                          <Switch checked={post.published} onCheckedChange={val => updatePost(post.id, { published: val })} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>제목</Label>
                          <Input value={post.title} onChange={e => updatePost(post.id, { title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>카테고리</Label>
                          <Input value={post.category} onChange={e => updatePost(post.id, { category: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>대표 이미지</Label>
                        <div className="flex gap-4 items-center">
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updatePost(post.id, { imageUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="cursor-pointer"
                          />
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border">
                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>요약 문구</Label>
                        <Input value={post.excerpt} onChange={e => updatePost(post.id, { excerpt: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>본문 내용</Label>
                        <Textarea rows={6} value={post.content} onChange={e => updatePost(post.id, { content: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSavePosts} className="gap-2" size="lg">
                    <Save className="w-4 h-4" /> 모든 게시글 저장
                  </Button>
                </div>
              </TabsContent>

              {/* Courses Management */}
              <TabsContent value="courses" className="mt-0 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">교육 과정 목록 ({localCourses.length})</h2>
                  <Button onClick={addCourse} className="gap-2">
                    <Plus className="w-4 h-4" /> 새 과정 추가
                  </Button>
                </div>

                {localCourses.map((course, index) => (
                  <Card key={course.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            disabled={index === 0}
                            onClick={() => moveCourse(index, 'up')}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            disabled={index === localCourses.length - 1}
                            onClick={() => moveCourse(index, 'down')}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-base">{course.name || "과정명 없음"}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCourse(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>과정명</Label>
                          <Input value={course.name} onChange={e => updateCourse(course.id, { name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>수강료</Label>
                          <Input value={course.price} onChange={e => updateCourse(course.id, { price: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>수강 기간</Label>
                          <Input value={course.duration} onChange={e => updateCourse(course.id, { duration: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>과정 이미지</Label>
                          <div className="flex gap-2 items-center">
                            <Input 
                              type="file" 
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    updateCourse(course.id, { imageUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              className="cursor-pointer"
                            />
                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border">
                              <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>과정 설명</Label>
                        <Textarea value={course.description} onChange={e => updateCourse(course.id, { description: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCourses} className="gap-2" size="lg">
                    <Save className="w-4 h-4" /> 모든 과정 저장
                  </Button>
                </div>
              </TabsContent>

              {/* Timetable Management */}
              <TabsContent value="timetable" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>시간표 설정</CardTitle>
                    <CardDescription>시간표의 칸을 클릭하여 수업을 추가하거나 수정하세요. 직관적으로 관리할 수 있습니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Label>해당 월 (예: 4월)</Label>
                        <Input 
                          value={localConfig.scheduleMonth} 
                          onChange={e => setLocalConfig({...localConfig, scheduleMonth: e.target.value})} 
                          className="max-w-[150px]"
                        />
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        * 빈 칸을 클릭하면 새로운 수업이 추가됩니다.<br/>
                        * 등록된 수업을 클릭하면 상세 내용을 수정할 수 있습니다.
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                      <div className="grid grid-cols-7 border-b bg-gray-50">
                        <div className="p-3 text-center text-[10px] font-bold text-gray-400 border-r uppercase tracking-wider">Time</div>
                        {DAYS.map(day => (
                          <div key={day} className="p-3 text-center text-sm font-bold text-gray-700 border-r last:border-r-0">{day}</div>
                        ))}
                      </div>
                      
                      <div className="divide-y">
                        {Array.from(new Set([...DEFAULT_TIME_SLOTS, ...(localConfig.schedule || []).map(s => s.timeSlot)])).sort().map(slot => (
                          <div key={slot} className="grid grid-cols-7 group">
                            <div className="p-2 flex items-center justify-center text-[10px] font-medium text-gray-400 bg-gray-50/30 border-r">
                              {slot}
                            </div>
                            {DAYS.map(day => {
                              const items = (localConfig.schedule || []).filter(i => i.day === day && i.timeSlot === slot);
                              return (
                                <div 
                                  key={`${day}-${slot}`} 
                                  className="p-1 border-r last:border-r-0 min-h-[70px] hover:bg-blue-50/50 cursor-pointer transition-colors relative group/cell"
                                  onClick={() => {
                                    const newItem: ScheduleItem = {
                                      id: Date.now().toString(),
                                      day,
                                      timeSlot: slot,
                                      className: "새 수업",
                                      isGroup: false
                                    };
                                    setLocalConfig({...localConfig, schedule: [...(localConfig.schedule || []), newItem]});
                                    setEditingItem(newItem);
                                  }}
                                >
                                  {items.map(item => (
                                    <motion.div 
                                      key={item.id}
                                      layoutId={item.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItem(item);
                                      }}
                                      className="mb-1 p-1.5 rounded-md text-[10px] font-bold shadow-sm border border-black/5 truncate cursor-pointer hover:brightness-95 transition-all"
                                      style={{ backgroundColor: item.color || '#f3f4f6', color: '#1f2937' }}
                                    >
                                      {item.className}
                                      {item.isGroup && <div className="text-[8px] opacity-50 font-normal">그룹</div>}
                                    </motion.div>
                                  ))}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 pointer-events-none">
                                    <Plus className="w-4 h-4 text-blue-400" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                        const time = prompt("새로운 시간대를 입력하세요 (예: 09:00-10:30)");
                        if (time) {
                          const newItem: ScheduleItem = {
                            id: Date.now().toString(),
                            day: "월",
                            timeSlot: time,
                            className: "새 수업",
                            isGroup: false
                          };
                          setLocalConfig({...localConfig, schedule: [...(localConfig.schedule || []), newItem]});
                          setEditingItem(newItem);
                        }
                      }}>
                        <Plus className="w-4 h-4 mr-2" /> 시간대 직접 추가
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveConfig} className="gap-2">
                      <Save className="w-4 h-4" /> 시간표 저장
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Edit Item Modal Overlay */}
              <AnimatePresence>
                {editingItem && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg">수업 상세 설정</h3>
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>요일</Label>
                            <select 
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                              value={editingItem.day}
                              onChange={e => {
                                const updated = { ...editingItem, day: e.target.value };
                                setEditingItem(updated);
                                setLocalConfig({
                                  ...localConfig,
                                  schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                                });
                              }}
                            >
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>시간대</Label>
                            <Input 
                              value={editingItem.timeSlot}
                              onChange={e => {
                                const updated = { ...editingItem, timeSlot: e.target.value };
                                setEditingItem(updated);
                                setLocalConfig({
                                  ...localConfig,
                                  schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>수업명</Label>
                          <Input 
                            value={editingItem.className}
                            onChange={e => {
                              const updated = { ...editingItem, className: e.target.value };
                              setEditingItem(updated);
                              setLocalConfig({
                                ...localConfig,
                                schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-0.5">
                            <Label>그룹수업</Label>
                            <p className="text-[10px] text-gray-500">시간표에 '그룹' 표시가 추가됩니다.</p>
                          </div>
                          <Switch 
                            checked={editingItem.isGroup}
                            onCheckedChange={val => {
                              const updated = { ...editingItem, isGroup: val };
                              setEditingItem(updated);
                              setLocalConfig({
                                ...localConfig,
                                schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>배경 색상</Label>
                          <div className="flex gap-3">
                            <Input 
                              value={editingItem.color || ""}
                              placeholder="#f3f4f6"
                              onChange={e => {
                                const updated = { ...editingItem, color: e.target.value };
                                setEditingItem(updated);
                                setLocalConfig({
                                  ...localConfig,
                                  schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                                });
                              }}
                            />
                            <div className="w-10 h-10 rounded-lg border shadow-sm shrink-0" style={{ backgroundColor: editingItem.color || '#f3f4f6' }}></div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {['#FFD8A8', '#D3F9D8', '#A5D8FF', '#FFD3E0', '#F3F4F6'].map(color => (
                              <button 
                                key={color}
                                className="w-6 h-6 rounded-full border border-black/5"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  const updated = { ...editingItem, color };
                                  setEditingItem(updated);
                                  setLocalConfig({
                                    ...localConfig,
                                    schedule: localConfig.schedule.map(s => s.id === editingItem.id ? updated : s)
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 bg-gray-50 border-t flex justify-between gap-3">
                        <Button variant="destructive" className="gap-2" onClick={() => {
                          setLocalConfig({
                            ...localConfig,
                            schedule: (localConfig.schedule || []).filter(s => s.id !== editingItem.id)
                          });
                          setEditingItem(null);
                          toast.success("수업이 삭제되었습니다.");
                        }}>
                          <Trash2 className="w-4 h-4" /> 삭제
                        </Button>
                        <Button className="flex-1" onClick={() => setEditingItem(null)}>확인</Button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
