const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim() && !source.trim().startsWith("{"));

if (!scripts.length) throw new Error("Nenhum script inline encontrado.");
new vm.Script(scripts[scripts.length - 1], { filename: "index.inline.js" });
console.log("JavaScript inline do index.html: sintaxe válida.");
