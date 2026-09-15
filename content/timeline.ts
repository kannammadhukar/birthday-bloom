// ──────────────────────────────────────────────────────────────
// content/timeline.ts — The Chronicles of Divija: Living Storybook
// ──────────────────────────────────────────────────────────────

export interface MilestoneImage {
  src: string;
  caption: string;
  alt: string;
}

export interface MilestoneEntry {
  chapter: string;
  era: string;
  icon: string;
  title: string;
  epigraph: string;
  storyParagraphs: string[];
  images: [MilestoneImage, MilestoneImage];
  emoji: string;
  side?: "left" | "right";
  stickyNote?: string;
  washiColor?: string;
  // Backward compatibility fields:
  img: string;
  desc: string;
}

const milestonesData: MilestoneEntry[] = [
  {
    chapter: "CHAPTER I",
    era: "THE BEGINNING",
    icon: "🪔",
    title: "A Little Girl with Big Dimples",
    epigraph: "“Before the textbooks and hospital rounds, she was just a little kid with boundless curiosity and a smile that lit up the whole house.”",
    storyParagraphs: [
      "Before the heavy medical books, Divija's story began in a warm Telangana home filled with laughter and bedtime stories. She was a bright, observant girl with an infectious smile and trademark deep cheek dimples.",
      "From playing games with cousins to lighting Diwali diyas, her gentle, caring nature brought quiet joy to the whole family. ✨"
    ],
    images: [
      {
        src: "/images/journey_01_childhood.jpg",
        caption: "Carefree childhood smiles & family warmth ✨",
        alt: "Young Divija smiling in her childhood days"
      },
      {
        src: "/images/journey_01_diwali.jpg",
        caption: "Lighting Diwali diyas with that trademark dimpled smile 🪔✨",
        alt: "Little Divija lighting clay lamps during Diwali"
      }
    ],
    emoji: "👶",
    side: "left",
    stickyNote: "Trademark dimples since day one! That smile was always meant to bring warmth to the world 🥹💛",
    washiColor: "#e5b869",
    img: "/images/journey_01_childhood.jpg",
    desc: "Growing up in a warm Telangana home — full of laughter, festival excitement, and that signature dimpled smile. ✨",
  },
  {
    chapter: "CHAPTER II",
    era: "SR PRIME DAYS",
    icon: "🎒",
    title: "Classroom Lessons & Backbench Laughter",
    epigraph: "“Attentive in the front row for science, but the biggest laughs always came from the backbenches.”",
    storyParagraphs: [
      "At SR Prime School in Karimnagar, Divija was the attentive student in the front row who loved science and kept neat notes. Yet school was never just about books.",
      "From backbench giggles and shared lunchboxes to goofy pranks, she made every day unforgettable. Walking home under the evening sky, she'd hum classic Telugu tunes, dreaming big. 🎒🎶"
    ],
    images: [
      {
        src: "/images/journey_02_schooldays.jpg",
        caption: "SR Prime school days — attentive in class, full of fun 🎒✨",
        alt: "Divija during her SR Prime School Karimnagar days"
      },
      {
        src: "/images/journey_02_classroom.jpg",
        caption: "Classroom lessons, backbench laughs & big dreams ✍️📖",
        alt: "Divija seated at wooden classroom desk with notebook"
      }
    ],
    emoji: "🎒",
    side: "right",
    stickyNote: "SR Prime days! Attentive for science in front, but queen of backbench giggles & canteen snacks 🎒😂",
    washiColor: "#d97757",
    img: "/images/journey_02_schooldays.jpg",
    desc: "At SR Prime School, Karimnagar — listening attentively in class, sharing uncontrollable laughs from the backbenches, and humming favorite Telugu tunes on the walk home. 🎒",
  },
  {
    chapter: "CHAPTER III",
    era: "INTERMEDIATE",
    icon: "📚",
    title: "Botany, Zoology & College Shenanigans",
    epigraph: "“Balancing tough competitive coaching with silly jokes and canteen laughs.”",
    storyParagraphs: [
      "Junior college brought thick Botany and Zoology charts, Organic Chemistry reactions, and nonstop tests. Here, her love for human biology sparked a quiet dream to heal people.",
      "Between heavy lectures, she balanced the pressure with canteen snack runs, silly pranks, and shared jokes — earning top marks while keeping her bright spirit intact. 🌿📚"
    ],
    images: [
      {
        src: "/images/journey_03_biolab.jpg",
        caption: "Biology lab records & discovering the dream 🔬✨",
        alt: "Divija in junior college biology science lab next to compound microscope"
      },
      {
        src: "/images/journey_03_campus.jpg",
        caption: "Intermediate college days — balancing studies & fun 🌿📖",
        alt: "Divija on junior college campus with Botany textbook"
      }
    ],
    emoji: "📖",
    side: "left",
    stickyNote: "Thick Botany charts, silly canteen jokes, and the quiet spark where the medical dream was born 🌿🩺",
    washiColor: "#5b9e76",
    img: "/images/journey_03_biolab.jpg",
    desc: "Heavy textbooks, biology lab records, and endless tests — balanced with silly banter, canteen breaks, and quietly setting her sights on the medical dream. 💪",
  },
  {
    chapter: "CHAPTER IV",
    era: "THE LONG TERM GRIND",
    icon: "🌙",
    title: "Tension, High Pressure & Studying Day and Night",
    epigraph: "“When the seat slipped away by a whisper, she faced the tension head-on — studying through the stress until she won.”",
    storyParagraphs: [
      "Missing the government MBBS seat by just a few marks was heartbreaking. Choosing 'Long Term' meant facing a grueling year of high tension, non-stop pressure, and endless question papers.",
      "Her desk was a battleground: solving question banks by day, and studying past 1 AM with hot chai and vintage melodies playing in her earphones. With sheer grit, she refused to give up until the seat was hers. ☀️🌙💪"
    ],
    images: [
      {
        src: "/images/journey_04_day_study.jpg",
        caption: "Long Term pressure — tense days over Biology & Chemistry ☀️📚",
        alt: "Divija deeply focused and tense while studying during Long Term preparation"
      },
      {
        src: "/images/journey_04_midnight_tunes.jpg",
        caption: "Midnight grind — earphones, chai & fighting for the seat 🌙☕",
        alt: "Divija studying late at night with earphones, notes, highlighters and anatomy charts"
      }
    ],
    emoji: "🌙",
    side: "right",
    stickyNote: "Midnight chai, endless highlighters, earphones plugged in, fighting through the pressure. Pure grit! 💪🔥",
    washiColor: "#4f7da8",
    img: "/images/journey_04_day_study.jpg",
    desc: "The heartbreak of missing the seat, followed by a year of intense pressure, tension, and round-the-clock studying. She fought through the stress and earned her dream. 💪✨",
  },
  {
    chapter: "CHAPTER V",
    era: "A NEW CHAPTER",
    icon: "🏛️",
    title: "Entering KMC Warangal & The White Coat",
    epigraph: "“Walking through the stone archways of Kakatiya Medical College — every sacrifice redeemed.”",
    storyParagraphs: [
      "When the rank list arrived, every sacrifice was redeemed. Divija walked proudly through the iconic heritage gates of Kakatiya Medical College (KMC) in Warangal.",
      "Donning that white coat and stethoscope was a dream fulfilled. Beyond anatomy labs, she thrived — making lifelong friends, laughing through marathon study nights, and exploring Warangal. 🏛️🩺"
    ],
    images: [
      {
        src: "/images/journey_05_kmc_firstday.jpg",
        caption: "First steps into KMC Warangal — white coat & Anatomy 🏛️🩺",
        alt: "Divija on her first day of MBBS on the campus walkway of KMC Warangal"
      },
      {
        src: "/images/journey_05_whitecoat.jpg",
        caption: "That proud white coat moment in the corridors of KMC 🩺✨",
        alt: "Divija holding her stethoscope in the corridors of KMC"
      }
    ],
    emoji: "🏛️",
    side: "left",
    stickyNote: "The iconic KMC Warangal gates & that crisp white coat! Tears of pride turned to pure joy 🏛️🩺🤍",
    washiColor: "#a35c82",
    img: "/images/journey_05_kmc_firstday.jpg",
    desc: "Walking through the gates of KMC Warangal — the white coat ceremony, new friendships, anatomy classes, and doing silly, fun stuff across campus corridors. 🌅",
  },
  {
    chapter: "CHAPTER VI",
    era: "TODAY · 4TH YEAR MBBS",
    icon: "🩺",
    title: "4th Year MBBS — A Future Doctor with That Constant Smile",
    epigraph: "“Not graduated yet, but on the threshold — learning the art of healing while staying her same silly, wonderful self.”",
    storyParagraphs: [
      "Today, Divija is in her 4th year of MBBS at KMC Warangal. Not yet graduated, she lives the intense life of a final-year medico: pediatric postings, ward rounds, and university exam prep.",
      "Yet she's still the same fun-loving soul — pulling hostel pranks with roomies Sai Prathima and Bhavana, dressing up for college fests, and lighting up every room. Almost at the finish line! 🩺👶💛✨"
    ],
    images: [
      {
        src: "/images/photo_18.jpg",
        caption: "4th Year pediatric clinical postings — gentle care for tiny smiles 🩺👶💕",
        alt: "Divija during 4th year MBBS pediatric clinical postings in hospital"
      },
      {
        src: "/images/photo_25.jpg",
        caption: "Still the same sweet, traditional soul at heart 🌺✨",
        alt: "Divija in traditional festive attire on temple steps"
      }
    ],
    emoji: "🩺",
    side: "right",
    stickyNote: "4th Year MBBS! Medico Divija, our best friend, sister, and forever coach 👑🎂❤️",
    washiColor: "#d4af37",
    img: "/images/photo_18.jpg",
    desc: "4th year of MBBS at KMC — clinical ward postings, hospital cases, and exam prep, while still making roomies laugh and staying true to her fun, down-to-earth self. 🌿💛",
  },
];

export default milestonesData;
