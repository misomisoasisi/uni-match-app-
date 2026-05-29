"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Settings as SettingsIcon, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  UserX, 
  LogOut, 
  X,
  Loader2
} from "lucide-react";
import { logout, getBlockedUsers, unblockUser } from "../actions";
import RulesContent from "../RulesContent";
import { getAvatarUrl } from "@/lib/avatar";

export default function SettingsSection() {
  const [mounted, setMounted] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<"block" | "help" | "terms" | null>(null);
  
  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch blocked users when modal is opened
  useEffect(() => {
    if (activeModal === "block") {
      loadBlockedUsers();
    }
  }, [activeModal]);

  const loadBlockedUsers = async () => {
    setLoadingBlocks(true);
    try {
      const users = await getBlockedUsers();
      setBlockedUsers(users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const handleUnblock = async (userId: number) => {
    if (confirm("このユーザーのブロックを解除しますか？")) {
      const res = await unblockUser(userId);
      if (res.success) {
        setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert("ブロック解除に失敗しました。");
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logout();
      window.location.href = "/login";
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    let title = "";
    let content = null;

    if (activeModal === "block") {
      title = "ブロックしたユーザー";
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loadingBlocks ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader2 className="animate-spin" size={24} color="var(--primary)" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", fontSize: "0.95rem" }}>
              ブロックしているユーザーはいません。
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "50vh", overflowY: "auto" }}>
              {blockedUsers.map(user => (
                <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--surface-light)" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: user.color || "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src={getAvatarUrl(user.name, user.feature)} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "bold", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.dept}</div>
                  </div>
                  <button 
                    onClick={() => handleUnblock(user.id)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      backgroundColor: "transparent",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (activeModal === "help") {
      title = "ヘルプ・よくある質問";
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <strong>Q. 気になってる（いいね）とは何ですか？</strong><br />
            A. 気になる相手にアピールできる機能です。お互いに「気になってる」を送り合うとマッチングが成立し、トークを開始できます。なお、マッチングしていない状態でも直接トークを開始することは可能です。
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <strong>Q. ブロックするとどうなりますか？</strong><br />
            A. ブロックした相手は、あなたのホーム画面（おすすめの仲間）やタイムライン、その他のリストから完全に除外されます。また、相手からもあなたのつぶやきやプロフィールは見えなくなります。
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <strong>Q. 通報機能について教えてください。</strong><br />
            A. 利用規約に違反する投稿や嫌がらせ行為を行うユーザーを発見した場合、プロフィールから通報できます。通報された内容は運営のデータベースに記録され、順次確認・対処を行います。
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <strong>Q. 性格タイプはどうやって判定されますか？</strong><br />
            A. プロフィールで選択した「趣味・性格タグ」に基づいて、システムが自動的に性格タイプを判定します。タグを変更してプロフィールを保存すると、性格タイプが更新されます。
          </p>
        </div>
      );
    } else if (activeModal === "terms") {
      title = "利用規約・ガイドライン";
      content = (
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          <RulesContent />
        </div>
      );
    }

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', padding: '1.8rem', display: 'flex', flexDirection: 'column', position: 'relative', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
            <X size={20} />
          </button>
          
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 700 }}>{title}</h2>
          
          <div style={{ flex: 1, marginBottom: '1.5rem' }}>
            {content}
          </div>
          
          <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', borderRadius: '12px' }} onClick={() => setActiveModal(null)}>
            閉じる
          </button>
        </div>
      </div>
    );
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'var(--surface-light)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'var(--text-main)',
    fontWeight: 500,
    fontSize: '0.95rem'
  };

  return (
    <>
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <SettingsIcon size={20} color="var(--primary)" /> 設定・その他
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* ブロック一覧 */}
          <div 
            style={itemStyle} 
            onClick={() => setActiveModal("block")}
            className="settings-menu-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UserX size={18} color="var(--accent)" />
              <span>ブロックしたユーザー</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* ヘルプ */}
          <div 
            style={itemStyle} 
            onClick={() => setActiveModal("help")}
            className="settings-menu-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <HelpCircle size={18} color="var(--primary)" />
              <span>ヘルプ・よくある質問</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* 利用規約 */}
          <div 
            style={itemStyle} 
            onClick={() => setActiveModal("terms")}
            className="settings-menu-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={18} color="#059669" />
              <span>利用規約・ガイドライン</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* ログアウト */}
          <div 
            style={{ 
              ...itemStyle, 
              backgroundColor: 'rgba(239, 68, 68, 0.04)', 
              borderColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--accent)',
              marginTop: '0.5rem'
            }} 
            onClick={handleLogout}
            className="settings-menu-item logout"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <LogOut size={18} />
              <span>ログアウト</span>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {mounted && typeof document !== 'undefined' ? createPortal(renderModal(), document.body) : null}
    </>
  );
}
