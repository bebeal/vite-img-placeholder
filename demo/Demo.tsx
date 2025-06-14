import { Terminal } from "@bebeal/terminal";
import "@bebeal/terminal/style.css";
import React, { useEffect, useState } from "react";
import fast4GThrottle from "./assets/Fast4GThrottle.png?p=blur";
import mountainImageBlur from "./assets/mountains.png?p=blur";
import mountainImageRgb from "./assets/mountains.png?p=rgb";
import mountainImageShimmer from "./assets/mountains.png?p=shimmer";
import "./assets/styles.css";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="theme-toggle"
      type="button"
      aria-label={`Toggle theme`}
    >
      {isDarkMode ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
};

const installPluginConfig = `import viteImgPlaceholder from 'vite-img-placeholder';
export default {
  plugins: [viteImgPlaceholder()],
  ...
};`

const installInstructions = "Integrate the plugin into your vite config";

const throttleInstructions = "Enable Fast 4G Throttle in devtools to see placeholders";

const blurCode = `import mountainImageBlur from "./assets/mountains.png?p=blur";
const Image = <img src={mountainImageBlur} />`;

const shimmerCode = `import mountainImageShimmer from "./assets/mountains.png?p=shimmer";
const Image = <img src={mountainImageShimmer} />`;

const rgbCode = `import mountainImageRgb from "./assets/mountains.png?p=rgb";
const Image = <img src={mountainImageRgb} />`;

export const Demo = () => {
  return (
    <div className="container">
      <ThemeToggle />
      <div className="left-column">
        <div className="demo-display-col">
          <div>Plugin Setup</div>
          <div>{installInstructions}</div>
          <Terminal language="ts" title="vite.config.">
            {installPluginConfig}
          </Terminal>
        </div>
        <div className="demo-display-col">
          <div>Demo Instructions</div>
          <div>{throttleInstructions}</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', justifyContent: 'center', minHeight: '222px' }}>
            <div className="kbd">F12</div>
            <div>+</div>
            <img src={fast4GThrottle} style={{ objectFit: 'contain', width: '400px', height: '100%' }} />
          </div>
        </div>
      </div>
      <div className="right-column">
        <div className="demo-display-row">
          <Terminal language="jsx" title="Blur." className="mw-500">
            {blurCode}
          </Terminal>
          <img src={mountainImageBlur} style={{ objectFit: 'contain', maxWidth: '350px', height: '100%', borderRadius: '10px' }} />
        </div>
        <div className="demo-display-row">
          <Terminal language="jsx" title="Shimmer." className="mw-500">
            {shimmerCode}
          </Terminal>
          <img src={mountainImageShimmer} style={{ objectFit: 'contain', maxWidth: '350px', height: '100%', borderRadius: '10px' }} />
        </div>
        <div className="demo-display-row">
          <Terminal language="jsx" title="RGB." className="mw-500">
            {rgbCode}
          </Terminal>
          <img src={mountainImageRgb} style={{ objectFit: 'contain', maxWidth: '350px', height: '100%', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  );
};
