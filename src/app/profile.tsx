// src/app/profile.tsx
import { AppIcon } from "@/components/icon-label";
import LoadingOverlay from "@/components/loading-overlay";
import { useTasks } from "@/context/task-context";
import { useUser } from "@/context/user-context";
import { authService } from "@/services/authService";
import { Colors, Radius, S } from "@/styles/shared";
import { useState } from "react";
import {
  Alert,
  Modal, // <--- Added Modal
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const { user, signOut } = useUser();
  const { classes } = useTasks();

  // ── Profile editing ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  // ── Logout Modal State ───────────────────────────────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ── Stats ────────────────────────────────────────────────────────
  const activeClasses = classes.filter((c) => !c.isArchived);

  const handleSaveProfile = async () => {
    if (!nameInput.trim() || !emailInput.trim() || !user) return;
    setIsSaving(true);

    try {
      await authService.updateProfile(user.id, {
        name: nameInput,
        email: emailInput,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      Alert.alert("Error", "Could not save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Triggers the custom modal
  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  // Actually runs when they click "Log Out" inside the modal
  const executeLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false); // Only reset if it fails, otherwise screen changes
    }
  };

  if (!user) return null;

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
                {user.name || "User"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setNameInput(user.name || "");
                  setEmailInput(user.email || "");
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
                editable={false}
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
            onPress={handleLogoutPress}
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

      {/* ── Custom Logout Confirmation Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalLogoutBtn]}
                onPress={executeLogout}
              >
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading overlays */}
      <LoadingOverlay visible={isSaving} message="Saving profile…" />
      <LoadingOverlay visible={isLoggingOut} message="Logging out…" />
    </View>
  );
}

const styles = StyleSheet.create({
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

  // ── New Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
    minWidth: 90,
    alignItems: "center",
  },
  modalCancelBtn: {
    backgroundColor: Colors.inputBg,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  modalLogoutBtn: {
    backgroundColor: Colors.danger,
  },
  modalLogoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
