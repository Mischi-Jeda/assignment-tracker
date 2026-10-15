// src/styles/shared.ts
// Shared design tokens and StyleSheet used across all screens.
// Edit here to change the app-wide look & feel in one place.

import { StyleSheet } from 'react-native';
import { AppColors, Radius, Shadow } from './theme';
export { Radius, Shadow } from './theme';
export const Colors = AppColors;

// ─── Design Tokens ───────────────────────────────────────────────
// ─── Shared StyleSheet ────────────────────────────────────────────
export const S = StyleSheet.create({
  // Screens
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  scroll: {
    padding: 16,
    paddingTop: 44,
    paddingBottom: 120,
    flexGrow: 1,
  },

  // Page Headers
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionHeaderFirst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // Cards
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  cardNoMargin: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },

  // Task cards
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.cardBg,
  },
  taskCardUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.urgentBorder,
    backgroundColor: Colors.urgentBg,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  taskTitleUrgent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.urgentText,
  },
  taskSubject: {
    fontSize: 12,
    color: Colors.textMedium,
    fontStyle: 'italic',
    marginTop: 2,
  },
  taskSubjectUrgent: {
    fontSize: 12,
    color: Colors.urgentSubText,
    fontStyle: 'italic',
    marginTop: 2,
  },
  taskDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  taskDateUrgent: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.urgentText,
  },
  taskInstructor: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Forms
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textBody,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.inputBg,
    padding: 10,
    borderRadius: Radius.sm,
    fontSize: 14,
    marginBottom: 6,
    color: Colors.textPrimary,
  },
  inputLarge: {
    backgroundColor: Colors.inputBg,
    padding: 10,
    borderRadius: Radius.sm,
    fontSize: 14,
    marginBottom: 6,
    color: Colors.textPrimary,
    height: 60,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    justifyContent: 'center',
  },
  btnWarning: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    justifyContent: 'center',
  },
  btnCancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  btnCancelText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  btnWhiteText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Chips / Filter pills
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: Colors.textPrimary,
  },

  // Misc
  subtaskChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 4,
  },
  subtaskText: {
    fontSize: 13,
    color: Colors.textBody,
  },
  subtaskTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  emptyText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.fab,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.fab,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 32,
  },

  // Dropdown chips inside modals
  dropdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  dropdownChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
  },
  dropdownChipSelected: {
    backgroundColor: Colors.primary,
  },
  dropdownChipText: {
    fontSize: 12,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  dropdownChipTextSelected: {
    color: '#fff',
  },
  instructorInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  addSubtaskBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Settings row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
});

