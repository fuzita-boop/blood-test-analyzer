import { Link, useLocation } from "wouter";
import { Activity, Database, FlaskConical, History, Menu, ShieldCheck, Upload, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: Activity },
  { href: "/upload", label: "新規解析", icon: Upload },
  { href: "/history", label: "端末内の履歴", icon: History },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = (onNavigate?: () => void) => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = location === href;
        return (
          <Link key={href} href={href} onClick={onNavigate}>
            <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="h-[100dvh] min-h-[100svh] flex overflow-hidden bg-background">
      <aside className="hidden lg:flex h-full flex-col w-60 bg-sidebar text-sidebar-foreground shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-sidebar-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">採血データ解析</p>
            <p className="text-xs text-sidebar-foreground/50">完全ローカルPWA</p>
          </div>
        </div>
        {navigation()}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-start gap-2 text-xs leading-relaxed text-sidebar-foreground/60">
            <Database className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>解析履歴は、この端末・このブラウザ内にのみ保存されます。</span>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="メニューを閉じる" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
              <div className="flex items-center gap-3"><FlaskConical className="w-5 h-5 text-sidebar-primary" /><span className="text-sm font-semibold">採血データ解析</span></div>
              <button aria-label="メニューを閉じる" onClick={() => setMobileOpen(false)}><X className="w-5 h-5 text-sidebar-foreground/60" /></button>
            </div>
            {navigation(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="lg:hidden z-40 shrink-0 flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] border-b border-border bg-card/95 backdrop-blur">
          <button aria-label="メニューを開く" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5 text-foreground" /></button>
          <div className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">採血データ解析</span></div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</main>
      </div>
    </div>
  );
}
