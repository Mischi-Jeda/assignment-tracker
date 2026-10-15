import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/legacy';
import { AppIcon } from '../icon-label';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateSignUp: () => void;
  onNavigateForgot: () => void;
}

export default function LoginScreen({ onLogin, onNavigateSignUp, onNavigateForgot }: LoginScreenProps) {
  const [loginInput, setLoginInput] = useState<string>('jade@gmail.com');
  const [password, setPassword] = useState<string>('Gwapo');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <AppIcon name="fa-user" size={32} color="#2563eb" />
      </View>
      <Text style={styles.title}>HELLO MABUHAY!!</Text>
      <Text style={styles.subtitle}>Activity Tracker</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email or Username</Text>
        <TextInput style={styles.input} value={loginInput} onChangeText={setLoginInput} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.forgotButton} onPress={onNavigateForgot}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onNavigateSignUp}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
