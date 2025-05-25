import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crossReferenceService, CrossReference } from '@/services/crossReferenceService';

export function useCrossReferences(reference: string) {
  const queryClient = useQueryClient();

  // Fetch cross-references for the current verse
  const { 
    data: crossRefs = [], 
    isLoading 
  } = useQuery({
    queryKey: ['crossRefs', reference],
    queryFn: () => crossReferenceService.getCrossReferences(reference),
    enabled: !!reference,
  });

  // Add a custom cross-reference
  const addCrossReference = useMutation({
    mutationFn: (newRef: CrossReference) => 
      crossReferenceService.addCustomCrossReference(newRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crossRefs', reference] });
    },
  });

  // Search cross-references by topic
  const searchByTopic = async (topic: string) => {
    return await crossReferenceService.searchByTopic(topic);
  };

  return {
    crossRefs,
    isLoading,
    addCrossReference: addCrossReference.mutate,
    searchByTopic,
  };
}
