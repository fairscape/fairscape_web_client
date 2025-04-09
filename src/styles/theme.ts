// src/styles/theme.ts
export const theme = {
  colors: {
    primary: "#005f73", // A different, darker teal/blue
    primaryLight: "#0a9396",
    secondary: "#ee9b00", // Amber/Orange accent
    background: "#f8f9fa", // Light gray background
    surface: "#ffffff", // White surfaces for cards/containers
    text: "#212529", // Dark text
    textSecondary: "#6c757d", // Gray text
    border: "#dee2e6",
    error: "#d00000",
    success: "#40916c",
  },
  fonts: {
    main: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  borderRadius: "8px",
};

export type ThemeType = typeof theme;
