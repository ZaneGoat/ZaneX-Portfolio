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

export const ZANOPHY_PLAYLIST: Track[] = [
  {
    id: "track-1",
    title: "Breathe",
    artist: "podval capella",
    videoId: "p4dI_uxXe24",
    duration: "2:46",
    thumbnail: "https://img.youtube.com/vi/p4dI_uxXe24/hqdefault.jpg",
    genre: "Phonk / Wave"
  },
  {
    id: "track-2",
    title: "Apocalypse",
    artist: "Cigarettes After Sex",
    videoId: "DdI598gKkKw",
    duration: "4:50",
    thumbnail: "https://img.youtube.com/vi/DdI598gKkKw/hqdefault.jpg",
    genre: "Dream Pop / Ambient"
  },
  {
    id: "track-3",
    title: "Psychedelic Addict",
    artist: "Oscar & Chill",
    videoId: "YV9IGBovirA",
    duration: "2:14",
    thumbnail: "https://img.youtube.com/vi/YV9IGBovirA/hqdefault.jpg",
    genre: "Lo-Fi / Chill"
  },
  {
    id: "track-4",
    title: "Idea 17",
    artist: "Gibran Alcocer",
    videoId: "oyVyAulO4_E",
    duration: "2:34",
    thumbnail: "https://img.youtube.com/vi/oyVyAulO4_E/hqdefault.jpg",
    genre: "Neo-Classical Piano"
  },
  {
    id: "track-5",
    title: "مَتَى يَا كِرَامَ الحَيِّ عَيْنِي تَرَاكُمُ",
    artist: "voxmind music",
    videoId: "FQHv-wZrxEw",
    duration: "3:42",
    thumbnail: "https://img.youtube.com/vi/FQHv-wZrxEw/hqdefault.jpg",
    genre: "Acoustic Sufi Fusion"
  },
  {
    id: "track-6",
    title: "Silent Echo",
    artist: "Obsidian Silence",
    videoId: "75bQZSVdC_c",
    duration: "3:18",
    thumbnail: "https://img.youtube.com/vi/75bQZSVdC_c/hqdefault.jpg",
    genre: "Dark Ambient"
  },
  {
    id: "track-7",
    title: "dead end",
    artist: "Azure",
    videoId: "vQ1m-3JSMzY",
    duration: "2:20",
    thumbnail: "https://img.youtube.com/vi/vQ1m-3JSMzY/hqdefault.jpg",
    genre: "Drift Phonk"
  },
  {
    id: "track-8",
    title: "Indigo Night",
    artist: "Tamino",
    videoId: "Ywj5305omOQ",
    duration: "4:14",
    thumbnail: "https://img.youtube.com/vi/Ywj5305omOQ/hqdefault.jpg",
    genre: "Indie Rock / Oud"
  },
  {
    id: "track-9",
    title: "Bad Timing",
    artist: "We Are Jazz",
    videoId: "cwZRBQWZRno",
    duration: "3:05",
    thumbnail: "https://img.youtube.com/vi/cwZRBQWZRno/hqdefault.jpg",
    genre: "Midnight Jazz"
  },
  {
    id: "track-10",
    title: "Mali Mali الشَّمْعَة",
    artist: "BeatAddict (Gnawa x Blues)",
    videoId: "ymxHLSvyQVU",
    duration: "3:30",
    thumbnail: "https://img.youtube.com/vi/ymxHLSvyQVU/hqdefault.jpg",
    genre: "Gnawa / Desert Blues"
  },
  {
    id: "track-11",
    title: "El Madani",
    artist: "CHEMSOU FREEKLANE",
    videoId: "JT73KPMEl9A",
    duration: "3:58",
    thumbnail: "https://img.youtube.com/vi/JT73KPMEl9A/hqdefault.jpg",
    genre: "Maghreb Folk Fusion"
  },
  {
    id: "track-12",
    title: "SOMETHING FOR YOU",
    artist: "TXDO",
    videoId: "zobWUE5Ik-A",
    duration: "2:15",
    thumbnail: "https://img.youtube.com/vi/zobWUE5Ik-A/hqdefault.jpg",
    genre: "Cyberpunk Wave"
  },
  {
    id: "track-13",
    title: "Lapay",
    artist: "Bo9al",
    videoId: "nBqPu6XBJ40",
    duration: "3:10",
    thumbnail: "https://img.youtube.com/vi/nBqPu6XBJ40/hqdefault.jpg",
    genre: "Moroccan Hip-Hop"
  }
];

export const ZANE_YOUTUBE_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLOLJsI8Bv-f8";

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
