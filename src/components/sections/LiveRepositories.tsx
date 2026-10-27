import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, ExternalLink, Star, GitFork, Search, RefreshCw,
  Terminal, Code2, Check, Copy, AlertCircle, Pin, ChevronDown, ChevronUp, FolderGit2
} from "lucide-react";
import { useGitHubRepos, GitHubRepo } from "@/services/github";
import { sound } from "@/lib/sound";

const LANGUAGE_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Python: { bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400", border: "border-amber-500/30" },
  TypeScript: { bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400", border: "border-sky-500/30" },
  JavaScript: { bg: "bg-yellow-500/10", text: "text-yellow-300", dot: "bg-yellow-400", border: "border-yellow-500/30" },
  HTML: { bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400", border: "border-orange-500/30" },
  Shell: { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400", border: "border-emerald-500/30" },
  C: { bg: "bg-purple-500/10", text: "text-purple-300", dot: "bg-purple-400", border: "border-purple-500/30" },
  "C++": { bg: "bg-indigo-500/10", text: "text-indigo-300", dot: "bg-indigo-400", border: "border-indigo-500/30" },
};

const formatRelativeTime = (isoString: string): string => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffMonths / 12)}y ago`;
  } catch {
    return "Recent";
  }
};

export const LiveRepositories: React.FC = () => {
  const { repos, loading, isCached, refresh } = useGitHubRepos();
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Auto-expand when user explicitly clicks a "Repositories" / "Show Repositories" link
  useEffect(() => {
    const handleExpand = () => setIsExpanded(true);
    const handleHash = () => {
      if (window.location.hash === "#repositories") {
        setIsExpanded(true);
      }
    };
    window.addEventListener("zanex:expand-repos", handleExpand);
    window.addEventListener("hashchange", handleHash);
    return () => {
      window.removeEventListener("zanex:expand-repos", handleExpand);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return ["ALL", ...Array.from(langs).sort()];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return repos.filter(repo => {
      const matchesSearch =
        !query ||
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.topics && repo.topics.some(t => t.toLowerCase().includes(query)));

      const matchesLang =
        selectedLang === "ALL" ||
        (repo.language && repo.language.toUpperCase() === selectedLang.toUpperCase());

      return matchesSearch && matchesLang;
    });
  }, [repos, search, selectedLang]);

  const handleCopyClone = (repo: GitHubRepo) => {
    sound.playClick();
    const cmd = `git clone ${repo.html_url}.git`;
    navigator.clipboard.writeText(cmd);
    setCopiedId(repo.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleExpanded = () => {
    sound.playClick();
    sound.haptic(20);
    setIsExpanded(prev => !prev);
  };

  return (
    <section id="repositories" className="py-6 sm:py-10 relative z-10 font-mono">
      <div className="container mx-auto px-3.5 sm:px-6 max-w-7xl">
        {/* Compact Collapsible Trigger Card (Keeps page short & easy to skim until clicked) */}
        <div className="hud-card p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-primary">
                <span className="font-bold">01</span>
                <span className="h-px w-6 bg-primary/40" />
                <span className="uppercase tracking-[0.18em]">Source Code</span>
                <span className="text-muted-foreground">· {repos.length} repos</span>
              </div>

              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-primary shrink-0" />
                <h2 className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tight">
                  Production Git Repositories
                </h2>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Hidden by default for a clean quick read. Click to inspect all open-source builds, including{" "}
                <span className="text-foreground/90 font-semibold">ZaneMegaCenter</span>,{" "}
                <span className="text-foreground/90 font-semibold">csi_project</span>, and{" "}
                <span className="text-foreground/90 font-semibold">Controler-space</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleExpanded}
                aria-expanded={isExpanded}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                  isExpanded
                    ? "bg-white/[0.06] text-foreground border border-white/20 hover:border-white/35"
                    : "bg-primary text-background hover:bg-primary/90"
                }`}
              >
                <span>{isExpanded ? "HIDE REPOSITORIES" : `VIEW REPOSITORIES (${repos.length})`}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <a
                href="https://github.com/ZaneGoat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-foreground/85 hover:text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>@ZaneGoat</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>

          {/* Expandable Full Repository Drawer */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-white/[0.08] space-y-5">
                  {/* Search, Filter & Sync Toolbar */}
                  <div className="bg-black/45 border border-white/[0.08] rounded-xl p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Filter repositories by name or topic..."
                          className="w-full pl-9 pr-14 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition-colors font-mono"
                        />
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-white/5"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          sound.playBoot();
                          refresh();
                        }}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-foreground/85 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                        title="Refresh from GitHub API"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
                        <span>{loading ? "Syncing..." : isCached ? "Live Cached" : "Refresh"}</span>
                      </button>
                    </div>

                    {/* Language Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pt-0.5">
                      {languages.map(lang => {
                        const count =
                          lang === "ALL"
                            ? repos.length
                            : repos.filter(r => r.language && r.language.toUpperCase() === lang.toUpperCase()).length;
                        const isActive = selectedLang.toUpperCase() === lang.toUpperCase();

                        return (
                          <button
                            key={lang}
                            onClick={() => {
                              sound.playClick();
                              setSelectedLang(lang);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                              isActive
                                ? "bg-primary text-background"
                                : "bg-white/[0.03] text-muted-foreground hover:text-foreground border border-white/10"
                            }`}
                          >
                            {lang} <span className="opacity-65 text-[10px]">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Repos Grid */}
                  {filteredRepos.length === 0 ? (
                    <div className="text-center py-10 px-4 border border-white/10 rounded-xl bg-black/40">
                      <AlertCircle className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                      <p className="text-foreground font-bold text-sm mb-1">No matching repositories</p>
                      <p className="text-muted-foreground text-xs max-w-md mx-auto mb-4">
                        Nothing matched "{search}" under {selectedLang}.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setSelectedLang("ALL");
                        }}
                        className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRepos.map(repo => {
                        const langStyle =
                          repo.language && LANGUAGE_COLORS[repo.language]
                            ? LANGUAGE_COLORS[repo.language]
                            : { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", border: "border-primary/20" };

                        return (
                          <div
                            key={repo.id}
                            className={`rounded-xl p-4 sm:p-5 bg-black/55 border flex flex-col justify-between group transition-colors ${
                              repo.isPinned
                                ? "border-primary/45 ring-1 ring-primary/15"
                                : "border-white/10 hover:border-primary/40"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {repo.isPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/35 text-amber-300">
                                      <Pin className="w-2.5 h-2.5 fill-amber-400 text-amber-400 rotate-45" />
                                      <span>PINNED</span>
                                    </span>
                                  )}

                                  {repo.language ? (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${langStyle.bg} ${langStyle.text} ${langStyle.border}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${langStyle.dot}`} />
                                      {repo.language}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-white/[0.04] text-muted-foreground border border-white/10">
                                      <Code2 className="w-3 h-3" />
                                      Multi
                                    </span>
                                  )}
                                </div>

                                <span className="text-[11px] text-muted-foreground shrink-0">
                                  {formatRelativeTime(repo.updated_at)}
                                </span>
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1.5 break-words">
                                {repo.name}
                              </h3>

                              <p className="text-muted-foreground text-xs leading-relaxed mb-3.5 line-clamp-3">
                                {repo.description || "Source repository maintained on GitHub."}
                              </p>

                              {repo.topics && repo.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {repo.topics.slice(0, 4).map(topic => (
                                    <span
                                      key={topic}
                                      className="px-2 py-0.5 bg-white/[0.03] border border-white/10 text-muted-foreground rounded text-[10px]"
                                    >
                                      #{topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="bg-black/65 border border-white/[0.07] rounded-lg px-2.5 py-2 mb-3 flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
                                  <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="truncate">git clone {repo.name}.git</span>
                                </div>
                                <button
                                  onClick={() => handleCopyClone(repo)}
                                  className="shrink-0 p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  title="Copy clone command"
                                >
                                  {copiedId === repo.id ? (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                      <Check className="w-3 h-3" /> COPIED
                                    </span>
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.07]">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1" title="Stars">
                                    <Star className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{repo.stargazers_count}</span>
                                  </span>
                                  <span className="flex items-center gap-1" title="Forks">
                                    <GitFork className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{repo.forks_count}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {repo.homepage && (
                                    <a
                                      href={repo.homepage}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => sound.playClick()}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 rounded-md text-xs font-bold transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>LIVE</span>
                                    </a>
                                  )}

                                  <a
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => sound.playClick()}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] hover:bg-primary/15 border border-white/10 hover:border-primary/40 text-foreground hover:text-primary rounded-md text-xs font-bold transition-colors"
                                  >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>SOURCE</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bottom Collapse Button so mobile users can fold it back up easily */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="px-4 py-2 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Collapse Repositories</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
