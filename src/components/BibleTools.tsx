import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BibleRequestParams, BibleResponse, handleBibleRequest } from "@/services/groqService";
import { Loader2 } from "lucide-react";
import { ResponseActions } from "./ResponseActions";

// Exegesis Tool Component
export function ExegesisTool() {
  const [passage, setPassage] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;

    setIsLoading(true);
    setResult("");

    try {
      const params: BibleRequestParams = {
        task: "exegesis",
        content: passage,
      };

      const response = await handleBibleRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response.text);
    } catch (error) {
      console.error("Error generating exegesis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="passage" className="block text-sm font-medium mb-1">
            Bible Passage
          </label>
          <Input
            id="passage"
            placeholder="Enter a Bible passage (e.g., John 3:16-21)"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isLoading || !passage.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Exegesis"
          )}
        </Button>
      </form>

      {result && (
        <div className="mt-6 bg-white rounded-lg border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold font-serif mb-3 text-bible-blue">Exegesis Result</h3>
          <div className="prose prose-sm max-w-none">
            {result.split("\n").map((paragraph, idx) => {
              // Check if it's a heading
              if (/^#+\s/.test(paragraph)) {
                const level = paragraph.match(/^(#+)/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s/, "");
                const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
                return <HeadingTag key={idx} className="font-serif font-bold mt-4 mb-2">{text}</HeadingTag>;
              }
              
              // Check if it's a scripture reference
              if (paragraph.match(/^[1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?/)) {
                return <p key={idx} className="scripture-reference my-2">{paragraph}</p>;
              }
              
              // Check if paragraph mentions KJV or ESV
              if (paragraph.includes("KJV") || paragraph.includes("ESV")) {
                return <div key={idx} className="scripture-block">{paragraph}</div>;
              }
              
              // Regular paragraph
              return paragraph.trim() ? <p key={idx} className="my-2">{paragraph}</p> : <br key={idx} />;
            })}
          </div>
          
          <ResponseActions 
            content={result} 
            type="exegesis" 
            passage={passage}
          />
        </div>
      )}
    </div>
  );
}

// Bible Q&A Tool Component
export function BibleQATool() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer("");

    try {
      const params: BibleRequestParams = {
        task: "qa",
        content: question,
      };

      const response = await handleBibleRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }

      setAnswer(response.text);
    } catch (error) {
      console.error("Error generating answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium mb-1">
            Your Question
          </label>
          <Textarea
            id="question"
            placeholder="Ask any Bible-related question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full min-h-[100px]"
          />
        </div>
        <Button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Get Answer"
          )}
        </Button>
      </form>

      {answer && (
        <div className="mt-6 bg-white rounded-lg border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold font-serif mb-3 text-bible-blue">Answer</h3>
          <div className="prose prose-sm max-w-none">
            {answer.split("\n").map((paragraph, idx) => {
              // Check if it's a scripture reference pattern
              if (paragraph.match(/^[1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?/)) {
                return <p key={idx} className="scripture-reference my-2">{paragraph}</p>;
              }
              
              // Regular paragraph
              return paragraph.trim() ? <p key={idx} className="my-2">{paragraph}</p> : <br key={idx} />;
            })}
          </div>
          
          <ResponseActions 
            content={answer} 
            type="qa" 
          />
        </div>
      )}
    </div>
  );
}

// Sermon Generator Tool Component
export function SermonTool() {
  const [topic, setTopic] = useState("");
  const [sermon, setSermon] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setSermon("");

    try {
      const params: BibleRequestParams = {
        task: "sermon",
        content: topic,
      };

      const response = await handleBibleRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }

      setSermon(response.text);
    } catch (error) {
      console.error("Error generating sermon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Sermon Topic or Theme
          </label>
          <Input
            id="topic"
            placeholder="Enter a topic (e.g., Faith, Forgiveness, Love)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isLoading || !topic.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Sermon...
            </>
          ) : (
            "Generate Sermon"
          )}
        </Button>
      </form>

      {sermon && (
        <div className="mt-6 bg-white rounded-lg border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold font-serif mb-3 text-bible-blue">Sermon Outline</h3>
          <div className="prose prose-sm max-w-none">
            {sermon.split("\n").map((paragraph, idx) => {
              // Check if it's a heading
              if (/^#+\s/.test(paragraph)) {
                const level = paragraph.match(/^(#+)/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s/, "");
                const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
                return <HeadingTag key={idx} className="font-serif font-bold mt-4 mb-2">{text}</HeadingTag>;
              }
              
              // Check if it's a scripture reference
              if (paragraph.match(/^[1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?/)) {
                return <p key={idx} className="scripture-reference my-2">{paragraph}</p>;
              }
              
              // Regular paragraph
              return paragraph.trim() ? <p key={idx} className="my-2">{paragraph}</p> : <br key={idx} />;
            })}
          </div>
          
          <ResponseActions 
            content={sermon} 
            type="sermon" 
          />
        </div>
      )}
    </div>
  );
}

// Bible Search Tool Component
export function BibleSearchTool() {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setSearchResults("");

    try {
      const params: BibleRequestParams = {
        task: "search",
        content: keyword,
      };

      const response = await handleBibleRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }

      setSearchResults(response.text);
    } catch (error) {
      console.error("Error searching Bible:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium mb-1">
            Search Keyword or Theme
          </label>
          <Input
            id="keyword"
            placeholder="Enter a keyword (e.g., love, mercy, justice)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isLoading || !keyword.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search Bible"
          )}
        </Button>
      </form>

      {searchResults && (
        <div className="mt-6 bg-white rounded-lg border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold font-serif mb-3 text-bible-blue">Search Results</h3>
          <div className="prose prose-sm max-w-none">
            {searchResults.split("\n").map((paragraph, idx) => {
              // Check if it's a heading or reference
              if (/^#+\s/.test(paragraph)) {
                const level = paragraph.match(/^(#+)/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s/, "");
                const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
                return <HeadingTag key={idx} className="font-serif font-bold mt-4 mb-2">{text}</HeadingTag>;
              }
              
              // Check if it's a scripture reference
              if (paragraph.match(/^[1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?/)) {
                return <p key={idx} className="scripture-reference my-2 font-medium">{paragraph}</p>;
              }
              
              // Regular paragraph
              return paragraph.trim() ? <p key={idx} className="my-2">{paragraph}</p> : <br key={idx} />;
            })}
          </div>
          
          <ResponseActions 
            content={searchResults} 
            type="search" 
          />
        </div>
      )}
    </div>
  );
}

// Bible Tools Tabs Component
export function BibleToolsTabs() {
  return (
    <Tabs defaultValue="exegesis" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="exegesis">Exegesis</TabsTrigger>
        <TabsTrigger value="qa">Bible Q&A</TabsTrigger>
        <TabsTrigger value="sermon">Sermon</TabsTrigger>
        <TabsTrigger value="search">Bible Search</TabsTrigger>
      </TabsList>
      <TabsContent value="exegesis" className="mt-6">
        <ExegesisTool />
      </TabsContent>
      <TabsContent value="qa" className="mt-6">
        <BibleQATool />
      </TabsContent>
      <TabsContent value="sermon" className="mt-6">
        <SermonTool />
      </TabsContent>
      <TabsContent value="search" className="mt-6">
        <BibleSearchTool />
      </TabsContent>
    </Tabs>
  );
}

// Tool Card Component
export function ToolCard({ 
  title, 
  description, 
  icon: Icon,
  onClick
}: { 
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <Card className="tool-card cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">{title}</CardTitle>
          <Icon className="w-5 h-5 text-bible-blue" />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
