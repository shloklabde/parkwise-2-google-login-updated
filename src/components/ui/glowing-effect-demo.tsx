import React from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Sparkles, Zap, Shield, Navigation } from "lucide-react";

export default function GlowingEffectDemo() {
  const cards = [
    {
      title: "Real-Time Sensor Sync",
      description: "Live occupancy detection across all smart bays with sub-second feedback.",
      icon: Zap,
    },
    {
      title: "Intelligent Guidance",
      description: "Turn-by-turn routing directly to your reserved space without circling.",
      icon: Navigation,
    },
    {
      title: "Encrypted QR Passes",
      description: "Instant barrier gate access using time-sensitive cryptographically signed tokens.",
      icon: Shield,
    },
    {
      title: "Dynamic Demand AI",
      description: "Predictive parking availability based on historical traffic patterns.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="relative min-h-[14rem] overflow-hidden rounded-2xl border border-[#dfe7ec] bg-white p-6 shadow-sm"
            >
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-fit rounded-lg border border-[#dfe7ec] bg-[#f5f8fa] p-2 text-[#153b5b]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#153b5b]">{card.title}</h3>
                  <p className="mt-2 text-sm text-[#73818b]">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
