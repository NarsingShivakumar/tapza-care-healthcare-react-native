import type {Medicine, Prescription, Timing} from '../../domain/models';

export const TIMINGS: readonly Timing[] = ['morning', 'afternoon', 'night'];
export function medicineIsActive(prescription: Prescription, medicine: Medicine, today = new Date()): boolean {
  const issued = new Date(prescription.issuedAt);
  const start = new Date(issued.getFullYear(), issued.getMonth(), issued.getDate());
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsed = Math.round((current.getTime() - start.getTime()) / 86_400_000);
  return elapsed >= 0 && elapsed < medicine.days;
}
export type ScheduledDose = {prescriptionId: string; medicine: Medicine; timing: Timing};
export function groupDoses(prescriptions: Prescription[], activeOnly: boolean, today = new Date()): Record<Timing, ScheduledDose[]> {
  const result: Record<Timing, ScheduledDose[]> = {morning: [], afternoon: [], night: []};
  for (const prescription of prescriptions) {
    for (const medicine of prescription.medicines) {
      if (activeOnly && !medicineIsActive(prescription, medicine, today)) continue;
      for (const timing of medicine.timing) result[timing].push({prescriptionId: prescription.id, medicine, timing});
    }
  }
  return result;
}
