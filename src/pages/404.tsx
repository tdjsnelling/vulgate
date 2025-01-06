import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { slugify } from "@/pages/[book]/[chapter]";
import contents from "../content/contents.json";
import Head from "next/head";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Not found — Vulgate Bible</title>
      </Head>
      <div className={styles.Home}>
        <h1>Page not found</h1>
        <Link href="/" className={styles.Author}>
          Index
        </Link>
      </div>
    </>
  );
}
