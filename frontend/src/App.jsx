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
import Payment from "./components/Payment";
import "./components/typewriter/typewriter.css"; // Ensure CSS is imported
import Typewriter from "./components/typewriter/typewriterEffect";

export default function App() {
  const [code, setCode] = useState(` function sum() {
  return 1 + 1
}`);
  const [review, setReview] = useState(`Here you will get your code review...`);
  const [animatedReview, setAnimatedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000, // 5 second timeout
        })
        .then((res) => {
          setUser(res.data);
          setAuthLoading(false);
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          setUser(null);
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  async function reviewCode() {
    try {
      const defaultCode = ` function sum() {
  return 1 + 1
}`;

      // Check if code is the default code - don't charge credits for this
      const isDefaultCode = code.trim() === defaultCode.trim();

      if (!isDefaultCode) {
        // Check if user has credits only for non-default code
        if (user.credits < 1) {
          setReview(
            "Error: You don't have enough credits to perform a code review."
          );
          return;
        }
      }

      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/get-review`,
        { code: code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setReview(response.data.review);

      // Update user credits in state only if not default code and credits were deducted
      if (!isDefaultCode && response.data.creditsRemaining !== undefined) {
        setUser((prevUser) => ({
          ...prevUser,
          credits: response.data.creditsRemaining,
        }));
      }
    } catch (error) {
      if (error.response?.status === 402) {
        setReview(`Error: ${error.response.data.message}`);
        // Update user credits to 0 if insufficient credits error
        setUser((prevUser) => ({
          ...prevUser,
          credits: 0,
        }));
      } else {
        setReview("Error: Unable to get review.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Show loading indicator while checking authentication
  if (authLoading) {
    return (
      <div className="auth-loading">
        <span className="spinner" /> Checking authentication...
      </div>
    );
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
                    <span className="credits-count">
                      Credits: {user.credits}
                    </span>
                    <div
                      onClick={reviewCode}
                      className="review"
                      disabled={user.credits < 1}
                    >
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
        <Route path="/buy-credits" element={<Payment />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />
    </Router>
  );
}
