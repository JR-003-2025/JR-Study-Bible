
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type ReadingEntry = {
  id: string;
  passage: string;
  description: string;
  day: number;
  completed: boolean;
};

// Mock reading plan data - in a real app, this would come from Supabase
const mockReadingPlan: ReadingEntry[] = [
  {
    id: "1",
    passage: "Genesis 1-3",
    description: "The Creation and Fall",
    day: 1,
    completed: true,
  },
  {
    id: "2",
    passage: "Exodus 20",
    description: "The Ten Commandments",
    day: 2,
    completed: true,
  },
  {
    id: "3",
    passage: "Psalm 23",
    description: "The Lord is My Shepherd",
    day: 3,
    completed: false,
  },
  {
    id: "4",
    passage: "Isaiah 53",
    description: "The Suffering Servant",
    day: 4,
    completed: false,
  },
  {
    id: "5",
    passage: "Matthew 5-7",
    description: "The Sermon on the Mount",
    day: 5,
    completed: false,
  },
  {
    id: "6",
    passage: "John 3",
    description: "Born Again and God's Love",
    day: 6,
    completed: false,
  },
  {
    id: "7",
    passage: "Romans 8",
    description: "Life in the Spirit",
    day: 7,
    completed: false,
  },
];

export function ReadingPlan() {
  const [readingPlan, setReadingPlan] = useState<ReadingEntry[]>(mockReadingPlan);
  
  const completedCount = readingPlan.filter(entry => entry.completed).length;
  const progress = Math.round((completedCount / readingPlan.length) * 100);

  const handleToggleComplete = (id: string) => {
    setReadingPlan(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, completed: !entry.completed } 
          : entry
      )
    );
    
    // Find the entry that was toggled
    const entry = readingPlan.find(entry => entry.id === id);
    if (entry) {
      if (!entry.completed) {
        toast.success(`Marked "${entry.passage}" as completed`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="font-medium">Your Progress</h3>
          <span className="text-sm">{completedCount} of {readingPlan.length} days completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        {readingPlan.map(entry => (
          <div 
            key={entry.id}
            className={`p-4 rounded-lg border ${
              entry.completed ? "bg-green-50 border-green-100" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-start">
                <div className="pt-0.5">
                  <Checkbox 
                    id={`reading-${entry.id}`}
                    checked={entry.completed}
                    onCheckedChange={() => handleToggleComplete(entry.id)}
                  />
                </div>
                <div>
                  <label 
                    htmlFor={`reading-${entry.id}`}
                    className={`font-medium block ${entry.completed ? "line-through text-gray-500" : ""}`}
                  >
                    Day {entry.day}: {entry.passage}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                asChild
              >
                <Link to={`/bible?reference=${encodeURIComponent(entry.passage)}`}>
                  <BookOpen className="h-4 w-4" />
                  <span>Read</span>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
