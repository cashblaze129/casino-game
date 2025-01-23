/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Paths to all component files
  ],
  theme: {
    extend: {
      boxShadow: {
        input: "0 1px 3px 0 rgba(0, 0, 0, .2), 0 1px 2px 0 rgba(0, 0, 0, .12)",
        "custom-shadow": "0 0 .25em rgba(7, 16, 23, 0.3)",
      },
      colors: {
        panel: "#0f212e",
        inputborader: "#2f4553",
        input_hover: "#557086",
        input_disable: "#172c38",
        input_bg: "#2f4553",
        sider_panel: "#213743",
        text_1: "#879097",
        bet_button: "#00e701",
        bet_hover_button: "#00ff01",
      },
      keyframes: {
        bounding: {
          "0%": { transform: "scale(0.7)" },
          "50%": { transform: "scale(1.1)" },
          "80%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        bounding1: {
          "0%": { transform: "scale(0.9)" },
          "60%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.9)" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.7)" },
          "80%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        zoom: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
        rotateY360: {
          to: { transform: "rotateY(360deg)" },
        },
        rotateY0: {
          to: { transform: "rotateY(0deg)" },
        },
        rotateY180: {
          to: { transform: "rotateY(-180deg)" },
        },
        _outRotateZ: {
          to: { transform: " translate(100px,-150px) rotateZ(-80deg)" },
        },
        outRotateZ: {
          to: { transform: "translate(-100px,-150px) rotateZ(80deg)" },
        },
        rotating: {
          from: { transform: "rotateZ(0deg)" },
          to: { transform: "rotateZ(360deg)" },
        },
        explode: {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "50%": { transform: "translateX(10px)" },
          "75%": { transform: "translateX(-5px)" },
          "100%": { transform: "translateX(0)" },
        },
        baccaratDeal: {
          to: {
            transform: "translate(0px, 0px) scale(1) ",
          },
        },
        actionChip: {
          from: {
            transform: "translateY(300px)",
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        actionChip1: {
          from: {
            transform: "translate(-300px,100px)",
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
      },
      animation: {
        bounding: "bounding 0.5s ease-in-out",
        bounding1: "bounding1 0.8s ease-in-out infinite",
        zoomIn: "zoomIn 0.5s ease-in-out",
        zoom: "zoom 0.7s ease-in-out infinite",
        explode: "explode 0.4s ease",
        baccaratDeal: "baccaratDeal 1s ease-out forwards",
        cardRotate360: "rotateY360 .7s ease-out forwards",
        cardRotate0: "rotateY0 .7s ease-out forwards",
        cardRotate180: "rotateY180 .7s ease-out forwards",
        actionChip: "actionChip 0.5s ease-in-out",
        actionChip1: "actionChip1 0.5s ease-in-out",
        _outRotateZ: "_outRotateZ 0.3s ease-in-out forwards",
        outRotateZ: "outRotateZ 0.3s ease-in-out forwards",
        rotating: "rotating 3s linear infinite",
      },
      boxShadow: {
        "custom-light": "0 2px 4px rgba(0, 0, 0, 0.1)",
        "custom-dark": "0 4px 8px rgba(0, 0, 0, 0.3)",
      },
      width: {
        "9/12": "75%", // Custom width class for 75%
      },
    },
  },
  plugins: [require("tailwindcss")({ watch: true })],
};
