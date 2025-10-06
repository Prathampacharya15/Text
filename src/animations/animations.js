import gsap from "gsap";

export function animateLetters(letters, animation, redraw) {
  if (!letters.length) return [];
  let anims = [];

  switch (animation) {
    case "WaveFromLeft":
      anims = letters.map((letter, i) =>
        gsap.to(letter, {
          y: letter.y + 20,
          duration: 0.6,
          delay: i * 0.03,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          onUpdate: redraw,
        })
      );
      break;

    case "Scramble": {
      const chars = "!@#$%^&*()_+1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
      anims = letters.map((letter, i) =>
        gsap.to(letter, {
          rot: Math.PI * 2,
          duration: 1,
          delay: i * 0.1,
          ease: "back.inOut(2)",
          repeat: 0,
          onUpdate: redraw,
          onComplete: () => {
            letter.rot = 0;
            redraw();
          }
        })
      );
      break;

    case "SplitTextEffect":
  let totalDuration = 0.5; 
  anims = letters.map((letter, i) =>
    gsap.fromTo(
      letter,
      { y: letter.y + 80, rot: Math.PI, scale: 0, opacity: 0 },
      { 
        y: letter.y, 
        rot: 0, 
        scale: 1, 
        opacity: 1, 
        duration: totalDuration, 
        delay: i * totalDuration, // each letter starts after the previous one
        ease: "back.out(1.7)", 
        onUpdate: redraw 
      }
    )
  );
  break;

    
    case "MaskedLines": {
      // Group letters by their y position (lines)
      const linesMap = {};
      letters.forEach((letter) => {
        if (!linesMap[letter.y]) linesMap[letter.y] = [];
        linesMap[letter.y].push(letter);
      });

      // Sort lines by y position
      const sortedLines = Object.keys(linesMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map((y) => linesMap[y]);

      // Animate each line from bottom to top
      sortedLines.forEach((line, lineIndex) => {
        line.forEach((letter) => {
          letter.opacity = 0; // start hidden
        });

        const tl = gsap.timeline({ delay: lineIndex * 0.2 }); // stagger lines
        line.forEach((letter, i) => {
          tl.to(letter, {
            opacity: 1,
            y: letter.y,
            duration: 0.6,
            ease: "expo.out",
            onUpdate: redraw,
          }, i * 0.05); // stagger letters in the line
        });

        anims.push(tl);
      });
      break;
      
    }

    

    default:
      break;
  }

  return anims;
}
