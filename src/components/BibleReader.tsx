
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BibleVerse, 
  fetchBiblePassage, 
  getAvailableBooks, 
  getAvailableChapters,
  getAvailableVersions,
  BibleVersion
} from "@/services/bibleService";
import { DEFAULT_BIBLE_VERSION } from "@/services/apiBibleService";
import { ChevronLeft, ChevronRight, Bookmark, Book, Loader2 } from "lucide-react";
import { toast } from "sonner";

type BibleReaderProps = {
  initialReference?: string;
};

export function BibleReader({ initialReference = "John 3:16" }: BibleReaderProps) {
  const [reference, setReference] = useState<string>(initialReference);
  const [inputReference, setInputReference] = useState<string>(initialReference);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(DEFAULT_BIBLE_VERSION);

  // Load available Bible versions
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const versions = await getAvailableVersions();
        setBibleVersions(versions);
      } catch (error) {
        console.error("Failed to load Bible versions:", error);
      }
    };
    
    loadVersions();
  }, []);

  // Load available books when version changes
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await getAvailableBooks(selectedVersion);
        setAvailableBooks(books);
      } catch (error) {
        console.error("Failed to load books:", error);
      }
    };
    
    if (selectedVersion) {
      loadBooks();
    }
  }, [selectedVersion]);

  const loadPassage = async (ref: string) => {
    setLoading(true);
    try {
      const response = await fetchBiblePassage(ref, selectedVersion);
      if (response.error) {
        toast.error("Error loading passage", { description: response.error });
        return;
      }
      
      setVerses(response.passage);
      setReference(response.reference);
      
      // Update book and chapter selectors
      if (response.passage.length > 0) {
        const firstVerse = response.passage[0];
        setSelectedBook(firstVerse.book_name);
        setSelectedChapter(firstVerse.chapter);
        
        // Load available chapters for this book
        const chapters = await getAvailableChapters(firstVerse.book_name, selectedVersion);
        setAvailableChapters(chapters);
      }
    } catch (error) {
      console.error("Failed to load passage:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference) {
      loadPassage(initialReference);
    }
  }, [initialReference, selectedVersion]);

  const handleBookChange = async (book: string) => {
    setSelectedBook(book);
    setLoading(true);
    
    try {
      const chapters = await getAvailableChapters(book, selectedVersion);
      setAvailableChapters(chapters);
      
      if (chapters.length > 0) {
        setSelectedChapter(chapters[0]);
        const newRef = `${book} ${chapters[0]}`;
        setInputReference(newRef);
        loadPassage(newRef);
      }
    } catch (error) {
      console.error("Failed to load chapters:", error);
      setLoading(false);
    }
  };

  const handleChapterChange = (chapter: string) => {
    const chapterNum = parseInt(chapter, 10);
    setSelectedChapter(chapterNum);
    const newRef = `${selectedBook} ${chapterNum}`;
    setInputReference(newRef);
    loadPassage(newRef);
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    // This will trigger the useEffect that reloads the passage with the new version
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPassage(inputReference);
  };

  const navigateChapter = async (direction: 'prev' | 'next') => {
    if (!selectedBook || !selectedChapter || availableChapters.length === 0) return;
    
    const currentIndex = availableChapters.indexOf(selectedChapter);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : availableChapters.length - 1;
    } else {
      newIndex = currentIndex < availableChapters.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newChapter = availableChapters[newIndex];
    const newRef = `${selectedBook} ${newChapter}`;
    setInputReference(newRef);
    loadPassage(newRef);
  };

  const handleSaveHighlight = (verseId: number) => {
    // In a real app, this would save the highlighted verse to Supabase
    toast.success("Verse highlighted", {
      description: "This will be saved in your highlights"
    });
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-bible-blue" />
          <p>Loading Bible data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-serif">Bible Reader</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateChapter('prev')}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Chapter</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateChapter('next')}
                disabled={loading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Chapter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select 
              value={selectedVersion} 
              onValueChange={handleVersionChange}
            >
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select Bible Version" />
              </SelectTrigger>
              <SelectContent>
                {bibleVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} ({version.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <form onSubmit={handleSearchSubmit} className="flex gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                <Select 
                  value={selectedBook} 
                  onValueChange={handleBookChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Book" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedChapter?.toString() || ""} 
                  onValueChange={handleChapterChange}
                  disabled={!selectedBook || availableChapters.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChapters.map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Reference (e.g., John 3:16)"
                    value={inputReference}
                    onChange={(e) => setInputReference(e.target.value)}
                  />
                  <Button type="submit" disabled={loading}>
                    Go
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-serif font-medium mb-4">
              {reference}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-bible-blue" />
              </div>
            ) : verses.length === 0 ? (
              <div className="text-center py-8">
                <Book className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No verses found. Try a different reference.</p>
              </div>
            ) : (
              <div className="space-y-2 bible-text">
                {verses.map((verse) => (
                  <div key={`${verse.chapter}-${verse.verse}`} className="group flex">
                    <div className="flex items-start w-full">
                      <span className="text-sm font-medium text-gray-500 w-7 pt-0.5 text-right mr-2 flex-shrink-0">
                        {verse.verse}
                      </span>
                      <p className="flex-1">
                        {verse.text}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                        onClick={() => handleSaveHighlight(verse.verse)}
                      >
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">Highlight verse</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
