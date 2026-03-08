"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Rate Opener", url: "/", emoji: "⚡" },
  { title: "My Openers", url: "/saved", emoji: "🔖" },
  { title: "Top Openers", url: "/explore", emoji: "🔥" },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <div
        className="absolute inset-0 bg-[#0a0a0f]"
        style={{
          backgroundImage: `radial-gradient(ellipse at top left, rgba(236,72,153,0.08) 0%, transparent 60%),
                           radial-gradient(ellipse at bottom right, rgba(139,92,246,0.08) 0%, transparent 60%)`,
        }}
      />

      <SidebarContent className="relative z-10">
        <SidebarGroup className="pt-4 px-4">
          {/* Logo */}
          <div className="mb-10 px-2">
            <p
              className="text-white/80 text-xl font-bold tracking-tight"
              style={{
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.03em",
              }}
            >
              rate my opener
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/30 text-[8px] tracking-widest uppercase">
                AI-powered and trained on battle-tested dating app openers that
                actually get replies
              </span>
            </div>
          </div>

          {/* Nav items */}
          <SidebarMenu className="gap-1">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="group h-auto rounded-xl px-3 py-3 hover:bg-white/5 data-[active=true]:bg-white/8 transition-all duration-200"
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <span
                      className="text-white/50 group-hover:text-white/80 transition-colors text-sm font-medium"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Divider */}
          <div className="mt-6 h-px bg-white/5" />

          {/* Bottom hint */}
          <p className="mt-6 px-2 text-xs text-white/15 leading-relaxed">
            Be honest, be interesting, be yourself.
          </p>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
