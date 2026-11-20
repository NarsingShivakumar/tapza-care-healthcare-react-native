import type {Timing} from '../../domain/models';

/** One stable key per prescription + medicine + timing + local calendar day. */
export function doseKey(prescriptionId: string, medicineId: string, timing: Timing, localDate: string) {
  return [prescriptionId, medicineId, timing, localDate].join(':');
}
