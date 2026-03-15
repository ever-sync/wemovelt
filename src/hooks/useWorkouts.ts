import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Workout = Tables<"workouts">;
export type WorkoutExercise = Tables<"workout_exercises">;

export interface WorkoutWithExercises extends Workout {
  workout_exercises: WorkoutExercise[];
}

export interface CreateWorkoutInput {
  name: string;
  description?: string;
  objective?: string;
  frequency?: number;
  difficulty?: string;
  exercises?: Omit<TablesInsert<"workout_exercises">, "workout_id">[];
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          *,
          workout_exercises (*)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WorkoutWithExercises[];
    },
    enabled: !!user,
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (input: CreateWorkoutInput) => {
      if (!user) throw new Error("Usuario nao autenticado");

      const { exercises, ...workoutData } = input;
      const { data: workout, error } = await supabase.rpc("create_workout_with_exercises", {
        p_name: workoutData.name,
        p_description: workoutData.description ?? null,
        p_objective: workoutData.objective ?? null,
        p_frequency: workoutData.frequency ?? null,
        p_difficulty: workoutData.difficulty ?? null,
        p_exercises: (exercises ?? []) as unknown as Record<string, unknown>[],
      });

      if (error) throw error;
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Workout> & { id: string }) => {
      const { error } = await supabase.from("workouts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  return {
    workouts: workouts ?? [],
    isLoading,
    createWorkout: createWorkoutMutation.mutateAsync,
    updateWorkout: updateWorkoutMutation.mutateAsync,
    deleteWorkout: deleteWorkoutMutation.mutateAsync,
    isCreating: createWorkoutMutation.isPending,
    isDeleting: deleteWorkoutMutation.isPending,
  };
};
