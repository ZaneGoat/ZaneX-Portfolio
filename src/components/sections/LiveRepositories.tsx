import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, ExternalLink, Star, GitFork, Search, RefreshCw, 
  Terminal, Code2, Sparkles, Check, Copy, AlertCircle, Database
} from "lucide-react";
import { useGitHubRepos, GitHubRepo } from "@/services/github";
import { SectionHeader } from "@/components/SectionHeader";
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
    if (diffDays === 0) return "Updated today";
    if (diffDays === 1) return "Updated yesterday";
    if (diffDays < 30) return `Updated ${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `Updated ${diffMonths}mo ago`;
    return `Updated ${Math.floor(diffMonths / 12)}y ago`;
  } catch {
    return "Recent";
  }
};

export const LiveRepositories: React.FC = () => {
  const { repos, loading, error, isCached, refresh } = useGitHubRepos();
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Available unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return ["ALL", ...Array.from(langs).sort()];
  }, [repos]);

  // Filtered list
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

  return (
    <section id="repositories" className="py-24 relative z-10 font-mono">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            index="01"
            kicker="Live Code Telemetry"
            title="Production Git Repositories"
            subtitle="Autonomous sync with github.com/ZaneGoat. Filter by language or keyword to inspect open-source architectures."
          />

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                sound.playBoot();
                refresh();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
              title="Force re-fetch from GitHub API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "SYNCING..." : isCached ? "LIVE CACHED" : "REFRESH"}</span>
            </button>

            <a
              href="https://github.com/ZaneGoat"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-background rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
            >
              <Github className="w-4 h-4" />
              <span>GITHUB PROFILE</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Search & Language Filter HUD */}
        <div className="bg-[#050816]/90 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-xl mb-8 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/60" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search repos, tags, or architectures (e.g. csi, radar, erp, pos)..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-primary/25 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-primary/60 hover:text-primary px-1.5 py-0.5 rounded bg-primary/10"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Language Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0">
              {languages.map(lang => {
                const count = lang === "ALL" 
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-primary text-background shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                        : "bg-primary/10 text-primary/70 hover:text-primary border border-primary/20 hover:bg-primary/15"
                    }`}
                  >
                    {lang} <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Repos Grid */}
        {filteredRepos.length === 0 ? (
          <div className="text-center py-16 border border-primary/20 rounded-2xl bg-[#050816]/60 p-8">
            <AlertCircle className="w-8 h-8 text-primary/60 mx-auto mb-3 animate-pulse" />
            <p className="text-primary font-bold text-base mb-1">NO MATCHING REPOSITORIES FOUND</p>
            <p className="text-muted-foreground text-xs max-w-md mx-auto mb-4">
              Zero repos matched keyword <span className="text-primary">"{search}"</span> under language filter <span className="text-primary">{selectedLang}</span>.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedLang("ALL");
              }}
              className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRepos.map((repo, i) => {
                const langStyle = repo.language && LANGUAGE_COLORS[repo.language]
                  ? LANGUAGE_COLORS[repo.language]
                  : { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", border: "border-primary/20" };

                return (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="bg-[#050816]/90 border border-primary/20 hover:border-primary/50 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] group"
                  >
                    <div>
                      {/* Card Header: Language & Activity */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        {repo.language ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${langStyle.bg} ${langStyle.text} ${langStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${langStyle.dot}`} />
                            {repo.language}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary/10 text-primary/70 border border-primary/20">
                            <Code2 className="w-3 h-3" />
                            Multi-Stack
                          </span>
                        )}

                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(repo.updated_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 break-all">
                        {repo.name}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground text-xs leading-relaxed mb-4 min-h-[3rem] line-clamp-3">
                        {repo.description || "Production repository with specialized architecture, automated pipelines, and zero-compromise engineering."}
                      </p>

                      {/* Topics / Tags */}
                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {repo.topics.slice(0, 4).map(topic => (
                            <span
                              key={topic}
                              className="px-2 py-0.5 bg-primary/5 border border-primary/15 text-primary/80 rounded text-[10px]"
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Clone command snippet */}
                      <div className="bg-black/70 border border-primary/15 rounded-xl p-2.5 mb-4 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
                          <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">git clone {repo.name}.git</span>
                        </div>
                        <button
                          onClick={() => handleCopyClone(repo)}
                          className="shrink-0 p-1 hover:bg-primary/15 rounded text-primary/70 hover:text-primary transition-colors cursor-pointer"
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

                      {/* Telemetry & Links */}
                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1" title="Stars">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            <span>{repo.stargazers_count}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Forks">
                            <GitFork className="w-3.5 h-3.5 text-primary/70" />
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
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold transition-all"
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>VIEW CODE</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};
