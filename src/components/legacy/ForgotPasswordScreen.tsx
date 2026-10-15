import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../../styles/legacy';

interface ForgotPasswordScreenProps {
  onNavigateLogin: () => void;
}

export default function ForgotPasswordScreen({ onNavigateLogin }: ForgotPasswordScreenProps) {
  const handleReset = () => {
    Alert.alert('Reset Sent', 'Password reset instructions sent to your email.');
    onNavigateLogin();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={[styles.subtitle, { textAlign: 'left', marginBottom: 20 }]}>
        Enter the email address linked to your account.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor="#999" />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
        <Text style={styles.primaryButtonText}>Send reset instructions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateLogin}>
        <Text style={styles.secondaryButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}