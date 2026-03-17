"use client";

import { usePathname } from "next/navigation";

const PLACEHOLDER = "https://instagram.com/SEU_PERFIL_AQUI";

export function InstagramCard() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const url = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim();
  const href = url && url !== PLACEHOLDER ? url : "#";

  if (!isHome) return null;

  return (
    <a
      href={href}
      title={
        href === "#" ? "Configure NEXT_PUBLIC_INSTAGRAM_URL no .env" : undefined
      }
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noopener noreferrer"}
      className="instagram-card"
      aria-label="Seguir no Instagram"
      onClick={href === "#" ? (e) => e.preventDefault() : undefined}
    >
      {/* Ícone Instagram SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="instagram-icon"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>

      <span className="instagram-label">Instagram</span>

      <span className="instagram-pulse" aria-hidden="true" />

      <style jsx>{`
        .instagram-card {
          position: fixed;
          /* Abaixo do card WhatsApp: header(64) + gap(56) + card~44 + gap(10) */
          top: calc(64px + 56px + 44px + 10px);
          right: 16px;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 30px 8px 16px;
          background: #18181b;
          border: 1px solid #e4405f;
          border-radius: 9999px;
          color: #e4405f;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          box-shadow: 0 0 0 0 rgba(228, 64, 95, 0.4);
          transition:
            background 0.2s,
            box-shadow 0.2s,
            transform 0.15s;
        }

        .instagram-card:hover {
          background: #2d1b24;
          box-shadow: 0 0 18px rgba(228, 64, 95, 0.35);
          transform: translateY(-1px);
        }

        .instagram-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .instagram-label {
          white-space: nowrap;
        }

        .instagram-pulse {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e4405f;
          animation: instagram-pulse 2s ease-in-out infinite;
        }

        @keyframes instagram-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        @media (max-width: 640px) {
          .instagram-card {
            padding: 12px;
          }
          .instagram-label {
            display: none;
          }
          .instagram-pulse {
            display: none;
          }
        }
      `}</style>
    </a>
  );
}
