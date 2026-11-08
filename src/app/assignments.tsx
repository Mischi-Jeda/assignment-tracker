// src/app/assignments.tsx
import { AppIcon, IconLabel } from "@/components/icon-label";
import LoadingOverlay from "@/components/loading-overlay";
import { ClassOption, Subtask, Task, useTasks } from "@/context/task-context";
import { useUser } from "@/context/user-context";
import { Colors, Radius, S } from "@/styles/shared";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function AssignmentsScreen() {
  const { user } = useUser();
  const displayName = user.name ? user.name.split(" ")[0] : "User";

  const { tasks, classes, addTask, updateTask, deleteTask, toggleTaskStatus } =
    useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);

  const [activeTab, setActiveTab] = useState<
    "incomplete" | "completed" | "archived"
  >("incomplete");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("All");
  const [isClassFilterDropdownOpen, setIsClassFilterDropdownOpen] =
    useState(false);

  // Date filter state ("All", "Today", "This Week", "This Month")
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("All");
  const [isDateFilterDropdownOpen, setIsDateFilterDropdownOpen] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // ── Confirmation Modal State ──────────────────────────────────
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    type: "save" as "save" | "delete",
    onConfirm: () => {},
  });

  // ── Add modal ─────────────────────────────────────────────────
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassOption>(
    activeClasses[0] || { id: "default", name: "General", instructor: "Self" },
  );
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [modalSubtasks, setModalSubtasks] = useState<Subtask[]>([]);

  // ── Edit modal ────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editClassDropdownOpen, setEditClassDropdownOpen] = useState(false);
  const [editSubtaskInput, setEditSubtaskInput] = useState("");

  // ── Deadline Helpers (Late, Today, Due Soon, Date filtering) ──
  const getTaskUrgency = (dateString: string) => {
    if (!dateString) return "normal";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);

    const diffDays = (due.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (diffDays < 0) return "late";
    if (diffDays === 0) return "today";
    if (diffDays > 0 && diffDays <= 7) return "dueSoon";
    return "normal";
  };

  const matchesDateFilter = (dateString: string) => {
    if (selectedDateFilter === "All") return true;
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);

    const diffDays = (due.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (selectedDateFilter === "Today") {
      return diffDays === 0;
    }
    if (selectedDateFilter === "This Week") {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (selectedDateFilter === "This Month") {
      return (
        due.getMonth() === today.getMonth() &&
        due.getFullYear() === today.getFullYear()
      );
    }
    return true;
  };

  const openAddModal = () => {
    if (activeClasses.length > 0) setSelectedClass(activeClasses[0]);
    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setModalSubtasks([]);
    setSubtaskInput("");
    setIsClassDropdownOpen(false);
    setAddModalVisible(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setModalSubtasks([
      ...modalSubtasks,
      {
        id: Date.now().toString(),
        title: subtaskInput.trim(),
        completed: false,
      },
    ]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (id: string) =>
    setModalSubtasks(modalSubtasks.filter((s) => s.id !== id));

  const handleSaveNewTask = () => {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      addTask({
        title: newTitle,
        subject: selectedClass.name,
        instructor: selectedClass.instructor,
        description: newDescription,
        subtasks: modalSubtasks,
        dueDate: newDueDate || new Date().toISOString().split("T")[0],
      });
      setAddModalVisible(false);
      setIsSaving(false);
    }, 400);
  };

  const openTaskDetail = (task: Task) => {
    setEditingTask({ ...task });
    setEditClassDropdownOpen(false);
    setEditSubtaskInput("");
    setEditModalVisible(true);
  };

  const handleToggleSubtaskCompletion = (subtaskId: string) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      ),
    });
  };

  const handleAddEditSubtask = () => {
    if (!editSubtaskInput.trim() || !editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: [
        ...editingTask.subtasks,
        {
          id: Date.now().toString(),
          title: editSubtaskInput.trim(),
          completed: false,
        },
      ],
    });
    setEditSubtaskInput("");
  };

  const handleRemoveEditSubtask = (subtaskId: string) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const promptSaveEditedTask = () => {
    if (!editingTask) return;
    setConfirmConfig({
      title: "Save Changes",
      message:
        "Are you sure you want to save the changes made to this assignment?",
      type: "save",
      onConfirm: () => {
        setConfirmModalVisible(false);
        setIsSaving(true);
        setTimeout(() => {
          updateTask(editingTask);
          setEditModalVisible(false);
          setEditingTask(null);
          setIsSaving(false);
        }, 400);
      },
    });
    setConfirmModalVisible(true);
  };

  const promptArchiveOrDeleteTask = () => {
    if (!editingTask) return;
    const isCompleted = editingTask.status === "completed";
    setConfirmConfig({
      title: isCompleted ? "Archive Assignment" : "Delete Assignment",
      message: isCompleted
        ? "Are you sure you want to archive this task?"
        : "Are you sure you want to delete this assignment? This action cannot be undone.",
      type: "delete",
      onConfirm: () => {
        setConfirmModalVisible(false);
        if (isCompleted) {
          toggleTaskStatus(editingTask.id, "completed");
        } else {
          deleteTask(editingTask.id);
        }
        setEditModalVisible(false);
        setEditingTask(null);
      },
    });
    setConfirmModalVisible(true);
  };

  const filteredAssignments = tasks.filter((task) => {
    const matchesStatus = task.status === activeTab;
    const matchesClass =
      selectedClassFilter === "All" || task.subject === selectedClassFilter;
    const matchesDate = matchesDateFilter(task.dueDate);
    return matchesStatus && matchesClass && matchesDate;
  });

  // Tab config
  const TABS = [
    {
      key: "incomplete",
      label: "Incomplete",
      fa: "fa-hourglass-half",
      emoji: "⏳",
    },
    {
      key: "completed",
      label: "Completed",
      fa: "fa-circle-check",
      emoji: "✅",
    },
    { key: "archived", label: "Archived", fa: "fa-box-archive", emoji: "📦" },
  ] as const;

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll} nestedScrollEnabled={true}>
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

        {/* ── 2. Original Assignments Header ── */}
        <View style={[S.row, { marginBottom: 4, gap: 8 }]}>
          <FaIcon
            fa="fa-clipboard-list"
            emoji="📋"
            size={20}
            color={Colors.primary}
          />
          <Text style={S.pageTitle}>Assignments</Text>
        </View>
        <Text style={[S.pageSubtitle, { marginBottom: 16 }]}>
          Track and organize your tasks.
        </Text>

        {/* ── Status tabs ── */}
        <View style={[S.row, { gap: 8, marginBottom: 14 }]}>
          {TABS.map((tab) => {
            const sel = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, sel && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <FaIcon
                  fa={tab.fa}
                  emoji={tab.emoji}
                  size={12}
                  color={sel ? "#fff" : Colors.textMedium}
                />
                <Text style={[styles.tabText, sel && styles.tabTextActive]}>
                  {"  "}
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Dropdown Filters Row (Class Filter & Date Filter) ── */}
        <View
          style={[
            styles.filtersRow,
            {
              zIndex:
                isClassFilterDropdownOpen || isDateFilterDropdownOpen
                  ? 999
                  : 10,
            },
          ]}
        >
          {/* Class Filter Dropdown */}
          <View
            style={[
              styles.filterColumn,
              { zIndex: isClassFilterDropdownOpen ? 1000 : 1 },
            ]}
          >
            <Text style={styles.filterDropdownLabel}>Class Filter</Text>
            <TouchableOpacity
              style={styles.dropdownSelectButton}
              onPress={() => {
                setIsClassFilterDropdownOpen(!isClassFilterDropdownOpen);
                setIsDateFilterDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownSelectText} numberOfLines={1}>
                {selectedClassFilter === "All"
                  ? "All Classes"
                  : selectedClassFilter}
              </Text>
              <FaIcon
                fa={
                  isClassFilterDropdownOpen
                    ? "fa-chevron-up"
                    : "fa-chevron-down"
                }
                emoji="▼"
                size={12}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {isClassFilterDropdownOpen && (
              <View style={styles.dropdownListContainer}>
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedClassFilter === "All" &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedClassFilter("All");
                    setIsClassFilterDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedClassFilter === "All" &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    All Classes
                  </Text>
                </TouchableOpacity>
                {activeClasses.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.dropdownItem,
                      selectedClassFilter === cls.name &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedClassFilter(cls.name);
                      setIsClassFilterDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedClassFilter === cls.name &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date Filter Dropdown */}
          <View
            style={[
              styles.filterColumn,
              { zIndex: isDateFilterDropdownOpen ? 1000 : 1 },
            ]}
          >
            <Text style={styles.filterDropdownLabel}>Due Date Filter</Text>
            <TouchableOpacity
              style={styles.dropdownSelectButton}
              onPress={() => {
                setIsDateFilterDropdownOpen(!isDateFilterDropdownOpen);
                setIsClassFilterDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownSelectText} numberOfLines={1}>
                {selectedDateFilter === "All"
                  ? "All Dates"
                  : selectedDateFilter}
              </Text>
              <FaIcon
                fa={
                  isDateFilterDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                }
                emoji="▼"
                size={12}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {isDateFilterDropdownOpen && (
              <View style={styles.dropdownListContainer}>
                {["All", "Today", "This Week", "This Month"].map(
                  (filterName) => (
                    <TouchableOpacity
                      key={filterName}
                      style={[
                        styles.dropdownItem,
                        selectedDateFilter === filterName &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedDateFilter(filterName);
                        setIsDateFilterDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedDateFilter === filterName &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {filterName === "All" ? "All Dates" : filterName}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
          </View>
        </View>

        {/* ── Assignments list ── */}
        <View style={[S.card, { marginBottom: 16, zIndex: 1 }]}>
          <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
            <FaIcon fa="fa-list" emoji="📝" size={14} color={Colors.primary} />
            <Text style={[S.sectionHeaderFirst, { margin: 0 }]}>
              {activeTab.toUpperCase()} ({filteredAssignments.length})
            </Text>
          </View>

          {filteredAssignments.length === 0 ? (
            <Text style={S.emptyText}>
              No tasks found matching these filters.
            </Text>
          ) : (
            filteredAssignments.map((item) => {
              const isChecked = item.status !== "incomplete";
              const urgency =
                activeTab === "incomplete"
                  ? getTaskUrgency(item.dueDate)
                  : "normal";
              const isLate = urgency === "late";
              const isToday = urgency === "today";
              const isDueSoon = urgency === "dueSoon";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    S.taskCard,
                    isLate && styles.cardLate,
                    isToday && styles.cardToday,
                    isDueSoon && styles.cardDueSoon,
                  ]}
                  onPress={() => openTaskDetail(item)}
                  activeOpacity={0.75}
                >
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(item.id, item.status);
                    }}
                  >
                    <FaIcon
                      fa={isChecked ? "fa-square-check" : "fa-square"}
                      emoji=""
                      size={18}
                      color={
                        isLate || isToday
                          ? Colors.danger
                          : isDueSoon
                            ? Colors.warning
                            : Colors.primary
                      }
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={[
                        S.taskTitle,
                        item.status === "completed" && {
                          textDecorationLine: "line-through",
                          color: Colors.textSecondary,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text style={S.taskSubject} numberOfLines={1}>
                      {item.subject}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <View style={styles.deadlineBadgeRow}>
                      {activeTab === "incomplete" && isLate && (
                        <View style={styles.badgeLate}>
                          <Text style={styles.badgeLateText}>LATE</Text>
                        </View>
                      )}
                      {activeTab === "incomplete" && isToday && (
                        <View style={styles.badgeToday}>
                          <Text style={styles.badgeTodayText}>TODAY</Text>
                        </View>
                      )}
                      {activeTab === "incomplete" && isDueSoon && (
                        <View style={styles.badgeDueSoon}>
                          <Text style={styles.badgeDueSoonText}>DUE SOON</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          S.taskDate,
                          activeTab === "incomplete" &&
                            (isLate || isToday) && { color: Colors.danger },
                        ]}
                      >
                        {isToday ? "" : item.dueDate}
                      </Text>
                    </View>
                    <Text style={S.taskInstructor} numberOfLines={1}>
                      {item.instructor}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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

      {/* ══ Modal 1: Add Assignment ══ */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>Add New Assignment</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={S.fieldLabel}>Task Name *</Text>
              <TextInput
                style={S.input}
                placeholder="e.g. Activity 4 – DB Triggers"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={S.fieldLabel}>Class / Subject *</Text>
              <View style={{ position: "relative", zIndex: 50 }}>
                <TouchableOpacity
                  style={styles.dropdownSelectButton}
                  onPress={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                >
                  <Text style={styles.dropdownSelectText}>
                    {selectedClass ? selectedClass.name : "Select a class..."}
                  </Text>
                  <FaIcon
                    fa={
                      isClassDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                    }
                    emoji="▼"
                    size={12}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {isClassDropdownOpen && (
                  <View style={styles.dropdownListContainer}>
                    {activeClasses.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[
                          styles.dropdownItem,
                          selectedClass.id === cls.id &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedClass(cls);
                          setIsClassDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedClass.id === cls.id &&
                              styles.dropdownItemTextSelected,
                          ]}
                        >
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={S.instructorInfo}>
                Instructor:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {selectedClass.instructor}
                </Text>
              </Text>

              <Text style={S.fieldLabel}>Description (Optional)</Text>
              <TextInput
                style={S.inputLarge}
                placeholder="Add details, instructions, or notes…"
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={S.fieldLabel}>Subtasks (Optional)</Text>
              <View style={[S.row, { gap: 8, marginBottom: 8 }]}>
                <TextInput
                  style={[S.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Add a subtask…"
                  value={subtaskInput}
                  onChangeText={setSubtaskInput}
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity
                  style={S.addSubtaskBtn}
                  onPress={handleAddSubtask}
                >
                  <Text style={S.btnPrimaryText}>Add</Text>
                </TouchableOpacity>
              </View>

              {modalSubtasks.map((sub) => (
                <View key={sub.id} style={S.subtaskChip}>
                  <Text style={[S.subtaskText, { flex: 1 }]} numberOfLines={1}>
                    {sub.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(sub.id)}>
                    <FaIcon
                      fa="fa-xmark"
                      emoji=""
                      size={16}
                      color={Colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={S.fieldLabel}>Deadline (YYYY-MM-DD) *</Text>
              <TextInput
                style={S.input}
                placeholder="2026-10-20"
                value={newDueDate}
                onChangeText={setNewDueDate}
                placeholderTextColor={Colors.textMuted}
              />

              <View
                style={[
                  S.row,
                  {
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 14,
                    marginBottom: 10,
                  },
                ]}
              >
                <TouchableOpacity
                  style={S.btnCancel}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={S.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={S.btnPrimary}
                  onPress={handleSaveNewTask}
                >
                  <Text style={S.btnPrimaryText}>Save Assignment</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ Modal 2: Task Detail / Edit ══ */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={S.modalOverlay}>
          {editingTask && (
            <View style={S.modalCard}>
              <Text style={S.modalTitle}>Task Details & Editing</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={S.fieldLabel}>Task Name</Text>
                <TextInput
                  style={S.input}
                  value={editingTask.title}
                  onChangeText={(t) =>
                    setEditingTask({ ...editingTask, title: t })
                  }
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={S.fieldLabel}>Class / Subject</Text>
                <View style={{ position: "relative", zIndex: 50 }}>
                  <TouchableOpacity
                    style={styles.dropdownSelectButton}
                    onPress={() =>
                      setEditClassDropdownOpen(!editClassDropdownOpen)
                    }
                  >
                    <Text style={styles.dropdownSelectText}>
                      {editingTask.subject || "Select a class..."}
                    </Text>
                    <FaIcon
                      fa={
                        editClassDropdownOpen
                          ? "fa-chevron-up"
                          : "fa-chevron-down"
                      }
                      emoji="▼"
                      size={12}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {editClassDropdownOpen && (
                    <View style={styles.dropdownListContainer}>
                      {activeClasses.map((cls) => (
                        <TouchableOpacity
                          key={cls.id}
                          style={[
                            styles.dropdownItem,
                            editingTask.subject === cls.name &&
                              styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setEditingTask({
                              ...editingTask,
                              subject: cls.name,
                              instructor: cls.instructor,
                            });
                            setEditClassDropdownOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              editingTask.subject === cls.name &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {cls.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <Text style={S.instructorInfo}>
                  Instructor:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {editingTask.instructor}
                  </Text>
                </Text>

                <Text style={S.fieldLabel}>Description</Text>
                <TextInput
                  style={S.inputLarge}
                  value={editingTask.description || ""}
                  onChangeText={(t) =>
                    setEditingTask({ ...editingTask, description: t })
                  }
                  multiline
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={S.fieldLabel}>Subtasks</Text>
                <View style={[S.row, { gap: 8, marginBottom: 8 }]}>
                  <TextInput
                    style={[S.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Add a subtask…"
                    value={editSubtaskInput}
                    onChangeText={setEditSubtaskInput}
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity
                    style={S.addSubtaskBtn}
                    onPress={handleAddEditSubtask}
                  >
                    <Text style={S.btnPrimaryText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {editingTask.subtasks.map((sub) => (
                  <View key={sub.id} style={S.subtaskChip}>
                    <TouchableOpacity
                      style={[S.row, { flex: 1 }]}
                      onPress={() => handleToggleSubtaskCompletion(sub.id)}
                    >
                      <FaIcon
                        fa={sub.completed ? "fa-square-check" : "fa-square"}
                        emoji=""
                        size={14}
                        color={Colors.primary}
                      />
                      <Text
                        style={[
                          S.subtaskText,
                          sub.completed && S.subtaskTextDone,
                        ]}
                        numberOfLines={1}
                      >
                        {sub.title}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveEditSubtask(sub.id)}
                    >
                      <FaIcon
                        fa="fa-xmark"
                        emoji=""
                        size={16}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={S.fieldLabel}>Deadline (YYYY-MM-DD)</Text>
                <TextInput
                  style={S.input}
                  value={editingTask.dueDate}
                  onChangeText={(t) =>
                    setEditingTask({ ...editingTask, dueDate: t })
                  }
                  placeholderTextColor={Colors.textMuted}
                />

                <View
                  style={[
                    S.rowSpaceBetween,
                    { marginTop: 14, marginBottom: 10 },
                  ]}
                >
                  <TouchableOpacity
                    style={
                      editingTask.status === "completed"
                        ? S.btnWarning
                        : S.btnDanger
                    }
                    onPress={promptArchiveOrDeleteTask}
                  >
                    <Text style={S.btnWhiteText}>
                      {editingTask.status === "completed"
                        ? "Archive"
                        : "Delete"}
                    </Text>
                  </TouchableOpacity>

                  <View style={[S.row, { gap: 8 }]}>
                    <TouchableOpacity
                      style={S.btnCancel}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={S.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={S.btnPrimary}
                      onPress={promptSaveEditedTask}
                    >
                      <Text style={S.btnPrimaryText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* ══ Confirmation Modal Overlay (Stacked ABOVE Task Edit Modal) ══ */}
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
              <TouchableOpacity
                style={S.btnCancel}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={S.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  confirmConfig.type === "delete" ? S.btnDanger : S.btnPrimary
                }
                onPress={confirmConfig.onConfirm}
              >
                <Text style={S.btnWhiteText}>
                  {confirmConfig.type === "delete" ? "Confirm" : "Save"}
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

  // Filters Row
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    position: "relative",
  },
  filterColumn: {
    flex: 1,
    position: "relative",
  },
  filterDropdownLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMedium,
  },
  tabTextActive: {
    color: "#ffffff",
  },

  // Urgency indicator badges & card highlights
  deadlineBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  badgeLate: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  badgeLateText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
  },
  badgeToday: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  badgeTodayText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
  },
  badgeDueSoon: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  badgeDueSoonText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#d97706",
  },
  cardLate: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    backgroundColor: "#fff5f5",
  },
  cardToday: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    backgroundColor: "#fff5f5",
  },
  cardDueSoon: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },

  // Confirmation Modal Overlay & Card (Rendered at top-most level)
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

  // Dropdown Select Menu Styles
  dropdownSelectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownSelectText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  dropdownListContainer: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontWeight: "bold",
    color: Colors.primary,
  },
});
