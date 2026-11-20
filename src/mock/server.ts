import AsyncStorage from '@react-native-async-storage/async-storage';
import normal from '../data/normal.json';
import festival from '../data/festival.json';
import {doctors, prescriptions} from '../data/clinic';
import type {ApiError, Booking, BookingRequest, Doctor, MockSettings, Slot} from '../domain/models';

export const MOCK_SETTINGS_KEY = '@tapza/mock-settings/v1';
const MOCK_BOOKINGS_KEY = '@tapza/mock-bookings/v1';
export const defaultMockSettings: MockSettings = {
  scene: 'normal', latencyMs: 700, failConfig: false, failBooking: false,
  emptyDoctors: false, emptySlots: false, emptyPrescriptions: false,
};
let settings: MockSettings = {...defaultMockSettings};
let bookings: Booking[] = [];
const slotTimes = ['09:00', '10:30', '12:00', '16:00', '17:30'];

export function getMockSettings(): MockSettings { return {...settings}; }
export function updateMockSettings(next: Partial<MockSettings>): MockSettings {
  settings = {...settings, ...next};
  return getMockSettings();
}
export async function persistMockSettings(): Promise<void> {
  await AsyncStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(settings));
}
export async function hydrateMockServer(): Promise<void> {
  const [savedSettings, savedBookings] = await AsyncStorage.multiGet([MOCK_SETTINGS_KEY, MOCK_BOOKINGS_KEY]);
  const storedSettings = savedSettings?.[1];
  const storedBookings = savedBookings?.[1];
  if (storedSettings) {
    try {
      const value = JSON.parse(storedSettings) as Partial<MockSettings>;
      settings = {...defaultMockSettings, ...value};
    } catch { settings = {...defaultMockSettings}; }
  }
  if (storedBookings) {
    try {
      const value: unknown = JSON.parse(storedBookings);
      bookings = Array.isArray(value) ? value as Booking[] : [];
    } catch { bookings = []; }
  }
}

export function buildSlots(doctorId: string, date: string, occupied: Booking[] = bookings): Slot[] {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return slotTimes.map((time, index) => {
    const start = new Date(`${date}T${time}:00+05:30`);
    const end = new Date(start.getTime() + 30 * 60_000);
    const id = `${doctorId}|${date}|${index}`;
    return {
      id, doctorId, startsAt: start.toISOString(), endsAt: end.toISOString(),
      available: date >= localToday && !(index === 1 && date === localToday) && !occupied.some(item => item.slotId === id),
    };
  });
}

function firstOpenSlotAt(doctorId: string): string | undefined {
  const now = Date.now();
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(); day.setDate(day.getDate() + offset);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const slot = buildSlots(doctorId, key).find(item => item.available && Date.parse(item.startsAt) > now + 15 * 60_000);
    if (slot) return slot.startsAt;
  }
  return undefined;
}

export interface MockRequest {
  path: '/config' | '/doctors' | '/slots' | '/bookings' | '/prescriptions';
  method?: 'GET' | 'POST';
  query?: Record<string, string>;
  body?: unknown;
}
function apiError(status: ApiError['status'], message: string): ApiError { return {status, message}; }
function delay(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }

/** A deterministic API boundary; replace this file with fetch() when a real backend exists. */
export async function mockFetch(request: MockRequest): Promise<unknown> {
  const snapshot = getMockSettings();
  await delay(snapshot.latencyMs);
  if (request.path === '/config') {
    if (snapshot.failConfig) throw apiError(503, 'The layout could not be refreshed. Using your saved layout.');
    return snapshot.scene === 'festival' ? festival : normal;
  }
  if (request.path === '/doctors') return snapshot.emptyDoctors ? [] : doctors.map(doctor => ({
    ...doctor, nextAvailableAt: firstOpenSlotAt(doctor.id),
  }));
  if (request.path === '/prescriptions') return snapshot.emptyPrescriptions ? [] : prescriptions;
  if (request.path === '/slots') {
    const {doctorId, date} = request.query ?? {};
    if (!doctorId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw apiError(400, 'Invalid doctor or date');
    if (snapshot.emptySlots) return [];
    return buildSlots(doctorId, date);
  }
  if (request.path === '/bookings' && request.method !== 'POST') return [...bookings];
  if (request.path === '/bookings' && request.method === 'POST') {
    if (snapshot.failBooking) throw apiError(503, 'Booking failed. Please check your connection and try again.');
    const body = request.body as BookingRequest | undefined;
    if (!body?.doctorId || !body.slotId) throw apiError(400, 'Doctor and slot are required');
    const [doctorId, date] = body.slotId.split('|');
    if (!doctorId || !date || body.doctorId !== doctorId || !doctors.some((doc: Doctor) => doc.id === doctorId)) {
      throw apiError(400, 'The requested slot is invalid');
    }
    const slot = buildSlots(body.doctorId, date).find(item => item.id === body.slotId);
    if (!slot || !slot.available) throw apiError(409, 'This time has just been booked. Please choose another.');
    const booking: Booking = {
      id: `BK-${Date.now()}-${bookings.length + 1}`, doctorId: body.doctorId,
      slotId: slot.id, startsAt: slot.startsAt, status: 'confirmed', createdAt: new Date().toISOString(),
    };
    bookings = [booking, ...bookings];
    try { await AsyncStorage.setItem(MOCK_BOOKINGS_KEY, JSON.stringify(bookings)); }
    catch { /* In-memory booking remains valid if device storage is full. */ }
    return booking;
  }
  throw apiError(404, `No mock endpoint: ${request.path}`);
}
