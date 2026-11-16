import React, { useEffect, useRef, useState } from 'react';
import {
  View, Modal, Pressable, Dimensions,
  StyleSheet, BackHandler, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from './DrawerContext';
import Sidebar from '../components/Sidebar';

const { width: W } = Dimensions.get('window');
const DRAWER_W  = W * 0.78;
const OPEN_MS   = 280;
const CLOSE_MS  = 240;

export const DrawerOverlay = () => {
  const navigation              = useNavigation();
  const { isOpen, closeDrawer } = useDrawer();

  // modalVisible stays true during close animation so Modal doesn't vanish instantly
  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim   = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Reset to hidden position first, then show Modal, then animate in
      slideAnim.setValue(0);
      overlayAnim.setValue(0);
      setModalVisible(true);
      // requestAnimationFrame ensures Modal is rendered before animation starts
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 1,
            speed: 14,         // higher = faster
            bounciness: 2,     // slight natural ease, no bounce
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: 1, duration: OPEN_MS, useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Slide out — hide Modal only after animation finishes
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, duration: CLOSE_MS, useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0, duration: CLOSE_MS, useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [isOpen]);

  // Android back button
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

  const translateX = slideAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [-DRAWER_W, 0],
  });

  const overlayOpacity = overlayAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.55],
  });

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View style={s.root}>

        {/* Dimmed background */}
        <Animated.View
          style={[s.overlay, { opacity: overlayOpacity }]}
          pointerEvents="none"
        />

        {/* Sliding sidebar */}
        <Animated.View style={[s.drawer, { transform: [{ translateX }] }]}>
          <Sidebar
            closeDrawer={closeDrawer}
            navigation={navigation}
            activeRoute={getActiveRouteName()}
          />
        </Animated.View>

        {/* Tap outside to close */}
        <Pressable style={s.dismissArea} onPress={closeDrawer} />

      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    width: DRAWER_W,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
    zIndex: 10,
  },
  dismissArea: {
    flex: 1,
  },
});
