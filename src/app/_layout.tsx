// src/app/_layout.tsx
import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, usePathname, Tabs } from 'expo-router';
import { TaskProvider } from '../context/task-context';
import { UserProvider, useUser } from '../context/user-context';
import { Colors, Radius } from '../styles/shared';
import { AppIcon, IconLabel } from '@/components/icon-label';

const NAV_ITEMS = [
  { route: '/', label: 'Home', faIcon: 'fa-house' },
  { route: '/assignments', label: 'Tasks', faIcon: 'fa-clipboard-list' },
  { route: '/classes', label: 'Classes', faIcon: 'fa-graduation-cap' },
  { route: '/profile', label: 'Profile', faIcon: 'fa-circle-user' },
] as const;

function MainLayout() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { setUser, isLoggedIn, isLoadingSession, signOut } = useUser();

  const formatUsernameToEmail = (username: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    return `${cleanUsername}@app.com`;
  };

  const handleAuth = async () => {
    const cleanUsername = usernameInput.trim();

    if (!cleanUsername || !passwordInput || (isSignUp && !confirmPasswordInput)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (isSignUp && passwordInput !== confirmPasswordInput) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (isSignUp && passwordInput.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    const generatedEmail = formatUsernameToEmail(cleanUsername);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: generatedEmail,
          password: passwordInput,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername,
            },
          },
        });
        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('profiles').upsert([
            {
              id: authData.user.id,
              username: cleanUsername,
            }
          ]);
        }

        Alert.alert('Success', 'Account created! You can now log in.');
        setIsSignUp(false);
        setPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: generatedEmail,
          password: passwordInput,
        });
        if (error) throw error;

        setUser({
          name: cleanUsername,
          email: generatedEmail,
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Authentication Error', error.message || 'Something went wrong.');
    }
  };

  if (isLoadingSession) {
    return (
      <View style={styles.loginContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <View style={styles.avatarContainer}>
            <AppIcon name="fa-circle-user" size={28} color={Colors.primary} />
          </View>

          <Text style={styles.loginTitle}>
            {isSignUp ? 'Create Account' : 'HELLO MABUHAY!'}
          </Text>
          <Text style={styles.loginSubtitle}>
            {isSignUp ? 'Just a simple signup' : 'simple log in'}
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Enter unique username"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry
              placeholder="Enter password"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {isSignUp && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPasswordInput}
                onChangeText={setConfirmPasswordInput}
                secureTextEntry
                placeholder="Confirm password"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignItems: 'center' }}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>
              {isSignUp
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      </View>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.route === '/'
              ? pathname === '/' || pathname === ''
              : pathname === item.route;

          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.activeNav]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.75}
            >
              <IconLabel
                name={item.faIcon}
                label={item.label}
                color={isActive ? Colors.navActiveIcon : Colors.navInactiveIcon}
                labelStyle={[styles.navLabel, isActive && styles.navLabelActive]}
              />
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: Colors.pageBg,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    height: 68,
    backgroundColor: Colors.navBg,
    borderTopWidth: 1,
    borderTopColor: Colors.navBorder,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
    paddingTop: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginHorizontal: 4,
  },
  activeNav: {
    backgroundColor: Colors.navActive,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.navInactiveIcon,
    marginTop: 1,
  },
  navLabelActive: {
    color: Colors.navActiveIcon,
    fontWeight: '700',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pageBg,
  },
  loginCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});