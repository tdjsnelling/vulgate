import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { slugify } from "@/pages/[book]/[chapter]";
import contents from "../content/contents.json";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Vulgate Bible</title>
      </Head>
      <div className={styles.Home}>
        <h1>Vulgate</h1>
        <h2>Read the Bible like it’s 1454</h2>
        <div className={styles.Contents}>
          <ul className={styles.Books}>
            {contents.slice(0, 46).map((book) => (
              <li key={book.name}>
                <Link href={`/${slugify(book.name)}/1`}>{book.name}</Link>
              </li>
            ))}
          </ul>
          <ul className={styles.Books}>
            {contents.slice(46).map((book) => (
              <li key={book.name}>
                <Link href={`/${slugify(book.name)}/1`}>{book.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <a className={styles.Author} href="https://tdjs.dev" target="_blank">
          tdjs.dev
        </a>
      </div>
    </>
  );
}
