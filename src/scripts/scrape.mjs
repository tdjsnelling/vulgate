import fs from "node:fs";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

function slugify(string) {
  return string.replaceAll(" ", "-").toLowerCase();
}

function capitalise(string) {
  return string.substring(0, 1).toUpperCase() + string.substring(1);
}

async function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

const contentsUrlBase = "https://www.perseus.tufts.edu/hopper/xmltoc?doc=";
const chunkUrlBase = "https://www.perseus.tufts.edu/hopper/xmlchunk?doc=";

const initialRef = "Perseus%3Atext%3A1999.02.0060";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "$",
});

(async () => {
  const initialContentsRes = await fetch(contentsUrlBase + initialRef);
  const initialContentsXml = await initialContentsRes.text();

  const contents = parser.parse(initialContentsXml);

  for (let i = 75; i < contents.contents.chunk.length; i++) {
    const bookRes = await fetch(
      contentsUrlBase + contents.contents.chunk[i].$ref + "%3Averse%3D1",
    );
    const bookXml = await bookRes.text();

    const bookContents = parser.parse(bookXml);

    const book = bookContents.contents.chunk[i];

    const chapters = Array.isArray(book.chunk) ? book.chunk : [book.chunk];

    for (let j = 0; j < chapters.length; j++) {
      const chapterRes = await fetch(chunkUrlBase + chapters[j].$ref);
      const chapterXml = await chapterRes.text();

      const chapterContents = parser.parse(chapterXml);

      const bookName = chapterContents["TEI.2"].text.body.div1.$n;
      const chapterName = chapterContents["TEI.2"].text.body.div1.div2.$n;

      try {
        fs.mkdirSync(`src/content/${slugify(bookName)}`);
      } catch (e) {}

      const chapter = chapterContents["TEI.2"].text.body.div1.div2.p.s ?? [
        chapterContents["TEI.2"].text.body.div1.div2.p["#text"] ??
          chapterContents["TEI.2"].text.body.div1.div2.p,
      ];
      console.log(chapter);

      fs.writeFileSync(
        `src/content/${slugify(bookName)}/${chapterName}.txt`,
        chapter.map((verse) => capitalise(verse["#text"] ?? verse)).join(". ") +
          ".",
        "utf-8",
      );

      console.log(`[${i}] ${bookName} [${j}] ${chapterName}`);

      await sleep(500);
    }
  }
})();
