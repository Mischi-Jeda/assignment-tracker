// src/services/classService.ts
import { supabase } from '@/lib/supabase';
import { ClassOption } from '@/context/task-context';

export const classService = {
  async getClasses(): Promise<ClassOption[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', user.id); // <-- Filter classes by user

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      instructor: item.instructor,
      room: item.room,
      isArchived: item.is_archived || false,
    }));
  },

  async addClass(newClass: Omit<ClassOption, 'id'>): Promise<ClassOption> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          name: newClass.name,
          instructor: newClass.instructor,
          room: newClass.room,
          is_archived: newClass.isArchived || false,
          user_id: user.id, // <-- Save with user ID
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      instructor: data.instructor,
      room: data.room,
      isArchived: data.is_archived,
    };
  },

  async updateClass(updatedClass: ClassOption): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .update({
        name: updatedClass.name,
        instructor: updatedClass.instructor,
        room: updatedClass.room,
        is_archived: updatedClass.isArchived,
      })
      .eq('id', updatedClass.id);

    if (error) throw error;
  },

  async deleteClass(classId: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;
  },
};