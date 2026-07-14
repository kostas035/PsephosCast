// scripts/smoke-nonzero.mjs — manual sanity check, not part of the regression suite.
import { snapshotScenario } from "./lib/engine-runner.mjs";

const zero = snapshotScenario("2023", { demSliders: { youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, affluence: 0, gender: 0 } });
const senior = snapshotScenario("2023", { demSliders: { youth: 0, seniors: 10, urban: 0, education: 0, precarity: 0, affluence: 0, gender: 0 } });
const afflu = snapshotScenario("2023", { demSliders: { youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, affluence: 10, gender: 0 } });

const evrytania0 = zero.districts.find(d => d.id === "evrytania");
const evrytaniaS = senior.districts.find(d => d.id === "evrytania");
console.log("Evrytania (oldest district) electorate: zero-slider =", evrytania0.electorate, "| seniors +10 =", evrytaniaS.electorate,
  `(${(((evrytaniaS.electorate / evrytania0.electorate) - 1) * 100).toFixed(1)}%)`);
console.log("Evrytania ND share: zero =", evrytania0.votes.nd.toFixed(2), "| seniors +10 =", evrytaniaS.votes.nd.toFixed(2));

const athensA0 = zero.districts.find(d => d.id === "athens_b1");
const athensAff = afflu.districts.find(d => d.id === "athens_b1");
const westAttica0 = zero.districts.find(d => d.id === "west_attica");
const westAttAff = afflu.districts.find(d => d.id === "west_attica");
console.log("Affluence +10 — Athens B1 (rich) ND share:", athensA0.votes.nd.toFixed(2), "->", athensAff.votes.nd.toFixed(2));
console.log("Affluence +10 — West Attica (poor) ND share:", westAttica0.votes.nd.toFixed(2), "->", westAttAff.votes.nd.toFixed(2));

const natZero = Object.fromEntries(zero.results.map(r => [r.id, r.nationalPct]));
const natSenior = Object.fromEntries(senior.results.map(r => [r.id, r.nationalPct]));
console.log("National ND% zero vs seniors+10 (should be ~equal, geo layer is share-neutral nationally):", natZero.nd?.toFixed(3), natSenior.nd?.toFixed(3));
