export interface Track {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  duration?: string;
  thumbnail: string;
  genre?: string;
  isCustom?: boolean;
}

export type ZanophyMood = "random" | "jazz";

export interface MoodMeta {
  id: ZanophyMood;
  name: string;
  tagline: string;
  sub: string;
  badge: string;
  icon: string;
  color: string;
  asciiArt: string;
}

export const RANDOM_PLAYLIST: Track[] = [
  {
    id: "random-1",
    title: "Apocalypse",
    artist: "Cigarettes After Sex",
    videoId: "DdI598gKkKw",
    duration: "4:51",
    thumbnail: "https://img.youtube.com/vi/DdI598gKkKw/hqdefault.jpg",
    genre: "Dream Pop / Ambient"
  },
  {
    id: "random-2",
    title: "Idea 17",
    artist: "Gibran Alcocer",
    videoId: "oyVyAulO4_E",
    duration: "2:04",
    thumbnail: "https://img.youtube.com/vi/oyVyAulO4_E/hqdefault.jpg",
    genre: "Neo-Classical Piano"
  },
  {
    id: "random-3",
    title: "\u0645\u064e\u062a\u064e\u0649 \u064a\u064e\u0627 \u0643\u0650\u0631\u064e\u0627\u0645\u064e \u0627\u0644\u062d\u064e\u064a\u0650\u0651 \u0639\u064e\u064a\u0652\u0646\u0650\u064a \u062a\u064e\u0631\u064e\u0627\u0643\u064f\u0645\u064f",
    artist: "VoxMind Music",
    videoId: "FQHv-wZrxEw",
    duration: "4:20",
    thumbnail: "https://img.youtube.com/vi/FQHv-wZrxEw/hqdefault.jpg",
    genre: "Acoustic Sufi Fusion"
  },
  {
    id: "random-4",
    title: "dead end",
    artist: "Azure",
    videoId: "vQ1m-3JSMzY",
    duration: "1:55",
    thumbnail: "https://img.youtube.com/vi/vQ1m-3JSMzY/hqdefault.jpg",
    genre: "Drift Phonk"
  },
  {
    id: "random-5",
    title: "Indigo Night",
    artist: "Tamino",
    videoId: "Ywj5305omOQ",
    duration: "4:15",
    thumbnail: "https://img.youtube.com/vi/Ywj5305omOQ/hqdefault.jpg",
    genre: "Indie Rock / Oud"
  },
  {
    id: "random-6",
    title: "Bad Timing",
    artist: "We Are Jazz",
    videoId: "cwZRBQWZRno",
    duration: "3:44",
    thumbnail: "https://img.youtube.com/vi/cwZRBQWZRno/hqdefault.jpg",
    genre: "Midnight Jazz"
  },
  {
    id: "random-7",
    title: "Mali Mali \u0627\u0644\u0634\u064e\u0651\u0645\u0652\u0639\u064e\u0629 | Moroccan Gnawa x Desert Blues x Chaabi World Fusion BY  BeatAddict 2025",
    artist: "BeatAddict",
    videoId: "ymxHLSvyQVU",
    duration: "5:19",
    thumbnail: "https://img.youtube.com/vi/ymxHLSvyQVU/hqdefault.jpg",
    genre: "Desert Blues / Gnawa"
  },
  {
    id: "random-8",
    title: "El Madani",
    artist: "CHEMSOU Freeklane",
    videoId: "JT73KPMEl9A",
    duration: "4:41",
    thumbnail: "https://img.youtube.com/vi/JT73KPMEl9A/hqdefault.jpg",
    genre: "Maghreb Folk Fusion"
  },
  {
    id: "random-9",
    title: "SOMETHING FOR YOU",
    artist: "TXDO",
    videoId: "zobWUE5Ik-A",
    duration: "3:25",
    thumbnail: "https://img.youtube.com/vi/zobWUE5Ik-A/hqdefault.jpg",
    genre: "Cyberpunk Wave"
  },
  {
    id: "random-10",
    title: "Lapay",
    artist: "Bo9al",
    videoId: "nBqPu6XBJ40",
    duration: "2:37",
    thumbnail: "https://img.youtube.com/vi/nBqPu6XBJ40/hqdefault.jpg",
    genre: "Late Night Hip-Hop"
  },
  {
    id: "random-11",
    title: "Habibi",
    artist: "Tamino",
    videoId: "5mjDZv4hJuk",
    duration: "5:07",
    thumbnail: "https://img.youtube.com/vi/5mjDZv4hJuk/hqdefault.jpg",
    genre: "Indie Rock / Oud"
  },
  {
    id: "random-12",
    title: "Radiohead - Creep (Acoustic Cover by wolfy)",
    artist: "wolfytheordinaryboo",
    videoId: "3aqeo8cI-04",
    duration: "4:57",
    thumbnail: "https://img.youtube.com/vi/3aqeo8cI-04/hqdefault.jpg",
    genre: "Classic / Acoustic Rock"
  },
  {
    id: "random-13",
    title: "Sweet Disposition (a moment, a love)",
    artist: "Lost Frequencies",
    videoId: "MDe979H7LME",
    duration: "3:33",
    thumbnail: "https://img.youtube.com/vi/MDe979H7LME/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-14",
    title: "Nothing Compares 2 U",
    artist: "Sin\u00e9ad O'Connor",
    videoId: "BqXCpmHPss8",
    duration: "4:41",
    thumbnail: "https://img.youtube.com/vi/BqXCpmHPss8/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-15",
    title: "bye (slowed)",
    artist: "Altare",
    videoId: "7Xqon20TlH4",
    duration: "3:26",
    thumbnail: "https://img.youtube.com/vi/7Xqon20TlH4/hqdefault.jpg",
    genre: "Dream Pop / Ambient"
  },
  {
    id: "random-16",
    title: "SCORPIONS-when the smoke is going down(original)",
    artist: "spacchiusu78",
    videoId: "akUJ-Cd0hxw",
    duration: "3:52",
    thumbnail: "https://img.youtube.com/vi/akUJ-Cd0hxw/hqdefault.jpg",
    genre: "Classic / Acoustic Rock"
  },
  {
    id: "random-17",
    title: "\u0627\u0644\u0634\u0627\u0628 T A O U S - \u062d\u0645\u0651\u0627\u0645 \u0627\u0644\u0632\u0651\u0627\u0644\u0650\u0763\u064a\u0646",
    artist: "C H E B . \u0627\u0644\u0634\u0627\u0628",
    videoId: "T8ly6Y7imhg",
    duration: "3:57",
    thumbnail: "https://img.youtube.com/vi/T8ly6Y7imhg/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-18",
    title: "Late night feelings",
    artist: "Mylesxiety",
    videoId: "wXH3ivPtIQw",
    duration: "2:06",
    thumbnail: "https://img.youtube.com/vi/wXH3ivPtIQw/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-19",
    title: "Are You All Good?",
    artist: "breathe.",
    videoId: "20iyXWrCvQo",
    duration: "3:12",
    thumbnail: "https://img.youtube.com/vi/20iyXWrCvQo/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-20",
    title: "Inside Your Soul",
    artist: "CharFutur",
    videoId: "7ZjOPTIurFY",
    duration: "4:30",
    thumbnail: "https://img.youtube.com/vi/7ZjOPTIurFY/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-21",
    title: "Tell Me Why (James Carter Extended Remix)",
    artist: "Supermode",
    videoId: "kVJTEaUJq2A",
    duration: "3:38",
    thumbnail: "https://img.youtube.com/vi/kVJTEaUJq2A/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-22",
    title: "Ghostly Kisses - The City Holds My Heart ( Remix )",
    artist: "r4prod",
    videoId: "UKPU-TK_dtY",
    duration: "4:12",
    thumbnail: "https://img.youtube.com/vi/UKPU-TK_dtY/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-23",
    title: "KAWTAR - GHANILI [\ud835\udc94\ud835\udc8d\ud835\udc90\ud835\udc98\ud835\udc86\ud835\udc85 + \ud835\udc93\ud835\udc86\ud835\udc97\ud835\udc86\ud835\udc93\ud835\udc83]",
    artist: "7zava Vibez",
    videoId: "MKQhsE8Vefk",
    duration: "3:42",
    thumbnail: "https://img.youtube.com/vi/MKQhsE8Vefk/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-24",
    title: "Travis Scott - My Eyes - (Second Half Extended)",
    artist: "sohkha",
    videoId: "pxwm3sqAytE",
    duration: "5:01",
    thumbnail: "https://img.youtube.com/vi/pxwm3sqAytE/hqdefault.jpg",
    genre: "Late Night Hip-Hop"
  },
  {
    id: "random-25",
    title: "The Weeknd, Playboi Carti - Timeless",
    artist: "The Weeknd",
    videoId: "5EpyN_6dqyk",
    duration: "4:17",
    thumbnail: "https://img.youtube.com/vi/5EpyN_6dqyk/hqdefault.jpg",
    genre: "Late Night Hip-Hop"
  },
  {
    id: "random-26",
    title: "Basrah w Atooh",
    artist: "Cairokee",
    videoId: "948wqojRi4I",
    duration: "3:58",
    thumbnail: "https://img.youtube.com/vi/948wqojRi4I/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-27",
    title: "Send Me An Angel",
    artist: "Scorpions",
    videoId: "K9RKlz1qpQY",
    duration: "4:34",
    thumbnail: "https://img.youtube.com/vi/K9RKlz1qpQY/hqdefault.jpg",
    genre: "Classic / Acoustic Rock"
  },
  {
    id: "random-28",
    title: "Wicked Game",
    artist: "Daisy Gray",
    videoId: "6G944qwQ1Hw",
    duration: "3:41",
    thumbnail: "https://img.youtube.com/vi/6G944qwQ1Hw/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-29",
    title: "Past Lives",
    artist: "sapientdream",
    videoId: "hK59OMfBN8E",
    duration: "2:34",
    thumbnail: "https://img.youtube.com/vi/hK59OMfBN8E/hqdefault.jpg",
    genre: "Dream Pop / Ambient"
  },
  {
    id: "random-30",
    title: "Ala bab EL Cima",
    artist: "Release",
    videoId: "6UrYntxTcN8",
    duration: "2:29",
    thumbnail: "https://img.youtube.com/vi/6UrYntxTcN8/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-31",
    title: "Smile",
    artist: "Juice WRLD",
    videoId: "SnLXJg6S0wM",
    duration: "3:17",
    thumbnail: "https://img.youtube.com/vi/SnLXJg6S0wM/hqdefault.jpg",
    genre: "Late Night Hip-Hop"
  },
  {
    id: "random-32",
    title: "Grave Pool - You Should All Be Murdered",
    artist: "ST\u2206R",
    videoId: "FlR0dgVb2BI",
    duration: "4:37",
    thumbnail: "https://img.youtube.com/vi/FlR0dgVb2BI/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-33",
    title: "La Verdad",
    artist: "Hermanos Guti\u00e9rrez",
    videoId: "oMk4fVjrfwc",
    duration: "3:59",
    thumbnail: "https://img.youtube.com/vi/oMk4fVjrfwc/hqdefault.jpg",
    genre: "Desert Guitar / Western"
  },
  {
    id: "random-34",
    title: "Los Navegantes",
    artist: "Hermanos Guti\u00e9rrez",
    videoId: "8eqBSlAShyg",
    duration: "4:13",
    thumbnail: "https://img.youtube.com/vi/8eqBSlAShyg/hqdefault.jpg",
    genre: "Desert Guitar / Western"
  },
  {
    id: "random-35",
    title: "Sonora",
    artist: "Hermanos Guti\u00e9rrez",
    videoId: "rSMH8xQijfk",
    duration: "1:04",
    thumbnail: "https://img.youtube.com/vi/rSMH8xQijfk/hqdefault.jpg",
    genre: "Desert Guitar / Western"
  },
  {
    id: "random-36",
    title: "LIGHT OR SHADOW",
    artist: "Wish & Gain",
    videoId: "sHn5dnyPDLo",
    duration: "4:35",
    thumbnail: "https://img.youtube.com/vi/sHn5dnyPDLo/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-37",
    title: "Good For You x One Of The Girls",
    artist: "dreamsoda",
    videoId: "uw1DIFsT26Y",
    duration: "2:30",
    thumbnail: "https://img.youtube.com/vi/uw1DIFsT26Y/hqdefault.jpg",
    genre: "Late Night Radio"
  },
  {
    id: "random-38",
    title: "\u0432\u0435\u0447\u0435\u0440\u0430 (cover)",
    artist: "Alem",
    videoId: "tTEnxCBLLHQ",
    duration: "2:23",
    thumbnail: "https://img.youtube.com/vi/tTEnxCBLLHQ/hqdefault.jpg",
    genre: "Late Night Radio"
  }
];

export const JAZZ_PLAYLIST: Track[] = [
  {
    id: "jazz-1",
    title: "Empty Heart",
    artist: "We Are Jazz",
    videoId: "RczZjYjxRhg",
    duration: "3:15",
    thumbnail: "https://img.youtube.com/vi/RczZjYjxRhg/hqdefault.jpg",
    genre: "Noir Jazz / Piano"
  },
  {
    id: "jazz-2",
    title: "Final Gaze",
    artist: "We Are Jazz",
    videoId: "QjSabYXeHNc",
    duration: "3:42",
    thumbnail: "https://img.youtube.com/vi/QjSabYXeHNc/hqdefault.jpg",
    genre: "Midnight Sax"
  },
  {
    id: "jazz-3",
    title: "Accidental Peace",
    artist: "We Are Jazz",
    videoId: "rwCETOJxNeY",
    duration: "3:28",
    thumbnail: "https://img.youtube.com/vi/rwCETOJxNeY/hqdefault.jpg",
    genre: "Smooth Jazz"
  },
  {
    id: "jazz-4",
    title: "Bad Timing",
    artist: "We Are Jazz",
    videoId: "cwZRBQWZRno",
    duration: "3:05",
    thumbnail: "https://img.youtube.com/vi/cwZRBQWZRno/hqdefault.jpg",
    genre: "Smoky Lounge"
  },
  {
    id: "jazz-5",
    title: "Silent Flirt",
    artist: "We Are Jazz",
    videoId: "6mF8XQRYaHY",
    duration: "3:36",
    thumbnail: "https://img.youtube.com/vi/6mF8XQRYaHY/hqdefault.jpg",
    genre: "Velvet Brass"
  },
  {
    id: "jazz-6",
    title: "Noble Blood",
    artist: "We Are Jazz",
    videoId: "ivFMbzHN_wI",
    duration: "3:50",
    thumbnail: "https://img.youtube.com/vi/ivFMbzHN_wI/hqdefault.jpg",
    genre: "Late Night Jazz"
  }
];

export const ZANOPHY_PLAYLIST: Track[] = RANDOM_PLAYLIST;

export const MOODS: Record<ZanophyMood, MoodMeta> = {
  random: {
    id: "random",
    name: "Random",
    tagline: "3 AM MIDNIGHT RADIO",
    sub: "Phonk, Dream Pop, Desert Blues, Sufi & Neo-Classical",
    badge: "38 TRACKS",
    icon: "RD",
    color: "emerald",
    asciiArt: [
      "██████╗  █████╗ ███╗   ██╗██████╗  ██████╗ ███╗   ███╗",
      "██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔═══██╗████╗ ████║",
      "██████╔╝███████║██╔██╗ ██║██║  ██║██║   ██║██╔████╔██║",
      "██╔══██╗██╔══██║██║╚██╗██║██║  ██║██║   ██║██║╚██╔╝██║",
      "██║  ██║██║  ██║██║ ╚████║██████╔╝╚██████╔╝██║ ╚═╝ ██║",
      "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝"
    ].join("\n")
  },
  jazz: {
    id: "jazz",
    name: "They are Jazz",
    tagline: "NOIR SAX & MIDNIGHT SMOKE",
    sub: "Velvet brass, moody piano & smooth smoky lounge jazz",
    badge: "6 TRACKS",
    icon: "JZ",
    color: "amber",
    asciiArt: [
      "     ██╗ █████╗ ███████╗███████╗",
      "     ██║██╔══██╗╚══███╔╝╚══███╔╝",
      "     ██║███████║  ███╔╝   ███╔╝ ",
      "██   ██║██╔══██║ ███╔╝   ███╔╝  ",
      "╚█████╔╝██║  ██║███████╗███████╗",
      " ╚════╝ ╚═╝  ╚═╝╚══════╝╚══════╝"
    ].join("\n")
  }
};

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle music.youtube.com or youtube.com or youtu.be
  const match = trimmed.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
