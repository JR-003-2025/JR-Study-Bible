import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BookOpen } from 'lucide-react';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReadingPlan as ReadingPlanType } from '@/services/types';

export function ReadingPlan() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const { plans, currentPlan, progress, markDayComplete, isLoading } = useReadingPlan(selectedPlanId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!plans?.length) {
    return (
      <div className="text-center p-8">
        <h3 className="font-medium mb-2">No Reading Plans Available</h3>
        <p className="text-sm text-gray-600">Please check back later for available reading plans.</p>
      </div>
    );
  }

  if (!selectedPlanId) {
    return <PlanSelector plans={plans} onSelectPlan={setSelectedPlanId} />;
  }

  if (!currentPlan || !progress) {
    return <LoadingState />;
  }

  const completedDays = progress.completedDays || [];
  const totalDays = currentPlan.readings.length;
  const progressValue = Math.round((completedDays.length / totalDays) * 100);

  const startDate = progress.startDate ? new Date(progress.startDate) : new Date();
  const currentDay = Math.min(
    Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    totalDays
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentPlan.name}</CardTitle>
          <CardDescription>{currentPlan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="font-medium">Your Progress</h3>
              <span className="text-sm">{completedDays.length} of {totalDays} days completed</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Started on {format(startDate, 'PPP')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {currentPlan.readings.map((reading, index) => {
          const day = index + 1;
          const isCompleted = completedDays.includes(day);
          const isAvailable = day <= currentDay;
          const references = reading.references.join(", ");

          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                isCompleted ? "bg-green-50 border-green-100" : 
                !isAvailable ? "bg-gray-50 opacity-60" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <div className="pt-0.5">
                    <Checkbox 
                      id={`reading-${day}`}
                      checked={isCompleted}
                      disabled={!isAvailable}
                      onCheckedChange={() => {
                        markDayComplete({ planId: currentPlan.id, day });
                        if (!isCompleted) {
                          toast.success(`Marked Day ${day} as completed`);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor={`reading-${day}`}
                      className={`font-medium block ${
                        isCompleted ? "line-through text-gray-500" :
                        !isAvailable ? "text-gray-400" : ""
                      }`}
                    >
                      Day {day}: {references}
                    </label>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  disabled={!isAvailable}
                  asChild
                >
                  <Link to={`/bible?reference=${encodeURIComponent(references)}`}>
                    <BookOpen className="h-4 w-4" />
                    <span>Read</span>
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setSelectedPlanId(undefined)}
        >
          Change Reading Plan
        </Button>
      </div>
    </div>
  );
}

interface PlanSelectorProps {
  plans: ReadingPlanType[];
  onSelectPlan: (id: string) => void;
}

function PlanSelector({ plans, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectPlan(plan.id)}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              {plan.duration} days
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[125px] w-full rounded-lg" />
      <Skeleton className="h-[100px] w-full rounded-lg" />
      <Skeleton className="h-[100px] w-full rounded-lg" />
    </div>
  );
}
