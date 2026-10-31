import React from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from './DrawerContext';
import Sidebar from '../components/Sidebar';

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_W = SCREEN_W * 0.82;

export const DrawerOverlay = () => {
  const navigation = useNavigation();
  const { isOpen, closeDrawer } = useDrawer();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeDrawer}
    >
      {/* Overlay Background */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Drawer Sidebar */}
      <View style={styles.drawer}>
        <Sidebar
          closeDrawer={closeDrawer}
          navigation={navigation}
          activeRoute="Dashboard"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
});
