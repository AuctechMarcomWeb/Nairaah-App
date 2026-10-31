import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { setToken, setUser } from '../redux/slice/userSlice';
import { preloadToken } from '../api/apiConfig';
import AuthNavigation from './AuthNavigation';
import UnauthNavigation from './UnauthNavigation';

const RootNavigation = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Pre-warm token cache for faster API calls
        await preloadToken();

        // Restore from AsyncStorage
        const savedToken = await AsyncStorage.getItem('authToken');
        const savedUser = await AsyncStorage.getItem('userData');

        if (savedToken) {
          dispatch(setToken(savedToken));
        }

        if (savedUser) {
          dispatch(setUser(JSON.parse(savedUser)));
        }
      } catch (e) {
        console.error('Error restoring data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AuthNavigation /> : <UnauthNavigation />}
    </NavigationContainer>
  );
};

export default RootNavigation;


