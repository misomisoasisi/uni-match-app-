"use client";

import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Home, Users, BookOpen, Coffee, User, Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMyUnreadCount, getCurrentUserFlags, agreeToTerms, completeTutorial } from "./actions";
import RulesContent from "./RulesContent";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === "/") return "ホーム";
    if (path.startsWith("/match")) return "マッチング";
    if (path.startsWith("/textbook")) return "教科書マルシェ";
    if (path.startsWith("/gathering")) return "ご飯・飲み会";
    if (path.startsWith("/profile")) return "マイページ";
    if (path.startsWith("/notifications")) return "通知";
    return "うにばーしてぃ";
  };

  const [unreadCount, setUnreadCount] = useState(0);
  
  // Tutorial and Terms State
  const [showTerms, setShowTerms] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isLoadingFlags, setIsLoadingFlags] = useState(true);

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/signup') {
      getCurrentUserFlags().then(flags => {
        if (flags) {
          if (!flags.hasAgreedToTerms) {
            setShowTerms(true);
          } else if (!flags.hasSeenTutorial) {
            setShowTutorial(true);
          }
        }
        setIsLoadingFlags(false);
      }).catch(() => setIsLoadingFlags(false));
    } else {
      setIsLoadingFlags(false);
    }
  }, [pathname]);

  const handleAgreeTerms = async () => {
    await agreeToTerms();
    setShowTerms(false);
    setShowTutorial(true);
  };

  const handleCompleteTutorial = async () => {
    await completeTutorial();
    setShowTutorial(false);
  };

  const tutorialContent = [
    {
      title: "ようこそ、うにばーしてぃへ！",
      description: "「うにばーしてぃ」は、同じ大学の仲間と繋がるための専用アプリです。まずはホーム画面で今日の気分やおすすめの仲間をチェックしましょう。",
      icon: <Home size={48} color="var(--primary)" />
    },
    {
      title: "マッチングで仲間探し",
      description: "趣味や学部が近い仲間をスワイプで見つけられます。気が合いそうな人がいたら気軽にアプローチしてみましょう！",
      icon: <Users size={48} color="var(--primary)" />
    },
    {
      title: "教科書マルシェ",
      description: "使わなくなった教科書を先輩から買ったり、後輩に譲ったりできるフリーマーケット機能です。かしこく節約しましょう。",
      icon: <BookOpen size={48} color="var(--primary)" />
    },
    {
      title: "ご飯・飲み会",
      description: "空きコマのランチや週末の飲み会を企画・参加して、新しい繋がりを作りましょう。充実したキャンパスライフを！",
      icon: <Coffee size={48} color="var(--primary)" />
    }
  ];

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/signup') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const fetchCount = async () => {
        try {
          const count = await getMyUnreadCount();
          setUnreadCount(prev => {
            if (count > prev && prev !== 0) {
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('うにばーしてぃ', { body: '新しい通知が届きました！' });
              }
            }
            return count;
          });
        } catch (e) {
          console.error(e);
        }
      };

      fetchCount();
      const interval = setInterval(fetchCount, 10000);
      return () => clearInterval(interval);
    }
  }, [pathname]);

  return (
    <html lang="ja">
      <body className={`${inter.className} ${notoSansJP.className}`}>
        <main id="app-main">
          {/* Main Content Area */}
          <div className="main-content">
            {/* Top Header */}
            {pathname !== '/login' && pathname !== '/signup' && (
              <header className="top-header">
                <h1>{getPageTitle(pathname)}</h1>
                <div className="header-actions">
                  <Link href="/notifications" className="icon-btn" style={{ position: 'relative' }}>
                    <Bell />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#f43f5e', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/chat" className="icon-btn">
                    <MessageCircle />
                  </Link>
                </div>
              </header>
            )}

            {/* Views */}
            <div className="view-container" style={{ padding: (pathname === '/login' || pathname === '/signup') ? 0 : undefined }}>
              {children}
            </div>
          </div>

          {/* Sidebar / Bottom Nav */}
          {pathname !== '/login' && pathname !== '/signup' && (
            <nav className="navigation">
              <ul className="nav-links">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                  <Home />
                  <span>ホーム</span>
                </Link>
                <Link href="/matches" className={`nav-item ${pathname.startsWith('/matches') ? 'active' : ''}`}>
                  <Users />
                  <span>マッチング</span>
                </Link>
                <Link href="/textbooks" className={`nav-item ${pathname.startsWith('/textbooks') ? 'active' : ''}`}>
                  <BookOpen />
                  <span>教科書マルシェ</span>
                </Link>
                <Link href="/gatherings" className={`nav-item ${pathname.startsWith('/gatherings') ? 'active' : ''}`}>
                  <Coffee />
                  <span>ご飯・飲み会</span>
                </Link>
                <Link href="/profile" className={`nav-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
                  <User />
                  <span>マイページ</span>
                </Link>
              </ul>
            </nav>
          )}

          {/* Terms Overlay */}
          {showTerms && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>利用規約とルール</h2>
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                  <RulesContent />
                </div>
                
                <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem' }} onClick={handleAgreeTerms}>
                  規約に同意して始める
                </button>
              </div>
            </div>
          )}

          {/* Tutorial Overlay */}
          {!showTerms && showTutorial && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '1.5rem', background: 'rgba(37, 99, 235, 0.1)', padding: '1.5rem', borderRadius: '50%', display: 'inline-flex' }}>
                  {tutorialContent[tutorialStep].icon}
                </div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                  {tutorialContent[tutorialStep].title}
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  {tutorialContent[tutorialStep].description}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                  {tutorialContent.map((_, idx) => (
                    <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === tutorialStep ? 'var(--primary)' : '#cbd5e1', transition: 'background-color 0.3s' }} />
                  ))}
                </div>

                <div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                  {tutorialStep > 0 && (
                    <button className="secondary-btn" style={{ flex: 1, padding: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }} onClick={() => setTutorialStep(s => s - 1)}>
                      戻る
                    </button>
                  )}
                  <button className="primary-btn" style={{ flex: 2, padding: '0.8rem', justifyContent: 'center' }} onClick={() => {
                    if (tutorialStep < tutorialContent.length - 1) {
                      setTutorialStep(s => s + 1);
                    } else {
                      handleCompleteTutorial();
                    }
                  }}>
                    {tutorialStep < tutorialContent.length - 1 ? '次へ' : 'さっそく始める！'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </body>
    </html>
  );
}
