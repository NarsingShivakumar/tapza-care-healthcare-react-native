import reducer, {bookingConfirmed, bookingRejected, bookingStarted} from '../features/bookings/bookingSlice';
import type {Booking} from '../domain/models';

const initial = {requestId: 'req1', doctorId: 'dr_ananya', doctorName: 'Dr. Ananya Rao', slotId: 'dr_ananya|2026-11-25|0', startsAt: '2026-11-25T03:30:00.000Z'};
const booking: Booking = {id: 'BK1', doctorId: initial.doctorId, slotId: initial.slotId, startsAt: initial.startsAt, createdAt: '2026-11-20T08:00:00.000Z', status: 'confirmed'};
describe('optimistic booking state machine', () => {
  it('shows pending immediately and then reconciles success', () => {
    const pending = reducer(undefined, bookingStarted(initial));
    expect(pending.entries.req1?.status).toBe('pending');
    const confirmed = reducer(pending, bookingConfirmed({requestId: 'req1', booking}));
    expect(confirmed.entries.req1?.status).toBe('confirmed');
    expect(confirmed.entries.req1?.bookingId).toBe('BK1');
  });
  it('retains failed request with actionable error instead of showing false success', () => {
    const pending = reducer(undefined, bookingStarted(initial));
    const failed = reducer(pending, bookingRejected({requestId: 'req1', error: '409: Slot taken'}));
    expect(failed.entries.req1?.status).toBe('failed');
    expect(failed.entries.req1?.error).toContain('Slot taken');
  });
  it('ignores stale confirmations for an unknown request ID', () => {
    const state = reducer(undefined, bookingConfirmed({requestId: 'missing', booking}));
    expect(Object.keys(state.entries)).toHaveLength(0);
  });
});
