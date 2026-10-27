import React from "react";
import { Check, Shield, Sparkles, ArrowRight, Zap, Terminal, Lock } from "lucide-react";
import { pricingTiers, PricingTier } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { sound } from "@/lib/sound";

export const Pricing: React.FC = () => {
  const handleInitiate = (tier: PricingTier) => {
    sound.playBoot();
    sound.haptic([30, 40]);
    const subject = encodeURIComponent(`[CONTRACT INITIATION] ${tier.name} (${tier.price}${tier.period})`);
    const body = encodeURIComponent(
      `Hi Zane,\n\nI'm looking to initiate the ${tier.name} monthly subscription (${tier.price}${tier.period}).\n\nOrganization / Project:\n- Project Description:\n- Timeline / Start Date:\n- Tech Stack / Systems Involved:\n\nLooking forward to speaking.`
    );
    window.location.href = `mailto:azizmaaizat@outlook.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="pricing" className="py-24 relative z-10 cv-auto font-mono">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <SectionHeader
          index="04"
          kicker="Retainers"
          title="Engineering Contracts"
          subtitle="Productized dev-as-a-service. Dedicated engineering capacity, zero agency overhead, cancel anytime."
        />

        {/* 3-Tier Retainer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {pricingTiers.map((tier) => {
            const isRec = tier.recommended;
            return (
              <div
                key={tier.id}
                className={`hud-card p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  isRec
                    ? "border-primary shadow-[0_0_35px_hsl(var(--primary)/0.2)] md:-translate-y-2"
                    : "border-primary/30 hover:border-primary/60"
                }`}
              >
                {/* Header & Badges */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-primary/60 font-bold tracking-widest uppercase">
                      PROTOCOL // {tier.index}
                    </span>
                    {tier.badge && (
                      <span
                        className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                          isRec
                            ? "bg-primary text-background border-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                            : "bg-primary/10 text-primary border-primary/30"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1 leading-tight">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    {tier.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-1.5 pb-6 border-b border-primary/20 mb-6">
                    <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold">
                      {tier.period}
                    </span>
                  </div>

                  <p className="text-xs text-primary/90 mb-6 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      DELIVERABLES & SLA:
                    </p>
                    {tier.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/85">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA & Target Audience */}
                <div className="pt-4 border-t border-primary/15">
                  <p className="text-[11px] text-muted-foreground italic mb-4">
                    <span className="text-primary font-bold not-italic">Best For: </span>
                    {tier.idealFor}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleInitiate(tier)}
                    className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-black tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      isRec
                        ? "bg-primary text-background hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                        : "bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contract Guarantees Footer Strip */}
        <div className="hud-card p-4 sm:p-6 bg-black/60 border border-primary/25 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Pause or Cancel Anytime</span>
          </div>
          <div className="flex items-center justify-center gap-2 border-y sm:border-y-0 sm:border-x border-primary/20 py-2 sm:py-0">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Direct Signal / Discord SLA</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Mutual NDA Protected</span>
          </div>
        </div>
      </div>
    </section>
  );
};
