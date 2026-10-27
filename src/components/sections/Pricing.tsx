import React, { useState, useCallback } from "react";
import { Check, ArrowRight, Zap, Terminal, Lock } from "lucide-react";
import { pricingTiers, PricingTier } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { AsciiPlanEntryOverlay } from "@/components/AsciiPlanEntryOverlay";
import { sound } from "@/lib/sound";

export const Pricing: React.FC = () => {
  const [activeTier, setActiveTier] = useState<PricingTier | null>(null);
  const [activeMailto, setActiveMailto] = useState<string>("");

  const handleInitiate = (tier: PricingTier) => {
    sound.playBoot();
    sound.haptic([30, 40]);
    const subject = encodeURIComponent(`Monthly Plan Inquiry: ${tier.name} (${tier.price}${tier.period})`);
    const body = encodeURIComponent(
      `Hi Zane,\n\nI'd like to discuss the ${tier.name} plan (${tier.price}${tier.period}).\n\nCompany / Project:\n- Scope & Goals:\n- Preferred Start Date:\n- Current Stack:\n\nBest regards,`
    );
    setActiveMailto(`mailto:azizmaaizat@outlook.com?subject=${subject}&body=${body}`);
    setActiveTier(tier);
  };

  const handleCloseOverlay = useCallback(() => {
    setActiveTier(null);
    setActiveMailto("");
  }, []);

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto font-mono">
      <div className="container mx-auto px-3.5 sm:px-6 max-w-7xl">
        <SectionHeader
          index="03"
          kicker="Monthly Plans"
          title="Work With Me"
          subtitle="Clear monthly retainers—predictable pricing, direct engineer access, pause or cancel anytime."
        />

        {/* 3-Tier Subscription Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {pricingTiers.map((tier) => {
            const isRec = tier.recommended;
            return (
              <div
                key={tier.id}
                className={`hud-card p-5 sm:p-7 flex flex-col justify-between relative ${
                  isRec
                    ? "border-primary/60 ring-1 ring-primary/20"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">
                      Plan {tier.index}
                    </span>
                    {tier.badge && (
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded border ${
                          isRec
                            ? "bg-primary text-background border-primary"
                            : "bg-white/[0.04] text-foreground/80 border-white/15"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 leading-snug">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                    {tier.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-1.5 pb-5 border-b border-white/[0.08] mb-5">
                    <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {tier.period}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 mb-5 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Deliverables */}
                  <div className="space-y-2.5 mb-6">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Included Each Month
                    </p>
                    {tier.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/85">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                    <span className="text-foreground font-semibold">Fit: </span>
                    {tier.idealFor}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleInitiate(tier)}
                    className={`w-full py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                      isRec
                        ? "bg-primary text-background hover:bg-primary/90"
                        : "bg-white/[0.05] text-foreground border border-white/15 hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terms Footer Strip */}
        <div className="hud-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center sm:justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>No lock-in — pause or cancel anytime</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2 border-y sm:border-y-0 sm:border-x border-white/[0.08] py-2 sm:py-0">
            <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Direct WhatsApp / Discord / Email access</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Full IP ownership & NDA included</span>
          </div>
        </div>
      </div>

      {/* Procedural 3D ASCII Entry Sequence -> "It's way cheaper than you think." -> Direct Outlook Mailto */}
      <AsciiPlanEntryOverlay
        tier={activeTier}
        mailtoUrl={activeMailto}
        onClose={handleCloseOverlay}
      />
    </section>
  );
};
