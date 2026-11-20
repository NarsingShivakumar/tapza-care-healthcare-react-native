import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import doseReducer, {DOSE_STORAGE_KEY, doseKey, saveDose} from '../features/reminders/doseSlice';

const makeStore = () => configureStore({reducer: {doses: doseReducer}});

describe('dose persistence feedback', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.removeItem(DOSE_STORAGE_KEY);
  });

  it('shows Saved after confirmed storage and serializes rapid dose changes', async () => {
    const store = makeStore();
    const a = doseKey('RX', 'A', 'morning', '2026-11-20');
    const b = doseKey('RX', 'B', 'night', '2026-11-20');
    await Promise.all([
      store.dispatch(saveDose({key: a, taken: true})).unwrap(),
      store.dispatch(saveDose({key: b, taken: true})).unwrap(),
    ]);
    expect(store.getState().doses.saveStatus[a]).toBe('saved');
    expect(store.getState().doses.saveStatus[b]).toBe('saved');
    expect(JSON.parse((await AsyncStorage.getItem(DOSE_STORAGE_KEY))!)).toEqual({[a]: true, [b]: true});
  });

  it('rolls back the optimistic checkmark and reports an error if storage fails', async () => {
    const store = makeStore();
    const key = doseKey('RX', 'M', 'night', '2026-11-20');
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Device full'));
    await store.dispatch(saveDose({key, taken: true}));
    expect(store.getState().doses.taken[key]).toBe(false);
    expect(store.getState().doses.saveStatus[key]).toBe('error');
  });
});
