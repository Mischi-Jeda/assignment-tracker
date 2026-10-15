import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/legacy';

interface SettingsScreenProps {
  onNavigateDashboard: () => void;
}

export default function SettingsScreen({ onNavigateDashboard }: SettingsScreenProps) {
  return (
    <View style={styles.dashContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>App Settings</Text>
        <Text style={styles.subtitleLeft}>Manage system preferences</Text>

        <Text style={styles.footerText}>Your account preferences are managed from Profile.</Text>

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 30 }]} onPress={onNavigateDashboard}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
