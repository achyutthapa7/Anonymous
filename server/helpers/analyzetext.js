const API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.API_KEY}`;
const analyzeComment = async (commentText, languages) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: {
          text: commentText,
        },
        languages: languages, // Array of language codes, e.g., ['en', 'es']
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
          IDENTITY_ATTACK: {},
        },
      }),
    });

    const data = await response.json();
    console.log(data.attributeScores);
    return data;
  } catch (error) {
    console.error("Error analyzing comment:", error);
    return null;
  }
};

// Example usage with multiple languages:
analyzeComment("i like you", ["en", "es"]);