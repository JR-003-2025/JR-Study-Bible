import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingPlanService, defaultReadingPlans } from '@/services/readingPlanService';
import type { ReadingPlan, UserProgress } from '@/services/types';

export function useReadingPlan(planId?: string) {
  const queryClient = useQueryClient();

  // Initialize default plans
  const initPlans = useMutation({
    mutationFn: async () => {
      for (const plan of defaultReadingPlans) {
        await readingPlanService.addPlan(plan);
      }
    },
  });

  // Get all plans
  const { data: plans = [] } = useQuery<ReadingPlan[]>({
    queryKey: ['readingPlans'],
    queryFn: async () => {
      const plans = await readingPlanService.getAllPlans();
      if (plans.length === 0) {
        await initPlans.mutateAsync();
        return defaultReadingPlans;
      }
      return plans;
    },
  });

  // Get specific plan and progress
  const { data: currentPlan } = useQuery<ReadingPlan | null>({
    queryKey: ['readingPlan', planId],
    queryFn: () => readingPlanService.getPlan(planId!),
    enabled: !!planId,
  });

  const { data: progress } = useQuery<UserProgress | null>({
    queryKey: ['readingProgress', planId],
    queryFn: () => readingPlanService.getProgress(planId!),
    enabled: !!planId,
  });

  // Mark a day as complete
  const markDayComplete = useMutation({
    mutationFn: ({ planId, day }: { planId: string; day: number }) =>
      readingPlanService.markDayComplete(planId, day),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress', planId] });
    },
  });

  return {
    plans,
    currentPlan,
    progress,
    markDayComplete: markDayComplete.mutate,
    isLoading: initPlans.isLoading,
  };
}
