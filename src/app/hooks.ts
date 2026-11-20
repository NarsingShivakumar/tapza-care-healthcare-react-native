import {useDispatch, useSelector, type TypedUseSelectorHook} from 'react-redux';
import {createSelector} from '@reduxjs/toolkit';
import {buildTheme} from '../theme/theme';
import type {AppDispatch, RootState} from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** One memoized theme for all subscribers; only rebuild when the config palette changes. */
const selectTheme = createSelector(
  [(state: RootState) => state.layout.current.theme],
  buildTheme,
);

export function useTheme() {
  return useAppSelector(selectTheme);
}
