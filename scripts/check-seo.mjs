import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
function url(path, replacements = {}) {
  let s = readFileSync(path, "utf8");
  for (const [a, b] of Object.entries(replacements)) s = s.replace(a, b);
  return (
    "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(s, {
        compilerOptions: { module: ts.ModuleKind.ESNext },
      }).outputText,
    ).toString("base64")
  );
}
const settings = url("src/features/seo/settings.ts"),
  articles = url("src/pages/website/components/blogArticles.ts");
const { resolveSeo, absoluteSeoUrl } = await import(
  url("src/features/seo/resolveSeo.ts", {
    "'./settings'": JSON.stringify(settings),
    "'@/pages/website/components/blogArticles'": JSON.stringify(articles),
  })
);
const { pageSeo } = await import(settings);
for (const path of Object.keys(pageSeo)) {
  assert.ok(resolveSeo(path).title);
  assert.ok(resolveSeo(path).description);
  assert.equal(resolveSeo(path).canonicalPath, path);
}
assert.equal(
  resolveSeo("/services/", "?utm_source=x").canonicalPath,
  "/services",
);
assert.equal(
  resolveSeo("/blog", "?article=care-conversation&utm_source=x").canonicalPath,
  "/blog?article=care-conversation",
);
assert.match(
  resolveSeo("/blog", "?article=care-conversation").title,
  /Starting/,
);
assert.equal(resolveSeo("/blog", "?article=invalid").noIndex, true);
assert.equal(
  resolveSeo("/customer/profile", "", { noIndex: false }).noIndex,
  true,
);
assert.equal(resolveSeo("/unknown").noIndex, true);
assert.equal(resolveSeo("/unknown").canonicalPath, undefined);
assert.equal(resolveSeo("/login").noIndex, true);
assert.equal(
  resolveSeo("/about", "", { title: "API title" }).title,
  "API title",
);
assert.equal(
  absoluteSeoUrl("/about", "https://care.example"),
  "https://care.example/about",
);
assert.equal(absoluteSeoUrl("/about", ""), undefined);
assert.equal(
  absoluteSeoUrl("javascript:alert(1)", "https://care.example"),
  undefined,
);
console.log(
  "SEO checks passed for " +
    Object.keys(pageSeo).length +
    " pages, article URLs, overrides and robots rules.",
);
