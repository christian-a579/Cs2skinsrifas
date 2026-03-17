"use client";

import { usePathname } from "next/navigation";

const PLACEHOLDER =
  "https://chat.whatsapp.com/SEU_LINK_AQUI";

function normalizeExternalUrl(raw: string | undefined | null) {
  const value = raw?.trim();
  if (!value) return null;
  if (value === "#") return null;

  if (/^https?:\/\//i.test(value)) return value;

  // Common case: user sets `chat.whatsapp.com/...` or `wa.me/...` without scheme.
  if (/^[a-z0-9.-]+\.[a-z]{2,}\/?/i.test(value)) return `https://${value}`;

  return null;
}

export function WhatsAppCommunityCard() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL;
  const normalized = normalizeExternalUrl(configured);
  const href =
    normalized && normalized !== PLACEHOLDER ? normalized : "#";

  if (!isHome) return null;

  return (
    <a
      href={href}
      title={
        href === "#"
          ? "Configure NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL no .env"
          : undefined
      }
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noopener noreferrer"}
      className="whatsapp-card"
      aria-label="Entrar na comunidade do WhatsApp"
      onClick={href === "#" ? (e) => e.preventDefault() : undefined}
    >
      {/* Ícone WhatsApp SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="whatsapp-icon"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.472 2.027 7.774L0 32l8.426-2.007A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.267 13.267 0 0 1-6.747-1.833l-.484-.287-5.002 1.193 1.215-4.866-.317-.499A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.878c-.398-.199-2.354-1.162-2.72-1.294-.365-.133-.631-.199-.897.199-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.619-3.202-1.977-1.183-1.056-1.981-2.361-2.213-2.759-.232-.398-.025-.613.175-.811.18-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.497-.033-.696-.1-.199-.897-2.162-1.228-2.96-.324-.776-.653-.671-.897-.683l-.764-.013c-.265 0-.696.1-1.061.497-.365.398-1.395 1.362-1.395 3.322s1.428 3.852 1.627 4.117c.199.265 2.81 4.289 6.808 6.016.951.411 1.694.656 2.272.84.955.303 1.824.26 2.511.158.766-.114 2.354-.962 2.687-1.891.333-.93.333-1.727.232-1.891-.099-.165-.365-.265-.763-.464z" />
      </svg>

      <span className="whatsapp-label">Comunidade</span>

      <span className="whatsapp-pulse" aria-hidden="true" />

      <style jsx>{`
        .whatsapp-card {
          position: fixed;
          top: calc(64px + 56px); /* altura do header + gap (mais abaixo) */
          right: 16px;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px 8px 12px;
          background: #18181b;
          border: 1px solid #25d366;
          border-radius: 9999px;
          color: #25d366;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
          transition:
            background 0.2s,
            box-shadow 0.2s,
            transform 0.15s;
        }

        .whatsapp-card:hover {
          background: #1a2e1f;
          box-shadow: 0 0 18px rgba(37, 211, 102, 0.35);
          transform: translateY(-1px);
        }

        .whatsapp-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .whatsapp-label {
          white-space: nowrap;
        }

        .whatsapp-pulse {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #25d366;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        @media (max-width: 640px) {
          .whatsapp-card {
            padding: 12px;
          }
          .whatsapp-label {
            display: none;
          }
          .whatsapp-pulse {
            display: none;
          }
        }
      `}</style>
    </a>
  );
}
