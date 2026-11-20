import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
export type Language = 'en' | 'hi' | 'te';
const initialState: {language: Language} = {language: 'en'};
const slice = createSlice({name: 'settings', initialState, reducers: {
  languageChanged: (state, action: PayloadAction<Language>) => {state.language = action.payload;},
}});
export const {languageChanged} = slice.actions;
export default slice.reducer;
