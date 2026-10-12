import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { styles } from './styles';

import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import DashboardScreen from './components/DashboardScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import MessagesScreen from './components/MessagesScreen';

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