import axios from "axios";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Editor from "react-simple-code-editor";
import rehypeHighlight from "rehype-highlight";
import "./App.css";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Footer from "./components/Footer/Footer";
import ContactUs from "./components/Legal/ContactUs";
import PrivacyPolicy from "./components/Legal/PrivacyPolicy";
import TermsOfService from "./components/Legal/TermsOfService";
import Navbar from "./components/Navbar/Navbar";
import "./components/typewriter/typewriter.css"; // Ensure CSS is imported
import Typewriter from "./components/typewriter/typewriterEffect";

function App() {
  const [code, setCode] = useState(` function sum() {
  return 1 + 1
}`);
  const [review, setReview] = useState(`Here you will get your code review...`);
  const [animatedReview, setAnimatedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  async function reviewCode() {
    try {
      // Check if user has credits
      if (user.credits < 1) {
        setReview("Error: You don't have enough credits to perform a code review.");
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/get-review`,
        { code: code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setReview(response.data.review);
      
      // Update user credits in state
      if (response.data.creditsRemaining !== undefined) {
        setUser(prevUser => ({
          ...prevUser,
          credits: response.data.creditsRemaining
        }));
      }
    } catch (error) {
      if (error.response?.status === 402) {
        setReview(`Error: ${error.response.data.message}`);
        // Update user credits to 0 if insufficient credits error
        setUser(prevUser => ({
          ...prevUser,
          credits: 0
        }));
      } else {
        setReview("Error: Unable to get review.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <main>
                <div className="left">
                  <div className="code">
                    <Editor
                      value={code}
                      onValueChange={(code) => setCode(code)}
                      highlight={(code) =>
                        Prism.highlight(
                          code,
                          Prism.languages.javascript,
                          "javascript"
                        )
                      }
                      padding={10}
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 16,
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        height: "100%",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div className="credits-section">
                    <span className="credits-count">Credits: {user.credits}</span>
                    <div onClick={reviewCode} className="review" disabled={user.credits < 1}>
                      {loading ? <span className="spinner" /> : "Review"}
                    </div>
                  </div>
                </div>

                <div className="right">
                  {loading ? (
                    <>
                      <span className="spinner" /> Loading, please wait...
                    </>
                  ) : (
                    <>
                      <h2>Code Review</h2>
                      <Typewriter
                        text={review}
                        speed={50}
                        setDisplayedText={setAnimatedReview}
                      />
                      <Markdown rehypePlugins={[rehypeHighlight]}>
                        {animatedReview}
                      </Markdown>
                    </>
                  )}
                </div>
              </main>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <Signup setUser={setUser} />}
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
