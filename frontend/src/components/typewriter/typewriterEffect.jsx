// components/typewriter/Typewriter.jsx
import { useEffect, useState } from "react";
import "../typewriter/typewriter.css";

function Typewriter({ text = "", speed = 100, setDisplayedText }) {
  const [localText, setLocalText] = useState("");

  useEffect(() => {
    let i = 0;
    if (setDisplayedText) {
      setDisplayedText(""); // clear external
    } else {
      setLocalText(""); // fallback local
    }

    const interval = setInterval(() => {
      if (i >= text.length) return clearInterval(interval);

      const nextChar = text.charAt(i);
      if (setDisplayedText) {
        setDisplayedText((prev) => prev + nextChar);
      } else {
        setLocalText((prev) => prev + nextChar);
      }
      i++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, setDisplayedText]);

  // Only render if you're not using external text
  if (setDisplayedText) return null;

  return <div className="typewriter">{localText}</div>;
}

export default Typewriter;
