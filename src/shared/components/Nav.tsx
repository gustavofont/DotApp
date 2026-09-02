import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleUserRound, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { getCurrentUserName } from "../../auth/tokenStore";
import { Button } from "../../components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

// "Abrir Pacote" and "Trocas" are deliberately not here — they're actions
// launched from Home, not standing destinations (opening a pack and
// proposing a trade are things you *do*, not places you *browse*). Keeps
// the sidebar to actual browsing destinations.
const LINKS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/catalog", labelKey: "nav.catalog" },
  { to: "/friends", labelKey: "nav.friends" },
] as const;

export function Nav() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const userName = getCurrentUserName();

  return (
    <aside className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 sm:sticky sm:top-0 sm:h-svh sm:w-56 sm:shrink-0 sm:flex-col sm:items-stretch sm:gap-0 sm:border-r sm:border-b-0 sm:px-0 sm:py-0">
      <Link
        to="/"
        className="shrink-0 rounded-sm font-serif text-lg font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-legendary/50 sm:px-6 sm:py-5"
      >
        DotCard
      </Link>

      <nav className="flex flex-1 flex-wrap items-center gap-x-1 gap-y-1 sm:flex-1 sm:flex-col sm:items-stretch sm:gap-1 sm:px-3 sm:py-2">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase outline-none transition-colors focus-visible:ring-3 focus-visible:ring-legendary/50 sm:rounded-sm",
                isActive
                  ? "bg-legendary/10 text-legendary"
                  : "text-ink-dim hover:text-ink",
              )
            }
          >
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:w-full sm:flex-col sm:items-stretch sm:gap-3 sm:border-t sm:border-hairline sm:p-3">
        <LanguageSwitcher />

        {userName ? (
          <div className="flex items-center gap-2 sm:w-full sm:rounded-sm sm:px-1 sm:py-1.5">
            <CircleUserRound className="size-7 shrink-0 rounded-full text-ink-dim" strokeWidth={1.5} />
            <span className="truncate text-sm font-medium text-ink sm:min-w-0">{userName}</span>
          </div>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 sm:w-full sm:justify-start"
          onClick={() => void logout()}
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          {t("nav.logout")}
        </Button>
      </div>
    </aside>
  );
}
