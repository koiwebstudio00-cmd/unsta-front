import { mkdir, writeFile } from "node:fs/promises";
import { projectMarkdown } from "../src/lib/project-description.ts";
await mkdir(new URL("../docs/", import.meta.url), { recursive: true });
await writeFile(new URL("../docs/descripcion-proyecto.md", import.meta.url), projectMarkdown(), "utf8");
console.log("Descripción exportada a docs/descripcion-proyecto.md");
