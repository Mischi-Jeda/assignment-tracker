// src/app/profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useUser } from '@/context/user-context';
import { useTasks } from '@/context/task-context';

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const { tasks, classes } = useTasks();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);

  const activeClasses = classes.filter((c) => !c.isArchived);
  const incompleteCount = tasks.filter((t) => t.status === 'incomplete').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleSaveProfile = () => {
    if (!nameInput.trim() || !emailInput.trim()) return;
    setUser({
      name: nameInput,
      email: emailInput,
    });
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>User Profile</Text>
        <Text style={styles.headerSubtitle}>View and manage your account information.</Text>

        {/* Main Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>

          {!isEditing ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNameInput(user.name);
                  setEmailInput(user.email);
                  setIsEditing(true);
                }}
              >
                <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Full Name"
              />

              <Text style={styles.inputLabel}>Email / Username</Text>
              <TextInput
                style={styles.input}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="Email Address"
              />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={{ color: '#64748b', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Quick Activity Stats */}
        <Text style={styles.sectionHeader}>Activity Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{incompleteCount}</Text>
            <Text style={styles.statLabel}>Incomplete Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeClasses.length}</Text>
            <Text style={styles.statLabel}>Enrolled Classes</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingTop: 44, paddingBottom: 110, flexGrow: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, fontStyle: 'italic' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  userEmail: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 8 },
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editButtonText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    fontSize: 13,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '500', textAlign: 'center' },
});