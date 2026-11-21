"use client";

import { createContext, startTransition, useActionState, useContext, type ComponentProps, type ReactNode } from "react";
import type { WorkFormState } from "./core";

type Action = (state: WorkFormState, input: FormData) => Promise<WorkFormState>;
const Fields = createContext<WorkFormState["errors"]>(undefined);

export function FieldNote({ name }: { name: string }) {
  const error = useContext(Fields)?.[name]?.[0];
  return error ? <p className="field-error" role="alert">{error}</p> : null;
}

export function WorkForm({ action, children, className, confirmation, id }: {
  action: Action;
  children: ReactNode;
  className?: string;
  confirmation?: string;
  id?: string;
}) {
  const [state, dispatch, pending] = useActionState(action, {});
  return (
    <form id={id} className={className} action={dispatch} noValidate onSubmit={(event) => {
      event.preventDefault();
      const submitter = (event.nativeEvent as SubmitEvent).submitter;
      const intent = submitter instanceof HTMLButtonElement ? submitter.value : "";
      const prompt = submitter?.getAttribute("data-confirm") ?? confirmation;
      if (prompt && !window.confirm(prompt)) return;
      const data = new FormData(event.currentTarget, submitter);
      if (intent && !data.has("intent")) data.set("intent", intent);
      startTransition(() => dispatch(data));
    }}>
      {state.message && <p role={state.success ? "status" : "alert"} className={"feedback " + (state.success ? "feedback-success" : "feedback-error")}>{state.message}</p>}
      {state.errors && <p role="alert" className="feedback feedback-error">Periksa isian yang ditandai sebelum melanjutkan.</p>}
      <Fields.Provider value={state.errors}>
        <fieldset disabled={pending} className="work-fields">{children}</fieldset>
      </Fields.Provider>
      {pending && <p role="status" className="dashboard-meta">Menyimpan perubahan…</p>}
    </form>
  );
}

type FieldProps =
  | ({ as?: "input" } & ComponentProps<"input">)
  | ({ as: "textarea" } & ComponentProps<"textarea">)
  | ({ as: "select" } & ComponentProps<"select">);

export function Field({ label, ...props }: FieldProps & { label: string; name: string }) {
  const errors = useContext(Fields);
  const { as, ...attrs } = props;
  const error = errors?.[props.name]?.[0];
  const id = attrs.id ?? attrs.name;
  const accessibility = { id, "aria-invalid": Boolean(error), "aria-describedby": error ? id + "-error" : undefined };
  return <div className="field work-field">
    <label htmlFor={id}>{label}{attrs.required && <span aria-hidden="true"> *</span>}</label>
    {as === "select" ? <select {...attrs as ComponentProps<"select">} {...accessibility} />
      : as === "textarea" ? <textarea {...attrs as ComponentProps<"textarea">} {...accessibility} />
      : <input {...attrs as ComponentProps<"input">} {...accessibility} />}
    {error && <p className="field-error" id={id + "-error"}>{error}</p>}
  </div>;
}
