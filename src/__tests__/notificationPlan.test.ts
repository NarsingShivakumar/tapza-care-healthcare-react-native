import {buildReminderPlan, MAX_PENDING_DOSE_NOTIFICATIONS, plannedReminderId} from '../features/reminders/notifications/reminderPlan';
import {doseKey} from '../features/reminders/doseSlice';
import type {Prescription} from '../domain/models';

const prescription: Prescription = {
  id: 'RX-1', issuedAt: '2026-11-20T09:00:00', doctorName: 'Demo doctor', clinicName: 'Tapza',
  medicines: [
    {id: 'MED-1', name: 'A', dose: 'one', days: 3, timing: ['morning', 'night']},
    {id: 'MED-2', name: 'B', dose: 'one', days: 4, timing: ['afternoon']},
  ],
};

const now = new Date(2026, 10, 20, 10, 0);
describe('OS medicine reminder plan', () => {
  it('generates a non-repeating dose alarm at local 1 PM/8 PM and skips past alarms', () => {
    const plan = buildReminderPlan([prescription], {}, 'en', now);
    expect(plan).toHaveLength(9); // today: afternoon + night, next 2 days: 3 each, day 4: afternoon
    expect(new Date(plan[0]!.at).getHours()).toBe(13);
    expect(plan[0]!.id).toBe(plannedReminderId(doseKey('RX-1', 'MED-2', 'afternoon', '2026-11-20')));
    expect(plan.every(item => item.at > now.getTime())).toBe(true);
  });

  it('does not send a notification after the dose is marked taken', () => {
    const takenKey = doseKey('RX-1', 'MED-2', 'afternoon', '2026-11-20');
    const plan = buildReminderPlan([prescription], {[takenKey]: true}, 'hi', now);
    expect(plan.some(item => item.id === plannedReminderId(takenKey))).toBe(false);
    expect(plan[0]?.title).toContain('टैप्ज़ा');
  });

  it('keeps unique, capped notifications even when the API accidentally duplicates records', () => {
    const plan = buildReminderPlan(Array.from({length: 20}, () => prescription), {}, 'te', now);
    expect(new Set(plan.map(item => item.id)).size).toBe(plan.length);
    expect(plan.length).toBeLessThanOrEqual(MAX_PENDING_DOSE_NOTIFICATIONS);
  });

  it('omits expired prescriptions', () => {
    expect(buildReminderPlan([prescription], {}, 'en', new Date(2026, 11, 1))).toHaveLength(0);
  });
});
