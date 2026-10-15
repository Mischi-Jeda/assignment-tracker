// src/app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useTasks, Task, Subtask, ClassOption } from '@/context/task-context';
import { useUser } from '@/context/user-context';
import { S, Colors, Radius } from '@/styles/shared';
import LoadingOverlay from '@/components/loading-overlay';
import { AppIcon, IconLabel } from '@/components/icon-label';

// ── Icon helper ─────────────────────────────────────────────────
function FaIcon({ fa, emoji, size = 16, color = Colors.textPrimary }: {
  fa: string; emoji: string; size?: number; color?: string;
}) {
  void emoji;
  return <AppIcon name={fa} size={size} color={color} />;
}

export default function HomeScreen() {
  const { user } = useUser();
  const displayName = user.name ? user.name.split(' ')[0] : 'User';

  const { tasks, classes, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);

  // ── Loading state ─────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  // ── Add modal state ───────────────────────────────────────────
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassOption>(
    activeClasses[0] || { id: 'default', name: 'General', instructor: 'Self' }
  );
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [modalSubtasks, setModalSubtasks] = useState<Subtask[]>([]);

  // ── Edit modal state ──────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editSubtaskInput, setEditSubtaskInput] = useState('');

  // ── Helpers ───────────────────────────────────────────────────
  const isWithinSevenDays = (dateString: string) => {
    if (!dateString) return false;
    const due = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = (due - now) / (1000 * 3600 * 24);
    return diff >= -1 && diff <= 7;
  };

  const openAddModal = () => {
    if (activeClasses.length > 0) setSelectedClass(activeClasses[0]);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setModalSubtasks([]);
    setAddModalVisible(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setModalSubtasks([
      ...modalSubtasks,
      { id: Date.now().toString(), title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput('');
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
        dueDate: newDueDate || new Date().toISOString().split('T')[0],
      });
      setAddModalVisible(false);
      setIsSaving(false);
    }, 400);
  };

  const openTaskDetail = (task: Task) => {
    setEditingTask({ ...task });
    setEditSubtaskInput('');
    setEditModalVisible(true);
  };

  const handleToggleSubtaskCompletion = (subtaskId: string) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleAddEditSubtask = () => {
    if (!editSubtaskInput.trim() || !editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: [
        ...editingTask.subtasks,
        { id: Date.now().toString(), title: editSubtaskInput.trim(), completed: false },
      ],
    });
    setEditSubtaskInput('');
  };

  const handleRemoveEditSubtask = (subtaskId: string) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const handleSaveEditedTask = () => {
    if (!editingTask) return;
    setIsSaving(true);
    setTimeout(() => {
      updateTask(editingTask);
      setEditModalVisible(false);
      setEditingTask(null);
      setIsSaving(false);
    }, 400);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    deleteTask(editingTask.id);
    setEditModalVisible(false);
    setEditingTask(null);
  };

  const incompleteTasks = tasks
    .filter((t) => t.status === 'incomplete')
    .sort((a, b) => {
      const aU = isWithinSevenDays(a.dueDate);
      const bU = isWithinSevenDays(b.dueDate);
      if (aU && !bU) return -1;
      if (!aU && bU) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <FaIcon fa="fa-house" emoji="🏠" size={20} color={Colors.primary} />
          <Text style={[S.pageTitle, { marginLeft: 8 }]}>Welcome, {displayName}!</Text>
        </View>
        <Text style={S.pageSubtitle}>Here's your activity overview.</Text>

        {/* ── Incomplete tasks card ── */}
        <View style={[S.card, { marginBottom: 16 }]}>
          <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
            <FaIcon fa="fa-clipboard-list" emoji="📋" size={16} color={Colors.primary} />
            <Text style={[S.sectionHeaderFirst, { margin: 0 }]}>
              Incomplete Assignments ({incompleteTasks.length})
            </Text>
          </View>

          {incompleteTasks.length === 0 ? (
            <Text style={S.emptyText}>🎉 All caught up! No incomplete assignments.</Text>
          ) : (
            incompleteTasks.map((task) => {
              const urgent = isWithinSevenDays(task.dueDate);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={urgent ? S.taskCardUrgent : S.taskCard}
                  onPress={() => openTaskDetail(task)}
                  activeOpacity={0.75}
                >
                  {/* Checkbox */}
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
                      color={urgent ? Colors.urgentText : Colors.textMuted}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={urgent ? S.taskTitleUrgent : S.taskTitle}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    <Text
                      style={urgent ? S.taskSubjectUrgent : S.taskSubject}
                      numberOfLines={1}
                    >
                      {task.subject}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={urgent ? S.taskDateUrgent : S.taskDate}>
                      {task.dueDate}
                    </Text>
                    <Text style={S.taskInstructor} numberOfLines={1}>
                      {task.instructor}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={S.fab} onPress={openAddModal} activeOpacity={0.85}>
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
              <View style={S.dropdownRow}>
                {activeClasses.map((cls) => {
                  const sel = selectedClass.id === cls.id;
                  return (
                    <Pressable
                      key={cls.id}
                      style={[S.dropdownChip, sel && S.dropdownChipSelected]}
                      onPress={() => setSelectedClass(cls)}
                    >
                      <Text style={[S.dropdownChipText, sel && S.dropdownChipTextSelected]}>
                        {cls.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={S.instructorInfo}>
                Instructor: <Text style={{ fontWeight: 'bold' }}>{selectedClass.instructor}</Text>
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
                <TouchableOpacity style={S.addSubtaskBtn} onPress={handleAddSubtask}>
                  <Text style={S.btnPrimaryText}>Add</Text>
                </TouchableOpacity>
              </View>

              {modalSubtasks.map((sub) => (
                <View key={sub.id} style={S.subtaskChip}>
                  <Text style={[S.subtaskText, { flex: 1 }]} numberOfLines={1}>{sub.title}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(sub.id)}>
                    <FaIcon fa="fa-xmark" emoji="" size={16} color={Colors.danger} />
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

              <View style={[S.row, { justifyContent: 'flex-end', gap: 10, marginTop: 14, marginBottom: 10 }]}>
                <TouchableOpacity style={S.btnCancel} onPress={() => setAddModalVisible(false)}>
                  <Text style={S.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.btnPrimary} onPress={handleSaveNewTask}>
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
                  onChangeText={(t) => setEditingTask({ ...editingTask, title: t })}
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={S.fieldLabel}>Class / Subject</Text>
                <View style={S.dropdownRow}>
                  {activeClasses.map((cls) => {
                    const sel = editingTask.subject === cls.name;
                    return (
                      <Pressable
                        key={cls.id}
                        style={[S.dropdownChip, sel && S.dropdownChipSelected]}
                        onPress={() =>
                          setEditingTask({
                            ...editingTask,
                            subject: cls.name,
                            instructor: cls.instructor,
                          })
                        }
                      >
                        <Text style={[S.dropdownChipText, sel && S.dropdownChipTextSelected]}>
                          {cls.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={S.instructorInfo}>
                  Instructor: <Text style={{ fontWeight: 'bold' }}>{editingTask.instructor}</Text>
                </Text>

                <Text style={S.fieldLabel}>Description</Text>
                <TextInput
                  style={S.inputLarge}
                  value={editingTask.description || ''}
                  onChangeText={(t) => setEditingTask({ ...editingTask, description: t })}
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
                  <TouchableOpacity style={S.addSubtaskBtn} onPress={handleAddEditSubtask}>
                    <Text style={S.btnPrimaryText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {editingTask.subtasks.map((sub) => (
                  <View key={sub.id} style={S.subtaskChip}>
                    <TouchableOpacity
                      style={[S.row, { flex: 1 }]}
                      onPress={() => handleToggleSubtaskCompletion(sub.id)}
                    >
                      <Text style={{ fontSize: 14, marginRight: 8 }}>
                        {sub.completed ? '☑️' : '⬜'}
                      </Text>
                      <Text
                        style={[S.subtaskText, sub.completed && S.subtaskTextDone]}
                        numberOfLines={1}
                      >
                        {sub.title}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveEditSubtask(sub.id)}>
                      <FaIcon fa="fa-xmark" emoji="" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={S.fieldLabel}>Deadline (YYYY-MM-DD)</Text>
                <TextInput
                  style={S.input}
                  value={editingTask.dueDate}
                  onChangeText={(t) => setEditingTask({ ...editingTask, dueDate: t })}
                  placeholderTextColor={Colors.textMuted}
                />

                <View style={[S.rowSpaceBetween, { marginTop: 14, marginBottom: 10 }]}>
                  <TouchableOpacity style={S.btnDanger} onPress={handleDeleteTask}>
                    <Text style={S.btnWhiteText}>Delete</Text>
                  </TouchableOpacity>
                  <View style={[S.row, { gap: 10 }]}>
                    <TouchableOpacity style={S.btnCancel} onPress={() => setEditModalVisible(false)}>
                      <Text style={S.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={S.btnPrimary} onPress={handleSaveEditedTask}>
                      <Text style={S.btnPrimaryText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
