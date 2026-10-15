import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { styles } from './src/styles/legacy';

import LoginScreen from './src/components/legacy/LoginScreen';
import SignUpScreen from './src/components/legacy/SignUpScreen';
import ForgotPasswordScreen from './src/components/legacy/ForgotPasswordScreen';
import DashboardScreen from './src/components/legacy/DashboardScreen';
import ProfileScreen from './src/components/legacy/ProfileScreen';
import SettingsScreen from './src/components/legacy/SettingsScreen';
import MessagesScreen from './src/components/legacy/MessagesScreen';

type ScreenName = 'Login' | 'SignUp' | 'ForgotPassword' | 'Dashboard' | 'Profile' | 'Settings' | 'Messages';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [userName, setUserName] = useState<string>('Jade');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentScreen === 'Login' && (
          <LoginScreen
            onLogin={() => setCurrentScreen('Dashboard')}
            onNavigateSignUp={() => setCurrentScreen('SignUp')}
            onNavigateForgot={() => setCurrentScreen('ForgotPassword')}
          />
        )}
        {currentScreen === 'SignUp' && (
          <SignUpScreen
            onSignUp={() => setCurrentScreen('Dashboard')}
            onNavigateLogin={() => setCurrentScreen('Login')}
          />
        )}
        {currentScreen === 'ForgotPassword' && (
          <ForgotPasswordScreen
            onNavigateLogin={() => setCurrentScreen('Login')}
          />
        )}
        {currentScreen === 'Dashboard' && (
          <DashboardScreen
            userName={userName}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
        {currentScreen === 'Profile' && (
          <ProfileScreen
            userName={userName}
            setUserName={setUserName}
            onNavigateDashboard={() => setCurrentScreen('Dashboard')}
          />
        )}
        {currentScreen === 'Settings' && (
          <SettingsScreen
            onNavigateDashboard={() => setCurrentScreen('Dashboard')}
          />
        )}
        {currentScreen === 'Messages' && (
          <MessagesScreen
            onNavigateDashboard={() => setCurrentScreen('Dashboard')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}