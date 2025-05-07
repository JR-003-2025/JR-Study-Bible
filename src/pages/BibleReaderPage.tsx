
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BibleReader } from "@/components/BibleReader";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const BibleReaderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "John 3:16";
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-serif font-bold text-bible-blue">
            Bible Reader
          </h1>
        </div>
        
        <BibleReader initialReference={reference} />
      </div>
    </Layout>
  );
};

export default BibleReaderPage;
