export type AuthFormState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
  values?: { email?: string; name?: string; privacy?: boolean };
};
