import { useEffect, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import fs from "node:fs";
import { globby } from "globby";
import opentype from "opentype.js";
import styles from "@/styles/Chapter.module.css";
import contents from "../../content/contents.json";

function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function slugify(string: string): string {
  return string.replaceAll(" ", "-").toLowerCase();
}

async function formatCharacters() {
  const content: HTMLParagraphElement | null =
    document.querySelector("#content");

  if (!content) return;

  const chars = content.innerText.split("");

  let html = "";

  let lastChar = "";

  const buffer = fetch("/fonts/JohannesG.otf").then((res) => res.arrayBuffer());
  const font = opentype.parse(await buffer);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (i === 0) {
      const path = font.getPath(char, 0, 0, 170);
      const bbox = path.getBoundingBox();

      const w = bbox.x2 - bbox.x1;
      const h = bbox.y2 - bbox.y1;

      const dw = (200 - w) / 2;
      const dh = (200 - h) / 2;

      const tx = dw - bbox.x1;
      const ty = dh - bbox.y1;

      const d = path.toPathData(2);

      html += `<div class="${styles.Dropcap}" style="--rotation: ${randomNumber(-1, 1)}deg">
        <svg viewBox="0 0 200 200">
          <path d="${d}" transform="translate(${tx}, ${ty})" />
        </svg>
      </div>
      <span class="${styles.Invisible}">${char}</span>`;
    } else if (lastChar === "." && char !== " ") {
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

type NavObject = {
  name: string;
  href: string;
};

function Nav({ prev, next }: { prev?: NavObject; next?: NavObject }) {
  return (
    <nav className={styles.Nav}>
      {prev ? (
        <Link href={prev.href}>{prev.name}</Link>
      ) : (
        <div style={{ width: "150px" }} />
      )}
      <Link href="/">Index</Link>
      {next ? (
        <Link href={next.href}>{next.name}</Link>
      ) : (
        <div style={{ width: "150px" }} />
      )}
    </nav>
  );
}

export default function Chapter({
  book,
  chapter,
  text,
  prev,
  next,
}: {
  book: string;
  chapter: string;
  text: string;
  prev?: NavObject;
  next?: NavObject;
}) {
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
  }, [book, chapter]);

  return (
    <>
      <Head>
        <title>{`${book}: ${chapter} — Vulgate Bible`}</title>
      </Head>
      <Nav prev={prev} next={next} />
      <div className={styles.Manuscript}>
        <h1>
          {book}: {chapter}
        </h1>
        <p id="content">{text}</p>
      </div>
      <Nav prev={prev} next={next} />
      <a className={styles.Author} href="https://tdjs.dev" target="_blank">
        tdjs.dev
      </a>
    </>
  );
}

export async function getStaticProps({
  params: { book, chapter },
}: {
  params: { book: string; chapter: string };
}) {
  let text;

  try {
    text = fs.readFileSync(`src/content/${book}/${chapter}.txt`, "utf-8");
  } catch (e) {
    console.error(e);

    return { notFound: true };
  }

  const thisBookIndex = (
    contents as [{ name: string; chapters: string[] }]
  ).findIndex((b) => slugify(b.name) === book);

  const thisBook = contents[thisBookIndex];

  if (!thisBook) {
    return {
      props: {
        book,
        chapter,
        text,
      },
    };
  }

  const thisChapter = thisBook.chapters.findIndex((c) => c === chapter);

  let prevBook = thisBook;
  let nextBook = thisBook;

  let prevChapter = thisBook.chapters[thisChapter - 1];
  let nextChapter = thisBook.chapters[thisChapter + 1];

  if (!prevChapter) {
    prevBook = contents[thisBookIndex - 1];
    if (prevBook) prevChapter = prevBook.chapters[prevBook.chapters.length - 1];
  }

  if (!nextChapter) {
    nextBook = contents[thisBookIndex + 1];
    if (nextBook) nextChapter = "1";
  }

  return {
    props: {
      book: thisBook.name,
      chapter,
      text,
      prev: prevChapter
        ? {
            name: `${prevBook.name}: ${prevChapter}`,
            href: `/${slugify(prevBook.name)}/${prevChapter}`,
          }
        : null,
      next: nextChapter
        ? {
            name: `${nextBook.name}: ${nextChapter}`,
            href: `/${slugify(nextBook.name)}/${nextChapter}`,
          }
        : null,
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
