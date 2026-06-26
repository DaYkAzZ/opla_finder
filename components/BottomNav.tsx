"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isTop5 = pathname === "/top-5";
  const isProfile = pathname === "/profile";

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        <Link
          href="/"
          className={`bottom-nav__link${isHome ? " bottom-nav__link--active" : ""}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="bottom-nav__label">Accueil</span>
        </Link>

        <Link
          href="/top-5"
          className={`bottom-nav__fab-wrap${isTop5 ? " bottom-nav__fab-wrap--active" : ""}`}
        >
          <span className="bottom-nav__fab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3V9M16 3V9M4 11H20M8 15H16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="bottom-nav__label">Top 5</span>
        </Link>

        <Link
          href="/profile"
          className={`bottom-nav__link${isProfile ? " bottom-nav__link--active" : ""}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="bottom-nav__label">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
