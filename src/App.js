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
      prompt: `Create detailed summary of the following text: \n\n ${validPrompt}`,
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
