import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

type ScreenName = 'Login' | 'SignUp' | 'ForgotPassword' | 'Dashboard' | 'Profile' | 'Settings' | 'Messages';

interface DashboardScreenProps {
  userName: string;
  onNavigate: (screen: ScreenName) => void;
}

export default function DashboardScreen({ userName, onNavigate }: DashboardScreenProps) {
  return (
    <View style={styles.dashContainer}>
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome, {userName}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>Here is your activity overview</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 24 }}>👤</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridCard} onPress={() => onNavigate('Profile')}>
          <View style={styles.iconCircleBlue}><Text style={{ fontSize: 20 }}>👤</Text></View>
          <Text style={styles.gridTitle}>Profile</Text>
          <Text style={styles.gridSubtitle}>View and edit account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => onNavigate('Settings')}>
          <View style={styles.iconCircleBlue}><Text style={{ fontSize: 20 }}>⚙️</Text></View>
          <Text style={styles.gridTitle}>Settings</Text>
          <Text style={styles.gridSubtitle}>App preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => onNavigate('Messages')}>
          <View style={styles.iconCircleBlue}><Text style={{ fontSize: 20 }}>💬</Text></View>
          <Text style={styles.gridTitle}>Messages</Text>
          <Text style={styles.gridSubtitle}>2 Inbox items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, styles.logoutCard]} onPress={() => onNavigate('Login')}>
          <View style={styles.iconCircleRed}><Text style={{ fontSize: 20 }}>🚪</Text></View>
          <Text style={[styles.gridTitle, { color: '#d9534f' }]}>Logout</Text>
          <Text style={styles.gridSubtitle}>Sign out safely</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}