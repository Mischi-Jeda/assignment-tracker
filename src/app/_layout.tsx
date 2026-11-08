// src/app/_layout.tsx
import { AppIcon, IconLabel } from "@/components/icon-label";
import { supabase } from "@/lib/supabase";
import { Slot, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TaskProvider } from "../context/task-context";
import { UserProvider, useUser } from "../context/user-context";
import { Colors, Radius } from "../styles/shared";

const NAV_ITEMS = [
  { route: "/", label: "Home", faIcon: "fa-house" },
  { route: "/assignments", label: "Tasks", faIcon: "fa-clipboard-list" },
  { route: "/classes", label: "Classes", faIcon: "fa-graduation-cap" },
  { route: "/profile", label: "Profile", faIcon: "fa-circle-user" },
] as const;

function MainLayout() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 State for our custom feedback modal
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
  });

  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoadingSession } = useUser();

  const formatUsernameToEmail = (username: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
    return `${cleanUsername}@app.com`;
  };

  // Helper to easily trigger the modal
  const showFeedback = (title: string, message: string, isError = false) => {
    setFeedbackModal({ visible: true, title, message, isError });
  };

  const handleAuth = async () => {
    const cleanUsername = usernameInput.trim();

    if (
      !cleanUsername ||
      !passwordInput ||
      (isSignUp && !confirmPasswordInput)
    ) {
      showFeedback("Missing Fields", "Please fill in all fields.", true);
      return;
    }

    if (isSignUp && passwordInput !== confirmPasswordInput) {
      showFeedback(
        "Passwords Do Not Match",
        "Please make sure both passwords are the same.",
        true,
      );
      return;
    }

    if (isSignUp && passwordInput.length < 6) {
      showFeedback(
        "Password Too Short",
        "Password must be at least 6 characters.",
        true,
      );
      return;
    }

    const generatedEmail = formatUsernameToEmail(cleanUsername);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: generatedEmail,
            password: passwordInput,
            options: {
              data: {
                username: cleanUsername,
                full_name: cleanUsername,
              },
            },
          },
        );
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert([
              {
                id: authData.user.id,
                username: cleanUsername,
              },
            ]);
          if (profileError)
            console.error("Profile creation failed:", profileError);
        }

        // 🔥 NEW: Kill the auto-session immediately!
        await supabase.auth.signOut();

        // Reset form to Login mode
        setIsSignUp(false);
        setPasswordInput("");
        setConfirmPasswordInput("");

        // Show success modal
        showFeedback(
          "Account Created",
          "Your account is ready! Please log in with your new credentials.",
          false,
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: generatedEmail,
          password: passwordInput,
        });
        if (error) throw error;
        // UserProvider automatically handles the redirect on login success
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      showFeedback(
        "Authentication Error",
        error.message || "Something went wrong.",
        true,
      );
    } finally {
      setIsSubmitting(false);
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
            {isSignUp ? "Create Account" : "HELLO MABUHAY!"}
          </Text>
          <Text style={styles.loginSubtitle}>
            {isSignUp ? "Just a simple signup" : "simple log in"}
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

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleAuth}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? "Sign Up" : "Login"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignItems: "center" }}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{ color: Colors.primary, fontWeight: "600" }}>
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 THE CUSTOM FEEDBACK MODAL 🔥 */}
        <Modal
          visible={feedbackModal.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={() =>
            setFeedbackModal({ ...feedbackModal, visible: false })
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text
                style={[
                  styles.modalTitle,
                  feedbackModal.isError && { color: Colors.danger },
                ]}
              >
                {feedbackModal.title}
              </Text>
              <Text style={styles.modalMessage}>{feedbackModal.message}</Text>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  feedbackModal.isError && { backgroundColor: Colors.danger },
                ]}
                onPress={() =>
                  setFeedbackModal({ ...feedbackModal, visible: false })
                }
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/" || pathname === ""
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
                labelStyle={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
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
  // ... KEEP YOUR EXISTING STYLES ...
  container: {
    flex: 1,
    flexDirection: "column",
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
    paddingTop: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginHorizontal: 4,
  },
  activeNav: {
    backgroundColor: Colors.navActive,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.navInactiveIcon,
    marginTop: 1,
  },
  navLabelActive: {
    color: Colors.navActiveIcon,
    fontWeight: "700",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.pageBg,
  },
  loginCard: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  // 🔥 NEW MODAL STYLES 🔥
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
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
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
