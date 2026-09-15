"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import milestonesData from "@/content/timeline";

interface LoveStoryTemplate {
  id: number;
  title: string;
  subtitle: string;
  romanticTheme: string;
  image: string;
  colors: string[];
  badges: string[];
  vibe: string;
  keyFeatures: string[];
  sampleQuote: string;
  sampleChapterTitle: string;
}

const templates: LoveStoryTemplate[] = [
  {
    id: 1,
    title: "The Princess & The Starlight",
    subtitle: "Enchanted Fairytale Love Storybook",
    romanticTheme: "Purple velvet bed with twinkling fairy lights, falling pink rose petals, and gold heart locket bookmark",
    image: "/templates/romantic_fairytale.jpg",
    colors: ["#2b0618", "#f3e5ab", "#ffb6c1", "#1a0410"],
    badges: ["Fairy Lights ✨", "Rose Petals 🌹", "Heart Locket 💛", "Fairytale Font"],
    vibe: "Magical Disney / Pixar royal romance. Feels like an enchanted open fairytale book celebrating the most beautiful girl in the kingdom.",
    keyFeatures: [
      "Twinkling golden fairy lights border wrapping around the book",
      "Falling soft pink rose petals with subtle floating animation",
      "Gilded fairytale chapter header with illuminated golden drop-cap (𝕺)",
      "Polaroid photos mounted with gold foil washi tape and floral vine margins",
      "Draped burgundy silk ribbon with a 3D gold heart locket charm",
    ],
    sampleQuote: "“Once upon a time, under a starlit sky, a girl with dimples and a pure heart lit up an entire universe...”",
    sampleChapterTitle: "✦ CHAPTER I · THE PRINCESS & THE STARLIGHT ✦",
  },
  {
    id: 2,
    title: "Our Love Story",
    subtitle: "Candlelit Rose & Wax Seal Scrapbook",
    romanticTheme: "Deep violet satin, flickering golden candlelight, dried red rose petals, and gold heart-clipped polaroids",
    image: "/templates/romantic_rose_scrapbook.jpg",
    colors: ["#1c0414", "#d4af37", "#8b0000", "#f5ecd7"],
    badges: ["Candlelit Aura 🕯️", "Heart Paperclips 📎", "Wax Seal 💌", "Deckled Parchment"],
    vibe: "Deeply intimate, emotional, and timeless. Reads like a treasured personal love diary filled with handwritten vows and memories.",
    keyFeatures: [
      "Vintage deckled-edge parchment with warm candlelight glow",
      "Polaroid memories pinned with delicate golden heart-shaped paperclips",
      "Folded romantic love letter titled 'My Dearest Divija...' with wax seal stamped with a golden heart",
      "Scattered dried rose petals and pressed botanicals across the page crease",
      "Tied rustic golden twine ribbon along the spine fold",
    ],
    sampleQuote: "“My love... forever grateful that your smile lights up my entire world. Every heartbeat writes your name...”",
    sampleChapterTitle: "✦ CHAPTER I · OUR BEAUTIFUL BEGINNING ✦",
  },
  {
    id: 3,
    title: "A Galaxy of Her",
    subtitle: "Cosmic Romance & Stardust Codex",
    romanticTheme: "Obsidian cosmic nebula, glowing golden constellation lines, and floating stardust surrounding her smile",
    image: "/templates/template2.jpg",
    colors: ["#090212", "#ffd700", "#a855f7", "#ffffff"],
    badges: ["Constellations 🌌", "Glowing Star Trails ⭐", "Gold Dust ✨", "Cosmic Astrological"],
    vibe: "Ethereal, grand cosmic love. Divija's life milestones form a glowing constellation in the midnight universe.",
    keyFeatures: [
      "Interactive golden stardust particles that follow touch and cursor",
      "Constellation lines linking her 6 life chapters like sacred stars in the sky",
      "Luminous polaroids that glow with soft violet and gold halos",
      "Deep obsidian pages with illuminated celestial drop-caps",
      "Golden zodiac & moon phase charms marking each milestone",
    ],
    sampleQuote: "“In a galaxy of a billion burning stars, hers was the light that made the universe feel like home.”",
    sampleChapterTitle: "✦ CHAPTER I · THE STAR THAT BLESSED THE EARTH ✦",
  },
  {
    id: 4,
    title: "The Doctor & Her Dimples",
    subtitle: "Sweet Medical Romance Keepsake",
    romanticTheme: "Royal plum velvet with a gold stethoscope shaped into a heart, cute band-aid washi tapes, and canteen memories",
    image: "/templates/template3.jpg",
    colors: ["#2d071c", "#e5c07b", "#fecdd3", "#38bdf8"],
    badges: ["Doctor Stethoscope 🩺", "Cute Band-Aids 🩹", "Dimple Notes 💛", "KMC Memories 🌅"],
    vibe: "Tender, proud, and playful. Celebrates her brilliant MBBS medical journey while cherishing her irresistible sweetness.",
    keyFeatures: [
      "Gold stethoscope heart crest wrapping the chapter title",
      "Cute pastel band-aid washi tapes holding candid hospital and hostel photos",
      "Pinned yellow memo note: 'Prescription: Lifetime of smiles and zero stress 🩺💛'",
      "KMC Warangal campus breeze animations with warm nostalgic Polaroid tilts",
      "Handwritten margin notes from loved ones cheering for Medico Divija",
    ],
    sampleQuote: "“She is healing hearts with medicine, but she conquered ours with just one dimpled smile.”",
    sampleChapterTitle: "✦ CHAPTER I · A LITTLE GIRL WITH A HEALING HEART ✦",
  },
  {
    id: 5,
    title: "The Rani of Warangal",
    subtitle: "Deccan Palace Royal Heritage Love Story",
    romanticTheme: "Royal purple silk bolster pillow, antique temple gold carvings, zari borders, and warm diya flame auras",
    image: "/templates/template5.jpg",
    colors: ["#1c0316", "#e5a93b", "#8b0000", "#faf5e8"],
    badges: ["Temple Gold 🏛️", "Diya Glow 🪔", "Zari Borders 🏵️", "Telugu Royalty 👑"],
    vibe: "Majestic, traditional Telugu royal romance. Honors Telangana culture, traditional sarees, and the queenly beauty of Divija.",
    keyFeatures: [
      "Book rests on a rich purple embroidered velvet bolster cushion",
      "Antique South Indian temple gold filigree arch framing her festive portraits",
      "Golden diya oil lamp flickers gently beside the open spread",
      "Ornate zari embroidery borders inspired by royal Kanjeevaram silk",
      "Royal Kakatiya court decree crest with Telugu-English bilingual flourishes",
    ],
    sampleQuote: "“Like a princess stepping onto palace steps, her elegance shines with the quiet majesty of a thousand diyas.”",
    sampleChapterTitle: "✦ CHAPTER I · THE BIRTH OF OUR TELANGANA PRINCESS ✦",
  },
  {
    id: 6,
    title: "Love Letters & Lavender",
    subtitle: "Tufted Velvet Boudoir Memory Box",
    romanticTheme: "Quilted purple velvet box with crystal buttons, pressed dried lavender sprigs, and folding love letters",
    image: "/templates/template10.jpg",
    colors: ["#28071e", "#f1c40f", "#e8b4b8", "#fdfbf7"],
    badges: ["Tufted Velvet 🎀", "Dried Lavender 🪻", "Wax Seal 💌", "Crystal Buttons 💎"],
    vibe: "Extremely romantic and tactile. Like opening a secret, precious love treasure box kept on a bedside table.",
    keyFeatures: [
      "3D diamond-tufted purple velvet casing with embedded crystal studs",
      "Pressed fragrant lavender sprig tied with gold thread",
      "Gold foil corner protectors on antique ivory pages",
      "Interactive fold-out love letters that expand when clicked",
      "Sweet handwritten memories and secret inside jokes tucked into vintage photo corners",
    ],
    sampleQuote: "“Every dried flower, every photo, every secret note in this box holds a memory of why you are so precious to me.”",
    sampleChapterTitle: "✦ CHAPTER I · THE DAY YOU ENTERED OUR WORLD ✦",
  },
  {
    id: 7,
    title: "The Butterfly Effect of You",
    subtitle: "Enchanted Mint & Gold Floral Romance",
    romanticTheme: "Deep forest plum, glowing gold botanical vines, blooming roses, and a persistent 3D mint-green butterfly",
    image: "/templates/template8.jpg",
    colors: ["#180415", "#d4af37", "#6ee7b7", "#fef3c7"],
    badges: ["3D Butterfly 🦋", "Golden Vines 🌿", "Blooming Petals 🌸", "Persistent Flight"],
    vibe: "Romantic, whimsical, and heartwarming. Celebrates how knowing Divija brought colors and joy into everyone's life.",
    keyFeatures: [
      "Persistent mint-green 3D butterfly fluttering smoothly across page turns",
      "Glowing golden botanical vines wrapping page margins that illuminate on hover",
      "Delicate cherry blossoms and pastel floral pins holding polaroids",
      "Interactive page-curl effect simulating real luxury art paper",
      "Warm golden sunshine rays emanating from the spine crease",
    ],
    sampleQuote: "“Just like a gentle butterfly landing on a quiet blossom, your warmth changed everything around you forever.”",
    sampleChapterTitle: "✦ CHAPTER I · THE SWEETEST BLOOM IN THE GARDEN ✦",
  },
  {
    id: 8,
    title: "Midnight Cafe & Polaroid Love",
    subtitle: "Vintage Retro Romance Scrapbook",
    romanticTheme: "Warm café bokeh, 35mm film strips, handwritten scribble captions, and golden hour nostalgia",
    image: "/templates/template6.jpg",
    colors: ["#200918", "#c5a059", "#fed7aa", "#f3e8ff"],
    badges: ["35mm Film 🎞️", "Retro Polaroid 📸", "Handwritten Scribbles ✍️", "Café Lights ☕"],
    vibe: "Cozy, cinematic, retro romance. Like reminiscing over late-night coffee, campus walks, and endless candid laughter.",
    keyFeatures: [
      "Authentic 35mm film perforation strips holding consecutive candid smiles",
      "Handwritten black ink cursive captions with spontaneous exclamation marks",
      "Warm golden hour photo filter toggle for romantic vintage warmth",
      "Taped postcard souvenirs with postage cancellation stamps",
      "Playful stickers: cherries 🍒, coffee cup ☕, heart sunglasses 🕶️",
    ],
    sampleQuote: "“Some memories never fade — the late-night canteen laughs, the crazy bus rides, and that smile in the rearview mirror.”",
    sampleChapterTitle: "✦ CHAPTER I · SUNSHINE & CAREFREE DAYS ✦",
  },
  {
    id: 9,
    title: "The Diamond Solitaire",
    subtitle: "Haute-Couture Gala Romance Portfolio",
    romanticTheme: "Minimalist obsidian marble, razor-sharp 24K gold bevels, and micro-pavé diamond trims around her portraits",
    image: "/templates/template9.jpg",
    colors: ["#0b0309", "#e2b86d", "#ffffff", "#3b0821"],
    badges: ["Cartier Style 💎", "Razor Gold Bevels 👑", "Pavé Diamonds ✨", "High-Fashion Editorial"],
    vibe: "Ultra-luxury high-fashion gala elegance. Clean, grand, and breathtaking — treating Divija like the queen she is.",
    keyFeatures: [
      "Deep obsidian velvet background with high-contrast razor gold borders",
      "Micro-pavé diamond frame shimmer effect when hovering over portraits",
      "Cinzel Decorative and Cormorant Garamond luxury gala typography",
      "Generous royal whitespace with pristine editorial balance",
      "Polished gold foil bookmark tag indicating chapter milestones",
    ],
    sampleQuote: "“She walks in beauty like the night of cloudless climes and starry skies. True royalty needs no crown.”",
    sampleChapterTitle: "✦ CHAPTER I · AN UNFORGETTABLE ENTRANCE ✦",
  },
  {
    id: 10,
    title: "Forever & Always",
    subtitle: "Interactive Love Letter & Memory Lock Diary",
    romanticTheme: "An openable interactive love envelope, secret flip-over polaroids, and heart wax seals with confetti pops",
    image: "/templates/romantic_rose_scrapbook.jpg",
    colors: ["#24051a", "#ffd166", "#ef476f", "#f8f9fa"],
    badges: ["Interactive Envelope 💌", "Flip-over Photos 🔄", "Heart Confetti 🎉", "Secret Audio Voice 🎙️"],
    vibe: "Deeply interactive and fun! Allows Divija to click polaroids to reveal secret love messages on the back.",
    keyFeatures: [
      "Flip-card polaroids: clicking any photo spins it 180° to reveal a secret handwritten message on the back!",
      "Interactive folded love envelope: click to break the wax seal and reveal a personalized love letter!",
      "Playful heart confetti burst when opening new chapters",
      "Built-in audio player button to play sweet background tunes or voice notes",
      "Signature love stamp at the bottom: 'Made with endless love for Divija ❤️'",
    ],
    sampleQuote: "“Flip this photo to see the secret note... You are, and will always be, the brightest part of our lives.”",
    sampleChapterTitle: "✦ CHAPTER I · THE STORY WRITTEN IN THE STARS ✦",
  },
];

export default function StoryTemplatesPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedId) || templates[0];
  const sampleChapter = milestonesData[0]; // Chapter 1

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#080305] text-[#fbf7ee] font-sans pb-24 selection:bg-[#d4af37]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#7a1843]/20 via-[#400826]/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#380927]/25 via-[#230417]/15 to-transparent rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-5 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e0414] border border-[#d4af37]/30 text-[#f5d77f] hover:bg-[#2e0720] hover:border-[#d4af37] transition text-sm font-medium"
          >
            <span>← Back to Divija&apos;s Birthday Universe</span>
          </Link>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-[#d4af37]/80 font-serif">
              Royal Design Showcase
            </span>
            <p className="text-xs text-[#d4af37]/50">10 Romantic Love Storybook Templates</p>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#f5d77f] text-xs uppercase tracking-widest mb-4">
            <span>✨ Divija&apos;s Royal Storybook Collection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#f5d77f] to-[#e17055] mb-4">
            A Beautiful Girl&apos;s Love Story
          </h1>
          <p className="text-base sm:text-lg text-[#e0cfbe] font-light leading-relaxed">
            Choose from 10 romantic, breathtaking storybook styles crafted to celebrate Divija. Each template seamlessly matches the website&apos;s dark purple velvet and 24K gold cosmic gala palette.
          </p>
        </div>

        {/* Selected Template Spotlight */}
        <div className="mb-14 bg-gradient-to-b from-[#1c0412]/90 to-[#0f020a]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#d4af37]/15 to-transparent rounded-bl-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Render Preview */}
            <div className="lg:col-span-6 relative group">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-2xl bg-black">
                <Image
                  src={selectedTemplate.image}
                  alt={selectedTemplate.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#f5d77f]">
                  <span className="font-serif font-semibold tracking-wider">
                    Template #{selectedTemplate.id} Reference Render
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/60 border border-[#d4af37]/40 backdrop-blur-md">
                    Photorealistic 8K Concept
                  </span>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#d4af37]/70 font-serif">Palette:</span>
                <div className="flex items-center gap-2">
                  {selectedTemplate.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Template Information & Details */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTemplate.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f] font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#fce8b2] mb-1">
                  Template {selectedTemplate.id}: {selectedTemplate.title}
                </h2>
                <p className="text-sm font-serif italic text-[#d4af37] mb-4">
                  {selectedTemplate.subtitle}
                </p>

                <p className="text-sm text-[#e6d5c3] leading-relaxed mb-5">
                  {selectedTemplate.vibe}
                </p>

                <div className="bg-[#240618]/60 border border-[#d4af37]/20 rounded-xl p-4 mb-5">
                  <p className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2 font-serif">
                    Key Features in this Template:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#e0cfbe]">
                    {selectedTemplate.keyFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#d4af37] mt-0.5">✦</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sample Poetic Quote */}
                <div className="border-l-2 border-[#d4af37] pl-3 py-1 mb-6 italic text-xs text-[#fce8b2]/90">
                  {selectedTemplate.sampleQuote}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => handleSelect(selectedTemplate.id)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-[#1a0410] font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition"
                >
                  {copiedId === selectedTemplate.id ? "✓ Template Selected!" : `I Choose Template ${selectedTemplate.id}`}
                </button>
                <span className="text-xs text-[#d4af37]/70">
                  (Reply in chat with &quot;Template {selectedTemplate.id}&quot; to apply)
                </span>
              </div>
            </div>
          </div>

          {/* Live Mockup Preview with Divija's Real Chapter 1 Content */}
          <div className="mt-10 pt-8 border-t border-[#d4af37]/25">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-serif font-bold">
                Live Layout Mockup Preview: How Divija&apos;s Chapter 1 Looks in Template #{selectedTemplate.id}
              </span>
              <span className="text-xs text-[#d4af37]/60">Authentic 2-Page Spread</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#16030e] border border-[#d4af37]/30 rounded-2xl p-6 relative overflow-hidden shadow-inner">
              {/* Left Page (Photos) */}
              <div className="bg-[#fcf8f0] text-[#2b0618] rounded-xl p-5 shadow-lg border border-[#e8d7b8] flex flex-col justify-between min-h-[300px] relative">
                <div className="absolute top-2 right-3 text-xs opacity-70">🌹 💛 🍒</div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#8b0000] uppercase mb-3">
                    MEMORIES OF DIVIJA · CHILDHOOD WARMTH
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="relative aspect-[4/5] rounded-md overflow-hidden border-2 border-white shadow-md rotate-[-2deg]">
                      <Image
                        src={sampleChapter.images[0].src}
                        alt="Divija Childhood"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-0 inset-x-2 h-3 bg-[#d4af37]/70 rotate-[-4deg]" />
                    </div>
                    <div className="relative aspect-[4/5] rounded-md overflow-hidden border-2 border-white shadow-md rotate-[3deg]">
                      <Image
                        src={sampleChapter.images[1].src}
                        alt="Divija Diwali"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-0 inset-x-2 h-3 bg-[#f48fb1]/70 rotate-[3deg]" />
                    </div>
                  </div>
                  <p className="text-[11px] italic font-serif text-center text-[#591d28]">
                    &ldquo;{sampleChapter.images[0].caption}&rdquo;
                  </p>
                </div>
                <div className="text-[10px] text-right font-serif text-[#8b0000]/60">Page 1</div>
              </div>

              {/* Right Page (Story Prose) */}
              <div className="bg-[#fcf8f0] text-[#2b0618] rounded-xl p-5 shadow-lg border border-[#e8d7b8] flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase mb-1">
                    {selectedTemplate.sampleChapterTitle}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#2b0618] mb-2">
                    {sampleChapter.title}
                  </h3>
                  <p className="text-xs italic text-[#78350f] mb-3 border-l-2 border-[#d4af37] pl-2 leading-relaxed">
                    {sampleChapter.epigraph}
                  </p>
                  <p className="text-xs leading-relaxed text-[#3f1622]">
                    <span className="float-left text-2xl font-serif font-bold text-[#b45309] mr-1.5 leading-none">
                      L
                    </span>
                    {sampleChapter.storyParagraphs[0]}
                  </p>
                </div>
                <div className="mt-4 p-2 bg-[#fffbeb] border border-[#fde68a] rounded text-[11px] text-[#92400e] flex items-center gap-2">
                  <span>💌</span>
                  <span>{sampleChapter.stickyNote}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Templates Grid Browser */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fce8b2] mb-2">
            Browse All 10 Love Story Templates
          </h2>
          <p className="text-sm text-[#d4af37]/80 mb-6">
            Click on any card to spotlight its visual render, specifications, and live Chapter 1 mockup preview above.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const isCurrent = tpl.id === selectedId;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                  className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 relative border flex flex-col justify-between ${
                    isCurrent
                      ? "bg-[#250518] border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.3)] scale-[1.02]"
                      : "bg-[#14030d]/80 border-[#d4af37]/25 hover:border-[#d4af37]/60 hover:bg-[#1a0412]"
                  }`}
                >
                  <div>
                    {/* Card Image */}
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-white/10">
                      <Image
                        src={tpl.image}
                        alt={tpl.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 border border-[#d4af37]/50 text-[10px] font-serif text-[#f5d77f]">
                        #{tpl.id}
                      </div>
                    </div>

                    {/* Card Info */}
                    <h3 className="text-lg font-serif font-bold text-[#fce8b2] mb-0.5">
                      {tpl.title}
                    </h3>
                    <p className="text-xs font-serif italic text-[#d4af37] mb-2">
                      {tpl.subtitle}
                    </p>
                    <p className="text-xs text-[#d5c4b3] line-clamp-2 leading-relaxed mb-3">
                      {tpl.vibe}
                    </p>
                  </div>

                  {/* Footer with Colors & Button */}
                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/20">
                      <div className="flex items-center gap-1.5">
                        {tpl.colors.map((col, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(tpl.id);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                          isCurrent
                            ? "bg-[#d4af37] text-[#1a0410] font-bold"
                            : "bg-[#250518] text-[#f5d77f] border border-[#d4af37]/30 hover:bg-[#d4af37] hover:text-[#1a0410]"
                        }`}
                      >
                        {isCurrent ? "Selected ✓" : "Preview"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
