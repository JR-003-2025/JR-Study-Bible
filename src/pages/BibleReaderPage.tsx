
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BibleReader } from "@/components/BibleReader";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Book, 
  ChevronRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BibleApiProvider,
  getBibleApiProvider, 
  setBibleApiProvider,
  getProviderDisplayName
} from "@/services/bibleService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import "../styles/bible-reader.css";

const BibleReaderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "John 3:16";
  const [isImmersiveMode, setIsImmersiveMode] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiProvider, setApiProvider] = useState<BibleApiProvider>(getBibleApiProvider());

  const toggleImmersiveMode = () => {
    setIsImmersiveMode(!isImmersiveMode);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Apply dark mode to the body when dark theme is active
    if (!isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const handleProviderChange = (value: string) => {
    const provider = value as BibleApiProvider;
    setApiProvider(provider);
    setBibleApiProvider(provider);
  };

  // Set up theme class on mount and cleanup on unmount
  useEffect(() => {
    // Apply the initial theme class
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-mode');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-mode');
    };
  }, []);

  return (
    <Layout>
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-[80vh]",
          isDarkTheme ? "bg-bible-darkblue text-white" : "bg-white text-bible-darkblue",
          isImmersiveMode ? "px-0 -mx-6" : "mx-auto max-w-4xl"
        )}
      >
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isImmersiveMode ? "px-6 py-3 opacity-60 hover:opacity-100" : "mb-6"
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant={isDarkTheme ? "outline" : "ghost"} 
              size="sm" 
              onClick={() => navigate(-1)}
              className={cn(
                "transition-all",
                isDarkTheme ? "text-white border-white/20 hover:bg-white/10" : ""
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Book className={cn(
                "h-5 w-5 transition-colors", 
                isDarkTheme ? "text-bible-gold" : "text-bible-blue"
              )} />
              <h1 className={cn(
                "text-2xl font-serif font-bold transition-colors",
                isDarkTheme ? "text-white" : "text-bible-blue"
              )}>
                Bible Reader
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettings}
              title="Bible settings"
              className={cn(
                "transition-all",
                isDarkTheme ? "text-white hover:bg-white/10" : ""
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Settings</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleImmersiveMode}
              title={isImmersiveMode ? "Exit immersive mode" : "Enter immersive mode"}
              className={cn(
                "transition-all",
                isDarkTheme ? "text-white hover:bg-white/10" : "",
                isImmersiveMode ? "bg-bible-cream/50" : ""
              )}
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-all",
                isImmersiveMode ? "rotate-180" : ""
              )} />
              <span className="ml-1">{isImmersiveMode ? "Exit" : "Immersive"}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
              className={cn(
                "transition-all", 
                isDarkTheme ? "text-white hover:bg-white/10" : ""
              )}
            >
              {isDarkTheme ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {showSettings && (
          <div className={cn(
            "mb-4 p-4 rounded-md transition-all",
            isDarkTheme ? "bg-bible-navy text-white" : "bg-bible-cream/50"
          )}>
            <h3 className="text-sm font-medium mb-2">Bible API Provider</h3>
            <div className="flex items-center gap-2">
              <Select value={apiProvider} onValueChange={handleProviderChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api.bible">{getProviderDisplayName("api.bible")}</SelectItem>
                  <SelectItem value="bible-api.com">{getProviderDisplayName("bible-api.com")}</SelectItem>
                  <SelectItem value="youversion">{getProviderDisplayName("youversion")}</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs opacity-75">
                {apiProvider === "youversion" 
                  ? "May have CORS issues in some browsers" 
                  : apiProvider === "bible-api.com" 
                    ? "Simple and reliable alternative" 
                    : "Primary Bible API"}
              </span>
            </div>
          </div>
        )}
        
        <div className={cn(
          "transition-all duration-300",
          isImmersiveMode ? "px-4 md:px-8 lg:px-16 max-w-5xl mx-auto" : ""
        )}>
          <BibleReader 
            initialReference={reference} 
            isDarkTheme={isDarkTheme} 
            isImmersiveMode={isImmersiveMode} 
            key={apiProvider} // Force re-render when provider changes
          />
        </div>
      </div>
    </Layout>
  );
};

export default BibleReaderPage;
