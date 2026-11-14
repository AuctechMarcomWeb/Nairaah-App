import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  Dimensions,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from './DrawerContext';
import Sidebar from '../components/Sidebar';

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_W = SCREEN_W * 0.75;

export const DrawerOverlay = () => {
  const navigation = useNavigation();
  const { isOpen, closeDrawer } = useDrawer();

  // Android back button closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, closeDrawer]);

  const getActiveRouteName = () => {
    try {
      const state = navigation.getState();
      const route = state?.routes?.[state.index];
      return route?.name || 'Dashboard';
    } catch {
      return 'Dashboard';
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      {/* Full screen row: drawer on left, pressable dismiss area on right */}
      <View style={styles.root}>

        {/* Drawer panel */}
        <View style={styles.drawer}>
          <Sidebar
            closeDrawer={closeDrawer}
            navigation={navigation}
            activeRoute={getActiveRouteName()}
          />
        </View>

        {/* Tap this area to close */}
        <Pressable style={styles.dismissArea} onPress={closeDrawer} />

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: DRAWER_W,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  dismissArea: {
    flex: 1,
  },
});
