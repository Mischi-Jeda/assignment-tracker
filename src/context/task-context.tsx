// src/context/task-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { classService } from '@/services/classService';
import { assignmentService } from '@/services/assignmentService';
import { useUser } from './user-context';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ClassOption {
  id: string;
  name: string;
  instructor: string;
  room?: string;
  isArchived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  description?: string;
  subtasks: Subtask[];
  dueDate: string; // YYYY-MM-DD
  status: 'incomplete' | 'completed' | 'archived';
}

interface TaskContextType {
  tasks: Task[];
  classes: ClassOption[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
  updateTask: (updatedTask: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string, currentStatus: Task['status']) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addClass: (newClass: Omit<ClassOption, 'id'>) => Promise<void>;
  updateClass: (updatedClass: ClassOption) => Promise<void>;
  archiveClass: (classId: string) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isLoggedIn } = useUser(); // <-- get isLoggedIn from user context

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    } else {
      setTasks([]);
      setClasses([]);
    }
  }, [isLoggedIn]);

  // ... rest of your code
  const loadData = async () => {
    try {
      const [fetchedClasses, fetchedTasks] = await Promise.all([
        classService.getClasses(),
        assignmentService.getAssignments(),
      ]);
      setClasses(fetchedClasses);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading Supabase data:', error);
    }
  };

  const addTask = async (newTaskData: Omit<Task, 'id' | 'status'>) => {
    try {
      const created = await assignmentService.addTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      await assignmentService.updateTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await assignmentService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: Task['status']) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    let nextStatus: Task['status'] = 'completed';
    if (currentStatus === 'incomplete') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'archived';
    else nextStatus = 'incomplete';

    const updated = { ...task, status: nextStatus };
    await updateTask(updated);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const updated = { ...task, subtasks: updatedSubtasks };
    await updateTask(updated);
  };

  const addClass = async (newClassData: Omit<ClassOption, 'id'>) => {
    try {
      const created = await classService.addClass(newClassData);
      setClasses((prev) => [...prev, created]);
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  const updateClass = async (updatedClass: ClassOption) => {
    try {
      await classService.updateClass(updatedClass);
      setClasses((prev) => prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const archiveClass = async (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const updated = { ...targetClass, isArchived: !targetClass.isArchived };
    await updateClass(updated);
  };

  const deleteClass = async (classId: string) => {
    try {
      await classService.deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        classes,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,
        addClass,
        updateClass,
        archiveClass,
        deleteClass,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};

export const ACTIVE_CLASSES = (classesList: ClassOption[]) =>
  classesList.filter((c) => !c.isArchived);