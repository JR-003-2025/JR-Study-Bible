
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  BibleVerse, 
  fetchBiblePassage, 
  getAvailableBooks, 
  getAvailableChapters,
  getAvailableVersions,
  BibleVersion
} from "@/services/bibleService";
import { DEFAULT_BIBLE_VERSION } from "@/services/wldehBibleService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Book, 
  Loader2,
  Search,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type BibleReaderProps = {
  initialReference?: string;
  isDarkTheme?: boolean;
  isImmersiveMode?: boolean;
};

export function BibleReader({ 
  initialReference = "John 3:16", 
  isDarkTheme = false,
  isImmersiveMode = false
}: BibleReaderProps) {
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
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(true);

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
      <div className="flex justify-center items-center py-20 animate-fade-in">
        <div className="text-center">
          <Loader2 className={cn(
            "h-10 w-10 animate-spin mx-auto mb-4", 
            isDarkTheme ? "text-bible-gold" : "text-bible-blue"
          )} />
          <p className={cn("text-lg font-serif", isDarkTheme ? "text-white/80" : "text-gray-600")}>Loading Bible data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-4 transition-all duration-300",
      isImmersiveMode ? "immersive-mode" : "",
      "bible-reader-controls"
    )}>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border",
        isDarkTheme 
          ? "bg-bible-darkblue/95 border-white/10 text-white shadow-lg" 
          : "bg-white"
      )}>
        <CardHeader className={cn(
          "py-4 px-6 bible-navigation",
          isDarkTheme ? "glassmorphism-dark" : "glassmorphism",
          isControlsOpen ? "border-b" : ""
        )}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className={cn(
                "text-xl font-serif font-medium transition-all",
                isDarkTheme ? "text-white" : "text-bible-blue",
                isImmersiveMode ? "text-2xl" : ""
              )}>
                {reference}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={isDarkTheme ? "outline" : "ghost"} 
                      size="sm" 
                      onClick={() => navigateChapter('prev')}
                      disabled={loading}
                      className={cn(
                        isDarkTheme ? "border-white/20 hover:bg-white/10 text-white" : "",
                        "transition-transform hover:scale-105"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Chapter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous Chapter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant={isDarkTheme ? "outline" : "ghost"} 
                    size="sm" 
                    className={cn(
                      isDarkTheme ? "border-white/20 hover:bg-white/10 text-white" : "",
                      "transition-transform hover:scale-105"
                    )}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isControlsOpen ? "" : "-rotate-180"
                    )} />
                    <span className="sr-only">Toggle Controls</span>
                  </Button>
                </CollapsibleTrigger>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isDarkTheme ? "outline" : "ghost"} 
                        size="sm" 
                        onClick={() => navigateChapter('next')}
                        disabled={loading}
                        className={cn(
                          isDarkTheme ? "border-white/20 hover:bg-white/10 text-white" : "",
                          "transition-transform hover:scale-105"
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Chapter</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Next Chapter</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Collapsible>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className={cn(
            "py-6 px-6 transition-all",
            isDarkTheme ? "bg-bible-darkblue/80" : "bg-white"
          )}>
            <div className="mb-6 space-y-4">
              <Select 
                value={selectedVersion} 
                onValueChange={handleVersionChange}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
                )}>
                  <SelectValue placeholder="Select Bible Version" />
                </SelectTrigger>
                <SelectContent className={cn(
                  isDarkTheme ? "bg-bible-darkblue border-white/10 text-white" : ""
                )}>
                  {bibleVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name} ({version.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <Select 
                    value={selectedBook} 
                    onValueChange={handleBookChange}
                  >
                    <SelectTrigger className={cn(
                      isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
                    )}>
                      <SelectValue placeholder="Select Book" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      isDarkTheme ? "bg-bible-darkblue border-white/10 text-white" : ""
                    )}>
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
                    <SelectTrigger className={cn(
                      isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
                    )}>
                      <SelectValue placeholder="Chapter" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      "max-h-[200px]",
                      isDarkTheme ? "bg-bible-darkblue border-white/10 text-white" : ""
                    )}>
                      {availableChapters.map((chapter) => (
                        <SelectItem key={chapter} value={chapter.toString()}>
                          {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                        isDarkTheme ? "text-white/50" : "text-gray-400"
                      )} />
                      <Input
                        placeholder="Reference (e.g., John 3:16)"
                        value={inputReference}
                        onChange={(e) => setInputReference(e.target.value)}
                        className={cn(
                          "pl-10",
                          isDarkTheme ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : ""
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      variant={isDarkTheme ? "outline" : "default"}
                      className={cn(
                        isDarkTheme ? "border-white/20 hover:bg-white/10 text-white" : ""
                      )}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </CollapsibleContent>

        <CardContent className={cn(
          "bible-text-container transition-all",
          isDarkTheme ? "bg-bible-darkblue/90" : "",
          !isControlsOpen ? "pt-0" : ""
        )}>
          {loading ? (
            <div className="flex justify-center py-12 animate-pulse">
              <Loader2 className={cn(
                "h-8 w-8 animate-spin",
                isDarkTheme ? "text-white/70" : "text-bible-blue/70"
              )} />
            </div>
          ) : verses.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <Book className={cn(
                "mx-auto h-16 w-16 mb-4", 
                isDarkTheme ? "text-white/30" : "text-gray-300"
              )} />
              <p className={cn(
                "mt-2 text-lg font-serif",
                isDarkTheme ? "text-white/70" : "text-gray-500"
              )}>
                No verses found. Try a different reference.
              </p>
            </div>
          ) : (
            <div className={cn(
              "space-y-2 bible-reader-content",
              isDarkTheme ? "text-white/90" : ""
            )}>
              {verses.map((verse, index) => (
                <div 
                  key={`${verse.chapter}-${verse.verse}`} 
                  className={cn(
                    "group bible-verse px-2 animate-fade-in",
                    { "animate-slide-up": !isImmersiveMode },
                    isDarkTheme ? "bible-verse-dark" : "",
                    isImmersiveMode ? "text-lg" : ""
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className={cn(
                    "verse-num",
                    isDarkTheme ? "text-white/50" : "text-gray-500"
                  )}>
                    {verse.verse}
                  </span>
                  <p className="verse-text">
                    {verse.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "verse-highlight-btn ml-2 flex-shrink-0",
                      isDarkTheme ? "hover:bg-white/10 text-white/70" : ""
                    )}
                    onClick={() => handleSaveHighlight(verse.verse)}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="sr-only">Highlight verse</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
