// const API_URL = ;

export const analyzeComment = async (commentText, languages) => {
  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: {
            text: commentText,
          },
          languages: languages,
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {},
            IDENTITY_ATTACK: {},
          },
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing comment:", error);
    return null;
  }
};
