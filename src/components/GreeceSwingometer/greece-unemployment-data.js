// Annual unemployment rate (%) per NUTS-2 region, 2009–2019 (Eurostat/ELSTAT
// regional labour force survey). This is regional-level data, not per-district —
// every electoral district within a region carries the same yearly figure, which
// is why the lookup below is keyed by region name (matching REGIONS in
// greece-analysis-data.js) rather than by district id.
//
// The 2009–2019 window spans the Greek sovereign debt crisis almost exactly:
// unemployment roughly tripled from 2009 to its 2013 peak before a slow, uneven
// recovery. That makes it useful for more than a single-year covariate — the
// PEAK level and the CHANGE since 2009 (computed in greece-analysis-data.js) are
// arguably more interesting predictors of radical/anti-establishment vote share
// than any single year's rate on its own.
export const GR_UNEMPLOYMENT_YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];

const series = (...vals) => Object.fromEntries(GR_UNEMPLOYMENT_YEARS.map((y, i) => [y, vals[i]]));

export const GR_UNEMPLOYMENT_BY_REGION = {
  "Attica":                    series(8.8, 12.3, 17.6, 25.3, 28.2, 27.4, 25.2, 23.0, 21.6, 19.9, 16.9),
  "Central Macedonia":         series(9.9, 13.5, 19.5, 26.0, 30.0, 28.7, 26.0, 24.5, 22.9, 20.7, 19.6),
  "West Greece":               series(9.5, 11.7, 17.3, 25.5, 28.3, 28.7, 28.5, 29.8, 26.3, 24.1, 24.1),
  "Peloponnese":                series(8.0, 9.8, 14.2, 19.9, 22.5, 23.4, 22.3, 19.2, 16.8, 14.4, 12.0),
  "Epirus":                    series(11.2, 12.6, 16.7, 22.9, 27.8, 26.8, 24.6, 24.4, 24.8, 20.1, 16.4),
  "Central Greece":            series(10.5, 12.5, 18.9, 27.8, 27.9, 26.9, 26.0, 25.0, 20.9, 18.9, 17.2),
  "West Macedonia":            series(12.5, 15.5, 23.2, 29.9, 31.8, 27.6, 30.8, 31.3, 29.1, 27.0, 24.6),
  "East Macedonia & Thrace":   series(10.9, 14.2, 19.9, 22.5, 26.4, 24.3, 23.4, 22.8, 19.5, 16.0, 16.2),
  "South Aegean":              series(12.0, 14.2, 15.0, 15.1, 20.7, 20.1, 14.9, 17.5, 16.0, 16.9, 13.7),
  "Ionian Islands":            series(9.7, 14.8, 14.2, 14.7, 18.3, 21.4, 19.0, 16.0, 19.7, 16.0, 12.4),
  "Crete":                     series(8.8, 11.7, 15.4, 21.7, 24.4, 24.0, 24.3, 22.6, 17.7, 13.4, 11.7),
  "North Aegean":              series(6.0, 9.0, 14.3, 21.2, 21.3, 22.4, 18.0, 18.3, 22.5, 22.3, 17.7),
  "Thessaly":                  series(9.2, 12.1, 16.8, 22.6, 25.4, 25.6, 27.1, 25.5, 20.7, 18.4, 18.7),
};

export function grUnemploymentForRegion(regionName, year) {
  const row = GR_UNEMPLOYMENT_BY_REGION[regionName];
  if (!row) return null;
  const v = row[year];
  return typeof v === "number" ? v : null;
}

export function grUnemploymentPeak(regionName) {
  const row = GR_UNEMPLOYMENT_BY_REGION[regionName];
  if (!row) return null;
  return Math.max(...Object.values(row));
}

export function grUnemploymentChangeSince2009(regionName, year) {
  const row = GR_UNEMPLOYMENT_BY_REGION[regionName];
  if (!row) return null;
  const base = row[GR_UNEMPLOYMENT_YEARS[0]];
  const v = row[year];
  return (typeof base === "number" && typeof v === "number") ? v - base : null;
}
