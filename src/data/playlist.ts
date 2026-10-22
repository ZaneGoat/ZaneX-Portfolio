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
  youtubeUrl: string;
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
    title: "Bad Timing",
    artist: "We Are Jazz",
    videoId: "cwZRBQWZRno",
    duration: "3:05",
    thumbnail: "https://img.youtube.com/vi/cwZRBQWZRno/hqdefault.jpg",
    genre: "Midnight Jazz"
  },
  {
    id: "random-10",
    title: "Mali Mali الشَّمْعَة",
    artist: "BeatAddict (Gnawa x Blues)",
    videoId: "ymxHLSvyQVU",
    duration: "3:30",
    thumbnail: "https://img.youtube.com/vi/ymxHLSvyQVU/hqdefault.jpg",
    genre: "Gnawa / Desert Blues"
  },
  {
    id: "random-11",
    title: "El Madani",
    artist: "CHEMSOU FREEKLANE",
    videoId: "JT73KPMEl9A",
    duration: "3:58",
    thumbnail: "https://img.youtube.com/vi/JT73KPMEl9A/hqdefault.jpg",
    genre: "Maghreb Folk Fusion"
  },
  {
    id: "random-12",
    title: "SOMETHING FOR YOU",
    artist: "TXDO",
    videoId: "zobWUE5Ik-A",
    duration: "2:15",
    thumbnail: "https://img.youtube.com/vi/zobWUE5Ik-A/hqdefault.jpg",
    genre: "Cyberpunk Wave"
  },
  {
    id: "random-13",
    title: "Lapay",
    artist: "Bo9al",
    videoId: "nBqPu6XBJ40",
    duration: "3:10",
    thumbnail: "https://img.youtube.com/vi/nBqPu6XBJ40/hqdefault.jpg",
    genre: "Moroccan Hip-Hop"
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

export const PLAYLIST_URLS: Record<ZanophyMood, string> = {
  random: "https://www.youtube.com/playlist?list=PLOLJsI8Bv-f8",
  jazz: "https://music.youtube.com/playlist?list=PLFGm1EVw4ry4&si=5kkcxIL0ZqR8ZNkj"
};

export const ZANE_YOUTUBE_PLAYLIST_URL = PLAYLIST_URLS.random;
export const ZANE_JAZZ_PLAYLIST_URL = PLAYLIST_URLS.jazz;

export const MOODS: Record<ZanophyMood, MoodMeta> = {
  random: {
    id: "random",
    name: "Random",
    tagline: "3 AM MIDNIGHT RADIO",
    sub: "Phonk, Dream Pop, Desert Blues, Sufi & Neo-Classical",
    badge: "13 TRACKS",
    icon: "🎲",
    color: "emerald",
    youtubeUrl: PLAYLIST_URLS.random,
    asciiArt: `
  [~ MOOD: RANDOM ~]
  .---.  .-. .-..-..---.
 /   __\\ | | | || || | |
 |  |__  | | | || || | |
 \\_____/ \`---' \`-' \`---'
 [ 3 AM ECLECTIC SYNTHETICS ]`
  },
  jazz: {
    id: "jazz",
    name: "They are Jazz",
    tagline: "NOIR SAX & MIDNIGHT SMOKE",
    sub: "Velvet brass, moody piano & smooth smoky lounge jazz",
    badge: "6 TRACKS",
    icon: "🎷",
    color: "amber",
    youtubeUrl: PLAYLIST_URLS.jazz,
    asciiArt: `
  [~ MOOD: THEY ARE JAZZ ~]
     _    _ _____   ___ 
    | |  | |  ___| / _ \\
 _  | |  | | |__  / /_\\ \\
| |_| |__| |  __| |  _  |
 \\___/ \\__/|_|    |_| |_|
 [ WE ARE JAZZ // VELVET NOIR ]`
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
  const match = trimmed.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
