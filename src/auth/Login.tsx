import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

function loginErrorMessage(err: unknown): string {
  const status = (err as { status?: number } | undefined)?.status;
  if (status === 429) {
    return "Muitas tentativas de login. Aguarde cerca de 1 minuto e tente de novo.";
  }
  if (status === 403) {
    return "Conta bloqueada ou inativa.";
  }
  if (status === 401 || status === 400) {
    return "Email ou senha inválidos.";
  }
  return "Não foi possível entrar agora. Tente novamente em instantes.";
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      void navigate("/", { replace: true });
    } catch (err) {
      toast.error(loginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8"
      >
        <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-ink">
          DotCard
        </h1>

        <label
          htmlFor="email"
          className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink outline-none focus-visible:border-legendary"
        />

        <label
          htmlFor="password"
          className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink outline-none focus-visible:border-legendary"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-legendary py-2.5 font-semibold text-[#241a06] transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
