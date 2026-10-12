// src/app/_layout.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter, usePathname, Tabs } from 'expo-router';
import { TaskProvider } from '../context/task-context';
import { UserProvider, useUser } from '../context/user-context';

function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useUser();

  const [emailInput, setEmailInput] = useState(user.email);
  const [passwordInput, setPasswordInput] = useState('Gwapo');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = () => {
    if (!emailInput || !passwordInput) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const derivedName = emailInput.includes('@')
      ? emailInput.split('@')[0].toUpperCase()
      : emailInput;

    setUser({
      name: derivedName || 'Mischi Jeda Jacinto Elumba',
      email: emailInput,
    });

    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={styles.loginTitle}>{isSignUp ? 'Create Account' : 'HELLO MABUHAY!'}</Text>
          <Text style={styles.loginSubtitle}>{isSignUp ? 'Just a simple signup' : 'simple log in'}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Enter email or username"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry
              placeholder="Enter password"
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 20, alignItems: 'center' }} 
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.content}>
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, (pathname === '/' || pathname === '') && styles.activeNav]} 
          onPress={() => router.push('/')}
        >
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, pathname === '/assignments' && styles.activeNav]} 
          onPress={() => router.push('/assignments')}
        >
          <Text style={styles.navIcon}>🎯</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, pathname === '/classes' && styles.activeNav]} 
          onPress={() => router.push('/classes')}
        >
          <Text style={styles.navIcon}>👥</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, pathname === '/profile' && styles.activeNav]} 
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, pathname === '/settings' && styles.activeNav]} 
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <TaskProvider>
        <MainLayout />
      </TaskProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'column',
    backgroundColor: '#f8fafc' 
  },
  content: { 
    flex: 1 
  },
  bottomNav: { 
    height: 65, 
    backgroundColor: '#ffffff', 
    borderTopWidth: 1, 
    borderTopColor: '#e2e8f0', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingBottom: 4,
  },
  navItem: { 
    padding: 10, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNav: { 
    backgroundColor: '#f3e8ff' 
  },
  navIcon: { 
    fontSize: 22 
  },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loginCard: { width: '90%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 24, padding: 32, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  loginTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  loginSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});