import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { authForgeClient } from "../api/client";
import { unwrap } from "../shared/apiUnwrap";

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  // The API always responds 200 regardless of whether the account exists
  // (anti-enumeration) — the UI mirrors that by only ever showing this one
  // neutral success state, never distinguishing "sent" from "no such account".
  const mutation = useMutation({
    mutationFn: (email: string) =>
      unwrap(authForgeClient.POST("/auth/forgot-password", { body: { email } })),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    mutation.mutate(email.trim());
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8">
        <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-ink">
          {t("forgotPassword.title")}
        </h1>

        {mutation.isSuccess ? (
          <>
            <p className="mb-6 text-center text-sm text-ink-dim">{t("forgotPassword.success")}</p>
            <Link to="/login" className="block text-center text-sm text-ink-dim hover:text-ink">
              {t("forgotPassword.backToLogin")}
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
            >
              {t("forgotPassword.email")}
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

            {mutation.error ? (
              <p className="mb-4 text-center text-sm text-destructive">
                {t("forgotPassword.errors.generic")}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mb-4 w-full rounded-lg bg-legendary py-2.5 font-semibold text-[#241a06] transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
            </button>

            <Link to="/login" className="block text-center text-sm text-ink-dim hover:text-ink">
              {t("forgotPassword.backToLogin")}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
