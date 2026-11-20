import {createApi} from '@reduxjs/toolkit/query/react';
import type {BaseQueryFn} from '@reduxjs/toolkit/query';
import {mockFetch} from '../mock/server';
import type {MockRequest} from '../mock/server';
import {parseLayoutConfig} from '../config/schema';
import type {ApiError, Booking, BookingRequest, Doctor, LayoutConfig, Prescription, Slot} from '../domain/models';

const mockBaseQuery: BaseQueryFn<MockRequest, unknown, ApiError> = async request => {
  try { return {data: await mockFetch(request)}; }
  catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      return {error: error as ApiError};
    }
    return {error: {status: 'NETWORK_ERROR', message: 'Something went wrong. Please try again.'}};
  }
};

export const api = createApi({
  reducerPath: 'api', baseQuery: mockBaseQuery,
  tagTypes: ['Config', 'Doctors', 'Slots', 'Bookings', 'Prescriptions'],
  endpoints: builder => ({
    getConfig: builder.query<LayoutConfig, void>({
      query: () => ({path: '/config'}),
      transformResponse: (raw: unknown) => parseLayoutConfig(raw),
      providesTags: ['Config'],
    }),
    getDoctors: builder.query<Doctor[], void>({query: () => ({path: '/doctors'}), providesTags: ['Doctors']}),
    getSlots: builder.query<Slot[], {doctorId: string; date: string}>({
      query: ({doctorId, date}) => ({path: '/slots', query: {doctorId, date}}),
      providesTags: ['Slots'],
    }),
    createBooking: builder.mutation<Booking, BookingRequest>({
      query: body => ({path: '/bookings', method: 'POST', body}),
      invalidatesTags: ['Bookings', 'Slots'],
    }),
    getBookings: builder.query<Booking[], void>({query: () => ({path: '/bookings'}), providesTags: ['Bookings']}),
    getPrescriptions: builder.query<Prescription[], void>({query: () => ({path: '/prescriptions'}), providesTags: ['Prescriptions']}),
  }),
});
export const {
  useGetConfigQuery, useGetDoctorsQuery, useGetSlotsQuery,
  useCreateBookingMutation, useGetBookingsQuery, useGetPrescriptionsQuery,
} = api;
