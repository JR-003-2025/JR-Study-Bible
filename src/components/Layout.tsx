
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Book, LogOut, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function Header() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  return (
    <header className="bg-bible-darkblue text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-0 gap-3">
        <div className="flex items-center gap-3 mx-px px-[2px]">
          <div className="bg-white/10 p-2 rounded-full">
            <Book className="h-6 w-6 text-bible-gold" />
          </div>
          <Link to="/" className="text-2xl font-serif font-bold">Divine Insight</Link>
        </div>
        
        <div className="flex items-center md:hidden">
          <Collapsible open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <span className="sr-only">Menu</span>
                <ChevronDown className={`h-6 w-6 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-col space-y-2">
                <Link to="/bible" className="text-white hover:text-bible-gold">
                  <Button variant="ghost" size="sm" className="text-white w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Bible
                  </Button>
                </Link>
                
                {user && (
                  <>
                    <Link to="/dashboard" className="text-white hover:text-bible-gold">
                      <Button variant="ghost" size="sm" className="text-white w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <User className="h-4 w-4 text-bible-gold" />
                      <span className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={signOut} className="text-white hover:bg-white/10 w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-center md:justify-end">
          <Link to="/bible" className="text-white hover:text-bible-gold">
            <Button variant="ghost" size="sm" className="text-white">
              <Book className="h-4 w-4 mr-2" />
              Bible
            </Button>
          </Link>
          
          {user && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Link to="/dashboard" className="text-white hover:text-bible-gold">
                <Button variant="ghost" size="sm" className="text-white">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 text-bible-gold" />
                <span className="text-sm font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-white hover:bg-white/10">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-bible-darkblue text-white py-4 px-6 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Divine Insight. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
