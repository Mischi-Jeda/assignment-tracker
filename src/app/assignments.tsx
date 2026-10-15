// src/app/assignments.tsx
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
  StyleSheet,
} from 'react-native';
import { useTasks, Task, Subtask, ClassOption } from '@/context/task-context';
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

export default function AssignmentsScreen() {
  const { tasks, classes, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);

  const [activeTab, setActiveTab] = useState<'incomplete' | 'completed' | 'archived'>('incomplete');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);

  // ── Add modal ─────────────────────────────────────────────────
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassOption>(
    activeClasses[0] || { id: 'default', name: 'General', instructor: 'Self' }
  );
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [modalSubtasks, setModalSubtasks] = useState<Subtask[]>([]);

  // ── Edit modal ────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editSubtaskInput, setEditSubtaskInput] = useState('');

  // ── Helpers ───────────────────────────────────────────────────
  const isWithinSevenDays = (dateString: string) => {
    if (!dateString) return false;
    const due = new Date(dateString).getTime();
    const diff = (due - new Date().getTime()) / (1000 * 3600 * 24);
    return diff >= -1 && diff <= 7;
  };

  const openAddModal = () => {
    if (activeClasses.length > 0) setSelectedClass(activeClasses[0]);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setModalSubtasks([]);
    setSubtaskInput('');
    setAddModalVisible(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setModalSubtasks([...modalSubtasks, { id: Date.now().toString(), title: subtaskInput.trim(), completed: false }]);
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

  const handleArchiveOrDeleteTask = () => {
    if (!editingTask) return;
    if (editingTask.status === 'completed') {
      toggleTaskStatus(editingTask.id, 'completed');
    } else {
      deleteTask(editingTask.id);
    }
    setEditModalVisible(false);
    setEditingTask(null);
  };

  const filteredAssignments = tasks.filter((task) => {
    const matchesStatus = task.status === activeTab;
    const matchesClass = selectedClassFilter === 'All' || task.subject === selectedClassFilter;
    return matchesStatus && matchesClass;
  });

  // Tab config
  const TABS = [
    { key: 'incomplete', label: 'Incomplete', fa: 'fa-hourglass-half', emoji: '⏳' },
    { key: 'completed', label: 'Completed', fa: 'fa-circle-check', emoji: '✅' },
    { key: 'archived', label: 'Archived', fa: 'fa-box-archive', emoji: '📦' },
  ] as const;

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>

        {/* ── Header ── */}
        <View style={[S.row, { marginBottom: 4, gap: 8 }]}>
          <FaIcon fa="fa-clipboard-list" emoji="📋" size={20} color={Colors.primary} />
          <Text style={S.pageTitle}>Assignments</Text>
        </View>
        <Text style={S.pageSubtitle}>Track and organize your tasks.</Text>

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
                <FaIcon fa={tab.fa} emoji={tab.emoji} size={12} color={sel ? '#fff' : Colors.textMedium} />
                <Text style={[styles.tabText, sel && styles.tabTextActive]}>
                  {'  '}{tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Class filter chips ── */}
        <View style={[S.row, { marginBottom: 16 }]}>
          <Text style={styles.filterLabel}>Class:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {['All', ...activeClasses.map((c) => c.name)].map((name) => {
              const sel = selectedClassFilter === name;
              return (
                <TouchableOpacity
                  key={name}
                  style={[S.chip, sel && S.chipSelected]}
                  onPress={() => setSelectedClassFilter(name)}
                >
                  <Text style={[S.chipText, sel && S.chipTextSelected]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Assignments list ── */}
        <View style={[S.card, { marginBottom: 16 }]}>
          <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
            <FaIcon fa="fa-list" emoji="📝" size={14} color={Colors.primary} />
            <Text style={[S.sectionHeaderFirst, { margin: 0 }]}>
              {activeTab.toUpperCase()} ({filteredAssignments.length})
            </Text>
          </View>

          {filteredAssignments.length === 0 ? (
            <Text style={S.emptyText}>No tasks found in this section.</Text>
          ) : (
            filteredAssignments.map((item) => {
              const isChecked = item.status !== 'incomplete';
              const urgent = activeTab === 'incomplete' && isWithinSevenDays(item.dueDate);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={urgent ? S.taskCardUrgent : S.taskCard}
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
                    <FaIcon fa={isChecked ? 'fa-square-check' : 'fa-square'} emoji="" size={18} color={Colors.primary} />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={[
                        urgent ? S.taskTitleUrgent : S.taskTitle,
                        item.status === 'completed' && { textDecorationLine: 'line-through', color: Colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={urgent ? S.taskSubjectUrgent : S.taskSubject}
                      numberOfLines={1}
                    >
                      {item.subject}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={urgent ? S.taskDateUrgent : S.taskDate}>
                      {item.dueDate}
                    </Text>
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
                          setEditingTask({ ...editingTask, subject: cls.name, instructor: cls.instructor })
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
                      <FaIcon fa={sub.completed ? 'fa-square-check' : 'fa-square'} emoji="" size={14} color={Colors.primary} />
                      <Text style={[S.subtaskText, sub.completed && S.subtaskTextDone]} numberOfLines={1}>
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
                  <TouchableOpacity
                    style={editingTask.status === 'completed' ? S.btnWarning : S.btnDanger}
                    onPress={handleArchiveOrDeleteTask}
                  >
                    <Text style={S.btnWhiteText}>
                      {editingTask.status === 'completed' ? '📦 Archive' : 'Delete'}
                    </Text>
                  </TouchableOpacity>

                  <View style={[S.row, { gap: 8 }]}>
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

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: Colors.textMedium,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  filterLabel: {
    fontWeight: '600',
    color: Colors.textBody,
    fontSize: 13,
    marginRight: 8,
  },
});
