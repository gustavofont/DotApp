import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catálogo" },
  { to: "/pull", label: "Abrir Pacote" },
  { to: "/friends", label: "Amigos" },
  { to: "/trades", label: "Trocas" },
] as const;

export function Nav() {
  const { logout } = useAuth();

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link
          to="/"
          className="shrink-0 rounded-sm font-serif text-lg font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-legendary/50"
        >
          DotCard
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-x-1 gap-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded-sm border-b-2 px-2 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase outline-none transition-colors focus-visible:ring-3 focus-visible:ring-legendary/50",
                  isActive
                    ? "border-legendary text-legendary"
                    : "border-transparent text-ink-dim hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>
          Sair
        </Button>
      </div>
    </header>
  );
}
