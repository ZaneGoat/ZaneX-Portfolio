import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Track, ZanophyMood, RANDOM_PLAYLIST, JAZZ_PLAYLIST, ZANOPHY_PLAYLIST, extractYouTubeVideoId } from "@/data/playlist";
import { sound } from "@/lib/sound";

// Extend window for YouTube API
declare global {
  interface Window {
    YT?: any;
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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_PLAYLIST_KEY = "zanophy_custom_tracks";
const STORAGE_VOLUME_KEY = "zanophy_volume";
const STORAGE_MOOD_KEY = "zanophy_active_mood";

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<ZanophyMood>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MOOD_KEY);
      if (saved === "jazz" || saved === "random") return saved;
    } catch {}
    return "random";
  });

  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);

  const [playlist, setPlaylist] = useState<Track[]>(() => {
    const baseList = mood === "jazz" ? JAZZ_PLAYLIST : RANDOM_PLAYLIST;
    try {
      const saved = localStorage.getItem(STORAGE_PLAYLIST_KEY);
      if (saved && mood === "random") {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...baseList, ...parsed];
        }
      }
    } catch {}
    return baseList;
  });

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

  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<any>(null);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const handleTrackEndedRef = useRef<() => void>(() => {});
  const nextTrackRef = useRef<() => void>(() => {});

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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
    } catch {}

    // Direct postMessage fallback to YouTube iframe contentWindow
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
    } catch {}
  }, []);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Initialize YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      isApiReadyRef.current = true;

      if (!playerRef.current && document.getElementById("zanophy-yt-player-iframe")) {
        try {
          playerRef.current = new window.YT.Player("zanophy-yt-player-iframe", {
            height: "1",
            width: "1",
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
              origin: typeof window !== "undefined" ? window.location.origin : undefined
            },
            events: {
              onReady: (event: any) => {
                if (event?.target) {
                  playerRef.current = event.target;
                }
                syncPlayerVolume(volumeRef.current, isMutedRef.current);
              },
              onStateChange: (event: any) => {
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
              onError: (err: any) => {
                console.warn("[Zanophy] YouTube player error, auto-skipping:", err);
                // On restricted or blocked video, skip to next after 1 second
                setTimeout(() => nextTrackRef.current(), 1000);
              }
            }
          });
        } catch (e) {
          console.warn("[Zanophy] Error creating YT.Player:", e);
        }
      }
    };

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
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
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
      } catch {}
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        sound.haptic(20);
      } catch {}
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
    }
  }, [play, syncPlayerVolume]);

  const selectTrack = useCallback((index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
    loadAndPlayTrack(playlist[index]);
  }, [playlist, loadAndPlayTrack]);

  const nextTrack = useCallback(() => {
    sound.playClick();
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      selectTrack(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      selectTrack(nextIndex);
    }
  }, [isShuffle, playlist.length, currentTrackIndex, selectTrack]);

  const prevTrack = useCallback(() => {
    sound.playClick();
    if (currentTime > 5) {
      seekTo(0);
      return;
    }
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    selectTrack(prevIndex);
  }, [currentTime, currentTrackIndex, playlist.length, selectTrack]);

  const handleTrackEnded = useCallback(() => {
    if (isLoop) {
      seekTo(0);
      play();
    } else {
      nextTrack();
    }
  }, [isLoop, play, nextTrack]);

  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded;
    nextTrackRef.current = nextTrack;
  }, [handleTrackEnded, nextTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      try {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch {}
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(clamped));
    } catch {}

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

  const addCustomTrack = useCallback((url: string, title?: string, artist?: string): boolean => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return false;

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: title?.trim() || `Custom Stream (${videoId})`,
      artist: artist?.trim() || "YouTube Live Stream",
      videoId,
      duration: "Stream",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      genre: "User Injected",
      isCustom: true
    };

    setPlaylist(prev => {
      const next = [...prev, newTrack];
      try {
        const customs = next.filter(t => t.isCustom);
        localStorage.setItem(STORAGE_PLAYLIST_KEY, JSON.stringify(customs));
      } catch {}
      return next;
    });

    // Immediately play the added track
    setTimeout(() => {
      setCurrentTrackIndex(playlist.length);
      loadAndPlayTrack(newTrack);
    }, 100);

    sound.playSuccess();
    return true;
  }, [playlist.length, loadAndPlayTrack]);

  const setMood = useCallback((newMood: ZanophyMood) => {
    sound.playClick();
    sound.haptic(30);
    setMoodState(newMood);
    try {
      localStorage.setItem(STORAGE_MOOD_KEY, newMood);
    } catch {}

    const targetList = newMood === "jazz" ? JAZZ_PLAYLIST : RANDOM_PLAYLIST;
    setPlaylist(targetList);
    setCurrentTrackIndex(0);
    const firstTrack = targetList[0];
    if (isPlaying) {
      loadAndPlayTrack(firstTrack);
    } else if (playerRef.current && typeof playerRef.current.cueVideoById === "function") {
      try {
        playerRef.current.cueVideoById(firstTrack.videoId);
        setCurrentTime(0);
      } catch {}
    }
  }, [isPlaying, loadAndPlayTrack]);

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
        addCustomTrack
      }}
    >
      {children}

      {/* Hidden off-screen YouTube Player Embed Container */}
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1
        }}
      >
        <div id="zanophy-yt-player-iframe" />
      </div>
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
