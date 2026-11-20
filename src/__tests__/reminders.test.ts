import {doseKey} from '../features/reminders/doseSlice';
import {groupDoses, medicineIsActive} from '../features/reminders/schedule';
import type {Prescription} from '../domain/models';
const sample: Prescription = {
  id: 'RX1', issuedAt: '2026-11-20T10:00:00+05:30', doctorName: 'Dr Rao', clinicName: 'Tapza Clinic',
  medicines: [{id: 'M1', name: 'Medicine', dose: '1 tablet', days: 3, timing: ['morning', 'night']}],
};
describe('dose schedule', () => {
  it('creates unique date-and-timing aware dose keys', () => {
    expect(doseKey('RX1', 'M1', 'morning', '2026-11-20')).not.toBe(doseKey('RX1', 'M1', 'night', '2026-11-20'));
  });
  it('returns active doses within the course and omits expired doses', () => {
    expect(medicineIsActive(sample, sample.medicines[0]!, new Date('2026-11-21T06:00:00+05:30'))).toBe(true);
    expect(medicineIsActive(sample, sample.medicines[0]!, new Date('2026-11-27T06:00:00+05:30'))).toBe(false);
    expect(groupDoses([sample], true, new Date('2026-11-21T06:00:00+05:30')).morning).toHaveLength(1);
    expect(groupDoses([sample], true, new Date('2026-11-27T06:00:00+05:30')).night).toHaveLength(0);
  });
});
