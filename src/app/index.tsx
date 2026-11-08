// src/app/index.tsx
import { AppIcon, IconLabel } from "@/components/icon-label";
import LoadingOverlay from "@/components/loading-overlay";
import { ClassOption, Subtask, Task, useTasks } from "@/context/task-context";
import { useUser } from "@/context/user-context";
import { Colors, Radius, S } from "@/styles/shared";
import { useRef, useState } from "react";
import {
  Modal,
  Platform,
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

export default function HomeScreen() {
  const { user } = useUser();
  const displayName = user.name ? user.name.split(" ")[0] : "User";

  const { tasks, classes, addTask, updateTask, deleteTask, toggleTaskStatus } =
    useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);

  // ── Refs for native HTML date input triggers on web ─────────────
  const addDateInputRef = useRef<any>(null);
  const editDateInputRef = useRef<any>(null);

  // ── Local helper to toggle subtask status directly via updateTask ──
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub,
    );

    updateTask({
      ...targetTask,
      subtasks: updatedSubtasks,
    });
  };

  // ── Stats for Summary ───────────────────────────────────────────
  const incompleteCount = tasks.filter((t) => t.status === "incomplete").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const archivedCount = tasks.filter((t) => t.status === "archived").length;

  // ── Loading state ─────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  // ── Confirmation Modal State ──────────────────────────────────
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    // 🔥 Add "error" to the allowed types
    type: "save" as "save" | "delete" | "error",
    onConfirm: () => {},
  });

  // ── Add modal state ───────────────────────────────────────────
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassOption>(
    activeClasses[0] || {
      id: "default",
      name: "General",
      instructor: "Self",
      icon: "fa-book",
    },
  );
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [modalSubtasks, setModalSubtasks] = useState<Subtask[]>([]);

  // ── Edit modal state ──────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editClassDropdownOpen, setEditClassDropdownOpen] = useState(false);
  const [editSubtaskInput, setEditSubtaskInput] = useState("");

  // Robust helper to extract and validate class icons from any property format
  const getClassIcon = (subjectName: string) => {
    const found = classes.find((c) => c.name === subjectName);
    return found?.icon || "fa-bookmark";
  };

  const getObjectIcon = (cls: ClassOption | undefined) => {
    return cls?.icon || "fa-bookmark";
  };

  // ── Deadline Helpers (Late, Today, & Due This Week) ───────────
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

  const openAddModal = () => {
    if (activeClasses.length > 0) setSelectedClass(activeClasses[0]);
    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setModalSubtasks([]);
    setIsClassDropdownOpen(false);
    setAddModalVisible(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setModalSubtasks([
      ...modalSubtasks,
      {
        id: Date.now().toString() + Math.random().toString(),
        title: subtaskInput.trim(),
        completed: false,
      },
    ]);
    setSubtaskInput("");
  };

  const handleToggleAddSubtask = (subtaskId: string) => {
    setModalSubtasks((prev) =>
      prev.map((sub) =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub,
      ),
    );
  };

  const handleRemoveSubtask = (id: string) =>
    setModalSubtasks((prev) => prev.filter((s) => s.id !== id));

  const handleSaveNewTask = () => {
    // 🔥 Trigger the error modal if title is blank
    if (!newTitle.trim()) {
      setConfirmConfig({
        title: "Missing Task Name",
        message: "Please enter a task name before saving.",
        type: "error",
        onConfirm: () => setConfirmModalVisible(false), // Just closes the modal
      });
      setConfirmModalVisible(true);
      return;
    }

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
          id: Date.now().toString() + Math.random().toString(),
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

    // 🔥 Add this check right here
    if (!editingTask.title.trim()) {
      setConfirmConfig({
        title: "Missing Task Name",
        message: "Please enter a task name before saving your changes.",
        type: "error",
        onConfirm: () => setConfirmModalVisible(false),
      });
      setConfirmModalVisible(true);
      return; // Stops the function so the "Save Changes" modal doesn't appear
    }

    // Your original save confirmation logic
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

  const promptDeleteTask = () => {
    if (!editingTask) return;
    setConfirmConfig({
      title: "Delete Assignment",
      message:
        "Are you sure you want to delete this assignment? This action cannot be undone.",
      type: "delete",
      onConfirm: () => {
        setConfirmModalVisible(false);
        deleteTask(editingTask.id);
        setEditModalVisible(false);
        setEditingTask(null);
      },
    });
    setConfirmModalVisible(true);
  };

  const incompleteTasks = tasks
    .filter((t) => t.status === "incomplete")
    .sort((a, b) => {
      const urgencyA = getTaskUrgency(a.dueDate);
      const urgencyB = getTaskUrgency(b.dueDate);
      if (urgencyA === "late" && urgencyB !== "late") return -1;
      if (urgencyA !== "late" && urgencyB === "late") return 1;
      if (urgencyA === "today" && urgencyB !== "today") return -1;
      if (urgencyA !== "today" && urgencyB === "today") return 1;
      if (urgencyA === "dueSoon" && urgencyB === "normal") return -1;
      if (urgencyA === "normal" && urgencyB === "dueSoon") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>
        {/* ── 1. Clean Instagram-Style App Header ── */}
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

        {/* ── 2. Separate Welcome Back Greeting Card ── */}
        <View style={styles.welcomeCard}>
          <Text style={styles.instaGreeting}>
            Welcome,{" "}
            <Text style={styles.instaNameHighlight}>{displayName}</Text>!
          </Text>
          <Text style={styles.instaSubtext}>
            Here's your academic activity overview.
          </Text>
        </View>

        {/* ── Summary Section (Classes card uses graduation-cap) ── */}
        <Text style={S.sectionHeaderFirst}>Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FaIcon
              fa="fa-hourglass-half"
              emoji="⏳"
              size={18}
              color={Colors.warning}
            />
            <Text style={styles.statNumber}>{incompleteCount}</Text>
            <Text style={styles.statLabel}>Incomplete</Text>
          </View>
          <View style={styles.statCard}>
            <FaIcon
              fa="fa-circle-check"
              emoji="✅"
              size={18}
              color={Colors.success}
            />
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <FaIcon
              fa="fa-box-archive"
              emoji="📦"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.statNumber}>{archivedCount}</Text>
            <Text style={styles.statLabel}>Archived</Text>
          </View>
          <View style={styles.statCard}>
            <FaIcon
              fa="fa-graduation-cap"
              emoji="🎓"
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.statNumber}>{activeClasses.length}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
        </View>

        {/* ── Incomplete tasks card ── */}
        <Text style={[S.sectionHeader, { marginTop: 24 }]}>
          Incomplete Assignments
        </Text>
        <View style={[S.card, { marginBottom: 16 }]}>
          <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
            <FaIcon
              fa="fa-clipboard-list"
              emoji="📋"
              size={16}
              color={Colors.primary}
            />
            <Text style={[S.sectionHeaderFirst, { margin: 0 }]}>
              Pending Tasks ({incompleteTasks.length})
            </Text>
          </View>

          {incompleteTasks.length === 0 ? (
            <Text style={S.emptyText}>
              🎉 All caught up! No incomplete assignments.
            </Text>
          ) : (
            incompleteTasks.map((task) => {
              const urgency = getTaskUrgency(task.dueDate);
              const isLate = urgency === "late";
              const isToday = urgency === "today";
              const isDueSoon = urgency === "dueSoon";

              return (
                <View
                  key={task.id}
                  style={[
                    S.taskCard,
                    isLate && styles.cardLate,
                    isToday && styles.cardToday,
                    isDueSoon && styles.cardDueSoon,
                    { flexDirection: "column", alignItems: "stretch" },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => openTaskDetail(task)}
                    activeOpacity={0.75}
                  >
                    {/* Outline Checkbox */}
                    <TouchableOpacity
                      style={{ marginRight: 10 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id, task.status);
                      }}
                    >
                      <FaIcon
                        fa="fa-square"
                        emoji="⬜"
                        size={18}
                        color={
                          isLate || isToday
                            ? Colors.danger
                            : isDueSoon
                              ? Colors.warning
                              : Colors.textMuted
                        }
                      />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={S.taskTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <Text style={S.taskSubject} numberOfLines={1}>
                        {task.subject}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <View style={styles.deadlineBadgeRow}>
                        {isLate && (
                          <View style={styles.badgeLate}>
                            <Text style={styles.badgeLateText}>LATE</Text>
                          </View>
                        )}
                        {isToday && (
                          <View style={styles.badgeToday}>
                            <Text style={styles.badgeTodayText}>TODAY</Text>
                          </View>
                        )}
                        {isDueSoon && (
                          <View style={styles.badgeDueSoon}>
                            <Text style={styles.badgeDueSoonText}>
                              DUE SOON
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[
                            S.taskDate,
                            (isLate || isToday) && { color: Colors.danger },
                          ]}
                        >
                          {isToday ? "" : task.dueDate}
                        </Text>
                      </View>
                      <Text style={S.taskInstructor} numberOfLines={1}>
                        {task.instructor}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Render Subtasks directly on the task card with functional checkboxes */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <View style={styles.subtaskInlineContainer}>
                      {task.subtasks.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          style={styles.subtaskInlineItem}
                          onPress={() => toggleSubtaskStatus(task.id, sub.id)}
                          activeOpacity={0.7}
                        >
                          <FaIcon
                            fa={sub.completed ? "fa-square-check" : "fa-square"}
                            emoji={sub.completed ? "☑️" : "⬜"}
                            size={14}
                            color={
                              sub.completed ? Colors.success : Colors.textMuted
                            }
                          />
                          <Text
                            style={[
                              styles.subtaskInlineText,
                              sub.completed && styles.subtaskInlineTextDone,
                            ]}
                            numberOfLines={1}
                          >
                            {sub.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
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
                  <View
                    style={[S.row, { gap: 8, flex: 1, alignItems: "center" }]}
                  >
                    <FaIcon
                      fa={getObjectIcon(selectedClass)}
                      emoji="📚"
                      size={16}
                      color={Colors.primary}
                    />
                    <Text style={styles.dropdownSelectText}>
                      {selectedClass ? selectedClass.name : "Select a class..."}
                    </Text>
                  </View>
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
                        <View
                          style={[
                            S.row,
                            { gap: 8, flex: 1, alignItems: "center" },
                          ]}
                        >
                          <FaIcon
                            fa={getObjectIcon(cls)}
                            emoji="📚"
                            size={16}
                            color={
                              selectedClass.id === cls.id
                                ? Colors.primary
                                : Colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedClass.id === cls.id &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {cls.name}
                          </Text>
                        </View>
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
                  <TouchableOpacity
                    style={[S.row, { flex: 1, alignItems: "center" }]}
                    onPress={() => handleToggleAddSubtask(sub.id)}
                    activeOpacity={0.7}
                  >
                    <FaIcon
                      fa={sub.completed ? "fa-square-check" : "fa-square"}
                      emoji={sub.completed ? "☑️" : "⬜"}
                      size={14}
                      color={sub.completed ? Colors.success : Colors.textMuted}
                    />

                    <Text
                      style={[
                        S.subtaskText,
                        sub.completed && S.subtaskTextDone,
                        { flex: 1, marginLeft: 8 },
                      ]}
                      numberOfLines={1}
                    >
                      {sub.title}
                    </Text>
                  </TouchableOpacity>

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

              <Text style={S.fieldLabel}>Deadline *</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  ref={addDateInputRef}
                  style={[styles.styledDateInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="YYYY-MM-DD"
                  value={newDueDate}
                  onChangeText={setNewDueDate}
                  placeholderTextColor={Colors.textMuted}
                  {...(Platform.OS === "web" ? ({ type: "date" } as any) : {})}
                />
                {Platform.OS === "web" && (
                  <input
                    type="date"
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                      width: 0,
                      height: 0,
                    }}
                    ref={(el) => {
                      addDateInputRef.current = el;
                    }}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                )}
                <TouchableOpacity
                  style={styles.calendarIconButton}
                  onPress={() => {
                    if (Platform.OS === "web") {
                      if (addDateInputRef.current) {
                        try {
                          addDateInputRef.current.showPicker?.();
                        } catch {
                          addDateInputRef.current.focus();
                        }
                      }
                    }
                  }}
                >
                  <FaIcon
                    fa="fa-calendar-days"
                    emoji="📅"
                    size={18}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>

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
                    <View
                      style={[S.row, { gap: 8, flex: 1, alignItems: "center" }]}
                    >
                      <FaIcon
                        fa={getClassIcon(editingTask.subject)}
                        emoji="📚"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.dropdownSelectText}>
                        {editingTask.subject || "Select a class..."}
                      </Text>
                    </View>
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
                          <View
                            style={[
                              S.row,
                              { gap: 8, flex: 1, alignItems: "center" },
                            ]}
                          >
                            <FaIcon
                              fa={getObjectIcon(cls)}
                              emoji="📚"
                              size={16}
                              color={
                                editingTask.subject === cls.name
                                  ? Colors.primary
                                  : Colors.textSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.dropdownItemText,
                                editingTask.subject === cls.name &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {cls.name}
                            </Text>
                          </View>
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
                      style={[S.row, { flex: 1, alignItems: "center" }]}
                      onPress={() => handleToggleSubtaskCompletion(sub.id)}
                      activeOpacity={0.7}
                    >
                      <FaIcon
                        fa={sub.completed ? "fa-square-check" : "fa-square"}
                        emoji={sub.completed ? "☑️" : "⬜"}
                        size={14}
                        color={
                          sub.completed ? Colors.success : Colors.textMuted
                        }
                      />

                      <Text
                        style={[
                          S.subtaskText,
                          sub.completed && S.subtaskTextDone,
                          { marginLeft: 8 },
                        ]}
                        numberOfLines={1}
                      >
                        {sub.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={S.fieldLabel}>Deadline</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    ref={editDateInputRef}
                    style={[
                      styles.styledDateInput,
                      { flex: 1, marginBottom: 0 },
                    ]}
                    value={editingTask.dueDate}
                    onChangeText={(t) =>
                      setEditingTask({ ...editingTask, dueDate: t })
                    }
                    placeholderTextColor={Colors.textMuted}
                    {...(Platform.OS === "web"
                      ? ({ type: "date" } as any)
                      : {})}
                  />
                  {Platform.OS === "web" && (
                    <input
                      type="date"
                      style={{
                        position: "absolute",
                        opacity: 0,
                        pointerEvents: "none",
                        width: 0,
                        height: 0,
                      }}
                      ref={(el) => {
                        editDateInputRef.current = el;
                      }}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  )}
                  <TouchableOpacity
                    style={styles.calendarIconButton}
                    onPress={() => {
                      if (Platform.OS === "web") {
                        if (editDateInputRef.current) {
                          try {
                            editDateInputRef.current.showPicker?.();
                          } catch {
                            editDateInputRef.current.focus();
                          }
                        }
                      }
                    }}
                  >
                    <FaIcon
                      fa="fa-calendar-days"
                      emoji="📅"
                      size={18}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    S.rowSpaceBetween,
                    { marginTop: 14, marginBottom: 10 },
                  ]}
                >
                  <TouchableOpacity
                    style={S.btnDanger}
                    onPress={promptDeleteTask}
                  >
                    <Text style={S.btnWhiteText}>Delete</Text>
                  </TouchableOpacity>
                  <View style={[S.row, { gap: 10 }]}>
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

      {/* ══ Confirmation Modal Overlay ══ */}
      {/* ══ Confirmation Modal Overlay ══ */}
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
                    ? "Delete"
                    : confirmConfig.type === "error"
                      ? "Got it"
                      : "Confirm"}
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
    marginBottom: 12,
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

  // Separate Welcome Back Greeting Card
  welcomeCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  instaGreeting: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  instaNameHighlight: {
    color: Colors.primary,
  },
  instaSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Urgency indicator badges
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

  // Subtask Inline rendering styles
  subtaskInlineContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 6,
  },
  subtaskInlineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  subtaskInlineText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  subtaskInlineTextDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },

  // Date input wrapper with calendar icon button & stylized picker box
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  styledDateInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calendarIconButton: {
    backgroundColor: Colors.primaryLight || "#eff6ff",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    padding: 11,
    justifyContent: "center",
    alignItems: "center",
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
    paddingVertical: 12,
    marginBottom: 6,
  },
  dropdownSelectText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  dropdownListContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontWeight: "bold",
    color: Colors.primary,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    minWidth: 72,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
});
