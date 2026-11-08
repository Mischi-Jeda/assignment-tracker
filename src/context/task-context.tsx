// src/context/task-context.tsx
import { assignmentService } from "@/services/assignmentService";
import { classService } from "@/services/classService";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-context";

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
  icon?: string; // v2-only
  color?: string; // v2-only
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
  status: "incomplete" | "completed" | "archived";
}

interface TaskContextType {
  tasks: Task[];
  classes: ClassOption[];
  addTask: (task: Omit<Task, "id" | "status">) => Promise<void>;
  updateTask: (updatedTask: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (
    id: string,
    currentStatus: Task["status"],
  ) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addClass: (newClass: Omit<ClassOption, "id">) => Promise<void>;
  updateClass: (updatedClass: ClassOption) => Promise<void>;
  archiveClass: (classId: string) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isLoggedIn } = useUser();

  // ---- from main: backend load, gated on auth, cleared on logout ----
  const loadData = async () => {
    try {
      const [fetchedClasses, fetchedTasks] = await Promise.all([
        classService.getClasses(),
        assignmentService.getAssignments(),
      ]);
      setClasses(fetchedClasses);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading Supabase data:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    } else {
      setTasks([]);
      setClasses([]);
    }
  }, [isLoggedIn]);

  // ---------------- Tasks ----------------
  const addTask = async (newTaskData: Omit<Task, "id" | "status">) => {
    try {
      const created = await assignmentService.addTask(newTaskData); // main
      setTasks((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      await assignmentService.updateTask(updatedTask); // main
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await assignmentService.deleteTask(id); // main
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // v2's status cycle logic, persisted through updateTask
  const toggleTaskStatus = async (
    id: string,
    currentStatus: Task["status"],
  ) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    let nextStatus: Task["status"] = "completed";
    if (currentStatus === "incomplete") nextStatus = "completed";
    else if (currentStatus === "completed") nextStatus = "archived";
    else nextStatus = "incomplete";

    await updateTask({ ...task, status: nextStatus });
  };

  // v2's subtask toggle logic, persisted through updateTask
  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    );
    await updateTask({ ...task, subtasks: updatedSubtasks });
  };

  // ---------------- Classes ----------------
  const addClass = async (newClassData: Omit<ClassOption, "id">) => {
    try {
      const created = await classService.addClass(newClassData); // main

      // 🔥 FIX: Merge the returned DB data (which has the ID) with the local data (which has the color/icon)
      const completeClass = { ...newClassData, ...created };

      setClasses((prev) => [...prev, completeClass]);
    } catch (error) {
      console.error("Error adding class:", error);
    }
  }; // 🔥 FIXED: This missing closing brace was causing the syntax error!

  const updateClass = async (updatedClass: ClassOption) => {
    try {
      await classService.updateClass(updatedClass); // main
      setClasses((prev) =>
        prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
      );

      // v2 behavior preserved: sync instructor to tasks whose subject matches.
      // Matches on the NEW name, exactly like v2 (so a rename does NOT re-sync — see note below).
      const affected = tasks.filter((t) => t.subject === updatedClass.name);
      if (affected.length > 0) {
        const patched = affected.map((t) => ({
          ...t,
          instructor: updatedClass.instructor,
        }));
        await Promise.all(patched.map((t) => assignmentService.updateTask(t)));
        setTasks((prev) =>
          prev.map((t) => patched.find((p) => p.id === t.id) ?? t),
        );
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const archiveClass = async (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const becomingArchived = !targetClass.isArchived;

    try {
      const updatedClass = { ...targetClass, isArchived: becomingArchived };
      await classService.updateClass(updatedClass); // main (no dedicated archive endpoint)
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? updatedClass : c)),
      );

      // v2 behavior preserved: archiving a class also archives its tasks.
      // (Un-archiving does NOT restore them, matching v2.)
      if (becomingArchived) {
        const toArchive = tasks
          .filter(
            (t) => t.subject === targetClass.name && t.status !== "archived",
          )
          .map((t) => ({ ...t, status: "archived" as const }));

        if (toArchive.length > 0) {
          await Promise.all(
            toArchive.map((t) => assignmentService.updateTask(t)),
          );
          setTasks((prev) =>
            prev.map((t) => toArchive.find((a) => a.id === t.id) ?? t),
          );
        }
      }
    } catch (error) {
      console.error("Error archiving class:", error);
    }
  };

  const deleteClass = async (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);

    try {
      await classService.deleteClass(classId); // main
      setClasses((prev) => prev.filter((c) => c.id !== classId));

      // v2 behavior preserved: deleting a class deletes its tasks.
      if (targetClass) {
        const toDelete = tasks.filter((t) => t.subject === targetClass.name);
        if (toDelete.length > 0) {
          await Promise.all(
            toDelete.map((t) => assignmentService.deleteTask(t.id)),
          );
          setTasks((prev) =>
            prev.filter((t) => t.subject !== targetClass.name),
          );
        }
      }
    } catch (error) {
      console.error("Error deleting class:", error);
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
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export const ACTIVE_CLASSES = (classesList: ClassOption[]) =>
  classesList.filter((c) => !c.isArchived);
