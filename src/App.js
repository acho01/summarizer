/*global chrome*/

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

function App() {
  const [text, setText] = useState();
  const [loading, setLoading] = useState(false);

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const getValidLengthText = (text) => {
    const validLength = 4*3200;
    return text.substr(0, validLength)
  }

  async function getCurrentTabHtml() {
    let queryOptions = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);

    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => document.documentElement.innerText,
      });
    } catch (e) {
      console.log(e)
    }

    return result;
  }

  const fetchSummary = async () => {
    setLoading(true);

    // Get and parse inner html of active tab
    const tabInnerHtmlText = await getCurrentTabHtml();
    const validPrompt = getValidLengthText(tabInnerHtmlText)

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Think step by step and provide a clear, concise, yet comprehensive summary of the provided content. Your task is to distil the content into a structured written format, using markdown for readability and organization. 

        In your summary, please ensure to:

        1. **Include the content's main title**: This will set the context and provide an idea about the content, if available.
        2. **Identify and summarize the key points/highlights**: List out the primary points, arguments, discoveries, or themes presented in the content. Consider these as the "need-to-know" points for understanding the content's core message/content.
        3. **Provide detail without losing clarity**: After the key points, provide a more detailed summary. Include significant sub-points, illustrative examples, discussions, and any conclusions or implications. Aim for this detailed section to complement and expand on the key points, but ensure it remains digestible and clear.
        4. **Structure your summary with markdown**: Use headers for different sections (e.g., Key Points, Detailed Summary), bullet points for listing items, bold or italic text for emphasis, and tables where appropriate.
        5. **Capture the content's essence without unnecessary length**: Strive for a balance of detail and brevity. Capture all the necessary information, but avoid overly long sentences and excessive detail.
        
        Remember, the goal is to ensure that someone who reads your summary will gain a complete and accurate understanding of the content, even if they haven't watched it themselves.
        If the content includes visual elements crucial to its understanding (like a graph, diagram, or scene description), please describe it briefly within the relevant part of the summary.

        Here's a template to guide your summary:
        # [title]

        ## TLDR
        (Provide a short summary of the content in a maximum of 3 sentences)

        ## Key Points/Highlights
        - Main Point/Highlight 1
        - Main Point/Highlight 2
        - ...

        ## Detailed Summary
        (Expand on the key points with sub-points, examples, discussions, conclusions or implications)

        ## Conclusion
        (Any conclusions made in the content, the final thoughts of the speaker, etc.)` +
        `The content is as follows: ${validPrompt}`,
      temperature: 0.7,
      max_tokens: 300,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    setText(response.data.choices[0].text)
    setLoading(false);
  };

  return (
    <Box
      sx={{
        width: "300px",
        height: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: 25,
          fontWeight: "550",
          color: "#00ab01",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        Summarizer
      </Typography>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: "550",
          color: "#212429",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        Get summary of this web page
      </Typography>
      <Button
        sx={{
          fontSize: 16,
          backgroundColor: "#00ab01",
          color: "white",
          width: "40%",
          marginTop: "40px",
          "&:hover": {
            backgroundColor: "white",
            color: "#00ab01",
          },
        }}
        onClick={fetchSummary}
      >
        {loading ? <CircularProgress color="inherit" /> : <>Summarize</>}
      </Button>
      <Typography
        sx={{
          padding: "3px",
          fontSize: 12,
          fontWeight: "500",
          color: "#212429",
          textAlign: "justify",
          marginTop: "20px",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default App;
