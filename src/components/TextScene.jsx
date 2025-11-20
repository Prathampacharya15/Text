

import React, { useEffect } from "react";
import { useThreeScene } from "../hooks/useThreeScene";
import { useLetters } from "../hooks//useLetters";
import { animateLetters } from "../animations/animations";

export default function TextScene({ text, animation, trigger,font}) {
  const { mountRef, canvasRef, textureRef } = useThreeScene();
  const lettersRef = useLetters(text, canvasRef,font);

  // --- Redraw function ---
  const redraw = () => {
  if (!canvasRef.current || !textureRef.current) return;

  const ctx = canvasRef.current;
  const texture = textureRef.current;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = `1px "${font}", sans-serif`;
  ctx.fillStyle = "#00ffcc";
  ctx.textBaseline = "top";

  lettersRef.current.forEach((letter) => {
    ctx.save();

    ctx.globalAlpha = letter.opacity ?? 1;

    // Filters, glow, blur, shadow
    ctx.filter = letter.blur ? `blur(${letter.blur}px)` : "none";
    if (letter.shadow) {
      ctx.shadowColor = letter.shadow.color || "#00ffcc";
      ctx.shadowBlur = letter.shadow.blur || 18;
    } else {
      ctx.shadowBlur = 0;
    }

    let px = letter.x + 10;
    let py = letter.y + 40;

    if (letter.shake) {
      px += (Math.random() - 0.5) * (letter.shake || 6);
      py += (Math.random() - 0.5) * (letter.shake || 6);
    }

    const sc = (letter.scale ?? 1) * 60;

    // NEW — scale first
    ctx.scale(sc, sc);

    // rotation next
    ctx.rotate(letter.rot || 0);

    // translate last (corrected for scale)
    ctx.translate(px / sc, py / sc);

    // Scrapbook skew
    if (letter.skewX || letter.skewY) {
      ctx.transform(
        1,
        letter.skewY || 0,
        letter.skewX || 0,
        1,
        0,
        0
      );
    }

    ctx.fillText(letter.char, 0, 0);
    ctx.restore();
  });

  texture.needsUpdate = true;
};


  // --- Animate letters when animation changes or trigger is pressed ---
  useEffect(() => {
    if (!lettersRef.current.length) return;

    
    lettersRef.current.forEach((letter) => {
      letter.rot = 0;
      letter.scale = 1;
      letter.opacity = 1;
      letter.blur = 0;
      letter.shadow = null;
      letter.skewX = 0;
      letter.skewY = 0;
      letter.shake = 0;

    });
    redraw();

    const anims = animateLetters(lettersRef.current, animation, redraw);

    return () => anims.forEach((a) => a.kill?.());
  }, [text, trigger]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", background: "#111" }}
    />
  );
}

