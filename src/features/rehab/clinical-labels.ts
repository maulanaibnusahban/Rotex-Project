import type { AppointmentStatus, MeasurementMethod, MovementType, SessionShoulderSide, TherapyMode } from "@prisma/client";

export const movementLabels: Record<MovementType, string> = {
  FLEXION: "Fleksi", EXTENSION: "Ekstensi", ABDUCTION: "Abduksi", ADDUCTION: "Adduksi",
};
export const sideLabels: Record<SessionShoulderSide, string> = { LEFT: "Kiri", RIGHT: "Kanan", BOTH: "Kedua bahu" };
export const modeLabels: Record<TherapyMode, string> = { ACTIVE: "Aktif", PASSIVE: "Pasif" };
export const methodLabels: Record<MeasurementMethod, string> = {
  ROTEX_HANDLE_ANGLE: "Sudut handle ROTEX",
  CALIBRATED_SHOULDER_ANGLE: "Sudut bahu setelah kalibrasi",
  GONIOMETER: "Goniometer",
  OTHER: "Metode lain",
};

export const appointmentLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Terjadwal", COMPLETED: "Selesai", CANCELLED: "Dibatalkan", NO_SHOW: "Tidak hadir",
};

export const clinicalNotes = [
  ["chiefComplaint", "Keluhan utama"],
  ["initialCondition", "Kondisi awal dan hasil pemeriksaan"],
  ["observations", "Observasi klinis"],
  ["assessment", "Penilaian atau diagnosis dokter"],
  ["patientResponse", "Respons pasien"],
  ["followUpPlan", "Rencana tindak lanjut"],
  ["postSessionNotes", "Catatan setelah sesi"],
] as const;
