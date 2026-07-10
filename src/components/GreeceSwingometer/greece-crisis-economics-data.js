// Three more 2009-2019 regional crisis-era series (Eurostat regional statistics,
// NUTS-2, retrieved live via the Eurostat REST API on 2026-07-05), same 13
// regions as GR_UNEMPLOYMENT_BY_REGION in greece-unemployment-data.js — so it
// slots into the same lookup-by-region pipeline with no renaming logic.
//
// Sources (Eurostat dataset code / dimension filter used):
//   - Youth unemployment (15-24):   lfst_r_lfu3rt  (isced11=TOTAL, sex=T, age=Y15-24, unit=PC)
//   - Long-term unemployment rate:  lfst_r_lfu2ltu (isced11=TOTAL, sex=T, age=Y15-74, unit=PC_ACT)
//     — share of the *labour force* that has been unemployed 12+ months, not
//     share of the unemployed; comparable in scale to the headline rate.
//   - GDP per capita (EUR/inhabitant): nama_10r_2gdp (unit=EUR_HAB)
//
// Ionian Islands youth unemployment for 2019 is genuinely missing from
// Eurostat (no survey estimate published) — left as null; every accessor
// below already tolerates that the way greece-unemployment-data.js does.
const YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];

const series = (...vals) => Object.fromEntries(YEARS.map((y, i) => [y, vals[i] ?? null]));

export const GR_YOUTH_UNEMPLOYMENT_BY_REGION = {
  "Attica":                    series(21.9, 30.9, 43.2, 56.0, 60.6, 52.5, 47.2, 45.4, 43.4, 39.3, 32.1),
  "Central Macedonia":         series(28.0, 34.1, 51.4, 60.7, 62.0, 53.4, 51.9, 51.9, 43.0, 35.6, 29.2),
  "West Greece":               series(28.8, 35.3, 45.1, 56.8, 59.0, 61.1, 54.6, 51.5, 46.7, 44.7, 46.8),
  "Peloponnese":                series(25.8, 29.0, 39.0, 62.3, 60.3, 52.0, 50.5, 51.7, 45.1, 47.7, 34.5),
  "Epirus":                    series(34.7, 37.1, 48.6, 61.1, 67.4, 69.8, 58.6, 46.1, 58.0, 45.8, 39.1),
  "Central Greece":            series(32.9, 36.9, 42.5, 58.7, 59.5, 59.1, 55.4, 52.6, 45.4, 51.1, 47.9),
  "West Macedonia":            series(34.8, 35.3, 52.7, 72.3, 70.4, 49.6, 49.4, 48.8, 55.0, 62.0, 53.5),
  "East Macedonia & Thrace":   series(30.4, 40.1, 51.8, 53.0, 59.4, 50.7, 53.8, 53.4, 42.8, 38.3, 39.7),
  "South Aegean":              series(24.5, 28.4, 36.8, 41.0, 37.2, 25.8, 33.8, 33.5, 29.4, 28.4, 30.4),
  "Ionian Islands":            series(26.5, 35.2, 26.2, 23.9, 51.5, 44.8, 54.6, 38.2, 42.7, 35.6, null),
  "Crete":                     series(20.9, 30.4, 39.8, 44.1, 45.4, 46.3, 40.4, 41.0, 32.9, 24.5, 30.5),
  "North Aegean":              series(24.6, 29.7, 43.0, 45.8, 46.1, 40.2, 42.1, 36.2, 58.2, 56.7, 41.5),
  "Thessaly":                  series(26.6, 34.4, 46.7, 53.7, 57.5, 59.8, 60.3, 52.7, 45.5, 43.6, 42.1),
};

export const GR_LONGTERM_UNEMPLOYMENT_BY_REGION = {
  "Attica":                    series(3.3, 5.1, 8.7, 15.3, 19.8, 21.2, 19.3, 16.9, 16.7, 15.1, 12.7),
  "Central Macedonia":         series(4.7, 7.1, 10.8, 16.5, 20.8, 21.7, 19.4, 18.6, 16.6, 14.0, 13.2),
  "West Greece":               series(5.0, 6.1, 9.4, 16.4, 20.6, 22.1, 21.7, 22.5, 19.6, 17.5, 18.2),
  "Peloponnese":                series(4.2, 5.7, 8.0, 13.5, 15.7, 17.3, 17.2, 14.5, 12.3, 10.5, 9.0),
  "Epirus":                    series(6.3, 7.6, 8.8, 12.0, 17.2, 20.3, 17.9, 18.9, 18.5, 15.5, 12.2),
  "Central Greece":            series(4.5, 6.9, 11.4, 15.9, 20.0, 19.4, 19.8, 19.4, 15.5, 14.1, 12.8),
  "West Macedonia":            series(5.8, 7.9, 11.7, 18.0, 20.7, 16.6, 19.5, 20.7, 20.7, 19.3, 17.0),
  "East Macedonia & Thrace":   series(5.5, 7.9, 10.9, 14.1, 18.4, 17.2, 16.1, 15.8, 14.0, 10.9, 12.1),
  "South Aegean":              series(1.7, 2.2, 3.3, 4.4, 8.0, 9.0, 6.5, 7.8, 6.4, 5.5, 4.6),
  "Ionian Islands":            series(1.9, 3.2, 4.3, 6.1, 8.5, 13.0, 12.9, 8.2, 10.1, 8.7, 5.7),
  "Crete":                     series(2.7, 4.1, 5.1, 10.8, 14.1, 15.2, 13.5, 12.7, 10.0, 6.7, 5.7),
  "North Aegean":              series(3.1, 4.6, 8.8, 14.7, 14.9, 15.0, 12.9, 12.3, 15.2, 15.2, 11.5),
  "Thessaly":                  series(3.5, 5.1, 7.8, 13.1, 17.0, 18.8, 19.8, 18.7, 16.0, 13.1, 12.7),
};

export const GR_GDP_PER_CAPITA_BY_REGION = {
  "Attica":                    series(28400, 27100, 24800, 22500, 21800, 21800, 21900, 22000, 22500, 23000, 23800),
  "Central Macedonia":         series(16800, 15700, 14500, 13300, 12600, 12400, 12600, 12800, 12900, 13300, 13600),
  "West Greece":               series(15600, 15200, 13600, 12600, 12000, 12000, 12100, 11900, 12100, 12100, 12400),
  "Peloponnese":                series(17000, 16300, 15100, 14200, 13700, 13500, 13800, 13900, 14300, 14400, 14800),
  "Epirus":                    series(14000, 13800, 12700, 11300, 11100, 11000, 10900, 11000, 11000, 11300, 11500),
  "Central Greece":            series(18700, 17700, 16300, 15200, 14300, 13800, 14000, 14200, 14600, 15000, 15200),
  "West Macedonia":            series(17800, 18000, 17700, 19000, 18200, 18300, 17200, 15900, 16000, 15900, 15200),
  "East Macedonia & Thrace":   series(15000, 14900, 12900, 11900, 11200, 11000, 10900, 11100, 11100, 11300, 11400),
  "South Aegean":              series(22800, 21600, 19600, 17900, 18400, 18400, 18000, 17300, 17400, 17900, 18400),
  "Ionian Islands":            series(20100, 19000, 16400, 15100, 14900, 15200, 14900, 14800, 15100, 15500, 16000),
  "Crete":                     series(18400, 17400, 15300, 13800, 13700, 14000, 14000, 13600, 14100, 14300, 14700),
  "North Aegean":              series(16700, 15700, 14400, 13200, 12800, 12800, 12500, 12100, 11700, 11400, 11300),
  "Thessaly":                  series(15700, 14400, 13000, 12400, 12000, 12000, 12300, 12200, 12300, 12700, 13200),
};

// Shared accessor factory — forRegion/extremum/changeSince2009 for a given
// table, so the three series above don't each need their own hand-written
// trio of functions (see grUnemploymentForRegion & co. in
// greece-unemployment-data.js for the pattern this generalises).
function makeAccessors(table, { extremum = "max" } = {}) {
  const pick = extremum === "min" ? Math.min : Math.max;
  return {
    forRegion(regionName, year) {
      const v = table[regionName]?.[year];
      return typeof v === "number" ? v : null;
    },
    extremum(regionName) {
      const row = table[regionName];
      if (!row) return null;
      const vals = Object.values(row).filter(v => typeof v === "number");
      return vals.length ? pick(...vals) : null;
    },
    changeSince2009(regionName, year) {
      const row = table[regionName];
      if (!row) return null;
      const base = row[YEARS[0]], v = row[year];
      return (typeof base === "number" && typeof v === "number") ? v - base : null;
    },
  };
}

const youthAcc = makeAccessors(GR_YOUTH_UNEMPLOYMENT_BY_REGION, { extremum: "max" });
const ltuAcc = makeAccessors(GR_LONGTERM_UNEMPLOYMENT_BY_REGION, { extremum: "max" });
const gdpAcc = makeAccessors(GR_GDP_PER_CAPITA_BY_REGION, { extremum: "min" }); // "trough", not peak

export const grYouthUnemploymentForRegion = youthAcc.forRegion;
export const grYouthUnemploymentPeak = youthAcc.extremum;
export const grYouthUnemploymentChangeSince2009 = youthAcc.changeSince2009;

export const grLongtermUnemploymentForRegion = ltuAcc.forRegion;
export const grLongtermUnemploymentPeak = ltuAcc.extremum;
export const grLongtermUnemploymentChangeSince2009 = ltuAcc.changeSince2009;

export const grGdpPerCapitaForRegion = gdpAcc.forRegion;
export const grGdpPerCapitaTrough = gdpAcc.extremum; // crisis-era low point, not a "peak"
export const grGdpPerCapitaChangeSince2009 = gdpAcc.changeSince2009;
