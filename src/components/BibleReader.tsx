
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BibleVerse, fetchBiblePassage, getAvailableBooks, getAvailableChapters } from "@/services/bibleService";
import { ChevronLeft, ChevronRight, Bookmark, Book } from "lucide-react";
import { toast } from "sonner";

type BibleReaderProps = {
  initialReference?: string;
};

export function BibleReader({ initialReference = "John 3:16" }: BibleReaderProps) {
  const [reference, setReference] = useState<string>(initialReference);
  const [inputReference, setInputReference] = useState<string>(initialReference);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableBooks] = useState<string[]>(getAvailableBooks());
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const loadPassage = async (ref: string) => {
    setLoading(true);
    try {
      const response = await fetchBiblePassage(ref);
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
        setAvailableChapters(getAvailableChapters(firstVerse.book_name));
      }
    } catch (error) {
      console.error("Failed to load passage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference) {
      loadPassage(initialReference);
    }
  }, [initialReference]);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    const chapters = getAvailableChapters(book);
    setAvailableChapters(chapters);
    setSelectedChapter(chapters.length > 0 ? chapters[0] : null);
    
    if (chapters.length > 0) {
      const newRef = `${book} ${chapters[0]}`;
      setInputReference(newRef);
      loadPassage(newRef);
    }
  };

  const handleChapterChange = (chapter: string) => {
    const chapterNum = parseInt(chapter, 10);
    setSelectedChapter(chapterNum);
    const newRef = `${selectedBook} ${chapterNum}`;
    setInputReference(newRef);
    loadPassage(newRef);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPassage(inputReference);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
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
          <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
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

          <div>
            <h2 className="text-lg font-serif font-medium mb-4">
              {reference}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
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
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-500 w-7 pt-0.5 text-right mr-2">
                        {verse.verse}
                      </span>
                      <p className="flex-1">
                        {verse.text}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
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
