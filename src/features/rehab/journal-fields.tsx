"use client";

import { useState } from "react";
import { Field, FieldNote } from "./work-form";
import { methodLabels, modeLabels, movementLabels, sideLabels } from "./clinical-labels";

export type MeasurementDraft = { movement: string; shoulderSide: string; degrees: string; method: string; mode: string; methodNotes: string };
const blank: MeasurementDraft = { movement: "", shoulderSide: "", degrees: "", method: "", mode: "", methodNotes: "" };

export function MeasurementFields({ initial }: { initial: MeasurementDraft[] }) {
  const [nextId, setNextId] = useState(initial.length);
  const [rows, setRows] = useState(() => initial.map((fields, id) => ({ id, fields })));
  function set(id: number, key: keyof MeasurementDraft, value: string) {
    setRows(current => current.map(row => row.id === id ? { ...row, fields: { ...row.fields, [key]: value } } : row));
  }
  return <div className="work-measurements">
    <input type="hidden" name="measurements" value={JSON.stringify(rows.map(row => row.fields))} />
    <FieldNote name="measurements" />
    {!rows.length && <p className="dashboard-meta">Tambahkan satu baris untuk setiap pengukuran yang benar-benar dilakukan.</p>}
    {rows.map(({ id, fields }, index) => <section className="work-measurement" key={id}>
      <div className="work-measurement-heading"><h3>Pengukuran {index + 1}</h3>
        <button type="button" className="text-link" onClick={() => setRows(current => current.filter(row => row.id !== id))}>Hapus baris</button>
      </div>
      <div className="work-grid">
        <Field as="select" name={"movement-" + id} label="Gerakan" value={fields.movement} onChange={e => set(id, "movement", e.target.value)} required>
          <option value="">Pilih gerakan</option>{Object.entries(movementLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Field>
        <Field as="select" name={"side-" + id} label="Sisi bahu" value={fields.shoulderSide} onChange={e => set(id, "shoulderSide", e.target.value)} required>
          <option value="">Pilih sisi</option><option value="LEFT">{sideLabels.LEFT}</option><option value="RIGHT">{sideLabels.RIGHT}</option>
        </Field>
        <Field name={"degrees-" + id} inputMode="decimal" label="Nilai (°)" value={fields.degrees} onChange={e => set(id, "degrees", e.target.value)} required maxLength={7} />
        <Field as="select" name={"method-" + id} label="Metode pengukuran" value={fields.method} onChange={e => set(id, "method", e.target.value)} required>
          <option value="">Pilih metode</option>{Object.entries(methodLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Field>
        <Field as="select" name={"mode-" + id} label="Mode pengukuran" value={fields.mode} onChange={e => set(id, "mode", e.target.value)}>
          <option value="">Ikuti mode sesi</option>{Object.entries(modeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Field>
        <Field name={"method-note-" + id} label="Rincian metode" value={fields.methodNotes} onChange={e => set(id, "methodNotes", e.target.value)} maxLength={255} required={fields.method === "OTHER"} />
      </div>
    </section>)}
    <button type="button" className="button button-secondary" disabled={rows.length >= 32} onClick={() => {
      setRows(current => [...current, { id: nextId, fields: { ...blank } }]);
      setNextId(nextId + 1);
    }}>Tambah pengukuran ROM</button>
  </div>;
}
