import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

interface MessagesScreenProps {
  onNavigateDashboard: () => void;
}

export default function MessagesScreen({ onNavigateDashboard }: MessagesScreenProps) {
  return (
    <View style={styles.dashContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Inbox Messages</Text>
        <Text style={styles.subtitleLeft}>Your recent activity alerts</Text>

        <View style={styles.messageBox}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderText}>Support Team</Text>
            <Text style={styles.timeText}>10:00 AM</Text>
          </View>
          <Text style={styles.messageBody}>Welcome to PoGo ! Let us know if you need help.</Text>
        </View>

        <View style={styles.messageBox}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderText}>System Alert</Text>
            <Text style={styles.timeText}>10:15 AM</Text>
          </View>
          <Text style={styles.messageBody}>Your account setup is complete.</Text>
        </View>

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={onNavigateDashboard}>
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}