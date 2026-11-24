// Chọn khách cần deploy theo các file thay đổi trong lần gộp vào main.
// - Chỉ đổi clients/<ma-khach>/...  → deploy riêng khách đó (nếu đang bật deploy).
// - Đổi mã chung (src/, public/, migrations/, package*.json, astro.config, scripts/ trừ tài liệu) → deploy mọi khách đang bật.
// - Chỉ đổi tài liệu (docs/, *.md, test/, .github/ trừ deploy.yml) → không deploy.
const DOC_ONLY = [/^docs\//, /\.md$/i, /^test\//, /^\.github\/(?!workflows\/deploy\.yml$)/, /^\.gitignore$/];

export function affectedClients(changedFiles, enabledClients) {
  const enabled = new Set(enabledClients);
  const out = new Set();
  for (const f of changedFiles.map((s) => s.trim()).filter(Boolean)) {
    const m = f.match(/^clients\/([^/]+)\//);
    if (m) { if (enabled.has(m[1])) out.add(m[1]); continue; }
    if (DOC_ONLY.some((re) => re.test(f))) continue;
    return [...enabledClients]; // mã chung đổi: mọi khách
  }
  return enabledClients.filter((s) => out.has(s));
}
