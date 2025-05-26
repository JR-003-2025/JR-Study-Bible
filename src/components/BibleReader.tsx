import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Loader2, 
  AlertCircle, 
  Book, 
  Bookmark, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight, 
  ArrowRight,
  TextCursor,
  Search,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  getDefaultVersionId, 
  getAvailableVersions, 
  getAvailableBooks,
  getAvailableChapters,
  fetchBiblePassage 
} from "@/services/bibleService";
import { Skeleton } from "@/components/ui/skeleton";
import { BibleVersion, BiblePassageVerse } from "@/services/types";

interface ReferenceFormValues {
  book: string;
  chapter: string;
  verse: string;
}

type BibleReaderProps = {
  initialReference?: string;
  isDarkTheme?: boolean;
  isImmersiveMode?: boolean;
  showSettings?: boolean;
};

export function BibleReader({ 
  initialReference = "Genesis 1:1",
  isDarkTheme = false,
  isImmersiveMode = false,
  showSettings = true
}: BibleReaderProps) {
  // Base state
  const [selectedVersion, setSelectedVersion] = useState(getDefaultVersionId());
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [effectiveShowSettings, setInternalShowSettings] = useState(showSettings);
  const [reference, setReference] = useState<string>(initialReference);
  const [inputReference, setInputReference] = useState<string>(initialReference);

  // State for last viewed passage
  const [lastViewedPassage, setLastViewedPassage] = useState<string | null>(null);

  // Data state
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [verses, setVerses] = useState<BiblePassageVerse[]>([]);
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);

  // Form handling
  const form = useForm<ReferenceFormValues>({
    defaultValues: {
      book: "",
      chapter: "",
      verse: ""
    }
  });

  // Handle Bible data loading errors
  useEffect(() => {
    if (loading) {
      setInitialLoading(true);
    } else {
      setInitialLoading(false);
    }
  }, [loading]);

  // Load available Bible versions
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const versions = await getAvailableVersions();
        setBibleVersions(versions);
      } catch (error) {
        console.error("Failed to load Bible versions:", error);
        toast.error("Failed to load Bible versions", { 
          description: "Using default versions instead"
        });
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
        toast.error("Failed to load Bible books", {
          description: "Please try a different Bible version"
        });
      }
    };
    
    if (selectedVersion) {
      loadBooks();
    }
  }, [selectedVersion]);

  // Load initial passage and handle last viewed passage
  useEffect(() => {
    // Try to get last viewed passage from localStorage
    const lastPassage = localStorage.getItem('lastViewedPassage');
    setLastViewedPassage(lastPassage);

    if (initialReference) {
      // Parse initial reference to set book and chapter
      const parts = initialReference.split(' ');
      if (parts.length >= 2) {
        const [book, chapterVerse] = parts;
        const chapter = chapterVerse.split(':')[0];
        setSelectedBook(book);
        setSelectedChapter(parseInt(chapter, 10));
      }
      loadPassage(initialReference);
    } else if (lastPassage) {
      // Show a toast notification when restoring last viewed passage
      toast.info("Restored last viewed passage", {
        description: `Returning to ${lastPassage}`,
        duration: 3000
      });

      const parts = lastPassage.split(' ');
      if (parts.length >= 2) {
        const [book, chapterVerse] = parts;
        const chapter = chapterVerse.split(':')[0];
        setSelectedBook(book);
        setSelectedChapter(parseInt(chapter, 10));
      }
      loadPassage(lastPassage);
    }
  }, [initialReference, selectedVersion]);

  // Save reference to localStorage when it changes
  useEffect(() => {
    if (reference && reference !== 'Genesis 1:1') {
      localStorage.setItem('lastViewedPassage', reference);
      setLastViewedPassage(reference);
    }
  }, [reference]);

  // Load passage with loading state
  const loadPassage = async (ref: string) => {
    setLoading(true);
    setLoadError("");

    try {
      // Add a subtle delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetchBiblePassage(ref, selectedVersion);
      
      if (response.error) {
        setLoadError(response.error);
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
        try {
          const chapters = await getAvailableChapters(firstVerse.book_name, selectedVersion);
          setAvailableChapters(chapters);
        } catch (chapterError) {
          console.error("Failed to load chapters:", chapterError);
        }
      }

      // Update last viewed passage
      if (response.reference) {
        localStorage.setItem('lastViewedPassage', response.reference);
        setLastViewedPassage(response.reference);
      }
    } catch (error) {
      console.error("Failed to load passage:", error);
      setLoadError(error instanceof Error ? error.message : "Unknown error occurred");
      toast.error("Error loading passage", {
        description: error instanceof Error ? error.message : "Failed to load passage"
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleBookChange = async (book: string) => {
    setSelectedBook(book);
    form.setValue("book", book);
    setLoading(true);
    
    try {
      const chapters = await getAvailableChapters(book, selectedVersion);
      setAvailableChapters(chapters);
      
      if (chapters.length > 0) {
        setSelectedChapter(chapters[0]);
        form.setValue("chapter", chapters[0].toString());
        const newRef = `${book} ${chapters[0]}`;
        setInputReference(newRef);
        loadPassage(newRef);
      }
    } catch (error) {
      console.error("Failed to load chapters:", error);
      toast.error("Failed to load chapters", {
        description: "Please try a different book"
      });
      setLoading(false);
    }
  };

  const handleChapterChange = async (chapter: string) => {
    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || !selectedBook) return;

    setSelectedChapter(chapterNum);
    form.setValue("chapter", chapter);
    
    const newRef = `${selectedBook} ${chapterNum}`;
    setInputReference(newRef);
    loadPassage(newRef);
  };

  const handleVerseChange = (verse: string) => {
    // Only allow numbers, hyphens, and commas
    const sanitizedVerse = verse.replace(/[^0-9\-]/g, '');
    setSelectedVerse(sanitizedVerse);
    form.setValue("verse", sanitizedVerse);
  };

  // Helper to validate verse input
  const validateVerseInput = (verse: string): boolean => {
    if (!verse.trim()) return true; // Empty input is valid
    
    // Single verse: "1" or "12"
    if (/^\d+$/.test(verse)) {
      const num = parseInt(verse, 10);
      return num > 0;
    }
    
    // Verse range: "1-5" or "12-15"
    if (/^\d+-\d+$/.test(verse)) {
      const [start, end] = verse.split('-').map(Number);
      return start > 0 && end > 0 && start < end;
    }
    
    return false;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPassage(inputReference);
  };
  
  // New handler for granular reference inputs form
  const handleGranularSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook || !selectedChapter) {
      toast.error("Please select both a book and chapter");
      return;
    }
    
    let referenceString = `${selectedBook} ${selectedChapter}`;
    if (selectedVerse && selectedVerse.trim()) {
      if (!validateVerseInput(selectedVerse)) {
        toast.error("Please enter a valid verse or range (e.g., '1' or '1-5')");
        return;
      }
      referenceString += `:${selectedVerse.trim()}`;
    }
    
    setInputReference(referenceString);
    loadPassage(referenceString);
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
    if (!newChapter) return;

    const newRef = `${selectedBook} ${newChapter}`;
    setInputReference(newRef);
    form.setValue("chapter", newChapter.toString());
    setSelectedVerse("");
    form.setValue("verse", "");
    loadPassage(newRef);
  };

  const handleSaveHighlight = (verseId: number) => {
    // In a real app, this would save the highlighted verse to Supabase
    toast.success("Verse highlighted", {
      description: "This will be saved in your highlights"
    });
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    // The version change effect will trigger a reload
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
        "overflow-hidden border",
        isDarkTheme 
          ? "bg-bible-darkblue/95 border-white/10 text-white shadow-lg" 
          : "bg-white"
      )}>
        {/* Navigation Bar */}
        <div className={cn(
          "sticky top-0 z-10 px-4 py-3 flex items-center justify-between",
          isDarkTheme ? "bg-bible-darkblue border-b border-white/10" : "bg-white border-b",
          "bible-navigation"
        )}>
          {/* Version Selector */}
          <Select 
            value={selectedVersion} 
            onValueChange={handleVersionChange}
          >
            <SelectTrigger className={cn(
              "w-48",
              isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
            )}>
              <SelectValue placeholder="Select Version" />
            </SelectTrigger>
            <SelectContent>
              {bibleVersions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.name} ({version.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reference Display */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg font-serif",
              isDarkTheme ? "text-white/90" : "text-gray-700"
            )}>
              {reference}
            </span>
          </div>

          {/* Controls Toggle */}
          <Button
            variant={isDarkTheme ? "ghost" : "outline"}
            size="sm"
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className={cn(
              "ml-2",
              isDarkTheme ? "hover:bg-white/10" : ""
            )}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Bible Controls */}
        <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen}>
          <CollapsibleContent>
            <div className={cn(
              "p-4 grid grid-cols-1 md:grid-cols-3 gap-4",
              isDarkTheme ? "bg-bible-darkblue/50" : "bg-gray-50"
            )}>
              {/* Book Selection */}
              <div>
                <label className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkTheme ? "text-white/90" : "text-gray-700"
                )}>
                  Book
                </label>
                <Select 
                  value={selectedBook} 
                  onValueChange={handleBookChange}
                >
                  <SelectTrigger className={cn(
                    isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
                  )}>
                    <Book className="h-4 w-4 mr-2 opacity-70" />
                    <SelectValue placeholder="Select Book" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {availableBooks.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkTheme ? "text-white/90" : "text-gray-700"
                )}>
                  Chapter
                </label>
                <Select 
                  value={selectedChapter?.toString() || ""} 
                  onValueChange={handleChapterChange}
                  disabled={!selectedBook}
                >
                  <SelectTrigger className={cn(
                    isDarkTheme ? "border-white/20 bg-white/5 text-white" : ""
                  )}>
                    <TextCursor className="h-4 w-4 mr-2 opacity-70" />
                    <SelectValue placeholder="Chapter" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {availableChapters.map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verse Input */}
              <div>
                <label className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkTheme ? "text-white/90" : "text-gray-700"
                )}>
                  Verse (optional)
                  <span className={cn(
                    "ml-2 text-xs",
                    isDarkTheme ? "text-white/50" : "text-gray-500"
                  )}>
                    e.g., 1 or 1-5
                  </span>
                </label>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          placeholder="Enter verse number"
                          value={selectedVerse}
                          onChange={(e) => setSelectedVerse(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGranularSearchSubmit(e);
                            }
                          }}
                          className={cn(
                            isDarkTheme ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : ""
                          )}
                          disabled={!selectedBook || !selectedChapter}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter a verse number (e.g., 1) or verse range (e.g., 1-5)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button 
                    type="button"
                    onClick={handleGranularSearchSubmit}
                    disabled={!selectedBook || !selectedChapter}
                    variant={isDarkTheme ? "outline" : "default"}
                    className={cn(
                      "whitespace-nowrap",
                      isDarkTheme ? "border-white/20 hover:bg-white/10" : ""
                    )}
                  >
                    Go
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bible Content */}
        <div className={cn(
          "p-4 min-h-[400px]",
          isDarkTheme ? "bg-bible-darkblue/90" : "bg-white",
          loading && "passage-loading"
        )}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <Loader2 className={cn(
                  "h-8 w-8 animate-spin mb-4",
                  isDarkTheme ? "text-white/70" : "text-bible-blue/70"
                )} />
                <p className={cn(
                  "text-lg font-serif loading-dots",
                  isDarkTheme ? "text-white/80" : "text-gray-600"
                )}>
                  Loading passage
                </p>
              </div>
            </div>
          ) : verses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {loadError ? (
                <>
                  <AlertCircle className={cn(
                    "h-12 w-12 mb-4",
                    isDarkTheme ? "text-red-400" : "text-red-500"
                  )} />
                  <p className={cn(
                    "text-lg text-center",
                    isDarkTheme ? "text-white/70" : "text-gray-700"
                  )}>
                    {loadError}
                  </p>
                </>
              ) : (
                <>
                  <Book className={cn(
                    "h-12 w-12 mb-4",
                    isDarkTheme ? "text-white/30" : "text-gray-300"
                  )} />
                  <p className={cn(
                    "text-lg text-center",
                    isDarkTheme ? "text-white/70" : "text-gray-700"
                  )}>
                    Select a book and chapter to begin reading
                  </p>
                </>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className={cn(
                "space-y-2 bible-reader-content",
                isDarkTheme ? "text-white/90" : ""
              )}>
                {verses.map((verse, index) => (
                  <div 
                    key={`${verse.chapter}-${verse.verse}`} 
                    className={cn(
                      "group flex items-start p-2 rounded-lg transition-all",
                      "hover:bg-gray-50 dark:hover:bg-white/5",
                      isDarkTheme ? "bible-verse-dark" : "",
                      isImmersiveMode ? "text-lg" : ""
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium mr-4 pt-1 w-8 text-right flex-shrink-0",
                      isDarkTheme ? "text-white/50" : "text-gray-400"
                    )}>
                      {verse.verse}
                    </span>
                    <p className="flex-1 leading-relaxed">{verse.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}
