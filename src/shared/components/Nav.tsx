import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catálogo" },
  { to: "/pull", label: "Abrir Pacote" },
  { to: "/collection", label: "Acervo" },
  { to: "/friends", label: "Amigos" },
  { to: "/trades", label: "Trocas" },
] as const;

export function Nav() {
  const { logout } = useAuth();

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <span className="shrink-0 font-serif text-lg font-semibold text-ink">DotCard</span>

        <nav className="flex flex-1 items-center gap-4 overflow-x-auto">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "shrink-0 text-sm whitespace-nowrap",
                  isActive ? "text-legendary font-semibold" : "text-ink-dim hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => void logout()}
          className="shrink-0 text-sm text-ink-faint hover:text-ink"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
