import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Highlighter, MessageSquare, X } from 'lucide-react';
import { useVerseAnnotations } from '@/hooks/useVerseAnnotations';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', value: '#fef08a' },
  { name: 'green', value: '#bbf7d0' },
  { name: 'blue', value: '#bfdbfe' },
  { name: 'purple', value: '#e9d5ff' },
  { name: 'pink', value: '#fbcfe8' },
];

interface VerseAnnotationsProps {
  reference: string;
  isDarkTheme?: boolean;
}

export function VerseAnnotations({ reference, isDarkTheme = false }: VerseAnnotationsProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  const {
    annotations,
    addHighlight,
    addNote,
    toggleBookmark,
    deleteAnnotation,
  } = useVerseAnnotations(reference);

  const hasBookmark = annotations.some(a => a.type === 'bookmark');
  const notes = annotations.filter(a => a.type === 'note');
  const highlights = annotations.filter(a => a.type === 'highlight');

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote(noteText.trim());
      setNoteText('');
      setIsAddingNote(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Highlight Colors */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <div className="flex gap-2">
            {HIGHLIGHT_COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => addHighlight(color.value)}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color.value }}
                title={`Highlight ${color.name}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Notes */}
      <Popover open={isAddingNote} onOpenChange={setIsAddingNote}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            <MessageSquare className="h-4 w-4" />
            {notes.length > 0 && (
              <span className="ml-1 text-xs">{notes.length}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note.id} className="flex items-start gap-2">
                <p className="flex-1 text-sm">{note.note}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAnnotation(note.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="flex-1"
              />
              <Button onClick={handleAddNote} size="sm">
                Add
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Bookmark */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBookmark}
        className={`${
          hasBookmark ? 'text-yellow-500' : ''
        } ${isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    </div>
  );
}
