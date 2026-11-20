
import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { store } from './src/app/store';
import { AppBootstrap } from './src/app/AppBootstrap';
import { useTheme } from './src/app/hooks';

function AppContent() {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Prevent double safe-area padding in existing screens */}
      <SafeAreaProvider>
        <AppBootstrap />
      </SafeAreaProvider>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
