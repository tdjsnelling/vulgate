import type { AppProps } from "next/app";
import "@/styles/globals.css";
import styles from "@/styles/App.module.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="roughpaper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005"
            result="noise"
            numOctaves="10"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor="var(--background)"
            surfaceScale="10"
          >
            <feDistantLight azimuth="110" elevation="60" />
          </feDiffuseLighting>
        </filter>
        <filter id="grain">
          <feTurbulence baseFrequency="0.75" result="colorNoise" />
          <feColorMatrix
            in="colorNoise"
            type="matrix"
            values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"
            result="monoNoise"
          />
          <feComposite operator="out" in="SourceGraphic" in2="monoNoise" />
        </filter>
      </svg>
      <div className={styles.Background} />
      <Component {...pageProps} />
    </>
  );
}
