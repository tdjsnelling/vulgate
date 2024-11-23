import { useEffect, useRef } from "react";
import fs from "node:fs";
import { globby } from "globby";
import styles from "@/styles/Chapter.module.css";

function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function capitalise(string: string): string {
  return string.substring(0, 1).toUpperCase() + string.substring(1);
}

function unslugify(string) {
  return string.replaceAll(/-([a-z])/g, " $1");
}

function formatCharacters() {
  const content: HTMLParagraphElement = document.querySelector("#content");

  if (!content) return;

  const chars = content.innerText.split("");

  let html = "";

  let lastChar = "";

  for (const char of chars) {
    if (lastChar === "." && char !== " ") {
      const style = [
        `--strokeRotation: ${randomNumber(-10, 10)}deg`,
        `--strokeHeight: ${randomNumber(0.6, 0.8)}em`,
      ];

      html += `<span class="${styles.Char} ${styles.Initial}" style="${style.join(";")}">${char}</span>`;
    } else {
      const style = [
        `--charRotation: ${randomNumber(-1, 1)}deg`,
        `--charTranslationX: ${randomNumber(-0.5, 0.5)}px`,
        `--charTranslationY: ${randomNumber(-0.5, 0.5)}px`,
      ];

      if (char !== " ") style.push("display: inline-block");

      html += `<span class="${styles.Char}" style="${style.join(";")}">${char}</span>`;
    }

    if (char !== " ") lastChar = char;
  }

  content.innerHTML = html;
}

function markWrappers() {
  console.log("resize");

  const spans: NodeListOf<HTMLSpanElement> =
    document.querySelectorAll("#content span");

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const nextSpan = spans[i + 1];

    if (
      nextSpan &&
      nextSpan.innerText !== " " &&
      span.innerText !== " " &&
      nextSpan.offsetLeft < span.offsetLeft
    ) {
      span.classList.add(styles.WrapHere);
    } else {
      span.classList.remove(styles.WrapHere);
    }
  }
}

export default function Chapter({ book, chapter, text }) {
  const makeWrappersTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    formatCharacters();

    setTimeout(() => {
      markWrappers();
    }, 100);

    function markWrappersTimeout() {
      if (makeWrappersTimeoutRef.current) {
        clearTimeout(makeWrappersTimeoutRef.current);
        makeWrappersTimeoutRef.current = undefined;
      }

      makeWrappersTimeoutRef.current = setTimeout(markWrappers, 100);
    }

    window.addEventListener("resize", markWrappersTimeout);

    return () => {
      window.removeEventListener("resize", markWrappersTimeout);
    };
  }, []);

  return (
    <>
      <svg height="0">
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
            surfaceScale="5"
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

      <div className={styles.Manuscript}>
        <h1>
          {unslugify(book)}: {chapter}
        </h1>
        <p id="content">{text}</p>
      </div>
    </>
  );
}

export async function getStaticProps({
  params: { book, chapter },
}: {
  params: { book: string; chapter: string };
}) {
  const text = fs.readFileSync(`src/content/${book}/${chapter}.txt`, "utf-8");

  return {
    props: {
      book,
      chapter,
      text,
    },
  };
}

export async function getStaticPaths() {
  const paths = await globby("src/content/**/*.txt");

  return {
    paths: paths.map((path) => {
      const split = path.split("/");
      const chapter = split.pop()?.replace(".txt", "");
      const book = split.pop();

      return { params: { book, chapter } };
    }),
    fallback: false,
  };
}
