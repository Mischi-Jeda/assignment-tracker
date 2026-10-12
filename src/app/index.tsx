// src/app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { useTasks, Task, Subtask, ClassOption } from '@/context/task-context';
import { useUser } from '@/context/user-context';

export default function HomeScreen() {
  const { user } = useUser();
  const displayName = user.name ? user.name.split(' ')[0] : 'User';

  const { tasks, classes, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  
  const activeClasses = classes.filter((c) => !c.isArchived);

  // Modal State for Adding Task
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassOption>(
    activeClasses[0] || { id: 'default', name: 'General', instructor: 'Self' }
  );
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [modalSubtasks, setModalSubtasks] = useState<Subtask[]>([]);

  // Modal State for Task Details & Editing
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editSubtaskInput, setEditSubtaskInput] = useState('');

  const isWithinSevenDays = (dateString: string) => {
    if (!dateString) return false;
    const due = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffDays = (due - now) / (1000 * 3600 * 24);
    return diffDays >= -1 && diffDays <= 7;
  };

  const openAddModal = () => {
    if (activeClasses.length > 0) {
      setSelectedClass(activeClasses[0]);
    }
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

  const handleRemoveSubtask = (id: string) => {
    setModalSubtasks(modalSubtasks.filter((s) => s.id !== id));
  };

  const handleSaveNewTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle,
      subject: selectedClass.name,
      instructor: selectedClass.instructor,
      description: newDescription,
      subtasks: modalSubtasks,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
    });

    setAddModalVisible(false);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setModalSubtasks([]);
  };

  const openTaskDetail = (task: Task) => {
    setEditingTask({ ...task });
    setEditModalVisible(true);
  };

  const handleToggleSubtaskCompletion = (subtaskId: string) => {
    if (!editingTask) return;
    const updatedSubtasks = editingTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
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
    updateTask(editingTask);
    setEditModalVisible(false);
    setEditingTask(null);
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
      const aUrgent = isWithinSevenDays(a.dueDate);
      const bUrgent = isWithinSevenDays(b.dueDate);
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Welcome back, {displayName}!</Text>
        <Text style={styles.headerSubtitle}>Here’s your activity overview.</Text>

        <View style={styles.cardSection}>
          <Text style={styles.sectionHeader}>Incomplete Assignments ({incompleteTasks.length})</Text>

          {incompleteTasks.length === 0 ? (
            <Text style={styles.emptyText}>🎉 All caught up! No incomplete assignments.</Text>
          ) : (
            incompleteTasks.map((task) => {
              const urgent = isWithinSevenDays(task.dueDate);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskCard, urgent ? styles.urgentCard : styles.defaultCard]}
                  onPress={() => openTaskDetail(task)}
                >
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id, task.status);
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>⬜</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.taskTitle, urgent ? { color: '#7f1d1d' } : undefined]} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskSubject, urgent ? { color: '#b91c1c' } : undefined]} numberOfLines={1}>
                      {task.subject}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.taskDate, urgent ? { color: '#7f1d1d' } : undefined]}>
                      Due: {task.dueDate}
                    </Text>
                    <Text style={[styles.taskInstructor, urgent ? { color: '#b91c1c' } : undefined]} numberOfLines={1}>
                      {task.instructor}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal 1: Add Assignment */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Assignment</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Task Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Activity 4 - DB Triggers"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.fieldLabel}>Class / Subject *</Text>
              <View style={styles.dropdownRow}>
                {activeClasses.map((cls) => {
                  const isSelected = selectedClass.id === cls.id;
                  return (
                    <Pressable
                      key={cls.id}
                      style={[
                        styles.dropdownChip,
                        isSelected ? styles.dropdownChipSelected : undefined,
                      ]}
                      onPress={() => setSelectedClass(cls)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : undefined,
                        ]}
                      >
                        {cls.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.instructorInfo}>
                Instructor: <Text style={{ fontWeight: 'bold' }}>{selectedClass.instructor}</Text>
              </Text>

              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Add details, instructions, or notes..."
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
              />

              <Text style={styles.fieldLabel}>Subtasks (Optional)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Add a subtask..."
                  value={subtaskInput}
                  onChangeText={setSubtaskInput}
                />
                <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddSubtask}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
              </View>

              {modalSubtasks.map((sub) => (
                <View key={sub.id} style={styles.modalSubtaskChip}>
                  <Text style={{ fontSize: 12, color: '#334155', flex: 1 }} numberOfLines={1}>{sub.title}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(sub.id)}>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 8 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.fieldLabel}>Deadline (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-10-20"
                value={newDueDate}
                onChangeText={setNewDueDate}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14, marginBottom: 10 }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={{ color: '#64748b' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveNewTask}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Assignment</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Task Detail / Edit / Delete */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {editingTask && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Task Details & Editing</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Task Name</Text>
                <TextInput
                  style={styles.input}
                  value={editingTask.title}
                  onChangeText={(text) => setEditingTask({ ...editingTask, title: text })}
                />

                <Text style={styles.fieldLabel}>Class / Subject</Text>
                <View style={styles.dropdownRow}>
                  {activeClasses.map((cls) => {
                    const isSelected = editingTask.subject === cls.name;
                    return (
                      <Pressable
                        key={cls.id}
                        style={[
                          styles.dropdownChip,
                          isSelected ? styles.dropdownChipSelected : undefined,
                        ]}
                        onPress={() =>
                          setEditingTask({
                            ...editingTask,
                            subject: cls.name,
                            instructor: cls.instructor,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected ? styles.chipTextSelected : undefined,
                          ]}
                        >
                          {cls.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.instructorInfo}>
                  Instructor: <Text style={{ fontWeight: 'bold' }}>{editingTask.instructor}</Text>
                </Text>

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  value={editingTask.description || ''}
                  onChangeText={(text) => setEditingTask({ ...editingTask, description: text })}
                  multiline
                />

                <Text style={styles.fieldLabel}>Subtasks</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Add a subtask..."
                    value={editSubtaskInput}
                    onChangeText={setEditSubtaskInput}
                  />
                  <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddEditSubtask}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                  </TouchableOpacity>
                </View>

                {editingTask.subtasks.map((sub) => (
                  <View key={sub.id} style={styles.modalSubtaskChip}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      onPress={() => handleToggleSubtaskCompletion(sub.id)}
                    >
                      <Text style={{ fontSize: 14, marginRight: 8 }}>
                        {sub.completed ? '☑️' : '⬜'}
                      </Text>
                      <Text
                        style={[
                          styles.subtaskModalText,
                          sub.completed ? styles.subtaskModalTextCompleted : undefined,
                        ]}
                        numberOfLines={1}
                      >
                        {sub.title}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleRemoveEditSubtask(sub.id)}>
                      <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 8 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={styles.fieldLabel}>Deadline (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={editingTask.dueDate}
                  onChangeText={(text) => setEditingTask({ ...editingTask, dueDate: text })}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 10 }}>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={{ color: '#64748b' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditedTask}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingTop: 44, paddingBottom: 110 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, fontStyle: 'italic' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { color: '#64748b', fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  defaultCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  urgentCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  checkbox: { marginRight: 10 },
  taskTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  taskSubject: { fontSize: 12, color: '#475569', fontStyle: 'italic' },
  taskDate: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  taskInstructor: { fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '75%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#0f172a' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 14, marginBottom: 6, color: '#0f172a' },
  dropdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  dropdownChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  dropdownChipSelected: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  instructorInfo: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 6 },
  addSubtaskBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  modalSubtaskChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  subtaskModalText: { fontSize: 13, color: '#334155' },
  subtaskModalTextCompleted: { textDecorationLine: 'line-through', color: '#94a3b8' },
  cancelButton: { padding: 10, justifyContent: 'center' },
  saveButton: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, justifyContent: 'center' },
  deleteButton: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8, justifyContent: 'center' },
});