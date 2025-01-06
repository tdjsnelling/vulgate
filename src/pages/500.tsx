import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { slugify } from "@/pages/[book]/[chapter]";
import contents from "../content/contents.json";
import Head from "next/head";

export default function Error() {
  return (
    <>
      <Head>
        <title>Error — Vulgate Bible</title>
      </Head>
      <div className={styles.Home}>
        <h1>An error occurred</h1>
        <Link href="/" className={styles.Author}>
          Index
        </Link>
      </div>
    </>
  );
}
