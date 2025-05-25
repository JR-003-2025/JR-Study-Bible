import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { BibleReference } from '@/hooks/useBibleReference';

type ReferenceFormValues = {
  book: string;
  chapter: string;
  verse: string;
};

type ReferenceSelectorProps = {
  reference: BibleReference;
  availableBooks: string[];
  availableChapters: string[];
  onReferenceChange: (ref: Partial<BibleReference>) => void;
};

export function ReferenceSelector({
  reference,
  availableBooks,
  availableChapters,
  onReferenceChange,
}: ReferenceSelectorProps) {
  const form = useForm<ReferenceFormValues>({
    defaultValues: {
      book: reference.book,
      chapter: reference.chapter,
      verse: reference.verse || '',
    },
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <Form {...form}>
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="book"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      onReferenceChange({ book: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select book" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.map((book) => (
                        <SelectItem key={book} value={book}>
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chapter"
              render={({ field }) => (
                <FormItem className="w-24">
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      onReferenceChange({ chapter: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ch." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChapters.map((chapter) => (
                        <SelectItem key={chapter} value={chapter}>
                          {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
