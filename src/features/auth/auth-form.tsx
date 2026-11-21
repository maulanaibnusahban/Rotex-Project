"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { changePassword, login, registerPatient, updatePatientProfile } from "./actions";
import { maximumPasswordLength, minimumPasswordLength, minimumPasswordMessage } from "./password-policy.mjs";

const fields = {
  name: { label: "Nama lengkap", type: "text", autoComplete: "name", maxLength: 100 },
  email: { label: "Alamat email", type: "email", autoComplete: "email", maxLength: 254 },
  password: { label: "Kata sandi", type: "password", autoComplete: "current-password", maxLength: maximumPasswordLength },
  current: { label: "Kata sandi saat ini", type: "password", autoComplete: "current-password", maxLength: maximumPasswordLength },
  newPassword: { label: "Kata sandi baru", type: "password", autoComplete: "new-password", maxLength: maximumPasswordLength },
  confirmation: {
    label: "Konfirmasi kata sandi",
    type: "password",
    autoComplete: "new-password",
    maxLength: maximumPasswordLength,
  },
} as const;

const formModes = {
  login: { action: login, button: "Masuk", fields: ["email", "password"] },
  register: { action: registerPatient, button: "Daftar", fields: ["name", "email", "newPassword", "confirmation"] },
  change: { action: changePassword, button: "Ganti kata sandi", fields: ["current", "newPassword", "confirmation"] },
  profile: { action: updatePatientProfile, button: "Simpan profil", fields: ["name"] },
} as const;

type Field = keyof typeof fields;

function useFieldError(errors?: string[]) {
  const [dismissedErrors, setDismissedErrors] = useState<string[]>();
  const message = errors === dismissedErrors ? undefined : errors?.[0];
  return { message, dismiss: message ? () => setDismissedErrors(errors) : undefined };
}

function FormField({
  mode,
  field,
  value,
  errors,
}: {
  mode: keyof typeof formModes;
  field: Field;
  value?: string;
  errors?: string[];
}) {
  const [visible, setVisible] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState("");
  const { message: error, dismiss } = useFieldError(errors);
  const config = fields[field];
  const isPassword = config.type === "password";
  const preservePassword = mode === "register" && isPassword;
  const id = `${mode}-${field}`;
  const help = field === "newPassword" && !error ? minimumPasswordMessage : undefined;
  const label = mode === "register" && field === "newPassword" ? "Kata sandi" : config.label;
  const descriptions = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      <div className={isPassword ? "password-input" : undefined}>
        <input
          id={id}
          name={field === "newPassword" ? "password" : field}
          type={visible ? "text" : config.type}
          autoComplete={config.autoComplete}
          maxLength={config.maxLength}
          minLength={field === "newPassword" ? minimumPasswordLength : undefined}
          value={preservePassword ? passwordDraft : undefined}
          defaultValue={preservePassword ? undefined : value}
          onChange={(event) => {
            if (preservePassword) setPasswordDraft(event.currentTarget.value);
            dismiss?.();
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptions || undefined}
          required
        />
        {isPassword && (
          <button
            aria-label={`${visible ? "Sembunyikan" : "Tampilkan"} ${label.toLowerCase()}`}
            type="button"
            style={{ backgroundColor: "transparent" }}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        )}
      </div>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({ mode, initialName }: { mode: keyof typeof formModes; initialName?: string }) {
  const config = formModes[mode];
  const [state, action, pending] = useActionState(config.action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const { message: privacyError, dismiss: dismissPrivacyError } = useFieldError(state.errors?.privacy);

  useEffect(() => {
    if (state.errors) formRef.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="account-form" noValidate>
      {state.message && (
        <p
          className={`feedback ${state.success ? "feedback-success" : "feedback-error"}`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
      {config.fields.map((field) => (
        <FormField
          key={field}
          field={field}
          mode={mode}
          value={field === "name" ? (state.values?.name ?? initialName) : field === "email" ? state.values?.email : undefined}
          errors={state.errors?.[field === "newPassword" ? "password" : field]}
        />
      ))}
      {mode === "register" && (
        <div>
          <div className="checkbox-row">
            <input
              id="privacy-consent"
              name="privacy"
              type="checkbox"
              required
              defaultChecked={state.values?.privacy}
              onChange={dismissPrivacyError}
              aria-invalid={Boolean(privacyError)}
              aria-describedby={privacyError ? "privacy-error" : undefined}
            />
            <label htmlFor="privacy-consent">
              Saya menyetujui{" "}
              <Link href="/privacy" target="_blank">
                Pemberitahuan Privasi
              </Link>
              .
            </label>
          </div>
          {privacyError && (
            <p className="field-error" id="privacy-error" role="alert">
              {privacyError}
            </p>
          )}
        </div>
      )}
      <button className="button button-primary" disabled={pending} type="submit">
        {pending && <LoaderCircle className="spinner" size={18} aria-hidden="true" />}
        {pending ? "Memproses…" : config.button}
      </button>
    </form>
  );
}
