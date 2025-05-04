
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "lucide-react";

export function UserProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSaveProfile = () => {
    // In a real application, this would update the user profile in Supabase
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-bible-blue/10 flex items-center justify-center">
          <User className="h-8 w-8 text-bible-blue" />
        </div>
        <div>
          <h3 className="font-medium text-lg">{user?.user_metadata?.full_name || 'Bible Scholar'}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      )}

      <div className="border-t pt-4 mt-6">
        <h4 className="font-medium text-lg mb-2">Account Statistics</h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Member Since</dt>
            <dd className="font-medium">{new Date().toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Last Login</dt>
            <dd className="font-medium">{new Date().toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Saved Responses</dt>
            <dd className="font-medium">0</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Reading Plan Completion</dt>
            <dd className="font-medium">0%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
