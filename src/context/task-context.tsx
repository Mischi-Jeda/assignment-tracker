
// src/context/task-context.tsx
import React, { createContext, useContext, useState } from 'react';

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
  icon?: string;
  color?: string;
  isArchived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  description?: string;
  subtasks: Subtask[];
  dueDate: string;
  status: 'incomplete' | 'completed' | 'archived';
}

interface TaskContextType {
  tasks: Task[];
  classes: ClassOption[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string, currentStatus: Task['status']) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addClass: (newClass: Omit<ClassOption, 'id'>) => void;
  updateClass: (updatedClass: ClassOption) => void;
  archiveClass: (classId: string) => void;
  deleteClass: (classId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassOption[]>([
    {
      id: '1',
      name: 'Quantitative Research',
      instructor: 'Ed Neil Maratas',
      room: 'Room 302',
      icon: 'fa-bookmark',
      isArchived: false,
    },
    {
      id: '2',
      name: 'Advance Database Systems',
      instructor: 'Mark Mascardo',
      room: 'Lab 2',
      icon: 'fa-clipboard-list',
      isArchived: false,
    },
    {
      id: '3',
      name: 'Information Systems Architecture',
      instructor: 'Department Faculty',
      room: 'Online',
      icon: 'fa-graduation-cap',
      isArchived: false,
    },
    {
      id: '4',
      name: 'Data Structures and Algorithms',
      instructor: 'Previous Instructor',
      room: 'Lab 1',
      icon: 'fa-list',
      isArchived: true,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Laboratory Exercise 3',
      subject: 'Quantitative Research',
      instructor: 'Ed Neil Maratas',
      description: 'Complete data collection section and summary analysis.',
      subtasks: [
        { id: 's1', title: 'Gather survey samples', completed: true },
        { id: 's2', title: 'Calculate mean and standard deviation', completed: false },
      ],
      dueDate: '2026-10-14',
      status: 'incomplete',
    },
    {
      id: '2',
      title: 'Activity 4 - DB Triggers',
      subject: 'Advance Database Systems',
      instructor: 'Mark Mascardo',
      description: 'Write PL/pgSQL BEFORE and AFTER trigger functions.',
      subtasks: [],
      dueDate: '2026-10-15',
      status: 'incomplete',
    },
    {
      id: '3',
      title: 'Midterm Project Proposal',
      subject: 'Information Systems Architecture',
      instructor: 'Department Faculty',
      description: 'System architectural overview draft.',
      subtasks: [],
      dueDate: '2026-10-01',
      status: 'completed',
    },
  ]);

  const addTask = (newTaskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      status: 'incomplete',
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string, currentStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          let nextStatus: Task['status'] = 'completed';

          if (currentStatus === 'incomplete') nextStatus = 'completed';
          else if (currentStatus === 'completed') nextStatus = 'archived';
          else nextStatus = 'incomplete';

          return { ...t, status: nextStatus };
        }

        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          };
        }

        return t;
      })
    );
  };

  // Class Management Handlers
  const addClass = (newClass: Omit<ClassOption, 'id'>) => {
    const createdClass: ClassOption = {
      ...newClass,
      id: Date.now().toString(),
      isArchived: false,
    };

    setClasses((prev) => [...prev, createdClass]);
  };

  const updateClass = (updatedClass: ClassOption) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );

    // Sync instructor/name updates to associated tasks
    setTasks((prev) =>
      prev.map((t) => {
        if (t.subject === updatedClass.name) {
          return { ...t, instructor: updatedClass.instructor };
        }

        return t;
      })
    );
  };

  const archiveClass = (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    // Toggle class archived status
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, isArchived: !c.isArchived } : c
      )
    );

    // Archive all tasks under this subject automatically
    if (!targetClass.isArchived) {
      setTasks((prev) =>
        prev.map((t) =>
          t.subject === targetClass.name ? { ...t, status: 'archived' } : t
        )
      );
    }
  };

  const deleteClass = (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);

    setClasses((prev) => prev.filter((c) => c.id !== classId));

    if (targetClass) {
      setTasks((prev) => prev.filter((t) => t.subject !== targetClass.name));
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

  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }

  return context;
};

// Export helper for active classes dropdowns across home/assignments
export const ACTIVE_CLASSES = (classesList: ClassOption[]) =>
  classesList.filter((c) => !c.isArchived);
