// src/app/profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useUser } from '@/context/user-context';
import { useTasks } from '@/context/task-context';
import { Colors, Radius, S } from '@/styles/shared';
import LoadingOverlay from '@/components/loading-overlay';
import { AppIcon } from '@/components/icon-label';

// ─── Helper: icon (FA on web, emoji on native) ───────────────────
function Icon({ fa, emoji, size = 18, color = Colors.primary }: {
  fa: string;
  emoji: string;
  size?: number;
  color?: string;
}) {
  void emoji;
  return <AppIcon name={fa} size={size} color={color} />;
}

export default function ProfileScreen() {
  const { user, setUser, setIsLoggedIn } = useUser();
  const { tasks, classes } = useTasks();

  // ── Profile editing ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);

  // ── Settings (moved from Settings screen) ───────────────────────
  const [pushNotifications, setPushNotifications] = useState(true);

  // ── Stats ────────────────────────────────────────────────────────
  const activeClasses = classes.filter((c) => !c.isArchived);
  const incompleteCount = tasks.filter((t) => t.status === 'incomplete').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const archivedCount = tasks.filter((t) => t.status === 'archived').length;

  const handleSaveProfile = () => {
    if (!nameInput.trim() || !emailInput.trim()) return;
    setIsSaving(true);
    // Simulate a brief save delay so the loading overlay is visible
    setTimeout(() => {
      setUser({ name: nameInput, email: emailInput });
      setIsEditing(false);
      setIsSaving(false);
    }, 600);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => setIsLoggedIn(false),
        },
      ],
    );
  };

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>

        {/* ── Page header ── */}
        <Text style={S.pageTitle}>My Profile</Text>
        <Text style={S.pageSubtitle}>View and manage your account information.</Text>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Icon fa="fa-circle-user" emoji="👤" size={32} color={Colors.primary} />
          </View>

          {/* View / Edit toggle */}
          {!isEditing ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setNameInput(user.name);
                  setEmailInput(user.email);
                  setIsEditing(true);
                }}
              >
                <Icon fa="fa-pen" emoji="✏️" size={12} color={Colors.primary} />
                <Text style={styles.editBtnText}>  Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={S.fieldLabel}>Display Name</Text>
              <TextInput
                style={S.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={S.fieldLabel}>Email / Username</Text>
              <TextInput
                style={S.input}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="Email Address"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={[S.row, { gap: 8, marginTop: 6 }]}>
                <TouchableOpacity style={S.btnPrimary} onPress={handleSaveProfile}>
                  <Text style={S.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.btnCancel, { backgroundColor: Colors.inputBg, borderRadius: Radius.sm }]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={S.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── Activity stats ── */}
        <Text style={S.sectionHeaderFirst}>Activity Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon fa="fa-hourglass-half" emoji="⏳" size={18} color={Colors.warning} />
            <Text style={styles.statNumber}>{incompleteCount}</Text>
            <Text style={styles.statLabel}>Incomplete</Text>
          </View>
          <View style={styles.statCard}>
            <Icon fa="fa-circle-check" emoji="✅" size={18} color={Colors.success} />
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Icon fa="fa-box-archive" emoji="📦" size={18} color={Colors.textSecondary} />
            <Text style={styles.statNumber}>{archivedCount}</Text>
            <Text style={styles.statLabel}>Archived</Text>
          </View>
          <View style={styles.statCard}>
            <Icon fa="fa-graduation-cap" emoji="🎓" size={18} color={Colors.primary} />
            <Text style={styles.statNumber}>{activeClasses.length}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
        </View>

        {/* ── Preferences (moved from Settings) ── */}
        <Text style={S.sectionHeader}>Preferences</Text>
        <View style={S.card}>
          <View style={[S.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingIcon}>
              <Icon fa="fa-bell" emoji="🔔" size={16} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={S.settingTitle}>Push Notifications</Text>
              <Text style={S.settingSubtitle}>Receive alerts for assignment deadlines</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#cbd5e1', true: Colors.primary }}
              thumbColor={pushNotifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* ── Account section (moved from Settings) ── */}
        <Text style={S.sectionHeader}>Account</Text>
        <View style={S.card}>
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon fa="fa-right-from-bracket" emoji="🚪" size={16} color={Colors.danger} />
            <Text style={styles.logoutText}>  Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Loading overlay while saving */}
      <LoadingOverlay visible={isSaving} message="Saving profile…" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    minWidth: 72,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Settings row
  settingRowBorder: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logout
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.danger,
  },
});
