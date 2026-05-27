import { Crosshair, ShieldAlert, Zap, Terminal, Music, Smartphone, MousePointer2, Move, Ghost, Target, Eye, Layers, Circle } from "lucide-react";

export const CATEGORIES = [
  {
    title: "MOBILE_READY",
    icon: Smartphone,
    color: "text-cyber-blue",
    games: [
      {
        id: "beyond",
        title: "BIT_BEYOND",
        desc: "Gravity inversion runner. Flip your world to survive.",
        href: "/game/beyond",
        icon: Move,
        colorClass: "bg-[#ffaa00]",
        textClass: "text-[#ffaa00]",
        tag: "GRAVITY_FLIP"
      },
      {
        id: "orb",
        title: "NEON_ORB",
        desc: "High-speed evasion. Navigate the void with precision.",
        href: "/game/orb",
        icon: Circle,
        colorClass: "bg-cyber-blue",
        textClass: "text-cyber-blue",
        tag: "FAST_FOLLOW"
      },
      {
        id: "tap",
        title: "CYBER_TAP",
        desc: "Reflex calibration. Neutralize nodes at light speed.",
        href: "/game/tap",
        icon: Zap,
        colorClass: "bg-electric-volt",
        textClass: "text-electric-volt",
        tag: "REFLEX_TEST"
      },
      {
        id: "jump",
        title: "CYBER_JUMP",
        desc: "One-tap survival. Jump over high-velocity laser beams.",
        href: "/game/jump",
        icon: Zap,
        colorClass: "bg-cyber-blue",
        textClass: "text-cyber-blue",
        tag: "MOBILE_ONLY"
      },
      {
        id: "stacks",
        title: "CYBER_STACKS",
        desc: "Precision timing. Build the highest tower in the void.",
        href: "/game/stacks",
        icon: Layers,
        colorClass: "bg-hyper-pink",
        textClass: "text-hyper-pink",
        tag: "TOUCH_READY"
      },
      {
        id: "dodge",
        title: "CYBER_DODGE",
        desc: "Evasion protocol. Dodge the void using touch or mouse.",
        href: "/game/dodge",
        icon: ShieldAlert,
        colorClass: "bg-electric-volt",
        textClass: "text-electric-volt",
        tag: "HYBRID_TOUCH"
      }
    ]
  },
  {
    title: "PC_MASTER_RACE",
    icon: MousePointer2,
    color: "text-electric-volt",
    games: [
      {
        id: "strike",
        title: "CYBER_STRIKE",
        desc: "Twin-stick combat. Eliminate rogue AI cores via mouse.",
        href: "/game/strike",
        icon: Crosshair,
        colorClass: "bg-electric-volt",
        textClass: "text-electric-volt",
        tag: "MOUSE_REQUIRED"
      },
      {
        id: "beat",
        title: "CYBER_BEAT",
        desc: "Rhythm survival. Sync inputs with data streams (A,S,D,F).",
        href: "/game/beat",
        icon: Music,
        colorClass: "bg-cyber-blue",
        textClass: "text-cyber-blue",
        tag: "KEYBOARD_SYNC"
      },
      {
        id: "typer",
        title: "CYBER_TYPER",
        desc: "Hacking simulation. Decrypt protocols at high velocity.",
        href: "/game/typer",
        icon: Terminal,
        colorClass: "bg-foreground",
        textClass: "text-foreground",
        tag: "KEYBOARD_ONLY"
      },
      {
        id: "run",
        title: "CYBER_RUN",
        desc: "Infinite speed. Leap over firewalls in the matrix.",
        href: "/game/run",
        icon: Move,
        colorClass: "bg-hyper-pink",
        textClass: "text-hyper-pink",
        tag: "SPACE_BAR"
      },
      {
        id: "pong",
        title: "VOID_PONG",
        desc: "Glow combat. Outplay the rogue AI in a duel of light.",
        href: "/game/pong",
        icon: Target,
        colorClass: "bg-electric-volt",
        textClass: "text-electric-volt",
        tag: "MOUSE_ONLY"
      },
      {
        id: "snake",
        title: "NEON_SNAKE",
        desc: "Growth hack. Consume data packets to expand your link.",
        href: "/game/snake",
        icon: Ghost,
        colorClass: "bg-cyber-blue",
        textClass: "text-cyber-blue",
        tag: "ARROWS_ONLY"
      },
      {
        id: "brick",
        title: "BIT_CRUSH",
        desc: "Deconstruction mode. Shatter the walls of the mainframe.",
        href: "/game/brick",
        icon: Target,
        colorClass: "bg-foreground",
        textClass: "text-foreground",
        tag: "MOUSE_PLAY"
      },
      {
        id: "maze",
        title: "DARK_MAZE",
        desc: "Pathfinding protocol. Find the exit before systems fail.",
        href: "/game/maze",
        icon: Eye,
        colorClass: "bg-hyper-pink",
        textClass: "text-hyper-pink",
        tag: "NAVIGATION"
      }
    ]
  }
];
