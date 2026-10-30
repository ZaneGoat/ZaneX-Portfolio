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
    title: "Breathe",
    artist: "podval capella",
    videoId: "p4dI_uxXe24",
    duration: "2:46",
    thumbnail: "https://img.youtube.com/vi/p4dI_uxXe24/hqdefault.jpg",
    genre: "Phonk / Wave"
  },
  {
    id: "random-2",
    title: "Apocalypse",
    artist: "Cigarettes After Sex",
    videoId: "DdI598gKkKw",
    duration: "4:50",
    thumbnail: "https://img.youtube.com/vi/DdI598gKkKw/hqdefault.jpg",
    genre: "Dream Pop / Ambient"
  },
  {
    id: "random-3",
    title: "Psychedelic Addict",
    artist: "Oscar & Chill",
    videoId: "YV9IGBovirA",
    duration: "2:14",
    thumbnail: "https://img.youtube.com/vi/YV9IGBovirA/hqdefault.jpg",
    genre: "Lo-Fi / Chill"
  },
  {
    id: "random-4",
    title: "Idea 17",
    artist: "Gibran Alcocer",
    videoId: "oyVyAulO4_E",
    duration: "2:34",
    thumbnail: "https://img.youtube.com/vi/oyVyAulO4_E/hqdefault.jpg",
    genre: "Neo-Classical Piano"
  },
  {
    id: "random-5",
    title: "مَتَى يَا كِرَامَ الحَيِّ عَيْنِي تَرَاكُمُ",
    artist: "voxmind music",
    videoId: "FQHv-wZrxEw",
    duration: "3:42",
    thumbnail: "https://img.youtube.com/vi/FQHv-wZrxEw/hqdefault.jpg",
    genre: "Acoustic Sufi Fusion"
  },
  {
    id: "random-6",
    title: "Silent Echo",
    artist: "Obsidian Silence",
    videoId: "75bQZSVdC_c",
    duration: "3:18",
    thumbnail: "https://img.youtube.com/vi/75bQZSVdC_c/hqdefault.jpg",
    genre: "Dark Ambient"
  },
  {
    id: "random-7",
    title: "dead end",
    artist: "Azure",
    videoId: "vQ1m-3JSMzY",
    duration: "2:20",
    thumbnail: "https://img.youtube.com/vi/vQ1m-3JSMzY/hqdefault.jpg",
    genre: "Drift Phonk"
  },
  {
    id: "random-8",
    title: "Indigo Night",
    artist: "Tamino",
    videoId: "Ywj5305omOQ",
    duration: "4:14",
    thumbnail: "https://img.youtube.com/vi/Ywj5305omOQ/hqdefault.jpg",
    genre: "Indie Rock / Oud"
  },
  {
    id: "random-9",
    title: "Solitude",
    artist: "M83 · Felsmann + Tiley Reinterpretation",
    videoId: "R-y049K38Q0",
    duration: "3:43",
    thumbnail: "https://img.youtube.com/vi/R-y049K38Q0/hqdefault.jpg",
    genre: "Cinematic Ambient"
  },
  {
    id: "random-10",
    title: "Desert Sunset",
    artist: "Hamid El Kasri · Gnawa Fusion",
    videoId: "E2F_mH2Xf2E",
    duration: "5:12",
    thumbnail: "https://img.youtube.com/vi/E2F_mH2Xf2E/hqdefault.jpg",
    genre: "Desert Blues / Guembri"
  },
  {
    id: "random-11",
    title: "Goth",
    artist: "Sidewalks and Skeletons",
    videoId: "l_lG8n2zNbg",
    duration: "2:48",
    thumbnail: "https://img.youtube.com/vi/l_lG8n2zNbg/hqdefault.jpg",
    genre: "Witch House / Darkwave"
  },
  {
    id: "random-12",
    title: "Resonance",
    artist: "HOME",
    videoId: "8GW6sLrK40k",
    duration: "3:32",
    thumbnail: "https://img.youtube.com/vi/8GW6sLrK40k/hqdefault.jpg",
    genre: "Chillwave / Synthwave"
  },
  {
    id: "random-13",
    title: "Experience",
    artist: "Ludovico Einaudi",
    videoId: "hN_q-_nGv4U",
    duration: "5:15",
    thumbnail: "https://img.youtube.com/vi/hN_q-_nGv4U/hqdefault.jpg",
    genre: "Modern Classical"
  }
];

export const JAZZ_PLAYLIST: Track[] = [
  {
    id: "jazz-1",
    title: "They are jazz",
    artist: "We Are Jazz",
    videoId: "bIe4_Qc_d90",
    duration: "3:12",
    thumbnail: "https://img.youtube.com/vi/bIe4_Qc_d90/hqdefault.jpg",
    genre: "Noir Jazz"
  },
  {
    id: "jazz-2",
    title: "Midnight Saxophone",
    artist: "We Are Jazz",
    videoId: "1fU_o1fUom8",
    duration: "3:45",
    thumbnail: "https://img.youtube.com/vi/1fU_o1fUom8/hqdefault.jpg",
    genre: "Smooth Sax"
  },
  {
    id: "jazz-3",
    title: "Rainy Streets",
    artist: "We Are Jazz",
    videoId: "8mF3Xz2aHY4",
    duration: "4:02",
    thumbnail: "https://img.youtube.com/vi/8mF3Xz2aHY4/hqdefault.jpg",
    genre: "Atmospheric Jazz"
  },
  {
    id: "jazz-4",
    title: "Blue Shadow",
    artist: "We Are Jazz",
    videoId: "7wE_q5kP1fA",
    duration: "3:24",
    thumbnail: "https://img.youtube.com/vi/7wE_q5kP1fA/hqdefault.jpg",
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
    badge: "13 TRACKS",
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
