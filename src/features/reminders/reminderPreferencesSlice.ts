import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type NotificationSyncStatus = 'off' | 'working' | 'ready' | 'blocked' | 'error';
export type ReminderPreferencesState = {
  enabled: boolean;
  status: NotificationSyncStatus;
  scheduledCount: number;
};
const initialState: ReminderPreferencesState = {enabled: false, status: 'off', scheduledCount: 0};

const reminderPreferencesSlice = createSlice({
  name: 'reminderPreferences', initialState,
  reducers: {
    notificationsEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
      state.status = action.payload ? 'working' : 'off';
      if (!action.payload) state.scheduledCount = 0;
    },
    notificationsStatusChanged: (state, action: PayloadAction<{status: NotificationSyncStatus; count?: number}>) => {
      state.status = action.payload.status;
      if (action.payload.count !== undefined) state.scheduledCount = action.payload.count;
    },
  },
});
export const {notificationsEnabledChanged, notificationsStatusChanged} = reminderPreferencesSlice.actions;
export default reminderPreferencesSlice.reducer;
