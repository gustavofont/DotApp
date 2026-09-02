import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authForgeClient } from "../api/client";
import { unwrap } from "../shared/apiUnwrap";

// Same rule the backend's ResetPasswordDto enforces (@Matches) — checked
// here only for a faster UX round trip; the server validation is the one
// that actually matters.
const PASSWORD_PATTERN = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      unwrap(
        authForgeClient.POST("/auth/reset-password", { body: { token: token!, newPassword } }),
      ),
    onSuccess: () => {
      toast.success(t("resetPassword.success"));
      void navigate("/login", { replace: true });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError(null);

    if (newPassword !== confirmPassword) {
      setValidationError(t("resetPassword.errors.mismatch"));
      return;
    }
    if (newPassword.length < 8 || !PASSWORD_PATTERN.test(newPassword)) {
      setValidationError(t("resetPassword.errors.weak"));
      return;
    }
    mutation.mutate();
  }

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8 text-center">
          <p className="mb-6 text-sm text-destructive">{t("resetPassword.missingToken")}</p>
          <Link to="/forgot-password" className="text-sm text-ink-dim hover:text-ink">
            {t("resetPassword.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  // AuthForge's error body carries its own errorCode (AllExceptionsFilter) —
  // matching on that is more precise than an HTTP status number, and it's
  // what's actually available here (unwrap() throws the parsed error body
  // as-is, it doesn't attach a `.status` the way AuthContext's login() does).
  const errorCode = (mutation.error as { errorCode?: string } | undefined)?.errorCode;
  const apiErrorMessage =
    errorCode === "INVALID_RESET_TOKEN"
      ? t("resetPassword.errors.invalidToken")
      : t("resetPassword.errors.generic");

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8"
      >
        <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-ink">
          {t("resetPassword.title")}
        </h1>

        <label
          htmlFor="newPassword"
          className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
        >
          {t("resetPassword.newPassword")}
        </label>
        <input
          id="newPassword"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="mb-1 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink outline-none focus-visible:border-legendary"
        />
        <p className="mb-4 text-xs text-ink-faint">{t("resetPassword.passwordHint")}</p>

        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
        >
          {t("resetPassword.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mb-4 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink outline-none focus-visible:border-legendary"
        />

        {validationError ? (
          <p className="mb-4 text-center text-sm text-destructive">{validationError}</p>
        ) : mutation.error ? (
          <p className="mb-4 text-center text-sm text-destructive">{apiErrorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-legendary py-2.5 font-semibold text-[#241a06] transition-opacity disabled:opacity-50"
        >
          {mutation.isPending ? t("resetPassword.submitting") : t("resetPassword.submit")}
        </button>
      </form>
    </div>
  );
}
