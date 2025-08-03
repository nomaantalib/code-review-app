
import axios from 'axios';
// import "highlight.js/styles/github.css"
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { useState } from 'react';
import Markdown from "react-markdown";
import Editor from "react-simple-code-editor";
import rehypeHighlight from "rehype-highlight";
import './App.css';

function App() {
  
  const [ code, setCode ] = useState(` function sum() {
  return 1 + 1
}`)

  const [review, setReview] = useState(`Here you will get your code review...`)
  const [loading,setloading ] = useState(false);

  // No need for highlightAll, Prism.highlight is used directly in Editor

  async function reviewCode() {
    try {
      setloading(true);
      
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code: code
      });
      setReview(response.data);
    } catch (error) {
      setReview('Error: Unable to get review.');
      console.error(error);
      setloading(false);
    }
    finally {
      setloading(false);
    }
  }

  return (
    <>
      <main>
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => Prism.highlight(code, Prism.languages.javascript, "javascript")}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%"
              }}
            />
          </div>
          <div
            onClick={reviewCode}
            className="review">
            {loading ? (
              <span className="spinner" /> // spinner placeholder
            ) : (
              "Review"
            )}
          </div> 
        </div>






        <div className="right"
             onClick={reviewCode}>
          {loading ? (
           <> <span className="spinner" /> Loading , please wait...
         </> ) : (<Markdown

            rehypePlugins={[rehypeHighlight]}

          >{review}</Markdown>)}
        </div>
      </main>
    </>
  )
}



export default App
