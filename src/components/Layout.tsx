import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Book, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
export function Header() {
  const {
    user,
    signOut
  } = useAuth();
  return <header className="bg-bible-darkblue text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-0">
        <div className="flex items-center gap-3 mx-px px-[2px]">
          <Book className="h-8 w-8 text-bible-gold" />
          <Link to="/" className="text-2xl font-serif font-bold">JR Study Bible</Link>
        </div>
        
        {user && <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-bible-gold">
              <Button variant="ghost" size="sm" className="text-white">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>}
      </div>
    </header>;
}
export function Footer() {
  return <footer className="bg-bible-darkblue text-white py-4 px-6 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} JR Study Bible. All rights reserved.</p>
      </div>
    </footer>;
}
export function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        {children}
      </main>
      <Footer />
    </div>;
}