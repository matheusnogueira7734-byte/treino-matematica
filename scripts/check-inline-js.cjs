const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [];
let cursor = 0;

while (true) {
  const open = html.indexOf("<script", cursor);
  if (open < 0) break;
  const openEnd = html.indexOf(">", open);
  const close = html.indexOf("</script>", openEnd + 1);
  if (openEnd < 0 || close < 0) throw new Error("Tag script incompleta.");
  const tag = html.slice(open, openEnd + 1);
  const source = html.slice(openEnd + 1, close);
  if (!tag.includes("src=") && source.trim() && !source.trim().startsWith("{")) {
    scripts.push(source);
  }
  cursor = close + "</script>".length;
}

if (!scripts.length) throw new Error("Nenhum script inline encontrado.");
new vm.Script(scripts[scripts.length - 1], { filename: "index.inline.js" });
console.log("JavaScript inline do index.html: sintaxe válida.");
