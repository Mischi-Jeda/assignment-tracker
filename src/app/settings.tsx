// src/app/settings.tsx
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@/context/user-context';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const { setIsLoggedIn } = useUser();

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>App Settings</Text>
        <Text style={styles.headerSubtitle}>Manage system preferences and display configurations.</Text>

        <View style={styles.card}>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Receive alerts for assignment deadlines</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#767577', true: '#2563eb' }}
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingTop: 44, paddingBottom: 110, flexGrow: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, fontStyle: 'italic' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10, marginTop: 20 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  settingSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutRow: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: '#ef4444' },
});