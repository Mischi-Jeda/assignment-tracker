// src/app/classes.tsx
import { AppIcon, IconLabel } from "@/components/icon-label";
import LoadingOverlay from "@/components/loading-overlay";
import { ClassOption, useTasks } from "@/context/task-context";
import { Colors, Radius, S } from "@/styles/shared";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ca8a04",
  "#0891b2",
];
const ICON_OPTIONS = [
  "fa-bookmark",
  "fa-clipboard-list",
  "fa-list",
  "fa-square",
  "fa-graduation-cap",
  "fa-hourglass-half",
  "fa-circle-check",
  "fa-box-archive",
];

// ── Icon helper ─────────────────────────────────────────────────
function FaIcon({
  fa,
  emoji,
  size = 16,
  color = Colors.textPrimary,
}: {
  fa: string;
  emoji: string;
  size?: number;
  color?: string;
}) {
  void emoji;
  return <AppIcon name={fa} size={size} color={color} />;
}

export default function ClassesScreen() {
  const { classes, addClass, updateClass, archiveClass, deleteClass } =
    useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);
  const archivedClasses = classes.filter((c) => c.isArchived);

  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassOption | null>(null);

  const [className, setClassName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [room, setRoom] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2563eb");
  const [selectedIcon, setSelectedIcon] = useState("fa-bookmark");

  // ── Confirmation Modal State ──────────────────────────────────
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    // 🔥 Added "error"
    type: "save" as "save" | "archive" | "delete" | "error",
    onConfirm: () => {},
  });

  const openAddModal = () => {
    setEditingClass(null);
    setClassName("");
    setInstructor("");
    setRoom("");
    setSelectedColor("#2563eb");
    setSelectedIcon("fa-bookmark");
    setModalVisible(true);
  };

  const openEditModal = (item: ClassOption) => {
    setEditingClass(item);
    setClassName(item.name);
    setInstructor(item.instructor);
    setRoom(item.room || "");
    setSelectedColor(item.color || "#2563eb");
    setSelectedIcon(item.icon || "fa-bookmark");
    setModalVisible(true);
  };

  const promptSaveClass = () => {
    // 🔥 Error Modal Logic
    if (!className.trim() || !instructor.trim()) {
      setConfirmConfig({
        title: "Missing Fields",
        message:
          "Please fill in both the class name and instructor before saving.",
        type: "error",
        onConfirm: () => setConfirmModalVisible(false),
      });
      setConfirmModalVisible(true);
      return;
    }

    setConfirmConfig({
      title: editingClass ? "Save Changes" : "Add New Subject",
      message: editingClass
        ? "Are you sure you want to save the changes made to this class?"
        : "Are you sure you want to add this new class to your schedule?",
      type: "save",
      onConfirm: () => {
        setConfirmModalVisible(false);
        setIsSaving(true);
        setTimeout(() => {
          if (editingClass) {
            updateClass({
              ...editingClass,
              name: className,
              instructor,
              room,
              color: selectedColor,
              icon: selectedIcon,
            });
          } else {
            addClass({
              name: className,
              instructor,
              room: room || "TBA",
              color: selectedColor,
              icon: selectedIcon,
            });
          }
          setModalVisible(false);
          setIsSaving(false);
        }, 400);
      },
    });
    setConfirmModalVisible(true);
  };

  const promptArchiveClass = () => {
    if (!editingClass) return;
    const isArchived = editingClass.isArchived;

    setConfirmConfig({
      title: isArchived ? "Restore Class" : "Archive Class",
      message: isArchived
        ? "Are you sure you want to restore this class back to active status?"
        : "Are you sure you want to archive this class?",
      type: "archive",
      onConfirm: () => {
        setConfirmModalVisible(false);
        archiveClass(editingClass.id);
        setModalVisible(false);
      },
    });
    setConfirmModalVisible(true);
  };

  const promptDeleteClass = () => {
    if (!editingClass) return;

    setConfirmConfig({
      title: "Delete Class",
      message:
        "Are you sure you want to permanently delete this class? This action cannot be undone.",
      type: "delete",
      onConfirm: () => {
        setConfirmModalVisible(false);
        deleteClass(editingClass.id);
        setModalVisible(false);
      },
    });
    setConfirmModalVisible(true);
  };

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>
        {/* ── 1. Clean Instagram-Style App Header (TaskFlow) ── */}
        <View style={styles.instaHeader}>
          <View style={styles.instaBrandGroup}>
            <View style={styles.instaIconContainer}>
              <FaIcon
                fa="fa-graduation-cap"
                emoji="🎓"
                size={18}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.instaAppName}>Assignment Tracker</Text>
          </View>
        </View>

        {/* ── 2. Original Classes Header ── */}
        <View style={[S.row, { marginBottom: 4, gap: 8 }]}>
          <FaIcon
            fa="fa-graduation-cap"
            emoji="🎓"
            size={20}
            color={Colors.primary}
          />
          <Text style={S.pageTitle}>Classes & Subjects</Text>
        </View>
        <Text style={[S.pageSubtitle, { marginBottom: 16 }]}>
          Manage and view your enrolled classes.
        </Text>

        {/* ── Active classes ── */}
        <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
          <FaIcon
            fa="fa-bookmark"
            emoji="🔖"
            size={14}
            color={Colors.primary}
          />
          <Text style={[S.sectionHeaderFirst, { margin: 0 }]}>
            Active Classes ({activeClasses.length})
          </Text>
        </View>

        {activeClasses.length === 0 ? (
          <Text style={S.emptyText}>No active classes found.</Text>
        ) : (
          activeClasses.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.classCard,
                { borderLeftColor: item.color || Colors.primary },
              ]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.classIconCircle,
                  { backgroundColor: (item.color || Colors.primary) + "20" },
                ]}
              >
                <AppIcon
                  name={item.icon || "fa-bookmark"}
                  size={20}
                  color={item.color || Colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.className} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.classInstructor} numberOfLines={1}>
                  <FaIcon
                    fa="fa-chalkboard-user"
                    emoji="👨‍🏫"
                    size={11}
                    color={Colors.textMedium}
                  />{" "}
                  {item.instructor}
                </Text>
                <Text style={styles.classRoom} numberOfLines={1}>
                  <FaIcon
                    fa="fa-location-dot"
                    emoji="📍"
                    size={11}
                    color={Colors.textSecondary}
                  />{" "}
                  {item.room || "TBA"}
                </Text>
              </View>
              <FaIcon
                fa="fa-chevron-right"
                emoji="›"
                size={14}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ))
        )}

        {/* ── Archived classes ── */}
        <View style={[S.row, { marginBottom: 12, marginTop: 24, gap: 6 }]}>
          <FaIcon
            fa="fa-box-archive"
            emoji="📦"
            size={14}
            color={Colors.textSecondary}
          />
          <Text
            style={[
              S.sectionHeaderFirst,
              { margin: 0, color: Colors.textSecondary },
            ]}
          >
            Archived Classes ({archivedClasses.length})
          </Text>
        </View>

        {archivedClasses.length === 0 ? (
          <Text style={S.emptyText}>No archived classes.</Text>
        ) : (
          archivedClasses.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.classCard, styles.archivedCard]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.classIconCircle,
                  { backgroundColor: Colors.inputBg },
                ]}
              >
                <AppIcon
                  name={item.icon || "fa-box-archive"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={[styles.className, { color: Colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={styles.classInstructor} numberOfLines={1}>
                  {item.instructor}
                </Text>
                <Text style={styles.classRoom} numberOfLines={1}>
                  {item.room || "TBA"}
                </Text>
              </View>
              <FaIcon
                fa="fa-chevron-right"
                emoji="›"
                size={14}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={S.fab}
        onPress={openAddModal}
        activeOpacity={0.85}
      >
        <IconLabel name="fa-plus" label="Add" size={19} color="#fff" />
      </TouchableOpacity>

      {/* ── Loading overlay ── */}
      <LoadingOverlay visible={isSaving} message="Saving…" />

      {/* ══ Modal: Add / Edit Class ══ */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalCard, { maxHeight: "92%" }]}>
            <Text style={S.modalTitle}>
              {editingClass ? "Edit Subject / Class" : "Add New Subject"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={S.fieldLabel}>Subject / Class Name *</Text>
              <TextInput
                style={S.input}
                placeholder="e.g. Quantitative Research"
                value={className}
                onChangeText={setClassName}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={S.fieldLabel}>Instructor Name *</Text>
              <TextInput
                style={S.input}
                placeholder="e.g. Ed Neil Maratas"
                value={instructor}
                onChangeText={setInstructor}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={S.fieldLabel}>Room / Location (Optional)</Text>
              <TextInput
                style={S.input}
                placeholder="e.g. Room 302 or Online"
                value={room}
                onChangeText={setRoom}
                placeholderTextColor={Colors.textMuted}
              />

              {/* Color picker */}
              <Text style={S.fieldLabel}>Theme Color</Text>
              <View style={styles.pickerRow}>
                {COLOR_OPTIONS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorCircle,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              {/* Icon picker */}
              <Text style={S.fieldLabel}>Icon</Text>
              <View style={styles.pickerRow}>
                {ICON_OPTIONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconBox,
                      selectedIcon === icon && styles.selectedIconBox,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <AppIcon name={icon} size={18} color={Colors.primary} />
                  </Pressable>
                ))}
              </View>

              {/* Action buttons */}
              <View
                style={[S.rowSpaceBetween, { marginTop: 18, marginBottom: 8 }]}
              >
                {editingClass ? (
                  <View style={[S.row, { gap: 6 }]}>
                    <TouchableOpacity
                      style={S.btnWarning}
                      onPress={promptArchiveClass}
                    >
                      <Text style={S.btnWhiteText}>
                        {editingClass.isArchived ? "Restore" : "Archive"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={S.btnDanger}
                      onPress={promptDeleteClass}
                    >
                      <Text style={S.btnWhiteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View />
                )}

                <View style={[S.row, { gap: 8 }]}>
                  <TouchableOpacity
                    style={S.btnCancel}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={S.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={S.btnPrimary}
                    onPress={promptSaveClass}
                  >
                    <Text style={S.btnPrimaryText}>
                      {editingClass ? "Save" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ Confirmation Modal Overlay (Stacked ABOVE Class Edit Modal) ══ */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{confirmConfig.title}</Text>
            <Text style={styles.confirmMessage}>{confirmConfig.message}</Text>

            <View
              style={[
                S.row,
                { justifyContent: "flex-end", gap: 10, marginTop: 16 },
              ]}
            >
              {/* 🔥 Hide Cancel button if it's an error */}
              {confirmConfig.type !== "error" && (
                <TouchableOpacity
                  style={S.btnCancel}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Text style={S.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={
                  confirmConfig.type === "delete" ? S.btnDanger : S.btnPrimary
                }
                onPress={confirmConfig.onConfirm}
              >
                <Text style={S.btnWhiteText}>
                  {/* 🔥 Change button text based on type */}
                  {confirmConfig.type === "delete"
                    ? "Confirm"
                    : confirmConfig.type === "error"
                      ? "Got it"
                      : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  archivedCard: {
    backgroundColor: Colors.pageBg,
    borderLeftColor: Colors.textMuted,
    opacity: 0.8,
  },
  classIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  className: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  classInstructor: {
    fontSize: 12,
    color: Colors.textMedium,
    marginTop: 3,
  },
  classRoom: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selectedIconBox: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Confirmation Modal Overlay & Card
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 20,
  },
  confirmCard: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
});
