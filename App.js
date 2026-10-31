import React from 'react';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { preloadToken } from './src/api/apiConfig';
import RootNavigation from './src/navigation/RootNavigation';
import { DrawerProvider } from './src/navigation/DrawerContext';

// Pre-warm token on app start
preloadToken().catch(console.error);

export default function App() {
  return (
    <Provider store={store}>
      <DrawerProvider>
        <RootNavigation />
      </DrawerProvider>
    </Provider>
  );
}
