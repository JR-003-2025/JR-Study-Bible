
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, History, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/components/UserProfile";
import { SavedResponses } from "@/components/SavedResponses";
import { ReadingPlan } from "@/components/ReadingPlan";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Please sign in to access your dashboard</h2>
            <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-bible-blue mb-6">
          Your Dashboard
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Saved Responses</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Reading Plan</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <UserProfile />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Your Saved Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <SavedResponses />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reading" className="mt-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Bible Reading Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ReadingPlan />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
