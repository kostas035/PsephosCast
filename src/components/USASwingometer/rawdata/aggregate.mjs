import fs from "node:fs";

const FIPS_STATE = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY",
  "22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT",
  "31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH",
  "40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"
};

const raw = fs.readFileSync(new URL("./counties.csv", import.meta.url), "utf8").trim().split("\n");
const counties = {}; // fips -> [gop, dem, total]
const states = {};   // abbr -> {gop, dem, total, n}

for (const line of raw) {
  const [fips, gop, dem, total] = line.split(",");
  const g = +gop, d = +dem, t = +total;
  counties[fips] = [g, d, t];
  const abbr = FIPS_STATE[fips.slice(0, 2)];
  if (!abbr) { console.error("UNKNOWN STATE PREFIX", fips); continue; }
  if (!states[abbr]) states[abbr] = { gop: 0, dem: 0, total: 0, n: 0 };
  states[abbr].gop += g; states[abbr].dem += d; states[abbr].total += t; states[abbr].n++;
}

console.log("=== County rows:", raw.length, "===");
console.log("=== States covered (from real county data) ===");
for (const [abbr, s] of Object.entries(states)) {
  console.log(abbr, "counties=" + s.n, "gop=" + s.gop, "dem=" + s.dem, "total=" + s.total,
    "gop%=" + (100 * s.gop / s.total).toFixed(2), "dem%=" + (100 * s.dem / s.total).toFixed(2));
}

fs.writeFileSync(new URL("./counties-agg.json", import.meta.url), JSON.stringify({ counties, states }));
console.log("Wrote counties-agg.json");
