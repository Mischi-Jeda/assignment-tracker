// src/components/loading-overlay.tsx
// Reusable loading overlay with dimmed backdrop.
// Usage:
//   import LoadingOverlay from '@/components/loading-overlay';
//   <LoadingOverlay visible={isLoading} />
//   <LoadingOverlay visible={isLoading} message="Saving..." />

import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/styles/shared';

interface Props {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: Props) {
  const opacityRef = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacityRef.current, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Keep modal mounted so the fade-out animation plays.
  // Modal handles its own pointer-events via the `visible` prop.
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        /* intentionally blocked — overlay is not user-dismissable */
      }}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityRef.current }]}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  message: {
    marginTop: 14,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
