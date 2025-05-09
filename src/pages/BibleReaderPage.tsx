
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
  ChevronDown,
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const BibleReaderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "John 3:16";
  const [isImmersiveMode, setIsImmersiveMode] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

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
        
        <div className={cn(
          "transition-all duration-300",
          isImmersiveMode ? "px-4 md:px-8 lg:px-16 max-w-5xl mx-auto" : ""
        )}>
          <BibleReader 
            initialReference={reference} 
            isDarkTheme={isDarkTheme} 
            isImmersiveMode={isImmersiveMode} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default BibleReaderPage;
