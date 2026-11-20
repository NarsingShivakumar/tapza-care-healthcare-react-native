import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore, createListenerMiddleware} from '@reduxjs/toolkit';
import {api} from '../services/api';
import bookingReducer from '../features/bookings/bookingSlice';
import doseReducer, {DOSE_STORAGE_KEY} from '../features/reminders/doseSlice';
import reminderPreferencesReducer from '../features/reminders/reminderPreferencesSlice';
import configReducer from '../features/settings/configSlice';
import settingsReducer, {languageChanged} from '../features/settings/settingsSlice';

export const DOSE_KEY = DOSE_STORAGE_KEY;
export const CONFIG_KEY = '@tapza/last-good-config/v2';
export const LANGUAGE_KEY = '@tapza/language/v1';
const listener = createListenerMiddleware();
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    layout: configReducer,
    bookingProgress: bookingReducer,
    doses: doseReducer,
    reminderPreferences: reminderPreferencesReducer,
    settings: settingsReducer,
  },
  middleware: getDefault => getDefault().prepend(listener.middleware).concat(api.middleware),
});
// Dose writes are serialized inside saveDose; do not duplicate them in listeners.
listener.startListening({
  actionCreator: languageChanged,
  effect: async (action) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, action.payload).catch(() => undefined);
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
