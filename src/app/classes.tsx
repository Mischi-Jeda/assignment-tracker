// src/app/classes.tsx
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
import { useTasks, ClassOption } from '@/context/task-context';

const COLOR_OPTIONS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2'];
const ICON_OPTIONS = ['📚', '💻', '📐', '🧪', '🎨', '📊', '⚡', '📝'];

export default function ClassesScreen() {
  const { classes, addClass, updateClass, archiveClass, deleteClass } = useTasks();

  const activeClasses = classes.filter((c) => !c.isArchived);
  const archivedClasses = classes.filter((c) => c.isArchived);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassOption | null>(null);

  // Form Fields
  const [className, setClassName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [selectedIcon, setSelectedIcon] = useState('📚');

  const openAddModal = () => {
    setEditingClass(null);
    setClassName('');
    setInstructor('');
    setRoom('');
    setSelectedColor('#2563eb');
    setSelectedIcon('📚');
    setModalVisible(true);
  };

  const openEditModal = (item: ClassOption & { color?: string; icon?: string }) => {
    setEditingClass(item);
    setClassName(item.name);
    setInstructor(item.instructor);
    setRoom(item.room || '');
    setSelectedColor(item.color || '#2563eb');
    setSelectedIcon(item.icon || '📚');
    setModalVisible(true);
  };

  const handleSaveClass = () => {
    if (!className.trim() || !instructor.trim()) return;

    if (editingClass) {
      updateClass({
        ...editingClass,
        name: className,
        instructor,
        room,
        color: selectedColor,
        icon: selectedIcon,
      } as any);
    } else {
      addClass({
        name: className,
        instructor,
        room: room || 'TBA',
        color: selectedColor,
        icon: selectedIcon,
      } as any);
    }

    setModalVisible(false);
  };

  const handleDeleteClass = () => {
    if (!editingClass) return;
    deleteClass(editingClass.id);
    setModalVisible(false);
  };

  const handleArchiveClass = () => {
    if (!editingClass) return;
    archiveClass(editingClass.id);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Classes & Subjects</Text>
        <Text style={styles.headerSubtitle}>Manage and view your enrolled classes.</Text>

        {/* Active Classes */}
        <Text style={styles.sectionHeader}>Active Classes ({activeClasses.length})</Text>
        {activeClasses.length === 0 ? (
          <Text style={styles.emptyText}>No active classes found.</Text>
        ) : (
          activeClasses.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.classCard, { borderLeftColor: item.color || '#2563eb' }]}
              onPress={() => openEditModal(item)}
            >
              <View style={[styles.classIconCircle, { backgroundColor: (item.color || '#2563eb') + '20' }]}>
                <Text style={{ fontSize: 22 }}>{item.icon || '📚'}</Text>
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.className} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.classInstructor} numberOfLines={1}>Instructor: {item.instructor}</Text>
                <Text style={styles.classRoom} numberOfLines={1}>{item.room || 'TBA'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Archived Classes */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
          Archived Classes ({archivedClasses.length})
        </Text>
        {archivedClasses.length === 0 ? (
          <Text style={styles.emptyText}>No archived classes.</Text>
        ) : (
          archivedClasses.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.classCard, styles.archivedCard]}
              onPress={() => openEditModal(item)}
            >
              <View style={[styles.classIconCircle, { backgroundColor: '#e2e8f0' }]}>
                <Text style={{ fontSize: 22 }}>{item.icon || '📁'}</Text>
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.className, { color: '#64748b' }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.classInstructor} numberOfLines={1}>Instructor: {item.instructor}</Text>
                <Text style={styles.classRoom} numberOfLines={1}>{item.room || 'TBA'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal: Add or Edit Class */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingClass ? 'Edit Subject / Class' : 'Add New Subject'}
            </Text>

            <Text style={styles.fieldLabel}>Subject / Class Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Quantitative Research"
              value={className}
              onChangeText={setClassName}
            />

            <Text style={styles.fieldLabel}>Instructor Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ed Neil Maratas"
              value={instructor}
              onChangeText={setInstructor}
            />

            <Text style={styles.fieldLabel}>Room / Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Room 302 or Online"
              value={room}
              onChangeText={setRoom}
            />

            <Text style={styles.fieldLabel}>Theme Color</Text>
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

            <Text style={styles.fieldLabel}>Icon</Text>
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
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              {editingClass ? (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.archiveButton} onPress={handleArchiveClass}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                      {editingClass.isArchived ? 'Restore' : 'Archive'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteClass}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View />
              )}

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#64748b' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveClass}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {editingClass ? 'Save' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingTop: 44, paddingBottom: 110, flexGrow: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, fontStyle: 'italic' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', marginBottom: 12, textAlign: 'center' },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 5,
  },
  archivedCard: {
    backgroundColor: '#f8fafc',
    borderLeftColor: '#94a3b8',
    opacity: 0.8,
  },
  classIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  className: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  classInstructor: { fontSize: 12, color: '#475569', marginTop: 2 },
  classRoom: { fontSize: 11, color: '#64748b', marginTop: 2 },
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
  fabText: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#0f172a' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 14, marginBottom: 4, color: '#0f172a' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 4 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
  selectedColorCircle: { borderWidth: 3, borderColor: '#0f172a' },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  selectedIconBox: { backgroundColor: '#dbeafe', borderWidth: 2, borderColor: '#2563eb' },
  cancelButton: { padding: 10, justifyContent: 'center' },
  saveButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  deleteButton: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  archiveButton: { backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
});