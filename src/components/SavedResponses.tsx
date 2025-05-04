
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Download, Edit, Save, Trash } from "lucide-react";
import { toast } from "sonner";

type SavedResponse = {
  id: string;
  title: string;
  content: string;
  type: "exegesis" | "qa" | "sermon" | "search";
  date: string;
};

// Mock data - in a real app, this would come from Supabase
const mockResponses: SavedResponse[] = [
  {
    id: "1",
    title: "Exegesis of John 3:16",
    content: "For God so loved the world that he gave his one and only Son...",
    type: "exegesis",
    date: "2025-05-01"
  },
  {
    id: "2",
    title: "Question about Baptism",
    content: "Baptism is a sacrament of the Christian faith...",
    type: "qa",
    date: "2025-05-02"
  },
  {
    id: "3",
    title: "Sermon on Faith",
    content: "Faith is the assurance of things hoped for...",
    type: "sermon",
    date: "2025-05-03"
  }
];

export function SavedResponses() {
  const [responses, setResponses] = useState<SavedResponse[]>(mockResponses);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const filteredResponses = responses.filter(
    response => 
      response.title.toLowerCase().includes(search.toLowerCase()) || 
      response.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = (response: SavedResponse) => {
    // In a real app, this would implement sharing functionality
    navigator.clipboard.writeText(response.content);
    toast.success("Content copied to clipboard", {
      description: "You can now share this with others"
    });
  };

  const handleDownload = (response: SavedResponse) => {
    const blob = new Blob([response.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Downloaded successfully");
  };

  const handleEdit = (response: SavedResponse) => {
    setEditingId(response.id);
    setEditContent(response.content);
    setEditTitle(response.title);
  };

  const handleSaveEdit = (id: string) => {
    setResponses(prev => prev.map(response => 
      response.id === id 
        ? { ...response, content: editContent, title: editTitle } 
        : response
    ));
    setEditingId(null);
    toast.success("Response updated");
  };

  const handleDelete = (id: string) => {
    setResponses(prev => prev.filter(response => response.id !== id));
    toast.success("Response deleted");
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Input
          placeholder="Search saved responses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredResponses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No saved responses found</p>
          <p className="text-sm mt-2">Save responses from your study tools to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map(response => (
            <div 
              key={response.id} 
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              {editingId === response.id ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="font-medium text-lg"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-48 p-2 border rounded-md"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(response.id)}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{response.title}</h3>
                      <div className="flex gap-2 items-center text-sm text-gray-500 mt-1">
                        <span className="capitalize">{response.type}</span>
                        <span>•</span>
                        <span>{response.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleShare(response)}>
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(response)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(response)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(response.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm line-clamp-3">
                    {response.content}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
