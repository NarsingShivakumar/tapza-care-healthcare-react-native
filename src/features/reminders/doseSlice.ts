import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
export {doseKey} from './doseId';

export const DOSE_STORAGE_KEY = '@tapza/dose-taken/v1';
export type DoseSaveStatus = 'saving' | 'saved' | 'error';
export type DoseState = {
  taken: Record<string, boolean>;
  saveStatus: Record<string, DoseSaveStatus>;
  previousValue: Record<string, boolean>;
  persistedRevision: number;
};
const initialState: DoseState = {taken: {}, saveStatus: {}, previousValue: {}, persistedRevision: 0};

// Serialize writes so rapidly checking several medicines cannot let an older write
// overwrite a newer one. Read the *persisted* snapshot inside each queued job.
let writeQueue: Promise<void> = Promise.resolve();
const persistDose = (key: string, taken: boolean): Promise<void> => {
  const task = writeQueue.then(async () => {
    const raw = await AsyncStorage.getItem(DOSE_STORAGE_KEY);
    const decoded: unknown = raw ? JSON.parse(raw) : {};
    const saved: Record<string, boolean> = decoded && typeof decoded === 'object' && !Array.isArray(decoded)
      ? Object.fromEntries(Object.entries(decoded).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'))
      : {};
    if (taken) saved[key] = true;
    else delete saved[key];
    await AsyncStorage.setItem(DOSE_STORAGE_KEY, JSON.stringify(saved));
  });
  // A failed job must not block subsequent attempts.
  writeQueue = task.catch(() => undefined);
  return task;
};

/** Optimistic checkmark, durable storage write, then a truthful Saved indicator. */
export const saveDose = createAsyncThunk<void, {key: string; taken: boolean}, {rejectValue: string}>(
  'doses/save', async ({key, taken}, {rejectWithValue}) => {
    try { await persistDose(key, taken); }
    catch { return rejectWithValue('STORAGE_FAILED'); }
  },
  {condition: ({key}, {getState}) => (getState() as {doses: DoseState}).doses.saveStatus[key] !== 'saving'},
);

const doseSlice = createSlice({
  name: 'doses', initialState,
  reducers: {
    dosesHydrated: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.taken = action.payload;
      state.saveStatus = {};
      state.previousValue = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(saveDose.pending, (state, action) => {
      const {key, taken} = action.meta.arg;
      state.previousValue[key] = !!state.taken[key];
      state.taken[key] = taken;
      state.saveStatus[key] = 'saving';
    });
    builder.addCase(saveDose.fulfilled, (state, action) => {
      const {key} = action.meta.arg;
      delete state.previousValue[key];
      state.saveStatus[key] = 'saved';
      state.persistedRevision += 1;
    });
    builder.addCase(saveDose.rejected, (state, action) => {
      const {key} = action.meta.arg;
      state.taken[key] = state.previousValue[key] ?? false;
      delete state.previousValue[key];
      state.saveStatus[key] = 'error';
      state.persistedRevision += 1;
    });
  },
});
export const {dosesHydrated} = doseSlice.actions;
export default doseSlice.reducer;
