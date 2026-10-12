import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../styles';

interface ProfileScreenProps {
  userName: string;
  setUserName: (name: string) => void;
  onNavigateDashboard: () => void;
}

export default function ProfileScreen({ userName, setUserName, onNavigateDashboard }: ProfileScreenProps) {
  const [email, setEmail] = useState<string>('jade@example.com');

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