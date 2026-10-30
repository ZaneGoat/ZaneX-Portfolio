import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Track, ZanophyMood, RANDOM_PLAYLIST, JAZZ_PLAYLIST, extractYouTubeVideoId } from "@/data/playlist";
import { sound } from "@/lib/sound";

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  loadVideoById?: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  getIframe?: () => HTMLIFrameElement;
  destroy?: () => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayerInstance;
  data?: number;
}

// Extend window for YouTube API
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: YouTubePlayerEvent) => void;
            onStateChange?: (event: YouTubePlayerEvent) => void;
            onError?: (err: unknown) => void;
          };
        }
      ) => YouTubePlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface MusicContextType {
  playlist: Track[];
  currentTrackIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isLoop: boolean;
  isFullPlayerOpen: boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (min: boolean) => void;
  mood: ZanophyMood;
  setMood: (mood: ZanophyMood) => void;
  isMoodMenuOpen: boolean;
  setIsMoodMenuOpen: (open: boolean) => void;
  openMoodMenu: () => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (index: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  addCustomTrack: (url: string, title?: string, artist?: string) => boolean;
  removeCustomTrack: (id: string) => void;
  resetToDefaultPlaylist: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_PLAYLIST_KEY = "zanophy_custom_tracks";
const STORAGE_DELETED_KEY = "zanophy_deleted_tracks";
const STORAGE_VOLUME_KEY = "zanophy_volume";
const STORAGE_MOOD_KEY = "zanophy_active_mood";
const PLAYLIST_BROADCAST_CHANNEL = "zanophy_playlist_sync";

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<ZanophyMood>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MOOD_KEY);
      if (saved === "jazz" || saved === "random") return saved;
    } catch { /* ignore */ }
    return "random";
  });

  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);

  // Helper to compute active playlist with additions and exclusions applied
  const buildPlaylistForMood = useCallback((activeMood: ZanophyMood): Track[] => {
    const baseList = activeMood === "jazz" ? JAZZ_PLAYLIST : RANDOM_PLAYLIST;
    let deletedIds: string[] = [];
    let customTracks: Track[] = [];

    try {
      const savedDeleted = localStorage.getItem(STORAGE_DELETED_KEY);
      if (savedDeleted) {
        deletedIds = JSON.parse(savedDeleted);
      }
    } catch { /* ignore */ }

    try {
      const savedCustom = localStorage.getItem(STORAGE_PLAYLIST_KEY);
      if (savedCustom) {
        customTracks = JSON.parse(savedCustom);
      }
    } catch { /* ignore */ }

    const filteredBase = baseList.filter(t => !deletedIds.includes(t.id));
    const activeCustom = customTracks.filter(t => !deletedIds.includes(t.id));

    // Combine base with custom
    return [...filteredBase, ...activeCustom];
  }, []);

  const [playlist, setPlaylist] = useState<Track[]>(() => buildPlaylistForMood(mood));
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
      return saved !== null ? Number(saved) : 80;
    } catch {
      return 80;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpenState] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);

  const setIsFullPlayerOpen = useCallback((open: boolean) => {
    setIsFullPlayerOpenState(open);
    if (!open) {
      setIsMinimized(true);
    }
  }, []);

  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const pendingPlayRef = useRef<boolean>(false);
  const pendingTrackRef = useRef<Track | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const handleTrackEndedRef = useRef<() => void>(() => {});
  const nextTrackRef = useRef<() => void>(() => {});
  const playlistRef = useRef<Track[]>(playlist);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Synchronize playlists across tabs and local events automatically
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_PLAYLIST_KEY ||
        e.key === STORAGE_DELETED_KEY ||
        e.key === STORAGE_MOOD_KEY
      ) {
        setPlaylist(buildPlaylistForMood(mood));
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel(PLAYLIST_BROADCAST_CHANNEL);
        bc.onmessage = (event) => {
          if (event.data?.type === "PLAYLIST_UPDATED") {
            setPlaylist(buildPlaylistForMood(mood));
          }
        };
      }
    } catch { /* ignore */ }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (bc) bc.close();
    };
  }, [mood, buildPlaylistForMood]);

  const broadcastPlaylistUpdate = () => {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel(PLAYLIST_BROADCAST_CHANNEL);
        bc.postMessage({ type: "PLAYLIST_UPDATED", timestamp: Date.now() });
        bc.close();
      }
    } catch { /* ignore */ }
  };

  const syncPlayerVolume = useCallback((vol: number, muted: boolean) => {
    const p = playerRef.current;
    const effectiveVol = muted ? 0 : Math.max(0, Math.min(100, Math.round(vol)));
    try {
      if (p) {
        if (typeof p.setVolume === "function") {
          p.setVolume(effectiveVol);
        }
        if (muted || effectiveVol === 0) {
          if (typeof p.mute === "function") p.mute();
        } else {
          if (typeof p.unMute === "function") p.unMute();
          if (typeof p.setVolume === "function") p.setVolume(effectiveVol);
        }
      }
    } catch { /* ignore */ }

    try {
      const iframe = document.getElementById("zanophy-yt-player-iframe") as HTMLIFrameElement | null;
      const win = iframe?.contentWindow || p?.getIframe?.()?.contentWindow;
      if (win) {
        if (muted || effectiveVol === 0) {
          win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
          win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [0] }), "*");
        } else {
          win.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
          win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [effectiveVol] }), "*");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const currentTrack = playlist[currentTrackIndex] || playlist[0] || {
    id: "empty",
    title: "Zanophy Station",
    artist: "Aziz Maaizate",
    videoId: "p4dI_uxXe24",
    thumbnail: "https://img.youtube.com/vi/p4dI_uxXe24/hqdefault.jpg"
  };

  // Initialize YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      isApiReadyRef.current = true;

      const mountEl = document.getElementById("zanophy-yt-player-iframe");
      if (!mountEl) {
        setTimeout(loadPlayer, 100);
        return;
      }

      if (!playerRef.current) {
        try {
          playerRef.current = new window.YT.Player("zanophy-yt-player-iframe", {
            height: "200",
            width: "200",
            videoId: currentTrack.videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              enablejsapi: 1,
              origin: typeof window !== "undefined" && window.location.origin && window.location.origin !== "null"
                ? window.location.origin
                : undefined
            },
            events: {
              onReady: (event: YouTubePlayerEvent) => {
                if (event?.target) {
                  playerRef.current = event.target;
                }
                syncPlayerVolume(volumeRef.current, isMutedRef.current);
                if (pendingPlayRef.current) {
                  pendingPlayRef.current = false;
                  try {
                    if (pendingTrackRef.current) {
                      event.target.loadVideoById(pendingTrackRef.current.videoId);
                    } else {
                      event.target.playVideo();
                    }
                    setIsPlaying(true);
                  } catch { /* ignore */ }
                }
              },
              onStateChange: (event: YouTubePlayerEvent) => {
                if (event?.target) {
                  playerRef.current = event.target;
                }
                // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                  setIsBuffering(false);
                  syncPlayerVolume(volumeRef.current, isMutedRef.current);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                  setIsBuffering(false);
                } else if (event.data === 3) {
                  setIsBuffering(true);
                } else if (event.data === 0) {
                  handleTrackEndedRef.current();
                }
              },
              onError: (err: unknown) => {
                console.warn("[Zanophy] YouTube player error, auto-skipping:", err);
                setTimeout(() => nextTrackRef.current(), 1000);
              }
            }
          });
        } catch (e) {
          console.warn("[Zanophy] Error creating YT.Player:", e);
        }
      }
    };

    let checkTimer: ReturnType<typeof setInterval> | null = null;
    if (window.YT && window.YT.Player) {
      loadPlayer();
    } else {
      const existingTag = document.getElementById("zanophy-yt-script");
      if (!existingTag) {
        const tag = document.createElement("script");
        tag.id = "zanophy-yt-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        loadPlayer();
      };

      // Fallback polling check in case onYouTubeIframeAPIReady already triggered
      let checkCount = 0;
      checkTimer = setInterval(() => {
        checkCount++;
        if (window.YT && window.YT.Player) {
          if (checkTimer) clearInterval(checkTimer);
          loadPlayer();
        } else if (checkCount > 50) {
          if (checkTimer) clearInterval(checkTimer);
        }
      }, 100);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll current time & duration when playing
  useEffect(() => {
    if (isPlaying) {
      pollTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(Math.floor(cur));
          if (dur > 0) setDuration(Math.floor(dur));
          syncPlayerVolume(volumeRef.current, isMutedRef.current);
        }
      }, 500);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isPlaying, syncPlayerVolume]);

  const play = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === "function") {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
        sound.haptic(25);
      } catch { /* ignore */ }
    } else {
      pendingPlayRef.current = true;
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    pendingPlayRef.current = false;
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        sound.haptic(20);
      } catch { /* ignore */ }
    } else {
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    sound.playClick();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const loadAndPlayTrack = useCallback((track: Track) => {
    if (!track) return;
    pendingTrackRef.current = track;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      try {
        playerRef.current.loadVideoById(track.videoId);
        syncPlayerVolume(volumeRef.current, isMutedRef.current);
        setIsPlaying(true);
        setCurrentTime(0);
        sound.playBoot();
        sound.haptic([30, 20]);
      } catch {
        play();
      }
    } else {
      pendingPlayRef.current = true;
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [play, syncPlayerVolume]);

  const selectTrack = useCallback((index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
    loadAndPlayTrack(playlist[index]);
  }, [playlist, loadAndPlayTrack]);

  const nextTrack = useCallback(() => {
    sound.playClick();
    if (playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      selectTrack(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      selectTrack(nextIndex);
    }
  }, [isShuffle, playlist.length, currentTrackIndex, selectTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      try {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch {
        /* ignore player error */
      }
    }
  }, []);

  const prevTrack = useCallback(() => {
    sound.playClick();
    if (playlist.length === 0) return;
    if (currentTime > 5) {
      seekTo(0);
      return;
    }
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    selectTrack(prevIndex);
  }, [currentTime, currentTrackIndex, playlist.length, seekTo, selectTrack]);

  const handleTrackEnded = useCallback(() => {
    if (isLoop) {
      seekTo(0);
      play();
    } else {
      nextTrack();
    }
  }, [isLoop, play, nextTrack, seekTo]);

  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded;
    nextTrackRef.current = nextTrack;
  }, [handleTrackEnded, nextTrack]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(clamped));
    } catch { /* ignore */ }

    const shouldMute = clamped === 0;
    if (shouldMute !== isMutedRef.current) {
      setIsMuted(shouldMute);
      isMutedRef.current = shouldMute;
    }
    syncPlayerVolume(clamped, shouldMute);
  }, [syncPlayerVolume]);

  const toggleMute = useCallback(() => {
    sound.playClick();
    const nextMuted = !isMutedRef.current;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (!nextMuted && volumeRef.current === 0) {
      setVolumeState(50);
      volumeRef.current = 50;
    }
    syncPlayerVolume(volumeRef.current, nextMuted);
  }, [syncPlayerVolume]);

  const toggleShuffle = useCallback(() => {
    sound.playClick();
    sound.haptic(20);
    setIsShuffle(prev => !prev);
  }, []);

  const toggleLoop = useCallback(() => {
    sound.playClick();
    sound.haptic(20);
    setIsLoop(prev => !prev);
  }, []);

  // Add a new track with instant autoreload
  const addCustomTrack = useCallback((url: string, title?: string, artist?: string): boolean => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return false;

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: title?.trim() || `Injected Track (${videoId})`,
      artist: artist?.trim() || "Zanophy Station",
      videoId,
      duration: "Stream",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      genre: "User Injected",
      isCustom: true
    };

    try {
      let customs: Track[] = [];
      const saved = localStorage.getItem(STORAGE_PLAYLIST_KEY);
      if (saved) {
        customs = JSON.parse(saved);
      }
      customs.push(newTrack);
      localStorage.setItem(STORAGE_PLAYLIST_KEY, JSON.stringify(customs));
    } catch { /* ignore */ }

    const updated = buildPlaylistForMood(mood);
    setPlaylist(updated);
    broadcastPlaylistUpdate();

    // Immediately play the added track
    const newIdx = updated.findIndex(t => t.id === newTrack.id);
    if (newIdx !== -1) {
      setTimeout(() => {
        setCurrentTrackIndex(newIdx);
        loadAndPlayTrack(newTrack);
      }, 50);
    }

    sound.playSuccess();
    return true;
  }, [mood, buildPlaylistForMood, loadAndPlayTrack]);

  // Delete a song with instant autoreload
  const removeCustomTrack = useCallback((trackId: string) => {
    sound.playClick();
    sound.haptic(20);

    try {
      // 1. Remove from custom tracks if it exists
      const saved = localStorage.getItem(STORAGE_PLAYLIST_KEY);
      if (saved) {
        const customs: Track[] = JSON.parse(saved);
        const filtered = customs.filter(t => t.id !== trackId);
        localStorage.setItem(STORAGE_PLAYLIST_KEY, JSON.stringify(filtered));
      }

      // 2. Add to deleted tracking list
      let deleted: string[] = [];
      const savedDeleted = localStorage.getItem(STORAGE_DELETED_KEY);
      if (savedDeleted) {
        deleted = JSON.parse(savedDeleted);
      }
      if (!deleted.includes(trackId)) {
        deleted.push(trackId);
        localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(deleted));
      }
    } catch { /* ignore */ }

    // 3. Autoreload playlist immediately
    const updated = buildPlaylistForMood(mood);
    setPlaylist(updated);
    broadcastPlaylistUpdate();

    // 4. Adjust active track pointer if deleting currently playing track
    if (currentTrack.id === trackId && updated.length > 0) {
      const nextIdx = Math.min(currentTrackIndex, updated.length - 1);
      setCurrentTrackIndex(nextIdx);
      if (isPlaying) {
        loadAndPlayTrack(updated[nextIdx]);
      }
    }
  }, [mood, currentTrack.id, currentTrackIndex, isPlaying, buildPlaylistForMood, loadAndPlayTrack]);

  // Reset to default playlist (clears cached deletions and restores full playlist)
  const resetToDefaultPlaylist = useCallback(() => {
    sound.playSuccess();
    sound.haptic([40, 20]);
    try {
      localStorage.removeItem(STORAGE_DELETED_KEY);
      localStorage.removeItem(STORAGE_PLAYLIST_KEY);
    } catch { /* ignore */ }

    const restored = mood === "jazz" ? JAZZ_PLAYLIST : RANDOM_PLAYLIST;
    setPlaylist(restored);
    setCurrentTrackIndex(0);
    broadcastPlaylistUpdate();

    if (restored.length > 0 && isPlaying) {
      loadAndPlayTrack(restored[0]);
    }
  }, [mood, isPlaying, loadAndPlayTrack]);

  const setMood = useCallback((newMood: ZanophyMood) => {
    sound.playClick();
    sound.haptic(30);
    setMoodState(newMood);
    try {
      localStorage.setItem(STORAGE_MOOD_KEY, newMood);
    } catch { /* ignore */ }

    const targetList = buildPlaylistForMood(newMood);
    setPlaylist(targetList);
    setCurrentTrackIndex(0);
    const firstTrack = targetList[0];
    if (firstTrack) {
      if (isPlaying) {
        loadAndPlayTrack(firstTrack);
      } else if (playerRef.current && typeof playerRef.current.cueVideoById === "function") {
        try {
          playerRef.current.cueVideoById(firstTrack.videoId);
          setCurrentTime(0);
        } catch { /* ignore */ }
      }
    }
  }, [isPlaying, buildPlaylistForMood, loadAndPlayTrack]);

  const openMoodMenu = useCallback(() => {
    sound.playBoot();
    sound.haptic(20);
    setIsMoodMenuOpen(true);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isLoop,
        isFullPlayerOpen,
        setIsFullPlayerOpen,
        isMinimized,
        setIsMinimized,
        mood,
        setMood,
        isMoodMenuOpen,
        setIsMoodMenuOpen,
        openMoodMenu,
        togglePlay,
        play,
        pause,
        nextTrack,
        prevTrack,
        selectTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleLoop,
        addCustomTrack,
        removeCustomTrack,
        resetToDefaultPlaylist
      }}
    >
      {children}
      <YouTubeHiddenMount />
    </MusicContext.Provider>
  );
};

const YouTubeHiddenMount = React.memo(() => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      bottom: "-9999px",
      left: "-9999px",
      width: "200px",
      height: "200px",
      overflow: "hidden",
      opacity: 0.01,
      pointerEvents: "none",
      zIndex: -1
    }}
    dangerouslySetInnerHTML={{ __html: '<div id="zanophy-yt-player-iframe"></div>' }}
  />
));

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
