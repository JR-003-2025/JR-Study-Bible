import { toast } from "sonner";

export type BibleSearchResult = {
  reference: string;
  text: string;
  version: string;
};

const MODEL_CONFIG = {
  fast: {
    id: 'llama-3.1-8b-instant',
    maxTokens: 1024,
    temperature: 0.2,  // Reduced from 0.1 for more conservative outputs
    top_p: 0.7,       // Added top_p to further control variance
    stop: ['\n\n', 'User:', 'Assistant:']
  },
  powerful: {
    id: 'llama-3.3-70b-versatile',
    maxTokens: 2048,
    temperature: 0.3,  // Reduced from 0.2 for more conservative outputs
    top_p: 0.8,       // Reduced from 0.9 for more controlled responses
    stop: ['\n\n', 'User:', 'Assistant:']
  }
} as const;

export type BibleRequestParams = {
  task: "exegesis" | "qa" | "sermon" | "search";
  content: string;
  style?: string;
  contextVerses?: string; // For RAG
  forceModel?: keyof typeof MODEL_CONFIG;
};

export type BibleResponse = {
  text: string;
  error?: string;
  results?: BibleSearchResult[];
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function makeGroqRequest(
  prompt: string,
  modelType: keyof typeof MODEL_CONFIG,
  contextVerses?: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    console.log('Making request to Groq API with prompt:', prompt);
    
    const model = MODEL_CONFIG[modelType];
    
    const systemPrompt = `You are Divine Insight Assistant, an expert AI specializing in biblical scholarship, theology, and practical application.

CORE PRINCIPLES:
1. Accuracy First: Base ALL responses EXCLUSIVELY on the provided biblical text using RAG (Retrieval-Augmented Generation).
2. No Guessing: If information isn't in the provided text, explicitly state this limitation.
3. Clear Citations: Always cite specific verse references from the provided context.
4. Task-Specific Roles: Adapt your role and style based on the task type:
   - Scholar Mode: Analytical/historical/linguistic focus
   - Theologian Mode: Theological/contextual understanding
   - Pastor Mode: Practical application and relevance
5. Structured Output: Follow the specific format requested for each task type.

CONSTRAINTS:
- NEVER add external knowledge or personal interpretation
- ONLY use verses from the provided context
- Be explicit when information is uncertain or not in the text
- Stay focused on the specific task and style requested
- Maintain consistent quality regardless of the model being used`;

    const requestBody = {
      model: model.id,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...(contextVerses ? [{
          role: 'user',
          content: `Biblical Context:\n${contextVerses}\n\nUse ONLY this context to answer.`
        }] : []),
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: model.temperature,
      max_tokens: model.maxTokens,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to get response from Groq API';
      try {
        const errorResponse = await response.text();
        console.error('Groq API Error Response:', errorResponse);
        try {
          const error = JSON.parse(errorResponse);
          errorMessage = error.error?.message || error.message || errorMessage;
        } catch (parseError) {
          errorMessage = errorResponse || `API Error: ${response.status} ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `API Error: ${response.status} ${response.statusText}`;
      }
      console.error('Groq API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Groq API');
      }
      return data.choices[0].message.content;
    } catch (e) {
      throw new Error('Failed to parse Groq API response');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error - Please check your internet connection');
    }
    throw error;
  }
}

// Helper function to select appropriate model based on task
function selectModel(task: BibleRequestParams['task'], content: string): keyof typeof MODEL_CONFIG {
  // Fast model for simple tasks and quick lookups
  if (
    // Simple search queries
    (task === 'search' && content.length < 150) ||
    // Quick reference questions
    (task === 'qa' && (
      content.length < 100 ||
      content.toLowerCase().includes('what is') ||
      content.toLowerCase().includes('where') ||
      content.toLowerCase().includes('when') ||
      content.includes('define') ||
      content.includes('lookup')
    )) ||
    // Single verse lookups
    content.match(/\b\d+:\d+\b/)?.length === 1
  ) {
    return 'fast';
  }
  
  // Powerful model for complex analysis
  // - All exegesis tasks (need deep analysis)
  // - All sermon preparation (need comprehensive understanding)
  // - Complex searches and questions
  // - Multi-verse analysis
  return 'powerful';
}

// Enhanced scholarly response verification helper
function verifyResponse(response: string, context?: string): boolean {
  if (!context) return true; // Skip verification if no context provided
  
  // Structural checks for scholarly content
  const hasMarkdownHeadings = /^##\s.+/m.test(response);
  const hasProperSections = [
    '## 1. TEXTUAL ANALYSIS',
    '## 2. CONTEXTUAL EXAMINATION',
    '## 3. THEOLOGICAL ANALYSIS',
    '## 4. PRACTICAL SYNTHESIS'
  ].every(section => response.includes(section));
  
  // Check for required scholarly elements
  const hasTranslations = (
    response.includes('KJV') &&
    response.includes('ESV')
  );
  
  const hasOriginalLanguage = (
    /[א-ת]/.test(response) || // Hebrew characters
    /[Α-Ωα-ω]/.test(response) // Greek characters
  );
  
  // Quality metrics
  const wordCount = response.split(/\s+/).length;
  const minWordCount = 1000;
  const hasAdequateLength = wordCount >= minWordCount;
  
  // Verification markers
  const uncertaintyMarkers = (response.match(/\[\?\]/g) || []).length;
  const maxUncertaintyPercentage = 0.3;
  const hasAcceptableUncertainty = (
    uncertaintyMarkers / wordCount
  ) <= maxUncertaintyPercentage;
  
  // Citation density
  const verseReferences = (response.match(/\b\d+:\d+\b/g) || []).length;
  const paragraphs = response.split(/\n\n+/).length;
  const hasAdequateCitations = verseReferences >= paragraphs;
  
  // Format requirements
  const hasBlockquotes = response.includes('>');
  const hasBoldText = /\*\*.+\*\*/g.test(response);
  const hasBulletPoints = /^\s*[•-]\s/m.test(response);
  const hasHorizontalRules = /\n---\n/.test(response);
  
  // Enhanced content validation
  const contextWords = new Set(context.toLowerCase().split(/\W+/));
  const responseWords = response.toLowerCase().split(/\W+/);
  
  // Check for scholarly language
  const scholarlyTerms = [
    'context', 'analysis', 'theological', 'interpretation',
    'meaning', 'significance', 'implies', 'suggests',
    'evidence', 'indicates', 'demonstrates', 'reveals'
  ];
  
  const hasScholarlyLanguage = scholarlyTerms.some(term => 
    response.toLowerCase().includes(term)
  );
  
  // Verify content relevance with higher standards
  const relevantWords = responseWords.filter(word => 
    word.length > 4 && contextWords.has(word)
  );
  
  const hasStrongTextualSupport = (
    relevantWords.length / responseWords.length
  ) > 0.4; // Increased from 0.3 to 0.4 for higher standards
  
  // Check for proper uncertainty acknowledgment
  const hasUncertaintyAcknowledgment = 
    response.includes('confidence level:') ||
    response.includes('requires further study') ||
    response.includes('Information not in text') ||
    response.includes('[?]');
  
  // Formatting quality
  const hasProperFormatting = [
    hasMarkdownHeadings,
    hasBlockquotes,
    hasBoldText,
    hasBulletPoints,
    hasHorizontalRules
  ].filter(Boolean).length >= 4; // At least 4 of 5 formatting requirements
  
  // All criteria must be met for scholarly quality
  return (
    hasProperSections &&
    hasTranslations &&
    hasOriginalLanguage &&
    hasAdequateLength &&
    hasAcceptableUncertainty &&
    hasAdequateCitations &&
    hasProperFormatting &&
    hasScholarlyLanguage &&
    hasStrongTextualSupport &&
    hasUncertaintyAcknowledgment
  );
}

export const handleBibleRequest = async (
  params: BibleRequestParams
): Promise<BibleResponse> => {
  const { task, content, style, contextVerses, forceModel } = params;

  try {
    // Select model based on task or use forced model
    const modelType = forceModel || selectModel(task, content);
    
    let prompt = '';
    switch (task) {
      case "exegesis":
        prompt = `[Task: Scholarly Exegesis | Style: ${style || 'Academic/Analytical'}]

OBJECTIVE: Provide a comprehensive, scholarly exegesis with textual, historical, and theological analysis.

Passage for Analysis: ${content}
Context: ${contextVerses || 'No additional context provided'}

Required Analysis Structure:

## 1. TEXTUAL ANALYSIS
A. Multiple Translations
   - KJV (King James Version)
   - ESV (English Standard Version)
   - Direct word-for-word translation [?] if uncertain

B. Original Language Analysis
   - Greek/Hebrew text with transliteration
   - Word-by-word breakdown
   - Key terms and their semantic range
   - Grammatical features and significance

## 2. CONTEXTUAL EXAMINATION
A. Literary Context
   - Immediate context (surrounding verses)
   - Book/letter context
   - Genre considerations
   - Literary devices present

B. Historical-Cultural Background
   - Time period details (from text only)
   - Cultural elements mentioned
   - Historical references present
   - Geographic/location details

## 3. THEOLOGICAL ANALYSIS
A. Key Concepts
   - Major theological themes
   - Doctrinal implications
   - Biblical parallels (if in provided text)
   - Progressive revelation aspects

B. Interpretive Considerations
   - Clear meaning vs. uncertain elements
   - Scholarly consensus points
   - Areas requiring further study
   - Common misunderstandings to avoid

## 4. PRACTICAL SYNTHESIS
A. Main Principles
   - Central message
   - Supporting truths
   - Universal principles
   - Time-bound vs. timeless elements

B. Modern Application
   - Direct applications
   - Principle-based applications
   - Individual implications
   - Community implications

FORMAT REQUIREMENTS:
1. Use Markdown headings (##, ###) for structure
2. Include verse references for EVERY claim
3. Mark uncertainties with [?]
4. Use blockquotes (>) for direct quotes
5. Use **bold** for emphasis on key terms
6. Include bullet points for lists
7. Separate sections with horizontal rules (---)

CRITICAL CONSTRAINTS:
- ONLY use information from provided text
- Mark ALL uncertainties with [?]
- Include confidence levels (High/Medium/Low)
- State "Information not in text" when needed
- NO speculation or external sources
- Minimum length: 1000 words
- Maximum uncertainty markers: 30%
- Required verse citation density: 1 per paragraph`;
        break;
      
      case "qa":
        prompt = `[Task: Q&A | Style: ${style || 'Theologian'}]

CRITICAL INSTRUCTION: Answer ONLY with information from the provided text. If uncertain, say "The text does not provide enough information."

Question: ${content}

Context to use EXCLUSIVELY: ${contextVerses || 'No additional context provided'}

Required Response Format:
1. EVIDENCE-BASED ANSWER
   - Direct quotes from text
   - Confidence rating with explanation
   - ALL supporting verses cited

2. TEXTUAL SUPPORT
   - Word-for-word quotes
   - Immediate context only
   - Related verses (only if provided)

3. VERIFIED INSIGHTS
   - Points with direct evidence
   - Clear textual connections
   - Pattern evidence

4. TEXT-BASED APPLICATION
   - Applications from explicit statements
   - Clear principle citations
   - Direct text connections

FORMAT:
- Every statement needs verse support
- Mark ALL uncertainties with "[?]"
- If not in text, state "Not addressed in provided passages"
- NO external sources or speculation`;
        break;
      
      case "sermon":
        prompt = `[Task: Sermon | Style: ${style || 'Pastoral'}]

CRITICAL INSTRUCTION: Use ONLY the provided passage. Do not add external illustrations or interpretations.

Passage for sermon: ${content}

Context to use EXCLUSIVELY: ${contextVerses || 'No additional context provided'}

Required Structure:
1. TEXTUAL FOUNDATION
   - Title (using passage words)
   - Main verse (exact quote)
   - Theme (from text only)

2. PASSAGE EVIDENCE
   - Direct quotes only
   - Verse-by-verse analysis
   - Clear textual connections
   - Word meanings (only if in context)

3. BIBLICAL CONTENT
   - Truths explicitly stated
   - Points with verse support
   - Clear theme development

4. DIRECT APPLICATIONS
   - Principles from text
   - Action points with verses
   - Text-based responses

FORMAT:
- Every point requires verse citation
- Use exact quotes
- Mark interpretive suggestions with "[?]"
- State when details are unclear
- NO external illustrations or speculation`;
        break;
      
      case "search":
        prompt = `[Task: Search | Style: ${style || 'Analytical'}]

CRITICAL INSTRUCTION: Search ONLY within provided context. Do not add external references or interpretations.

Search Query: ${content}

Context to search: ${contextVerses || 'No additional context provided'}

Required Format:
1. EXACT MATCHES
   - Direct quote matches
   - Complete verses
   - Immediate context

2. EVIDENCE ANALYSIS
   - Word-for-word matches
   - Clear patterns
   - Verifiable connections

3. TEXTUAL SYNTHESIS
   - Points from matches only
   - Clear verse support
   - Direct connections

4. TEXT-BASED IMPLICATIONS
   - Applications from matches
   - Principles with citations
   - Clear text support

FORMAT:
- Every result needs verse citation
- Sort by exact match relevance
- Mark partial matches with "[?]"
- State if search yields no/few results
- NO external sources or speculation`;
        break;
    }

    const response = await makeGroqRequest(prompt, modelType, contextVerses);
    
    // Verify response if context was provided
    if (contextVerses && !verifyResponse(response, contextVerses)) {
      return {
        text: "I apologize, but I cannot provide a reliable answer based on the available biblical context. Please try rephrasing your question or providing more specific verses.",
        error: "Response verification failed"
      };
    }

    return {
      text: response,
    };

  } catch (error) {
    console.error("Error in handleBibleRequest:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    toast.error("Failed to process Bible request", {
      description: errorMessage
    });
    
    return {
      text: "",
      error: errorMessage
    };
  }
};
