import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projectDescription, projectMarkdown } from "../src/lib/project-description.ts";
import { panelView, pageMetadata } from "../src/lib/page-metadata.ts";
test("la descripción admite acceso directo y exporta el mismo contenido documentado", async () => {
  assert.equal(panelView("project"), "project");
  assert.ok(pageMetadata.project.title.includes("UNSTA"));
  const markdown = projectMarkdown();
  assert.equal(await readFile(new URL("../docs/descripcion-proyecto.md", import.meta.url), "utf8"), markdown);
  for (const section of projectDescription.sections) {
    assert.ok(markdown.includes(`## ${section.title}\n`));
    for (const item of section.items) assert.ok(markdown.includes(`- ${item}`));
  }
  assert.ok(markdown.endsWith("\n"));
});
