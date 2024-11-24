import fs from "node:fs";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

async function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

const contentsUrlBase = "https://www.perseus.tufts.edu/hopper/xmltoc?doc=";

const initialRef = "Perseus%3Atext%3A1999.02.0060";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "$",
});

const contentsObj = [];

(async () => {
  const initialContentsRes = await fetch(contentsUrlBase + initialRef);
  const initialContentsXml = await initialContentsRes.text();

  const contents = parser.parse(initialContentsXml);

  for (let i = 0; i < contents.contents.chunk.length; i++) {
    const bookRes = await fetch(
      contentsUrlBase + contents.contents.chunk[i].$ref + "%3Averse%3D1",
    );
    const bookXml = await bookRes.text();

    const bookContents = parser.parse(bookXml);

    const book = bookContents.contents.chunk[i];

    const bookContentsObj = { name: book.$n, chapters: [] };

    const chapters = Array.isArray(book.chunk) ? book.chunk : [book.chunk];

    for (let j = 0; j < chapters.length; j++) {
      const chapterName = chapters[j].$n;

      bookContentsObj.chapters.push(chapterName);

      console.log(`[${i}] ${bookContentsObj.name} [${j}] ${chapterName}`);
    }

    contentsObj.push(bookContentsObj);

    await sleep(500);
  }

  fs.writeFileSync(
    "src/content/contents.json",
    JSON.stringify(contentsObj, null, 2),
    "utf-8",
  );
})();
