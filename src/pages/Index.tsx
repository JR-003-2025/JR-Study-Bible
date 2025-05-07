
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { AuthTabs } from "@/components/AuthForms";
import { BibleToolsTabs } from "@/components/BibleTools";
import { 
  Book, 
  Search, 
  HelpCircle, 
  FileText, 
  ChevronDown,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Enhanced Tool Card component with hover effects and animations
const ToolCard = ({ 
  title, 
  description,
  actionText,
  icon: Icon,
  onClick,
  color = "bg-blue-50"
}: { 
  title: string;
  description: string;
  actionText: string;
  icon: any;
  onClick: () => void;
  color?: string;
}) => {
  return (
    <div 
      className={`tool-card cursor-pointer rounded-xl ${color} transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] border border-gray-100`}
      onClick={onClick}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-serif font-bold text-bible-blue">{title}</h3>
          <div className="p-3 rounded-full bg-white/60 shadow-sm">
            <Icon className="w-6 h-6 text-bible-blue" />
          </div>
        </div>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        <div className="mt-auto">
          <span className="text-sm font-medium text-bible-blue flex items-center">
            {actionText}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show auth forms if not logged in
  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center my-10">
          <div className="max-w-4xl text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-serif font-bold mb-5 text-bible-blue bg-gradient-to-r from-bible-blue to-blue-600 bg-clip-text text-transparent">
              JR Study Bible
            </h1>
            <p className="text-2xl mb-8 font-medium">
              Your advanced theological research companion.
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access AI-powered Bible studies, generate exegesis, ask theological questions,
              create sermons, and search the Bible with expert insights.
            </p>
          </div>
          
          <div className="w-full max-w-md animate-fade-in">
            <AuthTabs />
          </div>
        </div>
      </Layout>
    );
  }

  // If user is logged in, show dashboard
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            {user.user_metadata?.full_name && (
              <div className="flex items-center mb-3">
                <div className="bg-bible-cream p-2 rounded-full">
                  <User className="h-5 w-5 text-bible-blue" />
                </div>
                <p className="ml-2 text-lg text-gray-600">
                  Welcome back, <span className="font-medium">{user.user_metadata.full_name}</span>
                </p>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-serif font-bold text-bible-blue mb-3 bg-gradient-to-r from-bible-blue to-blue-700 bg-clip-text text-transparent">
            Welcome to JR Study Bible
          </h1>
          <p className="text-gray-600">
            Choose a tool below or continue with your recent work.
          </p>
        </div>

        {activeTool ? (
          <div className="mb-8 animate-fade-in">
            <button
              onClick={() => setActiveTool(null)}
              className="mb-6 text-sm flex items-center text-bible-blue hover:underline"
            >
              ← Back to tools
            </button>
            <div className="glassmorphism rounded-xl p-6 shadow-md border border-gray-200/50">
              <BibleToolsTabs />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in">
            <ToolCard
              title="Exegesis"
              description="Deep dive into scripture with word-by-word analysis and historical context."
              actionText="Explore Scripture Deeply"
              icon={Book}
              onClick={() => setActiveTool("exegesis")}
              color="bg-blue-50"
            />
            <ToolCard
              title="Bible Q&A"
              description="Get theological answers to your Bible questions with scripture references."
              actionText="Get Instant Answers"
              icon={HelpCircle}
              onClick={() => setActiveTool("qa")}
              color="bg-amber-50"
            />
            <ToolCard
              title="Sermon Generator"
              description="Create sermon outlines with biblical foundations and key points."
              actionText="Draft Your Next Sermon"
              icon={FileText}
              onClick={() => setActiveTool("sermon")}
              color="bg-emerald-50"
            />
            <ToolCard
              title="Bible Search"
              description="Find relevant passages by keyword with theological insights."
              actionText="Search Scriptures"
              icon={Search}
              onClick={() => setActiveTool("search")}
              color="bg-indigo-50"
            />
          </div>
        )}

        <Collapsible
          open={isAboutOpen}
          onOpenChange={setIsAboutOpen}
          className="animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-xl text-bible-blue">About JR Study Bible</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isAboutOpen ? "Hide Details" : "Learn More"}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Card className="bg-bible-cream border-bible-gold/30">
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p>
                    JR Study Bible uses advanced AI technology to help pastors, theology students, and anyone studying the Bible gain deeper insights into scripture. Our tools provide rich contextual information, theological analysis, and practical applications.
                  </p>
                  <p className="mt-2">
                    Powered by the Groq LLM API, JR Study Bible delivers fast, accurate theological content to support your Bible study, sermon preparation, and spiritual growth.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Layout>
  );
};

export default Index;
