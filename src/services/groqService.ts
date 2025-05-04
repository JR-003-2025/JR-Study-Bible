
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
  style: string = "Christocentric"
): { system: string; user: string } => {
  const systemPrompt = `You are a ${style} Bible Scholar with expertise in original languages, theology, and practical application. 
Always maintain a Christ-centered approach to Scripture interpretation, recognizing Jesus Christ as the focal point of biblical revelation. 
View all Scripture in light of God's redemptive plan culminating in Christ.`;
  
  const taskPrompts: Record<string, string> = {
    exegesis: `Provide a Christ-centered exegesis for the passage: ${content}.
Include:
1. KJV and ESV versions
2. Greek text + transliteration
3. Word-by-word Greek meanings
4. Historical & cultural context
5. Christological significance - how this passage connects to or points to Christ
6. Practical insights for Christian living
`,
    qa: `Answer this Bible question from a ${style} perspective: ${content}.
Include:
1. Clear explanation anchored in Jesus Christ as the center of biblical revelation
2. Scripture references
3. Connection to Christ's person and work
4. Application for Christian discipleship`,
    sermon: `Create a sermon on the topic: ${content} using a Christ-centered approach.
Include:
1. Main theme connected to Christ
2. Biblical foundation with Christ as the interpretive key
3. Key points showing how Christ fulfills or illuminates this topic
4. Real-life application for followers of Christ`,
    search: `Search the Bible for passages about: ${content} using a Christ-centered method.
For each result, provide:
1. Reference
2. Summary
3. Connection to Christ
4. Application for Christian living`
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
