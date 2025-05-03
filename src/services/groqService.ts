
import { toast } from "sonner";

// Types for the API calls
export type GroqRequestParams = {
  task: "exegesis" | "qa" | "sermon" | "search";
  content: string;
  style?: string;
};

export type GroqResponse = {
  text: string;
  error?: string;
};

export const generateGroqPrompt = (
  task: string, 
  content: string, 
  style: string = "theological"
): { system: string; user: string } => {
  const systemPrompt = `You are a ${style} Bible Scholar with expertise in original languages, theology, and practical application.`;
  
  const taskPrompts: Record<string, string> = {
    exegesis: `Provide a scholarly exegesis for the passage: ${content}.
Include:
1. KJV and ESV versions
2. Greek text + transliteration
3. Word-by-word Greek meanings
4. Historical & cultural context
5. Theological significance
6. Practical insights
`,
    qa: `Answer this Bible question from a ${style} perspective: ${content}.
Include:
1. Clear explanation
2. Scripture references
3. Key insights
4. Application`,
    sermon: `Create a sermon on the topic: ${content} using a ${style} approach.
Include:
1. Main theme
2. Biblical foundation
3. Key points
4. Real-life application`,
    search: `Search the Bible for passages about: ${content} using a ${style} method.
For each result, provide:
1. Reference
2. Summary
3. Meaning
4. Application`
  };

  return {
    system: systemPrompt,
    user: taskPrompts[task] || ""
  };
};

const getGroqApiKey = (): string => {
  // First try the environment variable
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  
  // If env variable is not set, use the hardcoded key
  const hardcodedKey = "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";
  
  const key = envKey || hardcodedKey;
  
  if (!key) {
    console.error("Missing Groq API key. Set VITE_GROQ_API_KEY in your environment variables.");
    throw new Error("Missing Groq API key.");
  }
  
  return key;
};

export const fetchGroqResponse = async (
  params: GroqRequestParams
): Promise<GroqResponse> => {
  try {
    const { task, content, style = "theological" } = params;
    const prompt = generateGroqPrompt(task, content, style);
    
    const apiKey = getGroqApiKey();
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ],
        temperature: 0.8,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response from Groq");
    }

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error: any) {
    console.error("Groq API error:", error);
    toast.error("Failed to get response", {
      description: error.message || "Please try again later"
    });
    return { text: "", error: error.message };
  }
};
