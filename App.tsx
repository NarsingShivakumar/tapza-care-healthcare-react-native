import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/app/store';
import { AppBootstrap } from './src/app/AppBootstrap';

export default function App() {
  return <Provider store={store}>
    <SafeAreaProvider>
      <AppBootstrap />
    </SafeAreaProvider>
  </Provider>;
}