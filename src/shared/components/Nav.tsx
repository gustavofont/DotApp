import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/button";
import { cn } from "@/lib/utils";

// "Abrir Pacote" and "Trocas" are deliberately not here — they're actions
// launched from Home, not standing destinations (opening a pack and
// proposing a trade are things you *do*, not places you *browse*). Keeps
// the sidebar to actual browsing destinations.
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catálogo" },
  { to: "/friends", label: "Amigos" },
] as const;

export function Nav() {
  const { logout } = useAuth();

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
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 sm:w-full sm:border-t sm:border-hairline sm:p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="sm:w-full sm:justify-start"
          onClick={() => void logout()}
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
