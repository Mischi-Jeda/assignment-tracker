// src/app/classes.tsx
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
import { useTasks, ClassOption } from '@/context/task-context';
import { S, Colors, Radius } from '@/styles/shared';
import LoadingOverlay from '@/components/loading-overlay';
import { AppIcon, IconLabel } from '@/components/icon-label';

const COLOR_OPTIONS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2'];
const ICON_OPTIONS = ['fa-bookmark', 'fa-clipboard-list', 'fa-list', 'fa-square', 'fa-graduation-cap', 'fa-hourglass-half', 'fa-circle-check', 'fa-box-archive'];

// ── Icon helper ─────────────────────────────────────────────────
function FaIcon({ fa, emoji, size = 16, color = Colors.textPrimary }: {
  fa: string; emoji: string; size?: number; color?: string;
}) {
  void emoji;
  return <AppIcon name={fa} size={size} color={color} />;
}

export default function ClassesScreen() {
  const { classes, addClass, updateClass, archiveClass, deleteClass } = useTasks();
  const activeClasses = classes.filter((c) => !c.isArchived);
  const archivedClasses = classes.filter((c) => c.isArchived);

  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassOption | null>(null);

  const [className, setClassName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [selectedIcon, setSelectedIcon] = useState('fa-bookmark');

  const openAddModal = () => {
    setEditingClass(null);
    setClassName('');
    setInstructor('');
    setRoom('');
    setSelectedColor('#2563eb');
    setSelectedIcon('fa-bookmark');
    setModalVisible(true);
  };

  const openEditModal = (item: ClassOption & { color?: string; icon?: string }) => {
    setEditingClass(item);
    setClassName(item.name);
    setInstructor(item.instructor);
    setRoom(item.room || '');
    setSelectedColor((item as any).color || '#2563eb');
    setSelectedIcon((item as any).icon || 'fa-bookmark');
    setModalVisible(true);
  };

  const handleSaveClass = () => {
    if (!className.trim() || !instructor.trim()) return;
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
      setIsSaving(false);
    }, 400);
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
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scroll}>

        {/* ── Header ── */}
        <View style={[S.row, { marginBottom: 4, gap: 8 }]}>
          <FaIcon fa="fa-graduation-cap" emoji="🎓" size={20} color={Colors.primary} />
          <Text style={S.pageTitle}>Classes & Subjects</Text>
        </View>
        <Text style={S.pageSubtitle}>Manage and view your enrolled classes.</Text>

        {/* ── Active classes ── */}
        <View style={[S.row, { marginBottom: 12, gap: 6 }]}>
          <FaIcon fa="fa-bookmark" emoji="🔖" size={14} color={Colors.primary} />
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
              style={[styles.classCard, { borderLeftColor: item.color || Colors.primary }]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.classIconCircle, { backgroundColor: (item.color || Colors.primary) + '20' }]}>
                <AppIcon name={item.icon || 'fa-bookmark'} size={20} color={item.color || Colors.primary} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.className} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.classInstructor} numberOfLines={1}>
                  <FaIcon fa="fa-chalkboard-user" emoji="👨‍🏫" size={11} color={Colors.textMedium} />
                  {' '}{item.instructor}
                </Text>
                <Text style={styles.classRoom} numberOfLines={1}>
                  <FaIcon fa="fa-location-dot" emoji="📍" size={11} color={Colors.textSecondary} />
                  {' '}{item.room || 'TBA'}
                </Text>
              </View>
              <FaIcon fa="fa-chevron-right" emoji="›" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        {/* ── Archived classes ── */}
        <View style={[S.row, { marginBottom: 12, marginTop: 24, gap: 6 }]}>
          <FaIcon fa="fa-box-archive" emoji="📦" size={14} color={Colors.textSecondary} />
          <Text style={[S.sectionHeaderFirst, { margin: 0, color: Colors.textSecondary }]}>
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
              <View style={[styles.classIconCircle, { backgroundColor: Colors.inputBg }]}>
                <AppIcon name={item.icon || 'fa-box-archive'} size={20} color={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.className, { color: Colors.textSecondary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.classInstructor} numberOfLines={1}>{item.instructor}</Text>
                <Text style={styles.classRoom} numberOfLines={1}>{item.room || 'TBA'}</Text>
              </View>
              <FaIcon fa="fa-chevron-right" emoji="›" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={S.fab} onPress={openAddModal} activeOpacity={0.85}>
        <IconLabel name="fa-plus" label="Add" size={19} color="#fff" />
      </TouchableOpacity>

      {/* ── Loading overlay ── */}
      <LoadingOverlay visible={isSaving} message="Saving…" />

      {/* ══ Modal: Add / Edit Class ══ */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalCard, { maxHeight: '92%' }]}>
            <Text style={S.modalTitle}>
              {editingClass ? 'Edit Subject / Class' : 'Add New Subject'}
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
                    style={[styles.iconBox, selectedIcon === icon && styles.selectedIconBox]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <AppIcon name={icon} size={18} color={Colors.primary} />
                  </Pressable>
                ))}
              </View>

              {/* Action buttons */}
              <View style={[S.rowSpaceBetween, { marginTop: 18, marginBottom: 8 }]}>
                {editingClass ? (
                  <View style={[S.row, { gap: 6 }]}>
                    <TouchableOpacity style={S.btnWarning} onPress={handleArchiveClass}>
                      <Text style={S.btnWhiteText}>
                        {editingClass.isArchived ? 'Restore' : 'Archive'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={S.btnDanger} onPress={handleDeleteClass}>
                      <Text style={S.btnWhiteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View />
                )}

                <View style={[S.row, { gap: 8 }]}>
                  <TouchableOpacity style={S.btnCancel} onPress={() => setModalVisible(false)}>
                    <Text style={S.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.btnPrimary} onPress={handleSaveClass}>
                    <Text style={S.btnPrimaryText}>{editingClass ? 'Save' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  className: {
    fontSize: 15,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selectedIconBox: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
