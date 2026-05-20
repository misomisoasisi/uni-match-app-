"use client";

import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Home, Users, BookOpen, Coffee, User, Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMyUnreadCount } from "./actions";

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
  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/signup') {
      getMyUnreadCount().then(setUnreadCount).catch(console.error);
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
                  <button className="icon-btn"><MessageCircle /></button>
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
        </main>
      </body>
    </html>
  );
}
