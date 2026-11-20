import {buildSlots} from '../mock/server';
import type {Booking} from '../domain/models';

describe('mock scheduling contract', () => {
  it('returns five deterministic slots with real ISO timestamps', () => {
    const slots = buildSlots('dr_ananya', '2099-12-31', []);
    expect(slots).toHaveLength(5);
    expect(new Date(slots[0]!.startsAt).toISOString()).toBe(slots[0]!.startsAt);
  });
  it('makes the booked slot unavailable, permitting HTTP 409 conflict handling', () => {
    const first = buildSlots('dr_ananya', '2099-12-31', [])[0]!;
    const booking: Booking = {id: 'B', doctorId: first.doctorId, slotId: first.id, startsAt: first.startsAt, createdAt: first.startsAt, status: 'confirmed'};
    expect(buildSlots('dr_ananya', '2099-12-31', [booking])[0]!.available).toBe(false);
  });
});
