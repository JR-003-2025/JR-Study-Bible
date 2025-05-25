import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useBibleSearch } from '@/hooks/useBibleSearch';
import { SearchResults } from './SearchResults';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (reference: string) => void;
  version: string;
  isDarkTheme?: boolean;
}

export function SearchDialog({
  isOpen,
  onClose,
  onSelectReference,
  version,
  isDarkTheme = false
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [], isLoading } = useBibleSearch(searchQuery, version);

  const handleReferenceSelect = (reference: string) => {
    onSelectReference(reference);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl ${isDarkTheme ? 'bg-gray-900 text-white' : ''}`}>
        <DialogHeader>
          <DialogTitle>Search Bible</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isDarkTheme ? 'bg-gray-800 text-white' : ''}
          />
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            searchQuery.length >= 3 && (
              <SearchResults
                results={searchResults}
                onSelectReference={handleReferenceSelect}
                isDarkTheme={isDarkTheme}
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
