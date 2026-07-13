import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Mail, Lock, Chrome, Sparkles, AlertCircle, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (isLocal: boolean) => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'email' | 'bypass'>('google');
  const [email, setEmail] = useState('yjaronia@gmail.com');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === 'yjaronia@gmail.com') {
        toast.success('구글 계정으로 관리자 로그인 성공!');
        onLoginSuccess(false);
        onClose();
      } else {
        await signOut(auth);
        toast.error('관리자 권한이 없는 구글 계정입니다.');
        setAuthError('yjaronia@gmail.com 구글 계정으로 로그인해야 합니다.');
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      let errMsg = '로그인 중 오류가 발생했습니다.';
      
      if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
        errMsg = 'unauthorized-domain';
      } else if (error?.code === 'auth/popup-blocked') {
        errMsg = '팝업 차단을 해제하고 다시 시도해주세요.';
      } else if (error?.code === 'auth/cancelled-popup-request') {
        errMsg = '로그인 팝업이 닫혔습니다.';
      }
      
      setAuthError(errMsg);
      toast.error(errMsg === 'unauthorized-domain' ? '인증되지 않은 도메인입니다.' : errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email === 'yjaronia@gmail.com') {
        toast.success('이메일로 관리자 로그인 성공!');
        onLoginSuccess(false);
        onClose();
      } else {
        await signOut(auth);
        toast.error('관리자 권한이 없는 계정입니다.');
      }
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      let errMsg = '비밀번호가 올바르지 않거나 등록되지 않은 계정입니다.';
      if (error?.code === 'auth/user-not-found') {
        errMsg = '등록되지 않은 관리자 이메일입니다.';
      } else if (error?.code === 'auth/wrong-password') {
        errMsg = '비밀번호가 일치하지 않습니다.';
      } else if (error?.code === 'auth/configuration-not-found') {
        errMsg = 'Firebase에서 이메일/비밀번호 로그인 제공업체가 활성화되지 않았습니다.';
      }
      
      setAuthError(errMsg);
      toast.error('로그인 실패: ' + errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim();
    if (cleanCode === 'yj1212' || cleanCode === 'nihon1212' || cleanCode === '1212') {
      toast.success('임시 비밀번호 인증 성공! 관리자 모드가 활성화되었습니다.');
      onLoginSuccess(true);
      onClose();
    } else {
      toast.error('임시 비밀번호가 올바르지 않습니다.');
      setAuthError('올바른 비밀번호를 입력해주세요. (기본코드: yj1212 또는 nihon1212)');
    }
  };

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col relative max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gray-50 border-b border-gray-100 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">니혼톡 관리자 인증</h2>
              <p className="text-xs text-gray-500 mt-0.5">교습소 사이트의 내용을 실시간으로 관리 및 수정합니다.</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100/60 p-1 m-6 mb-2 rounded-xl border">
          <button
            onClick={() => { setActiveTab('google'); setAuthError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'google' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Chrome className="w-3.5 h-3.5" /> Google 로그인
          </button>
          <button
            onClick={() => { setActiveTab('email'); setAuthError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> 이메일 로그인
          </button>
          <button
            onClick={() => { setActiveTab('bypass'); setAuthError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bypass' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> 임시 비밀번호
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 pt-2 flex-1 overflow-y-auto">
          {/* Active Error Notice */}
          {authError && authError !== 'unauthorized-domain' && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* GOOGLE TAB */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                관리자로 지정된 구글 계정(<strong className="text-gray-900">yjaronia@gmail.com</strong>)으로 안전하게 1초만에 로그인합니다.
              </p>
              
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z" />
                    </svg>
                    Google 계정으로 계속하기
                  </>
                )}
              </Button>

              {/* Special Guide when unauthorized domain is detected */}
              {(authError === 'unauthorized-domain' || true) && (
                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/70 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>구글 로그인 에러 및 팝업 차단 해결 가이드</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    최종 배포 화면(Shared App) 또는 타 도메인에서 로그인할 때 Google API의 보안 정책 상 <span className="font-bold">"인증되지 않은 도메인(unauthorized-domain)"</span> 오류가 발생할 수 있습니다.
                  </p>
                  
                  <div className="text-[11px] text-amber-950 space-y-2 bg-white/70 p-3 rounded-xl border border-amber-200 font-mono">
                    <div className="font-sans font-semibold text-gray-700">해결 방법 1 (가장 간단):</div>
                    <div>우측의 <strong className="text-blue-700">이메일 로그인</strong> 또는 <strong className="text-blue-700">임시 비밀번호</strong> 탭을 클릭하여 로그인하세요. 도메인 등록 없이 즉시 100% 실행됩니다.</div>
                    
                    <div className="font-sans font-semibold text-gray-700 mt-2">해결 방법 2 (구글 인증 활성화):</div>
                    <div className="break-all">1. <a href="https://console.firebase.google.com/project/ai-studio-69791ad6-e69e-4f2f-ae25-0bf64cc309ed/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline font-semibold flex items-center gap-0.5 inline-flex">Firebase 콘솔 <ExternalLink className="w-2.5 h-2.5" /></a> 이동</div>
                    <div>2. 'Authorized domains(승인된 도메인)'에 아래 도메인을 복사하여 추가:</div>
                    <div className="bg-amber-100 px-2 py-1 rounded text-[10px] select-all font-bold text-amber-950 inline-block mt-1 border border-amber-200">
                      {currentDomain || 'ais-pre-c7onkyb5q6hfdwubxxzuhc-255870153519.asia-northeast1.run.app'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                도메인 승인 없이 언제 어디서나 100% 작동하는 안전한 이메일 직접 로그인 방식입니다.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">관리자 이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="email" 
                      value={email}
                      disabled
                      className="pl-10 h-10 bg-gray-50 border border-gray-200 rounded-xl font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="password" 
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-10 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>로그인하기 <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 space-y-2 text-[11px] text-blue-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>이메일 비밀번호를 설정하는 방법</span>
                </div>
                <div>이메일 로그인을 사용하려면 최초 1회 Firebase 콘솔 등록이 필요합니다:</div>
                <div className="font-mono bg-white/70 p-2.5 rounded-lg border border-blue-100 space-y-1">
                  <div>1. <a href="https://console.firebase.google.com/project/ai-studio-69791ad6-e69e-4f2f-ae25-0bf64cc309ed/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-blue-800 underline font-semibold inline-flex items-center gap-0.5">Firebase 콘솔 - 제공업체 <ExternalLink className="w-2.5 h-2.5" /></a> 이동</div>
                  <div>2. <strong className="text-gray-900">Email/Password(이메일/비밀번호)</strong> 공급업체를 사용 설정(활성화) 후 저장합니다.</div>
                  <div>3. 'Users(사용자)' 탭에서 <strong className="text-gray-900">"사용자 추가"</strong>를 눌러 이메일 <code className="bg-blue-100 px-1 rounded select-all font-bold text-blue-950">yjaronia@gmail.com</code> 및 원하시는 비밀번호를 직접 등록해주시면 즉시 로그인할 수 있습니다!</div>
                </div>
              </div>
            </form>
          )}

          {/* BYPASS TAB */}
          {activeTab === 'bypass' && (
            <form onSubmit={handleBypassLogin} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                가장 완벽한 임시 우회 수단입니다! Firebase DB 설정이나 구글 계정 연동 없이 즉시 관리자 편집 대시보드를 열어 사이트의 레이아웃을 마음껏 꾸밀 수 있습니다.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600">임시 비밀번호 (Passcode)</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="yj1212 또는 nihon1212 입력"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    className="pl-10 h-10 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                임시 비밀번호로 즉시 편집하기 <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="p-4 bg-gray-50 rounded-2xl border space-y-1.5 text-[11px] text-gray-600 leading-relaxed">
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>로컬 미리보기 및 오프라인 편집</span>
                </div>
                <div>임시 비밀번호로 로그인하면 브라우저 저장소(LocalStorage)를 활용하여 수정 사항이 즉시 화면에 반영되며 안전하게 임시 보관됩니다.</div>
                <div>이후 Firebase DB 연동이 성공하면 언제든지 데이터를 영구 클라우드에 원클릭으로 보관할 수 있습니다.</div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
