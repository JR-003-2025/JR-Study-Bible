
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { AuthTabs } from "@/components/AuthForms";
import { BibleToolsTabs, ToolCard } from "@/components/BibleTools";
import { Book, Search, HelpCircle, FileText } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);

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
          <div className="max-w-4xl text-center mb-12">
            <h1 className="text-4xl font-serif font-bold mb-4 text-bible-blue">
              JR Study Bible
            </h1>
            <p className="text-xl mb-6">
              Your advanced theological research companion.
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access AI-powered Bible studies, generate exegesis, ask theological questions,
              create sermons, and search the Bible with expert insights.
            </p>
          </div>
          
          <div className="w-full max-w-md">
            <AuthTabs />
          </div>
        </div>
      </Layout>
    );
  }

  // If user is logged in, show dashboard
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-bible-blue mb-2">
            Welcome to JR Study Bible
          </h1>
          <p className="text-gray-600">
            Choose a tool below or continue with your recent work.
          </p>
        </div>

        {activeTool ? (
          <div className="mb-8">
            <button
              onClick={() => setActiveTool(null)}
              className="mb-6 text-sm flex items-center text-bible-blue hover:underline"
            >
              ← Back to tools
            </button>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <BibleToolsTabs />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ToolCard
              title="Exegesis"
              description="Deep dive into scripture with word-by-word analysis and historical context."
              icon={Book}
              onClick={() => setActiveTool("exegesis")}
            />
            <ToolCard
              title="Bible Q&A"
              description="Get theological answers to your Bible questions with scripture references."
              icon={HelpCircle}
              onClick={() => setActiveTool("qa")}
            />
            <ToolCard
              title="Sermon Generator"
              description="Create sermon outlines with biblical foundations and key points."
              icon={FileText}
              onClick={() => setActiveTool("sermon")}
            />
            <ToolCard
              title="Bible Search"
              description="Find relevant passages by keyword with theological insights."
              icon={Search}
              onClick={() => setActiveTool("search")}
            />
          </div>
        )}

        <div className="bg-bible-cream rounded-lg p-6 border border-bible-gold/30">
          <h2 className="font-serif font-bold text-xl mb-4 text-bible-blue">About JR Study Bible</h2>
          <div className="prose prose-sm max-w-none">
            <p>
              JR Study Bible uses advanced AI technology to help pastors, theology students, and anyone studying the Bible gain deeper insights into scripture. Our tools provide rich contextual information, theological analysis, and practical applications.
            </p>
            <p className="mt-2">
              Powered by the Groq LLM API, JR Study Bible delivers fast, accurate theological content to support your Bible study, sermon preparation, and spiritual growth.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
