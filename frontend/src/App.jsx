
import axios from 'axios';
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { useEffect, useState } from 'react';
import Markdown from "react-markdown";
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Editor from "react-simple-code-editor";
import rehypeHighlight from "rehype-highlight";
import './App.css';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';

function App() {
  const [code, setCode] = useState(` function sum() {
  return 1 + 1
}`);

  const [review, setReview] = useState(`Here you will get your code review...`);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token and fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, []);

  async function reviewCode() {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code: code
      });
      setReview(response.data);
    } catch (error) {
      setReview('Error: Unable to get review.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={user ? (
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
                  <span className="spinner" />
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
        ) : (
          <Navigate to="/login" />
        )} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup setUser={setUser} />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
