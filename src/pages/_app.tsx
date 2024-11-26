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
            numOctaves="10"
            seed={Math.random() * 100}
            result="noise"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor="var(--background)"
            surfaceScale="10"
            result="lit"
          >
            <feDistantLight azimuth="110" elevation="60" />
          </feDiffuseLighting>
        </filter>
        <filter id="grain">
          <feTurbulence
            baseFrequency="0.75"
            seed={Math.random() * 100}
            result="noise"
          />
          <feComposite operator="out" in="SourceGraphic" in2="noise" />
        </filter>
        <filter id="ink">
          <feTurbulence baseFrequency="0.05" result="colorNoise" />
          <feColorMatrix
            in="colorNoise"
            type="matrix"
            values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0.5 0"
            result="monoNoise"
          />
          <feComposite operator="out" in="SourceGraphic" in2="monoNoise" />
        </filter>
        <filter id="giltroughedge">
          <feTurbulence
            baseFrequency="0.04"
            numOctaves="2"
            type="fractalNoise"
            seed={Math.random() * 100}
            result="noise"
          />
          <feDisplacementMap
            in2="noise"
            scale="10"
            result="map"
            xChannelSelector="R"
            in="SourceGraphic"
          />
          <feComposite operator="atop" in="SourceGraphic" in2="map" />
        </filter>
        <filter id="inkroughedge">
          <feTurbulence
            baseFrequency="0.05"
            numOctaves="2"
            type="fractalNoise"
            seed={Math.random() * 100}
            result="noise"
          />
          <feDisplacementMap
            in2="noise"
            scale="4"
            result="map"
            xChannelSelector="R"
            in="SourceGraphic"
          />
          <feComposite operator="atop" in="SourceGraphic" in2="map" />
        </filter>
      </svg>
      <div className={styles.Background} />
      <Component {...pageProps} />
    </>
  );
}
