// src/app/profile.tsx
import { AppIcon } from "@/components/icon-label";
import LoadingOverlay from "@/components/loading-overlay";
import { useTasks } from "@/context/task-context";
import { useUser } from "@/context/user-context";
import { Colors, Radius, S } from "@/styles/shared";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Helper: icon (FA on web, emoji on native) ───────────────────
function Icon({
  fa,
  emoji,
  size = 18,
  color = Colors.primary,
}: {
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
  const { classes } = useTasks();

  // ── Profile editing ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);

  // ── Stats ────────────────────────────────────────────────────────
  const activeClasses = classes.filter((c) => !c.isArchived);

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
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => setIsLoggedIn(false),
      },
    ]);
  };

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>
        {/* ── Clean Instagram-Style App Header (TaskFlow) ── */}
        <View style={styles.instaHeader}>
          <View style={styles.instaBrandGroup}>
            <View style={styles.instaIconContainer}>
              <Icon
                fa="fa-graduation-cap"
                emoji="🎓"
                size={18}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.instaAppName}>Assignment Tracker</Text>
          </View>
        </View>

        {/* ── Page header ── */}
        <Text style={S.pageTitle}>My Profile</Text>
        <Text style={[S.pageSubtitle, { marginBottom: 16 }]}>
          View and manage your account information.
        </Text>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Icon
              fa="fa-circle-user"
              emoji="👤"
              size={32}
              color={Colors.primary}
            />
          </View>

          {/* View / Edit toggle */}
          {!isEditing ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setNameInput(user.name);
                  setEmailInput(user.email);
                  setIsEditing(true);
                }}
              >
                <Icon fa="fa-pen" emoji="✏️" size={12} color={Colors.primary} />
                <Text style={styles.editBtnText}> Edit Profile</Text>
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
                <TouchableOpacity
                  style={S.btnPrimary}
                  onPress={handleSaveProfile}
                >
                  <Text style={S.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    S.btnCancel,
                    {
                      backgroundColor: Colors.inputBg,
                      borderRadius: Radius.sm,
                    },
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={S.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── Account section ── */}
        <Text style={S.sectionHeaderFirst}>Account</Text>
        <View style={S.card}>
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon
              fa="fa-right-from-bracket"
              emoji="🚪"
              size={16}
              color={Colors.danger}
            />
            <Text style={styles.logoutText}> Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading overlay while saving */}
      <LoadingOverlay visible={isSaving} message="Saving profile…" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Instagram-style clean app header top bar
  instaHeader: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  instaBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  instaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  instaAppName: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: Colors.textPrimary,
  },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  editBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },

  // Logout
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.danger,
  },
});
