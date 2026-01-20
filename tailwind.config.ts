import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Y2K Font Families
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      
      // Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      // Colors - Semantic + Y2K Neon
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Y2K Neon Colors with alpha support
        "neon-pink": "hsl(var(--neon-pink) / <alpha-value>)",
        "neon-cyan": "hsl(var(--neon-cyan) / <alpha-value>)",
        "neon-purple": "hsl(var(--neon-purple) / <alpha-value>)",
        "neon-lime": "hsl(var(--neon-lime) / <alpha-value>)",
      },
      
      // Y2K Box Shadows - Neon Glows
      boxShadow: {
        "neon-pink": "0 0 5px #FF6EC7, 0 0 20px #FF6EC7, 0 0 40px #FF6EC750",
        "neon-cyan": "0 0 5px #01CDFE, 0 0 20px #01CDFE, 0 0 40px #01CDFE50",
        "neon-purple": "0 0 5px #B967FF, 0 0 20px #B967FF, 0 0 40px #B967FF50",
        "neon-lime": "0 0 5px #39FF14, 0 0 20px #39FF14, 0 0 40px #39FF1450",
        "glow-sm": "0 0 10px rgba(255, 110, 199, 0.3)",
        "glow-md": "0 0 20px rgba(255, 110, 199, 0.4)",
        "glow-lg": "0 0 40px rgba(255, 110, 199, 0.5)",
        "inner-glow": "inset 0 0 20px rgba(255, 110, 199, 0.2)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
      
      // Y2K Background Images - Gradients & Mesh
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "y2k-mesh": `
          radial-gradient(at 40% 20%, hsla(330, 100%, 71%, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(187, 99%, 50%, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(275, 100%, 70%, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(330, 100%, 71%, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(187, 99%, 50%, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 100%, hsla(275, 100%, 70%, 0.15) 0px, transparent 50%)
        `,
        "synthwave-sunset": "linear-gradient(180deg, #FFD319 0%, #FF901F 25%, #FF2975 50%, #F222FF 75%, #8C1EFF 100%)",
        "vaporwave": "linear-gradient(135deg, #FF71CE, #01CDFE, #05FFA1)",
        "holographic": `linear-gradient(
          115deg,
          transparent 20%,
          hsl(200 80% 60% / 0.3) 36%,
          hsl(320 80% 70% / 0.3) 42%,
          hsl(260 80% 65% / 0.3) 48%,
          transparent 64%
        )`,
      },
      
      // Y2K Animations
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "mesh-move": "mesh-move 20s ease infinite",
        "reveal": "reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
      
      // Y2K Keyframes
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-y": {
          "0%, 100%": { backgroundPosition: "50% 0%" },
          "50%": { backgroundPosition: "50% 100%" },
        },
        "neon-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary))",
            borderColor: "hsl(var(--primary))"
          },
          "50%": { 
            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))",
            borderColor: "hsl(var(--primary))"
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "from": { textShadow: "0 0 5px #FF6EC7, 0 0 10px #FF6EC7, 0 0 20px #FF6EC7" },
          "to": { textShadow: "0 0 10px #01CDFE, 0 0 20px #01CDFE, 0 0 30px #01CDFE" },
        },
        "mesh-move": {
          "0%, 100%": { backgroundPosition: "0% 0%, 100% 100%, 0% 50%, 100% 50%, 0% 100%, 100% 0%" },
          "50%": { backgroundPosition: "100% 100%, 0% 0%, 100% 50%, 0% 50%, 100% 0%, 0% 100%" },
        },
        "reveal": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      
      // Background sizes for animated gradients
      backgroundSize: {
        "300%": "300%",
        "400%": "400%",
      },
      
      // Premium easing (Active Theory inspired)
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
