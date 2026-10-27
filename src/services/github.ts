import { useEffect, useState, useCallback } from "react";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  isPinned?: boolean;
}

export const PINNED_REPO_NAMES = ["ZaneMegaCenter", "csi_project", "Controler-space"];

export const isPinnedRepo = (name: string): boolean => {
  return PINNED_REPO_NAMES.some(p => p.toLowerCase() === name.toLowerCase().replace(/[\s_-]+/g, ""));
};

const getPinnedOrder = (name: string): number => {
  const normalized = name.toLowerCase().replace(/[\s_-]+/g, "");
  const idx = PINNED_REPO_NAMES.findIndex(p => p.toLowerCase().replace(/[\s_-]+/g, "") === normalized);
  return idx === -1 ? 999 : idx;
};

const CACHE_KEY = "zanex_github_repos_v3";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * High-fidelity fallback snapshot used when offline, in dev without internet,
 * or when unauthenticated GitHub rate limits are encountered.
 * Pinned flagships at top: ZaneMegaCenter, csi_project, Controler-space.
 */
export const FALLBACK_REPOS: GitHubRepo[] = [
  {
    id: 101,
    name: "ZaneMegaCenter",
    full_name: "ZaneGoat/ZaneMegaCenter",
    description: "Low-level Linux Embedded Controller (EC) register I/O governor and live fan curve tuner for MSI GF65 laptops.",
    html_url: "https://github.com/ZaneGoat/ZaneMegaCenter",
    homepage: null,
    language: "Python",
    stargazers_count: 5,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-10-18T10:00:00Z",
    created_at: "2025-05-15T00:00:00Z",
    topics: ["linux-ec", "hardware-tuning", "fan-control", "customtkinter", "isw"],
    fork: false,
    archived: false,
    isPinned: true
  },
  {
    id: 102,
    name: "csi_project",
    full_name: "ZaneGoat/csi_project",
    description: "Wi-Fi CSI Sensing Radar: Non-invasive camera-free human presence & Doppler motion recognition using 802.11 subcarriers.",
    html_url: "https://github.com/ZaneGoat/csi_project",
    homepage: null,
    language: "Python",
    stargazers_count: 6,
    forks_count: 1,
    open_issues_count: 0,
    updated_at: "2026-10-20T12:00:00Z",
    created_at: "2025-06-10T00:00:00Z",
    topics: ["wifi-csi", "rf-sensing", "radar", "signal-processing", "python"],
    fork: false,
    archived: false,
    isPinned: true
  },
  {
    id: 103,
    name: "Controler-space",
    full_name: "ZaneGoat/Controler-space",
    description: "Low-latency DualSense & HID gamepad deadzone calibration, stick curves, and adaptive trigger haptics for Linux.",
    html_url: "https://github.com/ZaneGoat/Controler-space",
    homepage: null,
    language: "Python",
    stargazers_count: 4,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-09-30T04:00:00Z",
    created_at: "2025-07-20T00:00:00Z",
    topics: ["gamepad", "dualsense", "hid-api", "haptics", "python"],
    fork: false,
    archived: false,
    isPinned: true
  },
  {
    id: 104,
    name: "ZaneX-Portfolio",
    full_name: "ZaneGoat/ZaneX-Portfolio",
    description: "High-performance Cyberpunk portfolio workstation with interactive terminals, CTF bounty hunting, and visitor profiles.",
    html_url: "https://github.com/ZaneGoat/ZaneX-Portfolio",
    homepage: "https://github.com/ZaneGoat/ZaneX-Portfolio",
    language: "TypeScript",
    stargazers_count: 6,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-10-22T12:46:00Z",
    created_at: "2025-09-01T00:00:00Z",
    topics: ["react", "vite", "tailwind", "cyberpunk", "portfolio"],
    fork: false,
    archived: false
  },
  {
    id: 105,
    name: "Highway-Sys",
    full_name: "ZaneGoat/Highway-Sys",
    description: "Real-time toll plaza flow engine with vehicle classification state machine, inductive loop telemetry & barrier controller.",
    html_url: "https://github.com/ZaneGoat/Highway-Sys",
    homepage: null,
    language: "Python",
    stargazers_count: 3,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-08-06T00:00:00Z",
    created_at: "2025-06-01T00:00:00Z",
    topics: ["automation", "state-machine", "sqlite", "relays"],
    fork: false,
    archived: false
  },
  {
    id: 106,
    name: "Gestion-optic",
    full_name: "ZaneGoat/Gestion-optic",
    description: "Enterprise Optical Clinic & Stock Management ERP: Optical prescriptions, barcode frame/lens tracking, and medical Docx exports.",
    html_url: "https://github.com/ZaneGoat/Gestion-optic",
    homepage: null,
    language: "Python",
    stargazers_count: 3,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-07-16T19:00:00Z",
    created_at: "2025-04-10T00:00:00Z",
    topics: ["erp", "optometry", "sqlite", "customtkinter", "docx"],
    fork: false,
    archived: false
  },
  {
    id: 107,
    name: "Pharmacie",
    full_name: "ZaneGoat/Pharmacie",
    description: "Pharmaceutical retail POS with automated 30/60/90-day drug expiry alert thresholds and prescription verification.",
    html_url: "https://github.com/ZaneGoat/Pharmacie",
    homepage: null,
    language: "Python",
    stargazers_count: 2,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-07-14T07:00:00Z",
    created_at: "2025-04-05T00:00:00Z",
    topics: ["pharmacy", "pos", "inventory", "expiry-tracker"],
    fork: false,
    archived: false
  },
  {
    id: 108,
    name: "smart-appointment-system",
    full_name: "ZaneGoat/smart-appointment-system",
    description: "Concurrency-safe reservation engine with automated client reminders, conflict prevention, and multi-view calendars.",
    html_url: "https://github.com/ZaneGoat/smart-appointment-system",
    homepage: null,
    language: "Python",
    stargazers_count: 2,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2025-09-24T15:00:00Z",
    created_at: "2025-03-12T00:00:00Z",
    topics: ["flask", "booking", "notifications", "calendar"],
    fork: false,
    archived: false
  },
  {
    id: 109,
    name: "school-hub-dashboard",
    full_name: "ZaneGoat/school-hub-dashboard",
    description: "TypeScript academic administration portal powering enrollment, weighted gradebooks, and report card exports.",
    html_url: "https://github.com/ZaneGoat/school-hub-dashboard",
    homepage: null,
    language: "TypeScript",
    stargazers_count: 2,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-06-21T04:00:00Z",
    created_at: "2025-02-28T00:00:00Z",
    topics: ["react", "typescript", "rbac", "education"],
    fork: false,
    archived: false
  },
  {
    id: 110,
    name: "SPA",
    full_name: "ZaneGoat/SPA",
    description: "Application de Gestion complète pour centre SPA et bien-être : réservations, forfaits soins et encaissement.",
    html_url: "https://github.com/ZaneGoat/SPA",
    homepage: null,
    language: "Python",
    stargazers_count: 1,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-10-21T01:16:00Z",
    created_at: "2025-06-15T00:00:00Z",
    topics: ["spa", "management", "pos", "python"],
    fork: false,
    archived: false
  },
  {
    id: 111,
    name: "Pizza-express",
    full_name: "ZaneGoat/Pizza-express",
    description: "Application Python de gestion de commande, cuisine et livraison express pour pizzeria.",
    html_url: "https://github.com/ZaneGoat/Pizza-express",
    homepage: null,
    language: "Python",
    stargazers_count: 1,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-10-21T01:15:00Z",
    created_at: "2025-05-20T00:00:00Z",
    topics: ["pizzeria", "pos", "orders", "python"],
    fork: false,
    archived: false
  }
];

const sortAndFilterRepos = (rawRepos: GitHubRepo[]): GitHubRepo[] => {
  // Exclude 'robin' and any fork named robin
  const filtered = rawRepos.filter(r => r.name.toLowerCase() !== "robin");

  return filtered
    .map(r => ({
      ...r,
      isPinned: isPinnedRepo(r.name)
    }))
    .sort((a, b) => {
      const aPinned = isPinnedRepo(a.name);
      const bPinned = isPinnedRepo(b.name);

      if (aPinned && bPinned) {
        return getPinnedOrder(a.name) - getPinnedOrder(b.name);
      }
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // For non-pinned, prioritize original non-forks
      if (a.fork !== b.fork) return a.fork ? 1 : -1;

      // Then by updated date
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
};

export const useGitHubRepos = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
          return sortAndFilterRepos(data);
        }
      }
    } catch {
      // Ignore cache read failures
    }
    return sortAndFilterRepos(FALLBACK_REPOS);
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const fetchRepos = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
            setRepos(sortAndFilterRepos(data));
            setIsCached(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Continue to network fetch
      }
    }

    try {
      const res = await fetch("https://api.github.com/users/ZaneGoat/repos?per_page=60&sort=updated", {
        headers: { Accept: "application/vnd.github.v3+json" }
      });

      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }

      const data: GitHubRepo[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = sortAndFilterRepos(data);
        setRepos(sorted);
        setIsCached(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() }));
        } catch {
          // Ignore cache quota errors
        }
      } else {
        setRepos(sortAndFilterRepos(FALLBACK_REPOS));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load latest repositories";
      console.warn("GitHub fetch failed, using fallback repos:", msg);
      setError(msg);
      setRepos(prev => (prev.length > 0 ? sortAndFilterRepos(prev) : sortAndFilterRepos(FALLBACK_REPOS)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return {
    repos,
    loading,
    error,
    isCached,
    refresh: () => fetchRepos(true)
  };
};
