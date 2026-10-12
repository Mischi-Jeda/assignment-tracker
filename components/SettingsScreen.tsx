import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

interface SettingsScreenProps {
  onNavigateDashboard: () => void;
}

export default function SettingsScreen({ onNavigateDashboard }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState<boolean>(true);

  return (
    <View style={styles.dashContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>App Settings</Text>
        <Text style={styles.subtitleLeft}>Manage system preferences</Text>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Receive app alerts</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#2563eb' }}
          />
        </View>

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 30 }]} onPress={onNavigateDashboard}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}