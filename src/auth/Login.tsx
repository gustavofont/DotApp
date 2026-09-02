import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

function loginErrorMessage(err: unknown, t: TFunction): string {
  const status = (err as { status?: number } | undefined)?.status;
  if (status === 429) {
    return t("login.errors.throttled");
  }
  if (status === 403) {
    return t("login.errors.forbidden");
  }
  if (status === 401 || status === 400) {
    return t("login.errors.invalidCredentials");
  }
  return t("login.errors.generic");
}

export function Login() {
  const { t } = useTranslation();
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
      toast.error(loginErrorMessage(err, t));
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
          {t("login.email")}
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
          {t("login.password")}
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-2 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink outline-none focus-visible:border-legendary"
        />
        <Link
          to="/forgot-password"
          className="mb-4 block text-right text-xs text-ink-faint hover:text-ink"
        >
          {t("login.forgotPasswordLink")}
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-legendary py-2.5 font-semibold text-[#241a06] transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </button>
      </form>
    </div>
  );
}
