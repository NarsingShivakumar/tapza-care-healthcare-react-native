import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import bundled from '../../data/normal.json';
import type {LayoutConfig} from '../../domain/models';
import {parseLayoutConfig} from '../../config/schema';

type ConfigState = {current: LayoutConfig; source: 'bundled' | 'cached' | 'remote'};
const initialState: ConfigState = {current: parseLayoutConfig(bundled), source: 'bundled'};
const slice = createSlice({name: 'layout', initialState, reducers: {
  configHydrated: (state, action: PayloadAction<LayoutConfig>) => {
    if (state.source !== 'remote') {state.current = action.payload; state.source = 'cached';}
  },
  configReceived: (state, action: PayloadAction<LayoutConfig>) => {
    state.current = action.payload; state.source = 'remote';
  },
}});
export const {configHydrated, configReceived} = slice.actions;
export default slice.reducer;
