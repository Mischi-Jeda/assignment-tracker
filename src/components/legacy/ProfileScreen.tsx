import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { styles } from '../../styles/legacy';

interface ProfileScreenProps {
  userName: string;
  setUserName: (name: string) => void;
  onNavigateDashboard: () => void;
}

export default function ProfileScreen({ userName, setUserName, onNavigateDashboard }: ProfileScreenProps) {
  const [email, setEmail] = useState<string>('jade@example.com');
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    onNavigateDashboard();
  };

  return (
    <View style={styles.dashContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitleLeft}>Update your personal information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={userName} onChangeText={setUserName} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Receive app alerts</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#cbd5e1', true: '#2563eb' }} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateDashboard}>
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
