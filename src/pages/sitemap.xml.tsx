import contents from "../content/contents.json";
import { slugify } from "@/pages/[book]/[chapter]";

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const chapters = [];

  for (const book of contents) {
    for (const chapter of book.chapters) {
      chapters.push(`<url>
        <loc>https://example.com/${slugify(book.name)}/${chapter}</loc>
    </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://example.com</loc>
    </url>
    ${chapters.join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}
