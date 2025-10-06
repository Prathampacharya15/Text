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
          const systemFonts = await window.electronAPI.getFonts(); // ✅ async/await
          setFonts(systemFonts);
          if (systemFonts.length) setSelectedFont(systemFonts[0]);
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

// add multiple animations
// import React, { useState, useEffect } from "react";
// import TextScene from "./components/TextScene";

// export default function App() {
//   const [text, setText] = useState("Hello");
//   const [animation, setAnimation] = useState("FlyIn");
//   const [trigger, setTrigger] = useState(0);
//   const [fonts, setFonts] = useState([]);
//   const [selectedFont, setSelectedFont] = useState("Arial");

//   // 🔹 Animation management
//   const [animationsList, setAnimationsList] = useState([]);
//   const [selectedIndex, setSelectedIndex] = useState(-1);

//   // Load system fonts
//   useEffect(() => {
//     const loadFonts = async () => {
//       if (window.electronAPI?.getFonts) {
//         try {
//           const systemFonts = await window.electronAPI.getFonts();
//           setFonts(systemFonts);
//           if (systemFonts.length) setSelectedFont(systemFonts[0]);
//         } catch (err) {
//           console.error("Failed to load fonts:", err);
//           setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
//         }
//       } else {
//         setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
//       }
//     };

//     loadFonts();
//   }, []);

//   // Font change
//   const handleFontChange = (e) => {
//     setSelectedFont(e.target.value);
//   };

//   // 🔹 Add new animation entry
//   const handleAddAnimation = () => {
//     if (!text.trim()) return;

//     const newItem = {
//       id: Date.now(),
//       text,
//       animation,
//       font: selectedFont,
//     };
//     setAnimationsList([...animationsList, newItem]);
//     setSelectedIndex(animationsList.length);
//   };

//   // 🔹 Update selected animation
//   const handleUpdateAnimation = () => {
//     if (selectedIndex === -1) return;
//     const updated = [...animationsList];
//     updated[selectedIndex] = {
//       ...updated[selectedIndex],
//       text,
//       animation,
//       font: selectedFont,
//     };
//     setAnimationsList(updated);
//   };

//   // 🔹 Handle selection from dropdown
//   const handleSelectChange = (e) => {
//     const index = Number(e.target.value);
//     setSelectedIndex(index);

//     if (index >= 0) {
//       const item = animationsList[index];
//       setText(item.text);
//       setAnimation(item.animation);
//       setSelectedFont(item.font);
//     }
//   };

//   // 🔹 Delete selected animation
//   const handleDeleteAnimation = () => {
//     if (selectedIndex === -1) return;
//     const updated = animationsList.filter((_, i) => i !== selectedIndex);
//     setAnimationsList(updated);
//     setSelectedIndex(-1);
//     setText("Hello");
//     setAnimation("FlyIn");
//     setSelectedFont("Arial");
//   };

//   // 🔹 Trigger render manually
//   const handleApply = () => setTrigger((t) => t + 1);

//   // Determine what to show in TextScene
//   const currentText =
//     selectedIndex >= 0 ? animationsList[selectedIndex].text : text;
//   const currentAnimation =
//     selectedIndex >= 0 ? animationsList[selectedIndex].animation : animation;
//   const currentFont =
//     selectedIndex >= 0 ? animationsList[selectedIndex].font : selectedFont;

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//         background: "#111",
//         color: "#00ffcc",
//       }}
//     >
//       {/* --- Control Panel --- */}
//       <div
//         style={{
//           padding: 10,
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 10,
//           alignItems: "center",
//         }}
//       >
//         {/* Text input */}
//         <textarea
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Enter text"
//           style={{
//             fontSize: 16,
//             padding: 5,
//             width: 300,
//             height: 80,
//             resize: "none",
//           }}
//         />

//         {/* Animation selector */}
//         <select
//           value={animation}
//           onChange={(e) => setAnimation(e.target.value)}
//           style={{ fontSize: 16, padding: 5 }}
//         >
//           <option value="FlyIn">Fly In</option>
//           <option value="Bounce">Bounce</option>
//           <option value="Rotate">Rotate</option>
//           <option value="Fade">Fade</option>
//           <option value="Scale">Scale</option>
//           <option value="WaveFromLeft">Wave</option>
//           <option value="Scramble">Scramble</option>
//           <option value="LetterFlip">Letter Flip</option>
//           <option value="Collision">Collision</option>
//           <option value="MaskedLines">Masked Lines</option>
//           <option value="SplitTextEffect">Revert</option>
//         </select>

//         {/* Font selector */}
//         <select
//           value={selectedFont}
//           onChange={handleFontChange}
//           style={{ fontSize: 16, padding: 5 }}
//         >
//           {fonts.map((f, i) => (
//             <option key={i} value={f}>
//               {f}
//             </option>
//           ))}
//         </select>

//         {/* Action buttons */}
//         <button onClick={handleApply} style={{ fontSize: 16, padding: "5px 10px" }}>
//           ▶️ Apply
//         </button>

//         <button onClick={handleAddAnimation} style={{ fontSize: 16, padding: "5px 10px" }}>
//           ➕ Add Animation
//         </button>

//         <button
//           onClick={handleUpdateAnimation}
//           disabled={selectedIndex === -1}
//           style={{ fontSize: 16, padding: "5px 10px" }}
//         >
//           🔄 Update Selected
//         </button>

//         <button
//           onClick={handleDeleteAnimation}
//           disabled={selectedIndex === -1}
//           style={{ fontSize: 16, padding: "5px 10px", background: "#ff0044", color: "#fff" }}
//         >
//           ❌ Delete
//         </button>

//         {/* Dropdown of saved animations */}
//         <select
//           value={selectedIndex}
//           onChange={handleSelectChange}
//           style={{ fontSize: 16, padding: 5 }}
//         >
//           <option value={-1}>Select Saved Text</option>
//           {animationsList.map((item, i) => (
//             <option key={item.id} value={i}>
//               {item.text.slice(0, 25)} ({item.animation})
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* --- Render Area --- */}
//       <div style={{ flex: 1, minHeight: 500 }}>
//         <TextScene
//           text={currentText}
//           animation={currentAnimation}
//           trigger={trigger}
//           font={currentFont}
//         />
//       </div>
//     </div>
//   );
// }
