// src/app/_layout.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, usePathname, Tabs } from 'expo-router';
import { TaskProvider } from '../context/task-context';
import { UserProvider, useUser } from '../context/user-context';
import { Colors, Radius, S } from '../styles/shared';
import { AppIcon, IconLabel } from '@/components/icon-label';

// ─── Font Awesome CDN injection (web only) ───────────────────────
// On native the icon labels carry the meaning; FA icons are a web enhancement.
const NAV_ITEMS = [
  { route: '/', label: 'Home', faIcon: 'fa-house' },
  { route: '/assignments', label: 'Tasks', faIcon: 'fa-clipboard-list' },
  { route: '/classes', label: 'Classes', faIcon: 'fa-graduation-cap' },
  { route: '/profile', label: 'Profile', faIcon: 'fa-circle-user' },
] as const;

// ─── NavIcon ─────────────────────────────────────────────────────
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

  // ── Login / Sign-up screen ──────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          {/* Avatar */}
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
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Enter email or username"
              placeholderTextColor={Colors.textMuted}
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

  // ── Main app layout ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Screen content */}
      <View style={styles.content}>
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      </View>

      {/* Bottom Navigation Bar */}
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

// ─── Root ─────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <UserProvider>
      <TaskProvider>
        <MainLayout />
      </TaskProvider>
    </UserProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.pageBg,
  },
  content: {
    flex: 1,
  },

  // Bottom nav
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

  // Login screen
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
  // inputContainer lives in S (shared), referenced directly
});
