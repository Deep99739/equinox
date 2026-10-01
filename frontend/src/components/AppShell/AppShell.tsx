import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpenText,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  HeartPulse,
  Menu,
  MessageCircle,
  Settings2,
  X,
} from "lucide-react";
import { getUserEmail, signOut } from "../../utils/authUtils";

const primary = [
  { to: "/today", label: "Today", icon: CalendarDays },
  { to: "/chat", label: "Ask Equinox", icon: MessageCircle },
  { to: "/todos", label: "Tasks", icon: CheckCircle2 },
  { to: "/notes", label: "Notes", icon: BookOpenText },
];
const secondary = [
  { to: "/wellness", label: "Wellness", icon: HeartPulse },
  { to: "/briefing", label: "Briefing", icon: ArrowUpRight },
  { to: "/agents", label: "How it works", icon: Bot },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const email = getUserEmail();
  const title =
    [...primary, ...secondary, { to: "/settings", label: "Settings" }].find(
      (item) => location.pathname.startsWith(item.to),
    )?.label || "Today";
  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => menuRef.current?.focus());
  };
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const navigateToContent = () => {
    setOpen(false);
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus(),
    );
  };
  const navItem = ({ to, label, icon: Icon }: (typeof primary)[number]) => (
    <NavLink
      key={to}
      to={to}
      end={to !== "/chat"}
      onClick={navigateToContent}
      className={({ isActive }) =>
        `app-nav-link${isActive ? " is-active" : ""}`
      }
    >
      <Icon size={19} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <button
        type="button"
        className="mobile-scrim"
        aria-label="Close navigation"
        hidden={!open}
        onClick={closeMenu}
      />
      <aside
        className={`app-sidebar${open ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-top">
          <NavLink to="/today" className="wordmark" onClick={navigateToContent}>
            <span className="brand-mark" />
            equinox<span className="wordmark-period">.</span>
          </NavLink>
          <button
            ref={closeRef}
            type="button"
            className="icon-button mobile-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-nav">
          <span className="nav-caption">Workspace</span>
          {primary.map(navItem)}
          <span className="nav-caption nav-caption-spaced">Your rhythm</span>
          {secondary.map(navItem)}
        </div>
        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " is-active" : ""}`
            }
            onClick={navigateToContent}
          >
            <Settings2 size={19} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
          <div className="sidebar-account">
            <span className="account-avatar" aria-hidden="true">
              {email?.charAt(0).toUpperCase() || "E"}
            </span>
            <div className="account-details">
              <strong>{email?.split("@")[0] || "Account"}</strong>
              <small>{email || ""}</small>
            </div>
            <button
              type="button"
              className="icon-button signout-icon"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => void signOut()}
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-frame" inert={open}>
        <header className="app-topbar">
          <button
            ref={menuRef}
            type="button"
            className="icon-button menu-button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={21} />
          </button>
          <span className="app-location">{title}</span>
          <div className="topbar-right">
            <span className="topbar-date">
              {new Intl.DateTimeFormat("en", {
                weekday: "long",
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </span>
            <span className="topbar-avatar" aria-hidden="true">
              {email?.charAt(0).toUpperCase() || "E"}
            </span>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="app-content"
          key={location.pathname}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
