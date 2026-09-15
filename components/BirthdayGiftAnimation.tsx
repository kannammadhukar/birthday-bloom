"use client";
import React, { useState, useEffect, useRef } from "react";

export interface EmojiOption {
  emoji: string;
  name: string;
  desc: string;
}

export const TOP_GIRL_EMOJIS: EmojiOption[] = [
  { emoji: "🦋", name: "Magical Pink Butterfly", desc: "Glowing pink fairy butterfly with heart trail" },
  { emoji: "💖", name: "Sparkling Pink Heart", desc: "Aesthetic glowing celebratory sparkle" },
  { emoji: "👑", name: "Royal Golden Crown", desc: "For the Birthday Queen Divija" },
  { emoji: "🎀", name: "Pink Ribbon Bow", desc: "Trendy aesthetic coquette charm" },
  { emoji: "✨", name: "Golden Sparkles", desc: "Ethereal luxury stardust glow" },
  { emoji: "🌸", name: "Cherry Blossom", desc: "Soft, delicate floral elegance" },
  { emoji: "🪄", name: "Magic Wand", desc: "Enchanting fairy-tale birthday sparkle" },
  { emoji: "💕", name: "Double Pink Hearts", desc: "Sweet, affectionate, cheerful warmth" },
  { emoji: "🌷", name: "Soft Pink Tulip", desc: "Fresh, graceful, elegant blossom" },
  { emoji: "🍓", name: "Sweet Strawberry", desc: "Playful, cute pastel aesthetic" },
];

interface BirthdayGiftAnimationProps {
  onContinueToGala: () => void;
  audioPlaying?: boolean;
  onToggleMusic?: () => void;
}

export default function BirthdayGiftAnimation({
  onContinueToGala,
  audioPlaying = true,
  onToggleMusic,
}: BirthdayGiftAnimationProps) {
  const [dateText, setDateText] = useState("");
  const [showDateStars, setShowDateStars] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [letterTitle, setLetterTitle] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [showLetterGifs, setShowLetterGifs] = useState(false);
  const [showLetterHearts, setShowLetterHearts] = useState(false);
  const [isExiting, setIsExiting] = useState(false);



  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(() => {
      onContinueToGala();
    }, 450);
  };

  const fullDate = "Thursday, 11 September 2003";
  const fullTitle = "To Divija";
  const fullBody =
    "You are a truly special soul, Divija. Today, on your 23rd birthday, I wish you endless happiness, vibrant health, and boundless joy. From childhood smiles and laughter with family to the compassionate, brilliant, and royal Divija, may all your MBBS dreams take flight! Always here cheering for you. Happy 23rd Birthday! 💕👑✨";

  // Lock page scroll to (0, 0) while gift animation is active
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Typewriter effect for Date of Birth banner
  useEffect(() => {
    let index = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < fullDate.length) {
          setDateText((prev) => prev + fullDate.charAt(index));
          index++;
        } else {
          setShowDateStars(true);
          clearInterval(interval);
        }
      }, 70);
    }, 2600);

    return () => clearTimeout(startTimeout);
  }, []);

  // Open Letter Animation
  const handleOpenLetter = () => {
    setIsLetterOpen(true);
    setLetterTitle("");
    setLetterBody("");
    setShowLetterGifs(false);
    setShowLetterHearts(false);

    // Title typewriter
    setTimeout(() => {
      let tIndex = 0;
      const tInterval = setInterval(() => {
        if (tIndex < fullTitle.length) {
          setLetterTitle((prev) => prev + fullTitle.charAt(tIndex));
          tIndex++;
        } else {
          clearInterval(tInterval);
        }
      }, 90);
    }, 600);

    // GIFs appear
    setTimeout(() => {
      setShowLetterGifs(true);
    }, 1400);

    // Pulsing decorative hearts
    setTimeout(() => {
      setShowLetterHearts(true);
    }, 1800);

    // Body typewriter
    setTimeout(() => {
      let bIndex = 0;
      const bInterval = setInterval(() => {
        if (bIndex < fullBody.length) {
          setLetterBody((prev) => prev + fullBody.charAt(bIndex));
          bIndex++;
        } else {
          clearInterval(bInterval);
        }
      }, 35);
    }, 2200);
  };

  const handleCloseLetter = () => {
    setIsLetterOpen(false);
  };

  // Rotating circle text: "HAPPY-BIRTHDAY-"
  const circleLetters = "HAPPY-BIRTHDAY-".split("");

  return (
    <div className={`gift-animation-wrapper ${isExiting ? "exiting" : ""}`}>

      {/* Music Toggle (Top Right) */}
      {onToggleMusic && (
        <button
          className="audio-control-btn"
          onClick={onToggleMusic}
          aria-label={audioPlaying ? "Mute Music" : "Play Music"}
        >
          {audioPlaying ? "🔊" : "🔇"}
        </button>
      )}

      {/* ── Bunting Flags Dropping Down from Top ── */}
      <div className="flag__birthday">
        <img src="/images/gift_animation/1.png" alt="Party Flag Left" width={350} className="flag__left" />
        <img src="/images/gift_animation/1.png" alt="Party Flag Right" width={350} className="flag__right" />
      </div>

      {/* ── Main Gift Card Content ── */}
      <div className="content">
        {/* Left Column: Typography, Party Hat, Date & Letter Button */}
        <div className="left">
          <div className="title">
            <h1 className="happy">
              <span style={{ animationDelay: "0.3s" }}>H</span>
              <span style={{ animationDelay: "0.45s" }}>a</span>
              <span style={{ animationDelay: "0.6s" }}>p</span>
              <span style={{ animationDelay: "0.75s" }}>p</span>
              <span style={{ animationDelay: "0.9s" }}>y</span>
            </h1>
            <h1 className="birthday">
              <span style={{ animationDelay: "1.05s" }}>B</span>
              <span style={{ animationDelay: "1.2s" }}>i</span>
              <span style={{ animationDelay: "1.35s" }}>r</span>
              <span style={{ animationDelay: "1.5s" }}>t</span>
              <span style={{ animationDelay: "1.65s" }}>h</span>
              <span style={{ animationDelay: "1.8s" }}>d</span>
              <span style={{ animationDelay: "1.95s" }}>a</span>
              <span style={{ animationDelay: "2.1s" }}>y</span>
            </h1>

            {/* Dropping and Tilting Party Hat */}
            <div className="hat">
              <img src="/images/gift_animation/hat.png" alt="Birthday Hat" width={130} />
            </div>
          </div>

          {/* Date of Birth Animated Pill */}
          <div className="date__of__birth">
            {showDateStars && <span className="star-icon">★</span>}
            <span className="date-text">{dateText}</span>
            {showDateStars && <span className="star-icon">★</span>}
          </div>

          {/* "Click here" Envelope Button */}
          <div className="btn">
            <button id="btn__letter" onClick={handleOpenLetter} aria-label="Open Birthday Letter">
              <span>Click here</span>
              <span className="btn-envelope-icon">💌</span>
            </button>
          </div>
        </div>

        {/* Right Column: Divija's Royal Grace Photo, Balloons & Rotating Circle */}
        <div className="right">
          <div className="box__account">
            {/* Divija Royal Grace Portrait (As Requested!) */}
            <div className="image">
              <img src="/images/photo_25.jpg" alt="Divija - Royal Grace" />
            </div>

            {/* Name Badge with Beating Hearts */}
            <div className="name">
              <span className="heart-icon">❤️</span>
              <span id="birthdayName">Divija</span>
              <span className="heart-icon">❤️</span>
            </div>

            {/* Left Balloon */}
            <div className="balloon_one">
              <img width="100px" src="/images/gift_animation/balloon1.png" alt="Balloon Left" />
            </div>

            {/* Right Balloon */}
            <div className="balloon_two">
              <img width="100px" src="/images/gift_animation/balloon2.png" alt="Balloon Right" />
            </div>
          </div>

          {/* Rotating Circular Seal Stamp: "HAPPY-BIRTHDAY-" */}
          <div className="cricle">
            <div className="text__cricle">
              {circleLetters.map((char, i) => (
                <span key={i} style={{ transform: `rotate(${i * 24}deg)` }}>
                  {char}
                </span>
              ))}
            </div>
            <span className="center-heart">❤️</span>
          </div>
        </div>
      </div>

      {/* ── Twinkling 4-Point Stars ── */}
      <div className="decorate_star star1" style={{ animationDelay: "2.8s" }} />
      <div className="decorate_star star2" style={{ animationDelay: "3.0s" }} />
      <div className="decorate_star star3" style={{ animationDelay: "3.2s" }} />
      <div className="decorate_star star4" style={{ animationDelay: "3.4s" }} />
      <div className="decorate_star star5" style={{ animationDelay: "3.6s" }} />

      {/* ── Floating Flower Decorations ── */}
      <div className="decorate_flower--one">
        <img width="22" src="/images/gift_animation/decorate_flower.png" alt="Flower 1" />
      </div>
      <div className="decorate_flower--two">
        <img width="22" src="/images/gift_animation/decorate_flower.png" alt="Flower 2" />
      </div>
      <div className="decorate_flower--three">
        <img width="22" src="/images/gift_animation/decorate_flower.png" alt="Flower 3" />
      </div>

      {/* ── Bottom Corner Accents ── */}
      <div className="decorate_bottom">
        <img src="/images/gift_animation/decorate.png" alt="Decorate Corner" width="100" />
      </div>
      <div className="smiley__icon">
        <img src="/images/gift_animation/smiley_icon.png" alt="Smiley" width="100" />
      </div>

      {/* ── Interactive Birthday Letter Popup Modal ── */}
      {isLetterOpen && (
        <div className="box__letter" onClick={handleCloseLetter}>
          <div className="letter__border" onClick={(e) => e.stopPropagation()}>
            <div className="letter">
              <div className="title__letter">
                {letterTitle} {letterTitle && <span className="title-heart">❤️</span>}
              </div>

              <div className="content__letter">
                {/* Left Side of Letter: Heart GIF & Floating Hearts */}
                <div className="left-letter-pane">
                  <img
                    id="heart__letter"
                    className={showLetterGifs ? "animationOp" : ""}
                    src="/images/gift_animation/heart_letter.gif"
                    alt="Cute Heart Animation"
                  />
                  {showLetterHearts && (
                    <>
                      <img className="heart heart_1" src="/images/gift_animation/heart.png" alt="heart" />
                      <img className="heart heart_2" src="/images/gift_animation/heart.png" alt="heart" />
                      <img className="heart heart_3" src="/images/gift_animation/heart.png" alt="heart" />
                      <img className="heart heart_4" src="/images/gift_animation/heart.png" alt="heart" />
                    </>
                  )}
                </div>

                {/* Right Side of Letter: Love GIF, Typed Prose, MewMew Cat */}
                <div className="right-letter-pane">
                  <div className={`love__img ${showLetterGifs ? "animationOp" : ""}`}>
                    <img src="/images/gift_animation/love_img.gif" alt="Love Banner" width="180" />
                  </div>
                  <div className="text__letter">
                    <p>{letterBody}</p>
                  </div>
                  <img
                    id="mewmew"
                    className={showLetterGifs ? "animationOp" : ""}
                    width="80"
                    src="/images/gift_animation/mewmew.gif"
                    alt="Cute MewMew Cat"
                  />
                </div>
              </div>
            </div>

            {/* Modal Close Button (X) */}
            <div className="close" onClick={handleCloseLetter} role="button" aria-label="Close Letter">
              ✕
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Action Bar: Proceed to Gala & Cut Cake ── */}
      <div className="gala-continue-bar">
        <button className="gala-continue-btn" onClick={handleContinue}>
          <span>Enter Birthday Gala & Cut the Cake</span>
          <span className="cake-emoji">🎂👑 ➔</span>
        </button>
      </div>

      {/* ── Scoped Styles Replicating Original Birthday Gift Animation Exactly ── */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Coiny&family=Titan+One&family=Nerko+One&family=Sriracha&family=Dancing+Script:wght@700&display=swap');

        .gift-animation-wrapper {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100dvh;
          min-height: -webkit-fill-available;
          max-height: 100dvh;
          z-index: 10000;
          background-color: #feecea;
          background-image:
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 1) 25%, rgba(255, 255, 255, 1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 1) 75%, rgba(255, 255, 255, 1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 1) 25%, rgba(255, 255, 255, 1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 1) 75%, rgba(255, 255, 255, 1) 76%, transparent 77%, transparent);
          background-size: 80px 80px;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: clamp(6px, 1.2vh, 14px) clamp(10px, 2vw, 20px);
          box-sizing: border-box;
          font-family: 'Outfit', sans-serif;
          opacity: 1;
          transition: opacity 0.45s ease;
        }

        .gift-animation-wrapper button,
        .gift-animation-wrapper a,
        .gift-animation-wrapper [role="button"] {
          cursor: pointer !important;
        }

        .custom-emoji-cursor-follower {
          position: fixed;
          top: -24px;
          left: -24px;
          width: 48px;
          height: 48px;
          pointer-events: none;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
          transition: transform 0.03s ease-out;
        }

        .pink-butterfly-cursor {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          filter: drop-shadow(0 2px 10px rgba(255, 42, 122, 0.85)) drop-shadow(0 0 16px rgba(255, 179, 217, 0.9));
        }
        .flutter-wings {
          animation: butterflyFlutter 0.32s infinite ease-in-out alternate;
          transform-origin: 24px 24px;
        }
        @keyframes butterflyFlutter {
          0% {
            transform: scaleX(1) scaleY(1);
          }
          100% {
            transform: scaleX(0.62) scaleY(1.06);
          }
        }

        .cursor-emoji-glyph {
          font-size: 34px;
          line-height: 1;
          filter: drop-shadow(0 3px 12px rgba(255, 105, 180, 0.85));
          user-select: none;
        }
        .cursor-aura-glow {
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 120, 180, 0.5) 0%, rgba(255, 215, 0, 0.25) 50%, transparent 75%);
          animation: pulseCursorGlow 1.6s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes pulseCursorGlow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.35); opacity: 0.95; }
        }

        /* ── Top Left: Cursor Selector Pill ── */
        .cursor-selector-wrapper {
          position: fixed;
          top: 16px;
          left: 18px;
          z-index: 16000;
        }
        .cursor-selector-btn {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 2.5px solid #333;
          border-radius: 50px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          color: #333;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .cursor-selector-btn:hover {
          transform: scale(1.05);
          background: #ffffff;
        }
        .cursor-current-emoji {
          font-size: 1.15rem;
          filter: drop-shadow(0 1px 4px rgba(255, 105, 180, 0.5));
        }
        .cursor-caret {
          font-size: 0.75rem;
          color: #666;
        }
        .cursor-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 260px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border: 2.5px solid #333;
          border-radius: 18px;
          padding: 10px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 120, 180, 0.25);
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: popDropdown 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popDropdown {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cursor-dropdown-header {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #e0245e;
          padding: 2px 6px 6px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .cursor-emoji-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          max-height: 250px;
          overflow-y: auto;
        }
        .cursor-option-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 12px;
          border: 1.5px solid transparent;
          background: rgba(255, 235, 240, 0.65);
          transition: all 0.15s ease;
          text-align: left;
        }
        .cursor-option-btn:hover {
          background: #ffe3ec;
          border-color: #ff7882;
          transform: translateY(-1px);
        }
        .cursor-option-btn.active {
          background: #ff7882;
          color: #fff;
          border-color: #333;
          box-shadow: 0 3px 8px rgba(255, 120, 130, 0.35);
        }
        .cursor-option-btn.active .option-name {
          color: #fff;
        }
        .option-emoji {
          font-size: 1.15rem;
        }
        .option-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gift-animation-wrapper.exiting {
          opacity: 0;
          pointer-events: none;
        }

        .cursor-hearts-canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 15000;
        }

        .audio-control-btn {
          position: fixed;
          top: 16px;
          right: 18px;
          z-index: 16000;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2.5px solid #333;
          background: #ffffff;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .audio-control-btn:hover {
          transform: scale(1.1);
          background: #feecea;
        }

        /* ── Party Flags ── */
        .flag__birthday {
          width: 100%;
          display: flex;
          justify-content: space-between;
          transform: translateY(-200px);
          animation: translateYFlag 1.2s 0.2s forwards ease-out;
          pointer-events: none;
          max-height: clamp(38px, 6vh, 65px);
        }
        @keyframes translateYFlag {
          to {
            transform: translateY(-10px);
          }
        }
        .flag__birthday .flag__left {
          transform: rotate(-10deg) translate(-20px, 25px);
        }
        .flag__birthday .flag__right {
          transform: rotate(10deg) translate(20px, 25px) scaleX(-1);
        }

        /* ── Content Layout ── */
        .content {
          width: 100%;
          max-width: 1100px;
          flex: 1;
          min-height: 0;
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 3.5vw, 48px);
          padding: 0.3rem 1.2rem;
          box-sizing: border-box;
          z-index: 10;
        }
        .content .left {
          width: 42%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-left: 10px;
        }
        .content .right {
          width: 58%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* ── Happy Birthday Typography ── */
        .title {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Titan One', 'Impact', sans-serif;
          font-size: clamp(2.4rem, 4.5vw, 3.4rem);
          perspective: 1000px;
        }
        .title .happy,
        .title .birthday {
          position: relative;
          text-shadow:
            4px 4px #333,
            -4px 4px #333,
            4px -4px #333,
            -4px -4px #333,
            4px 8px 0 #333;
          font-weight: 900;
          display: flex;
          justify-content: center;
          line-height: 1.1;
          margin: 0;
          letter-spacing: 2px;
        }
        .title .happy {
          color: #ffffff;
        }
        .title .birthday {
          color: #ff7882;
        }
        .title .happy span,
        .title .birthday span {
          transform: translateY(50px);
          opacity: 0;
          display: inline-block;
          animation: txtTranslateY 0.5s forwards ease-out;
        }
        @keyframes txtTranslateY {
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* ── Dropping Party Hat ── */
        .title .hat {
          position: absolute;
          right: 35px;
          top: -350px;
          transform: rotate(-40deg);
          z-index: 5;
          animation: topHat 2s 2.2s forwards ease;
        }
        @keyframes topHat {
          30% {
            top: -30px;
            transform-origin: left;
            transform: rotate(-40deg);
          }
          50%,
          100% {
            top: -30px;
            transform: rotate(0deg);
          }
        }

        /* ── Date of Birth Pill ── */
        .date__of__birth {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background-color: #ff7882;
          border-radius: 50px;
          margin-top: 22px;
          font-family: 'Sriracha', cursive, sans-serif;
          border: 3px solid #333;
          position: relative;
          opacity: 0;
          width: 0px;
          height: 0px;
          animation: dateOfBirth 1.5s 2.4s forwards;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        @keyframes dateOfBirth {
          0% {
            width: 0;
            height: 0;
            opacity: 0;
            transform: translateY(-20px);
          }
          40% {
            width: 380px;
            height: 0px;
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            width: 380px;
            height: 48px;
            opacity: 1;
            transform: translateY(0);
          }
        }
        .date__of__birth .date-text {
          font-weight: bold;
          font-size: 1.15rem;
          color: #ffffff;
          letter-spacing: 0.05em;
        }
        .date__of__birth .star-icon {
          color: #fde047;
          font-size: 1.2rem;
          margin: 0 10px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
        }

        /* ── Click Here Button ── */
        .left .btn {
          transform: scale(0);
          animation: scaleCricle 1.2s 3.4s forwards ease-in-out;
        }
        #btn__letter {
          margin-top: 22px;
          background: linear-gradient(135deg, #e6195e 0%, #c2185b 50%, #880e4f 100%);
          color: #ffffff;
          padding: 10px 28px;
          font-size: 1.15rem;
          border-radius: 50px;
          border: 2.5px solid #ffd700;
          font-family: 'Sriracha', cursive, sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 6px 20px rgba(230, 25, 94, 0.45), 0 0 16px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          font-weight: 800;
          letter-spacing: 0.4px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          animation: clickHereWavy 3.4s ease-in-out infinite;
          animation-delay: 4.4s;
          will-change: transform, box-shadow;
        }

        @keyframes clickHereWavy {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            box-shadow: 0 6px 20px rgba(230, 25, 94, 0.45), 0 0 16px rgba(255, 215, 0, 0.4);
          }
          25% {
            transform: translateY(-3px) rotate(-1.8deg) scale(1.025);
            box-shadow: 0 10px 26px rgba(230, 25, 94, 0.58), 0 0 22px rgba(255, 215, 0, 0.65);
          }
          50% {
            transform: translateY(-1px) rotate(0.4deg) scale(1.01);
            box-shadow: 0 8px 22px rgba(230, 25, 94, 0.5), 0 0 18px rgba(255, 215, 0, 0.5);
          }
          75% {
            transform: translateY(2.5px) rotate(1.8deg) scale(1.025);
            box-shadow: 0 5px 16px rgba(230, 25, 94, 0.4), 0 0 14px rgba(255, 215, 0, 0.35);
          }
        }

        #btn__letter:hover {
          border-color: #ffffff;
          background: linear-gradient(135deg, #ff2a7a 0%, #d81b60 50%, #ad1457 100%);
          color: #ffffff;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 10px 28px rgba(230, 25, 94, 0.7), 0 0 26px rgba(255, 215, 0, 0.8);
        }
        #btn__letter:active {
          transform: scale(0.96);
        }
        .btn-envelope-icon {
          font-size: 1.3rem;
          display: inline-block;
          transition: transform 0.25s ease;
          animation: wiggleEnvelope 2.6s ease-in-out infinite;
          animation-delay: 4.8s;
        }
        @keyframes wiggleEnvelope {
          0%, 80%, 100% { transform: rotate(0deg) scale(1); }
          85% { transform: rotate(-12deg) scale(1.15); }
          90% { transform: rotate(12deg) scale(1.15); }
          95% { transform: rotate(-8deg) scale(1.1); }
        }

        /* ── Right Column: Circular Portrait Frame ── */
        .right .box__account {
          position: relative;
          opacity: 0;
          transform: scale(0.6);
          animation: popBoxImage 0.75s 0.2s forwards cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popBoxImage {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .content .right .image {
          position: relative;
          width: clamp(280px, 42vh, 420px);
          height: clamp(280px, 42vh, 420px);
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 6px solid #ffffff;
          outline: 5px solid #ff7882;
          box-shadow: 0 18px 52px rgba(255, 120, 130, 0.5), 0 0 45px rgba(255, 215, 0, 0.65);
          background: #ffffff;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .content .right .image:hover {
          transform: scale(1.03);
          box-shadow: 0 24px 65px rgba(255, 120, 130, 0.65), 0 0 60px rgba(255, 215, 0, 0.85);
        }
        .content .right .image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          transition: transform 0.5s ease;
        }
        .content .right .image:hover img {
          transform: scale(1.05);
        }

        /* Name Badge at bottom of circle */
        .name {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background-color: #ff7882;
          border-radius: 50px;
          border: 3.5px solid #333;
          padding: 5px 32px;
          font-family: 'Sriracha', cursive, sans-serif;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
          white-space: nowrap;
          z-index: 10;
        }
        .name span {
          font-weight: bold;
          font-size: clamp(1.25rem, 2.1vw, 1.65rem);
          color: #ffffff;
          letter-spacing: 0.05em;
        }
        .heart-icon {
          font-size: 1.35rem;
          animation: scaleHeart 1.2s infinite linear;
          display: inline-block;
        }
        @keyframes scaleHeart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }

        /* Swaying Balloons */
        .right .balloon_one {
          position: absolute;
          top: -45px;
          left: -45px;
          animation: balloon1 2.5s infinite linear;
          pointer-events: none;
        }
        .right .balloon_one img {
          width: clamp(85px, 12vh, 120px);
        }
        @keyframes balloon1 {
          0%, 50%, 100% { transform-origin: bottom right; transform: rotate(0deg); }
          25% { transform-origin: bottom right; transform: rotate(4deg); }
          75% { transform-origin: bottom right; transform: rotate(-4deg); }
        }
        .right .balloon_two {
          position: absolute;
          top: 150px;
          right: -45px;
          z-index: -1;
          transform: rotate(10deg);
          animation: balloon2 2.5s infinite linear;
          pointer-events: none;
        }
        .right .balloon_two img {
          width: clamp(85px, 12vh, 120px);
        }
        @keyframes balloon2 {
          0%, 50%, 100% { transform-origin: bottom left; transform: rotate(10deg); }
          25% { transform-origin: bottom left; transform: rotate(6deg); }
          75% { transform-origin: bottom left; transform: rotate(14deg); }
        }

        /* ── Rotating Circle Stamp: "HAPPY-BIRTHDAY-" ── */
        .cricle {
          position: absolute;
          top: -25px;
          right: 35px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform: scale(0);
          animation: scaleCricle 1.2s 2.8s forwards ease-in-out;
          z-index: 20;
        }
        @keyframes scaleCricle {
          0% { transform: scale(0); }
          50% { transform: scale(1.25); }
          75% { transform: scale(0.85); }
          100% { transform: scale(1); }
        }
        .text__cricle {
          width: 98px;
          height: 98px;
          background-color: #ff7882;
          border-radius: 50%;
          border: 4px solid #333;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          animation: rotateCricle 7s linear infinite;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
        }
        @keyframes rotateCricle {
          to { transform: rotate(360deg); }
        }
        .text__cricle span {
          top: 2px;
          left: 50%;
          position: absolute;
          color: #333333;
          transform-origin: 0 44px;
          font-family: 'Sriracha', cursive, sans-serif;
          text-transform: uppercase;
          font-size: 0.68rem;
          font-weight: 800;
        }
        .center-heart {
          position: absolute;
          font-size: 1.3rem;
          animation: scaleHeart 1.2s infinite linear;
        }

        /* ── Twinkling Stars ── */
        .decorate_star {
          position: absolute;
          transform: scale(0);
          background-color: #333333;
          clip-path: polygon(0 50%, 35% 35%, 50% 0, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%);
          animation: scaleCricle 1s 2.5s forwards ease-in-out, scaleStar 2s 3.5s infinite ease-in-out;
          pointer-events: none;
        }
        .decorate_star.star1 { width: 22px; height: 22px; top: 85px; left: 24%; }
        .decorate_star.star2 { width: 16px; height: 20px; top: 40px; right: 28%; }
        .decorate_star.star3 { width: 16px; height: 16px; top: 42%; left: 54%; }
        .decorate_star.star4 { width: 18px; height: 18px; bottom: 80px; left: 4%; }
        .decorate_star.star5 { width: 17px; height: 19px; bottom: 120px; right: 8%; }
        @keyframes scaleStar {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }

        /* ── Drifting Flowers & Icons ── */
        .decorate_flower--one {
          position: absolute;
          top: 240px;
          left: 45px;
          animation: scaleCricle 1s 2.6s forwards ease-in-out;
          pointer-events: none;
        }
        .decorate_flower--two {
          position: absolute;
          top: 180px;
          left: 48%;
          animation: scaleCricle 1s 2.8s forwards ease-in-out;
          pointer-events: none;
        }
        .decorate_flower--three {
          position: absolute;
          top: 130px;
          right: 18%;
          animation: scaleCricle 1s 3.0s forwards ease-in-out;
          pointer-events: none;
        }
        .decorate_bottom {
          position: absolute;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        .smiley__icon {
          position: absolute;
          bottom: 18px;
          left: 24px;
          width: clamp(45px, 6vw, 70px);
          animation: scaleCricle 1.2s 3.2s forwards ease-in-out;
          pointer-events: none;
          opacity: 0.85;
          z-index: 15;
        }
        .smiley__icon img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* ── Letter Modal ── */
        .box__letter {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          width: 100%;
          height: 100%;
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          box-sizing: border-box;
          animation: fadeInLetter 0.4s ease-out forwards;
        }
        @keyframes fadeInLetter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .letter__border {
          position: relative;
          width: clamp(340px, 65vw, 760px);
          min-height: 440px;
          background-color: #ffffff;
          border-radius: 27px;
          padding: 18px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          animation: popLetter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-sizing: border-box;
        }
        @keyframes popLetter {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .letter__border .close {
          position: absolute;
          right: -12px;
          top: -12px;
          width: 44px;
          height: 44px;
          background-color: #ffffff;
          border: 2.5px solid #333;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          font-weight: 900;
          color: #333;
          font-size: 1.25rem;
          transition: transform 0.2s ease, background-color 0.2s ease;
          z-index: 10;
        }
        .letter__border .close:hover,
        .letter__border .close:active {
          transform: scale(1.12) rotate(90deg);
          background-color: #feecea;
          color: #f61f1f;
        }
        .letter__border .letter {
          width: 100%;
          height: 100%;
          background-color: #fff8e4;
          border-radius: 14px;
          padding: 18px 20px 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .title__letter {
          text-align: center;
          font-family: 'Dancing Script', cursive, serif;
          font-weight: bold;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          color: #333;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .title-heart {
          font-size: 1.4rem;
          animation: scaleHeart 1s infinite linear;
        }
        .content__letter {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 16px;
          margin-top: 8px;
        }
        .left-letter-pane {
          position: relative;
          width: 44%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 3px dashed #daccbf;
          padding-right: 12px;
        }
        #heart__letter {
          opacity: 0;
          width: 100%;
          max-width: 200px;
          object-fit: contain;
          transition: opacity 0.6s ease;
        }
        #heart__letter.animationOp {
          opacity: 1;
        }
        .left-letter-pane .heart {
          position: absolute;
          animation: scaleHeartLetter 1.2s infinite ease-in-out;
        }
        @keyframes scaleHeartLetter {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .heart_1 { top: 15px; left: 15px; width: 22px; }
        .heart_2 { top: 10px; right: 20px; width: 20px; }
        .heart_3 { bottom: 20px; left: 30px; width: 24px; }
        .heart_4 { bottom: 30px; right: 20px; width: 18px; }

        .right-letter-pane {
          position: relative;
          width: 56%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 6px;
        }
        .love__img {
          opacity: 0;
          margin-bottom: 8px;
          transition: opacity 0.6s ease;
        }
        .love__img.animationOp {
          opacity: 1;
        }
        .text__letter {
          font-family: 'Dancing Script', cursive, serif;
          font-size: clamp(1.05rem, 1.6vw, 1.35rem);
          color: #3b1d28;
          line-height: 1.45;
          min-height: 120px;
          font-weight: 700;
        }
        #mewmew {
          opacity: 0;
          align-self: flex-end;
          margin-top: 6px;
          transition: opacity 0.6s ease;
        }
        #mewmew.animationOp {
          opacity: 1;
        }

        /* ── Bottom Action Bar ── */
        .gala-continue-bar {
          margin: 0.35rem auto clamp(8px, 1.5vh, 18px);
          z-index: 30;
          flex-shrink: 0;
        }
        .gala-continue-btn {
          background: linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%);
          color: #18020b;
          border: 3px solid #ffffff;
          padding: clamp(9px, 1.6vh, 13px) clamp(20px, 3.2vw, 34px);
          border-radius: 50px;
          font-size: clamp(0.92rem, 1.7vw, 1.2rem);
          font-weight: 900;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.5), 0 0 25px rgba(255, 215, 0, 0.6);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }
        .gala-continue-btn:hover {
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 14px 38px rgba(245, 158, 11, 0.7), 0 0 35px rgba(255, 215, 0, 0.9);
        }
        .cake-emoji {
          font-size: 1.3rem;
        }

        /* ── Responsive Rules for Mobile (Matching style.css @media 658px) ── */
        @media (max-width: 768px) {
          .flag__birthday .flag__left {
            transform: rotate(-10deg) translate(-110px, 10px);
          }
          .flag__birthday .flag__right {
            transform: rotate(10deg) translate(110px, 10px) scaleX(-1);
          }
          .content {
            flex-direction: column;
            gap: 10px;
            padding: 0.25rem 0.6rem;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto 0;
            width: 100%;
          }
          .content .left {
            width: 100%;
            padding-left: 0;
          }
          .content .right {
            width: 100%;
          }
          .title {
            font-size: 1.65rem;
          }
          .title .hat {
            right: 0;
            top: -20px !important;
            transform: rotate(-20deg);
          }
          .title .hat img {
            width: 70px;
          }
          .date__of__birth {
            margin-top: 8px;
          }
          @keyframes dateOfBirth {
            0% { width: 0; height: 0; opacity: 0; }
            50% { width: 300px; height: 0; opacity: 1; }
            100% { width: 300px; height: 38px; opacity: 1; }
          }
          .date__of__birth .date-text {
            font-size: 0.82rem;
            white-space: nowrap;
          }
          .date__of__birth .star-icon {
            font-size: 0.95rem;
            margin: 0 4px;
          }
          #btn__letter {
            margin-top: 12px;
            font-size: 0.98rem;
            padding: 8px 22px;
          }
          .content .right .image {
            width: clamp(215px, 33vh, 290px);
            height: clamp(215px, 33vh, 290px);
            border-width: 5px;
          }
          .name {
            bottom: -15px;
            padding: 3px 22px;
          }
          .name span {
            font-size: 1.18rem;
          }
          .right .balloon_one {
            top: -25px;
            left: -20px;
          }
          .right .balloon_one img {
            width: 65px !important;
          }
          .right .balloon_two {
            top: 95px;
            right: -20px;
          }
          .right .balloon_two img {
            width: 65px !important;
          }
          .cricle {
            top: -15px;
            right: 15px;
          }
          .text__cricle {
            width: 74px;
            height: 74px;
          }
          .text__cricle span {
            transform-origin: 0 33px;
            font-size: 0.55rem;
          }
          .decorate_star.star1 { left: 10%; top: 40px; }
          .decorate_star.star2 { right: 10%; top: 30px; }
          .decorate_star.star3 { display: none; }
          .decorate_flower--two { display: none; }
          .smiley__icon { display: none; }

          /* Letter Modal Mobile */
          .letter__border {
            width: 95vw;
            padding: 12px;
            min-height: 380px;
            max-height: 88dvh;
            overflow-y: auto;
            margin: auto;
          }
          .content__letter {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .left-letter-pane {
            width: 100%;
            min-height: 120px;
            border-right: none;
            border-bottom: 2px dashed #daccbf;
            padding-bottom: 10px;
          }
          #heart__letter {
            max-width: 110px;
          }
          .right-letter-pane {
            width: 100%;
            padding-left: 0;
            align-items: center;
          }
          .text__letter {
            font-size: 0.96rem;
            text-align: center;
            min-height: auto;
          }

          /* Mobile Top Controls & Continue Button */
          .cursor-selector-wrapper {
            top: 10px !important;
            left: 10px !important;
          }
          .cursor-selector-btn {
            padding: 4px 10px !important;
            font-size: 0.74rem !important;
          }
          .audio-control-btn {
            top: 10px !important;
            right: 10px !important;
            width: 36px !important;
            height: 36px !important;
            font-size: 1rem !important;
          }
          .gala-continue-bar {
            margin: 0.2rem auto 8px !important;
          }
          .gala-continue-btn {
            padding: 8px 18px !important;
            font-size: 0.88rem !important;
            border-width: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}
