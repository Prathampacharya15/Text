import gsap from "gsap";

export function animateLetters(letters, animation, redraw) {
  if (!letters || !letters.length) return [];

  // Ensure each letter has stable base positions to restore to
  letters.forEach((l) => {
    if (l._baseX === undefined) l._baseX = l.x;
    if (l._baseY === undefined) l._baseY = l.y;
    if (l._baseScale === undefined) l._baseScale = l.scale ?? 1;
    if (l._baseRot === undefined) l._baseRot = l.rot ?? 0;
    if (l._baseOpacity === undefined) l._baseOpacity = l.opacity ?? 1;
  });

  const anims = [];

  const setRestore = (letter) => {
    letter.x = letter._baseX;
    letter.y = letter._baseY;
    letter.scale = letter._baseScale;
    letter.rot = letter._baseRot;
    letter.opacity = letter._baseOpacity;
    if (redraw) redraw();
  };

  switch (animation) {
    // ---------- Common / Simple Entrance Effects ----------
    case "FlyIn": { // letters fly in from above with stagger
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        letter.y = letter._baseY - 120;
        letter.opacity = 0;
      });
      letters.forEach((letter, i) => {
        tl.to(letter, {
          y: letter._baseY,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          onUpdate: redraw,
        }, i * 0.04);
      });
      anims.push(tl);
      break;
    }

    case "Bounce": { // entrance bounce
      const tl = gsap.timeline();
      letters.forEach((letter) => {
        letter.y = letter._baseY - 60;
        letter.scale = 0.9;
        letter.opacity = 0;
      });
      letters.forEach((letter, i) => {
        tl.to(letter, {
          y: letter._baseY,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "bounce.out",
          onUpdate: redraw,
        }, i * 0.03);
      });
      anims.push(tl);
      break;
    }

    case "Rotate": { // each letter rotates in
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        letter.rot = -Math.PI / 2;
        letter.opacity = 0;
      });
      letters.forEach((letter, i) => {
        tl.to(letter, {
          rot: letter._baseRot,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.4)",
          onUpdate: redraw,
        }, i * 0.05);
      });
      anims.push(tl);
      break;
    }

    case "Fade": { // simple fade in
      letters.forEach((l) => { l.opacity = 0; });
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          opacity: 1,
          duration: 0.45,
          ease: "sine.out",
          onUpdate: redraw,
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    case "Scale": { // pop-in scale
      letters.forEach((l) => { l.scale = 0; l.opacity = 0; });
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2)",
          onUpdate: redraw,
        }, i * 0.03);
      });
      anims.push(tl);
      break;
    }

    // ---------- Wave / Scramble / Flip (you already had these) ----------
    case "WaveFromLeft":
      anims.push(...letters.map((letter, i) =>
        gsap.to(letter, {
          y: letter._baseY + 20,
          duration: 0.6,
          delay: i * 0.03,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          onUpdate: redraw,
          onComplete: () => setRestore(letter),
        })
      ));
      break;

    case "Scramble": {
      const chars = "!@#$%^&*()_+1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const tl = gsap.timeline();
      letters.forEach((letter) => {
        const originalChar = letter.char;
        tl.to({}, {
          duration: 0.2,
          repeat: 3,
          onRepeat: () => {
            letter.char = chars[Math.floor(Math.random() * chars.length)];
            redraw();
          },
          onComplete: () => {
            letter.char = originalChar;
            redraw();
          }
        });
      });
      anims.push(tl);
      break;
    }

    case "LetterFlip":
      anims.push(...letters.map((letter, i) =>
        gsap.to(letter, {
          rot: letter._baseRot + Math.PI * 2,
          duration: 1,
          delay: i * 0.06,
          ease: "back.inOut(2)",
          onUpdate: redraw,
          onComplete: () => {
            // reset to neat rotation
            letter.rot = letter._baseRot;
            redraw();
          }
        })
      ));
      break;

    // ---------- Split / Masked lines you had ----------
    case "SplitTextEffect": {
      const totalDuration = 0.45;
      anims.push(...letters.map((letter, i) =>
        gsap.fromTo(letter,
          { y: letter._baseY + 80, rot: Math.PI, scale: 0, opacity: 0 },
          {
            y: letter._baseY,
            rot: letter._baseRot,
            scale: 1,
            opacity: 1,
            duration: totalDuration,
            delay: i * (totalDuration * 0.5),
            ease: "back.out(1.7)",
            onUpdate: redraw,
          })
      ));
      break;
    }

    case "MaskedLines": {
      // Group letters by y (line)
      const linesMap = {};
      letters.forEach((letter) => {
        if (!linesMap[letter._baseY]) linesMap[letter._baseY] = [];
        linesMap[letter._baseY].push(letter);
        letter.opacity = 0;
      });

      const sortedLines = Object.keys(linesMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map((y) => linesMap[y]);

      sortedLines.forEach((line, lineIndex) => {
        const tl = gsap.timeline({ delay: lineIndex * 0.18 });
        line.forEach((letter, i) => {
          // reveal each letter with slight upward mask motion
          letter.y = letter._baseY + 30;
          tl.to(letter, {
            opacity: 1,
            y: letter._baseY,
            duration: 0.55,
            ease: "expo.out",
            onUpdate: redraw,
          }, i * 0.04);
        });
        anims.push(tl);
      });
      break;
    }

    // ---------- Collision (simple physics-like pop) ----------
    case "Collision": {
      // give each letter an outward velocity then settle back
      letters.forEach((letter) => {
        // random small push from center
        const dx = (letter._baseX - (letters[0]._baseX || 0)) + (Math.random() - 0.5) * 80;
        const dy = (Math.random() - 0.5) * 80;
        letter.x = letter._baseX + dx;
        letter.y = letter._baseY + dy;
        letter.opacity = 0.9;
        letter.scale = 0.9 + Math.random() * 0.4;
      });

      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          x: letter._baseX,
          y: letter._baseY,
          scale: 1,
          duration: 0.9,
          ease: "power4.out",
          onUpdate: redraw,
        }, i * 0.01);
      });
      anims.push(tl);
      break;
    }

    // ---------- Pan / Slide / Drift (directional motions) ----------
    case "Pan": {
      // pan letters from left to right like a slow horizontal drift
      letters.forEach((l) => { l.x = l._baseX - 200; l.opacity = 0; });
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          x: letter._baseX,
          opacity: 1,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: redraw
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    case "Slide": {
      letters.forEach((l) => { l.x = l._baseX - 200; l.opacity = 0; });
      anims.push(...letters.map((letter, i) =>
        gsap.to(letter, {
          x: letter._baseX,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.02,
          ease: "power3.out",
          onUpdate: redraw,
        })
      ));
      break;
    }

    case "Drift": {
      // gentle floating in from random offsets
      letters.forEach((l) => {
        l.x = l._baseX + (Math.random() - 0.5) * 120;
        l.y = l._baseY + 80;
        l.opacity = 0;
        l.scale = 0.95;
      });
      const tlDrift = gsap.timeline();
      letters.forEach((letter, i) => {
        tlDrift.to(letter, {
          x: letter._baseX,
          y: letter._baseY,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "sine.out",
          onUpdate: redraw
        }, i * 0.03);
      });
      anims.push(tlDrift);
      break;
    }

    // ---------- Pop / Tumble / Stomp / Tectonic ----------
    case "Pop": {
      letters.forEach((l) => { l.scale = 0.2; l.opacity = 0; });
      const tlPop = gsap.timeline();
      letters.forEach((letter, i) => {
        tlPop.to(letter, {
          scale: 1.15,
          opacity: 1,
          duration: 0.28,
          ease: "back.out(3)",
          onUpdate: redraw,
        }, i * 0.02);
        tlPop.to(letter, { scale: 1, duration: 0.18, ease: "sine.out", onUpdate: redraw }, `>`);
      });
      anims.push(tlPop);
      break;
    }

    case "Tumble": {
      letters.forEach((l) => { l.rot = Math.PI * (Math.random() > 0.5 ? -1 : 1); l.opacity = 0; });
      const tlT = gsap.timeline();
      letters.forEach((letter, i) => {
        tlT.to(letter, {
          rot: letter._baseRot,
          opacity: 1,
          y: letter._baseY,
          duration: 0.8,
          ease: "circ.out",
          onUpdate: redraw,
        }, i * 0.03);
      });
      anims.push(tlT);
      break;
    }

    case "Stomp": {
      // heavy downward stomp, then bounce
      letters.forEach((l) => { l.y = l._baseY - 200; l.opacity = 0; });
      const tlS = gsap.timeline();
      letters.forEach((letter, i) => {
        tlS.to(letter, {
          y: letter._baseY + 10,
          opacity: 1,
          duration: 0.35,
          ease: "power4.out",
          onUpdate: redraw,
        }, i * 0.03);
        tlS.to(letter, { y: letter._baseY, duration: 0.28, ease: "bounce.out", onUpdate: redraw }, `>`);
      });
      anims.push(tlS);
      break;
    }

    // ---------- Roll ----------
    case "Roll": {
      letters.forEach((l) => { l.rot = Math.PI; l.opacity = 0; });
      const tlR = gsap.timeline();
      letters.forEach((letter, i) => {
        tlR.to(letter, {
          rot: letter._baseRot,
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          onUpdate: redraw,
        }, i * 0.03);
      });
      anims.push(tlR);
      break;
    }

    // ---------- Typewriter & Writing Effects ----------
    case "Typewriter": {
      // show letters one by one (character reveal)
      const tl = gsap.timeline();
      // hide all first
      letters.forEach((l) => { l.charBackup = l.char; l.char = ""; });
      letters.forEach((letter, i) => {
        tl.call(() => {
          letter.char = letter.charBackup;
          redraw();
        }, null, i * 0.06);
      });
      anims.push(tl);
      break;
    }

    case "CharReveal": { // reveal characters with small pop
      const tl = gsap.timeline();
      letters.forEach((l) => { l.opacity = 0; l.scale = 0.6; });
      letters.forEach((letter, i) => {
        tl.to(letter, {
          opacity: 1,
          scale: 1,
          duration: 0.28,
          ease: "back.out(2)",
          onUpdate: redraw,
        }, i * 0.04);
      });
      anims.push(tl);
      break;
    }

    case "WordReveal": { // reveal by words (we assume contiguous letters of words separated by spaces)
      // very simple grouping by x gaps: combine adjacent letters until a large gap
      const words = [];
      let current = [letters[0]];
      for (let i = 1; i < letters.length; i++) {
        if (letters[i].x - letters[i - 1].x > 30) { // heuristic gap => new word
          words.push(current);
          current = [letters[i]];
        } else current.push(letters[i]);
      }
      words.push(current);

      const tl = gsap.timeline();
      words.forEach((w, wi) => {
        w.forEach((l) => { l.opacity = 0; l.scale = 0.92; });
        tl.to(w, {
          duration: 0.6,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          onUpdate: redraw,
        }, wi * 0.12);
      });
      anims.push(tl);
      break;
    }

    // ---------- Emphasis / Attention animations ----------
    case "Pulse": {
      const tl = gsap.timeline({ repeat: 1, yoyo: true });
      letters.forEach((l) => { l.scale = 1; });
      tl.to(letters, {
        scale: 1.12,
        duration: 0.5,
        ease: "sine.inOut",
        onUpdate: redraw
      });
      anims.push(tl);
      break;
    }

    case "Breathe": {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(letters, {
        scale: 1.04,
        duration: 1.6,
        ease: "sine.inOut",
        onUpdate: redraw
      });
      anims.push(tl);
      break;
    }

    case "Jitter": {
      // small random positional jitter for a beat
      const tl = gsap.timeline();
      letters.forEach((l) => { l._jitterX = 0; l._jitterY = 0; });
      tl.to({}, {
        duration: 0.04,
        repeat: 8,
        onRepeat: () => {
          letters.forEach((letter) => {
            letter.x = letter._baseX + (Math.random() - 0.5) * 6;
            letter.y = letter._baseY + (Math.random() - 0.5) * 6;
          });
          redraw();
        },
        onComplete: () => letters.forEach((l) => setRestore(l))
      });
      anims.push(tl);
      break;
    }

    case "Shake": {
      const tl = gsap.timeline();
      tl.to({}, {
        duration: 0.05,
        repeat: 10,
        onRepeat: () => {
          letters.forEach((letter) => {
            letter.x = letter._baseX + (Math.random() - 0.5) * 20;
          });
          redraw();
        },
        onComplete: () => letters.forEach((l) => setRestore(l))
      });
      anims.push(tl);
      break;
    }

    case "Flicker": {
      const tl = gsap.timeline();
      letters.forEach((l) => l.opacity = 1);
      tl.to({}, {
        duration: 0.08,
        repeat: 8,
        onRepeat: () => {
          letters.forEach((letter) => {
            letter.opacity = Math.random() > 0.5 ? 1 : 0.2;
          });
          redraw();
        },
        onComplete: () => letters.forEach((l) => setRestore(l))
      });
      anims.push(tl);
      break;
    }

    case "Echo": {
      // ripple opacity outward from center
      const midIndex = Math.floor(letters.length / 2);
      const tl = gsap.timeline();
      letters.forEach((l) => { l.opacity = 0.25; });
      letters.forEach((letter, i) => {
        const dist = Math.abs(i - midIndex);
        tl.to(letter, {
          opacity: 1,
          duration: 0.5,
          ease: "sine.out",
          onUpdate: redraw,
        }, dist * 0.04);
      });
      anims.push(tl);
      break;
    }

    // ---------- Exit animations ----------
    case "FadeOut": {
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          opacity: 0,
          duration: 0.45,
          ease: "sine.in",
          onUpdate: redraw
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    case "SlideOut": {
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          x: letter._baseX + 200,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
          onUpdate: redraw,
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    case "Shrink": {
      const tl = gsap.timeline();
      letters.forEach((l) => l.scale = 1);
      letters.forEach((letter, i) => {
        tl.to(letter, {
          scale: 0,
          opacity: 0,
          duration: 0.45,
          ease: "back.in(2)",
          onUpdate: redraw
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    case "MaskWipeOut": {
      // wipe down
      const tl = gsap.timeline();
      letters.forEach((l) => l.opacity = 1);
      letters.forEach((letter, i) => {
        tl.to(letter, {
          y: letter._baseY + 60,
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
          onUpdate: redraw,
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }

    // ---------- Visual / Glow-like (simulated via opacity/scale) ----------
    case "NeonGlow": {
      // mimic glow by pulsing opacity/scale rapidly
      const tl = gsap.timeline({ repeat: 1, yoyo: true });
      tl.to(letters, {
        scale: 1.06,
        duration: 0.18,
        onUpdate: redraw,
      });
      tl.to(letters, {
        scale: 1,
        duration: 0.18,
        onUpdate: redraw,
      });
      anims.push(tl);
      break;
    }

    // ---------- Fallback / default: small pop ----------
    default: {
      // small default entrance so user sees something
      letters.forEach((l) => { l.scale = 0.8; l.opacity = 0; });
      const tl = gsap.timeline();
      letters.forEach((letter, i) => {
        tl.to(letter, {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onUpdate: redraw,
        }, i * 0.02);
      });
      anims.push(tl);
      break;
    }
  }

  return anims;
}
