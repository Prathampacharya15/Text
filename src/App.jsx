import React, { useState, useEffect } from "react";
import TextScene from "./components/TextScene";

export default function App() {
  const [text, setText] = useState("Hello");
  const [animation, setAnimation] = useState("FlyIn");
  const [trigger, setTrigger] = useState(0);
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Arial");
 

  useEffect(() => {
    const loadFonts = async () => {
      if (window.electronAPI?.getFonts) {
        try {
          const systemFonts = await window.electronAPI.getFonts(); 
          const cleanedFonts = systemFonts.map(f => f.replace(/^"+|"+$/g, ""));
          setFonts(cleanedFonts);

          if (cleanedFonts.length) setSelectedFont(cleanedFonts[0]);
         
        } catch (err) {
          console.error("Failed to load fonts:", err);
          setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
        }
      } else {
        setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
      }
    };

    loadFonts();
  }, []);

  const handleFontChange = (e) => {
    setSelectedFont(e.target.value);
    setTrigger((t) => t + 1); // re-trigger text update
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#111",
        color: "#00ffcc",
      }}
    >
      {/* Controls */}
      <div
        style={{
          padding: 10,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          style={{ fontSize: 16, padding: 5, width: 300, height: 80 }}
        />

        <select
  value={animation}
  onChange={(e) => setAnimation(e.target.value)}
  style={{ fontSize: 16, padding: 5 }}
>
  <option value="FlyIn">Fly In</option>
  <option value="Bounce">Bounce</option>
  <option value="Rotate">Rotate</option>
  <option value="Fade">Fade</option>
  <option value="Scale">Scale</option>
  <option value="WaveFromLeft">Wave</option>
  <option value="Scramble">Scramble</option>
  <option value="LetterFlip">Letter Flip</option>
  <option value="Collision">Collision</option>
  <option value="MaskedLines">Masked Lines</option>
  <option value="SplitTextEffect">Revert</option>
  <option value="Pan">Pan</option>

  {/* NEW ANIMATIONS ADDED BELOW */}
  <option value="Slide">Slide</option>
  <option value="Drift">Drift</option>
  <option value="Pop">Pop</option>
  <option value="Tumble">Tumble</option>
  <option value="Stomp">Stomp</option>
  <option value="Roll">Roll</option>

  {/* Typing & reveal */}
  <option value="Typewriter">Typewriter</option>
  <option value="CharReveal">Character Reveal</option>
  <option value="WordReveal">Word Reveal</option>

  {/* Emphasis animations */}
  <option value="Pulse">Pulse</option>
  <option value="Breathe">Breathe</option>
  <option value="Jitter">Jitter</option>
  <option value="Shake">Shake</option>
  <option value="Flicker">Flicker</option>
  <option value="Echo">Echo</option>

  {/* Exit animations */}
  <option value="FadeOut">Fade Out</option>
  <option value="SlideOut">Slide Out</option>
  <option value="Shrink">Shrink</option>
  <option value="MaskWipeOut">Mask Wipe Out</option>

  {/* Visual glow */}
  <option value="NeonGlow">Neon Glow</option>
</select>


        {/* Font selector */}
        <select
          value={selectedFont}
          onChange={handleFontChange}
          style={{ fontSize: 16, padding: 5 }}
        >
          {fonts.map((f, i) => (
            <option key={i} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button
          onClick={() => setTrigger((t) => t + 1)}
          style={{ fontSize: 16, padding: "5px 10px", cursor: "pointer" }}
        >
          Apply
        </button>
      </div>

      {/* 3D Text Canvas */}
      <div style={{ flex: 1, minHeight: 500 }}>
        <TextScene
          text={text}
          animation={animation}
          trigger={trigger}
          font={selectedFont}
        />
      </div>
    </div>
  );
}
