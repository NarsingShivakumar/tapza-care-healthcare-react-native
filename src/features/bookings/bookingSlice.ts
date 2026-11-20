import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {Booking} from '../../domain/models';

export type BookingProgress = {
  requestId: string;
  doctorId: string;
  doctorName: string;
  slotId: string;
  startsAt: string;
  status: 'pending' | 'confirmed' | 'failed';
  bookingId?: string;
  error?: string;
};
type BookingState = {entries: Record<string, BookingProgress>};
const initialState: BookingState = {entries: {}};
const bookingSlice = createSlice({
  name: 'bookingProgress', initialState,
  reducers: {
    bookingStarted: (state, action: PayloadAction<Omit<BookingProgress, 'status'>>) => {
      state.entries[action.payload.requestId] = {...action.payload, status: 'pending'};
    },
    bookingConfirmed: (state, action: PayloadAction<{requestId: string; booking: Booking}>) => {
      const entry = state.entries[action.payload.requestId];
      if (entry) { entry.status = 'confirmed'; entry.bookingId = action.payload.booking.id; entry.error = undefined; }
    },
    bookingRejected: (state, action: PayloadAction<{requestId: string; error: string}>) => {
      const entry = state.entries[action.payload.requestId];
      if (entry) { entry.status = 'failed'; entry.error = action.payload.error; }
    },
  },
});
export const {bookingStarted, bookingConfirmed, bookingRejected} = bookingSlice.actions;
export default bookingSlice.reducer;
