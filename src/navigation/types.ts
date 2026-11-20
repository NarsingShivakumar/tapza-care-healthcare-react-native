import type {NavigatorScreenParams} from '@react-navigation/native';
export type TabRoutes = {home: undefined; bookings: undefined; prescriptions: undefined; profile: undefined};
export type RootRoutes = {
  Tabs: NavigatorScreenParams<TabRoutes> | undefined;
  Booking: {doctorId?: string; serviceId?: string; serviceName?: string};
  BookingStatus: {requestId: string};
  PrescriptionDetail: {prescriptionId: string};
  Reminders: undefined;
  Admin: undefined;
};
