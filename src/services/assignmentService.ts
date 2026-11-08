// src/services/assignmentService.ts
import { supabase } from '@/lib/supabase';
import { Task, Subtask } from '@/context/task-context';

export const assignmentService = {
  async getAssignments(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.id); // <-- Filter by logged-in user

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      instructor: item.instructor,
      description: item.description || '',
      subtasks: (item.subtasks as Subtask[]) || [],
      dueDate: item.due_date,
      status: item.status,
    }));
  },

  async addTask(task: Omit<Task, 'id' | 'status'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('assignments')
      .insert([
        {
          title: task.title,
          subject: task.subject,
          instructor: task.instructor,
          description: task.description,
          subtasks: task.subtasks,
          due_date: task.dueDate,
          status: 'incomplete',
          user_id: user.id, // <-- Save with user ID
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      instructor: data.instructor,
      description: data.description || '',
      subtasks: (data.subtasks as Subtask[]) || [],
      dueDate: data.due_date,
      status: data.status,
    };
  },

  async updateTask(task: Task): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .update({
        title: task.title,
        subject: task.subject,
        instructor: task.instructor,
        description: task.description,
        subtasks: task.subtasks,
        due_date: task.dueDate,
        status: task.status,
      })
      .eq('id', task.id);

    if (error) throw error;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },
};