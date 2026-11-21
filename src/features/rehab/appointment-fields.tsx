"use client";

import { useState } from "react";
import { Field } from "./work-form";

type Person = { user: { id: string; name: string } };
type AssignmentPair = { doctor: Person; patient: Person };

export function AppointmentFields({ pairs, fixedDoctor, initialDoctor, initialPatient }: {
  pairs: AssignmentPair[];
  fixedDoctor?: string;
  initialDoctor: string;
  initialPatient: string;
}) {
  const doctors = [...new Map(pairs.map(({ doctor }) => [doctor.user.id, doctor.user.name])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "id"));
  const [doctorId, setDoctorId] = useState(fixedDoctor ?? (doctors.some(([id]) => id === initialDoctor) ? initialDoctor : ""));
  const patients = [...new Map(pairs.filter(({ doctor }) => doctor.user.id === doctorId)
    .map(({ patient }) => [patient.user.id, patient.user.name])).entries()];
  const [patientId, setPatientId] = useState(patients.some(([id]) => id === initialPatient) ? initialPatient : "");
  return <>
    {fixedDoctor ? <input type="hidden" name="doctorId" value={fixedDoctor} />
      : <Field as="select" name="doctorId" label="Dokter" value={doctorId} required onChange={event => {
        setDoctorId(event.currentTarget.value);
        setPatientId("");
      }}>
        <option value="">Pilih dokter</option>
        {doctors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </Field>}
    <Field as="select" name="patientId" label="Pasien" value={patientId} required disabled={!doctorId}
      onChange={event => setPatientId(event.currentTarget.value)}>
      <option value="">{doctorId ? "Pilih pasien" : "Pilih dokter terlebih dahulu"}</option>
      {patients.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </Field>
  </>;
}
