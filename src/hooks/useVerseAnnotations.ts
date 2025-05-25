import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { annotationService, VerseAnnotation } from '@/services/annotationService';

export function useVerseAnnotations(reference: string) {
  const queryClient = useQueryClient();

  // Fetch annotations for the current reference
  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ['annotations', reference],
    queryFn: () => annotationService.getAnnotationsForReference(reference),
  });

  // Add annotation mutation
  const addAnnotation = useMutation({
    mutationFn: (annotation: Omit<VerseAnnotation, 'id' | 'timestamp'>) => 
      annotationService.addAnnotation(annotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', reference] });
    },
  });

  // Update annotation mutation
  const updateAnnotation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VerseAnnotation> }) =>
      annotationService.updateAnnotation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', reference] });
    },
  });

  // Delete annotation mutation
  const deleteAnnotation = useMutation({
    mutationFn: (id: string) => annotationService.deleteAnnotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', reference] });
    },
  });

  // Helper functions
  const addHighlight = useCallback((color: string) => {
    addAnnotation.mutate({
      reference,
      type: 'highlight',
      color,
    });
  }, [reference, addAnnotation]);

  const addNote = useCallback((note: string) => {
    addAnnotation.mutate({
      reference,
      type: 'note',
      note,
    });
  }, [reference, addAnnotation]);

  const toggleBookmark = useCallback(() => {
    const existingBookmark = annotations.find(a => a.type === 'bookmark');
    if (existingBookmark) {
      deleteAnnotation.mutate(existingBookmark.id);
    } else {
      addAnnotation.mutate({
        reference,
        type: 'bookmark',
      });
    }
  }, [reference, annotations, addAnnotation, deleteAnnotation]);

  return {
    annotations,
    isLoading,
    addHighlight,
    addNote,
    toggleBookmark,
    updateAnnotation: updateAnnotation.mutate,
    deleteAnnotation: deleteAnnotation.mutate,
  };
}
