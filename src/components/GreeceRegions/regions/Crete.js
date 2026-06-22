// ─── Crete.js ─────────────────────────────────────────────────────────────────
// Regional Council election data for Crete (Περιφέρεια Κρήτης).
//
// ELECTORAL SYSTEM (Law 3852/2010 as amended):
//   • 61 total council seats.
//   • First round: candidate with >50%+1 votes wins outright.
//     If no one clears 50%, a runoff is held between the top two.
//   • Winner automatically receives 37 seats (≈ 3/5 of council).
//   • Remaining 24 seats distributed by Hare quota among all lists that
//     cleared the 3% threshold in round one (winner's list excluded).
//
// CANDIDATE ID CONVENTION:
//   IDs must match the keys used in baseVote objects in `details`.
//   This was inconsistent in v1 (arnautakis ≠ arnaoutakis, kke, ecology).
//   All 2023 and 2019 references now use the canonical IDs below.
//
// SCENARIOS:
//   "2023"  — October 8  2023  (base/default, stored in config.candidates)
//   "2019"  — May 26     2019
//   "2014"  — May 18     2014  (Round 1 — nobody cleared 50%, runoff followed)

// ─── 2023 Municipality Demographics & Baseline Votes ─────────────────────────
// baseVote values reflect the actual certified municipal-level results from the
// October 8, 2023 Crete regional election (Heraklion Prefecture public records).
// Where municipality-level data was not officially published, results are
// interpolated from district-level returns using population weighting.
const CRETE_DETAILS_2023 = {

  // ── CHANIA DISTRICT ──────────────────────────────────────────────────────────
  "Chania": {
    pop: 111359, baseTurnout: 58.5, elasticity: 1.10, urbanization: 0.90,
    baseVote: { arnaoutakis: 69.1, danellis: 13.5, marinakis: 13.6, zampoulakis: 3.8 }
  },
  "Platanias": {
    pop: 31059, baseTurnout: 56.2, elasticity: 1.05, urbanization: 0.40,
    baseVote: { arnaoutakis: 65.3, danellis: 12.1, marinakis: 19.7, zampoulakis: 2.9 }
  },
  "Apokoronas": {
    pop: 11559, baseTurnout: 55.0, elasticity: 1.00, urbanization: 0.35,
    baseVote: { arnaoutakis: 72.5, danellis: 10.7, marinakis: 14.3, zampoulakis: 2.5 }
  },
  "Kissamos": {
    pop: 11572, baseTurnout: 54.5, elasticity: 0.95, urbanization: 0.30,
    baseVote: { arnaoutakis: 74.7, danellis: 10.1, marinakis: 12.6, zampoulakis: 2.6 }
  },
  "Kandanos-Selino": {
    pop: 8036, baseTurnout: 53.0, elasticity: 0.90, urbanization: 0.20,
    baseVote: { arnaoutakis: 67.9, danellis: 12.3, marinakis: 17.3, zampoulakis: 2.5 }
  },
  "Sfakia": {
    pop: 2158, baseTurnout: 59.0, elasticity: 1.20, urbanization: 0.10,
    baseVote: { arnaoutakis: 66.9, danellis: 23.7, marinakis: 7.6, zampoulakis: 1.8 }
  },
  "Gavdos": {
    pop: 127, baseTurnout: 65.0, elasticity: 1.50, urbanization: 0.00,
    baseVote: { arnaoutakis: 72.6, danellis: 16.1, marinakis: 9.7, zampoulakis: 1.6 }
  },

  // ── RETHYMNO DISTRICT ────────────────────────────────────────────────────────
  "Rethymno": {
    pop: 57216, baseTurnout: 57.0, elasticity: 1.10, urbanization: 0.85,
    baseVote: { arnaoutakis: 83.1, danellis: 10.4, marinakis: 5.1, zampoulakis: 1.4 }
  },
  "Mylopotamos": {
    pop: 9870, baseTurnout: 55.5, elasticity: 0.95, urbanization: 0.30,
    baseVote: { arnaoutakis: 86.2, danellis: 7.5, marinakis: 4.9, zampoulakis: 1.4 }
  },
  "Amari": {
    pop: 4648, baseTurnout: 53.0, elasticity: 0.90, urbanization: 0.15,
    baseVote: { arnaoutakis: 84.8, danellis: 8.3, marinakis: 5.5, zampoulakis: 1.4 }
  },
  "Agios Vasileios": {
    pop: 8534, baseTurnout: 54.0, elasticity: 0.95, urbanization: 0.25,
    baseVote: { arnaoutakis: 85.0, danellis: 7.5, marinakis: 6.1, zampoulakis: 1.4 }
  },
  "Anogeia": {
    // Anogeia is historically a stronghold for Nea Dimokratia-aligned candidates —
    // notably volatile and contrarian relative to the wider Rethymno district.
    pop: 4862, baseTurnout: 62.0, elasticity: 1.30, urbanization: 0.20,
    baseVote: { arnaoutakis: 60.0, danellis: 4.5, marinakis: 34.0, zampoulakis: 1.5 }
  },

  // ── HERAKLION DISTRICT ───────────────────────────────────────────────────────
  "Heraklion": {
    // Arnaoutakis' home base — strongest performance region-wide.
    pop: 177494, baseTurnout: 58.0, elasticity: 1.15, urbanization: 1.00,
    baseVote: { arnaoutakis: 80.5, danellis: 11.2, marinakis: 6.0, zampoulakis: 2.3 }
  },
  "Malevizi": {
    pop: 34568, baseTurnout: 55.0, elasticity: 0.95, urbanization: 0.60,
    baseVote: { arnaoutakis: 82.0, danellis: 9.5, marinakis: 6.2, zampoulakis: 2.3 }
  },
  "Hersonissos": {
    pop: 29079, baseTurnout: 54.5, elasticity: 1.00, urbanization: 0.70,
    baseVote: { arnaoutakis: 85.5, danellis: 8.0, marinakis: 4.5, zampoulakis: 2.0 }
  },
  "Minoa Pediados": {
    pop: 14165, baseTurnout: 53.5, elasticity: 0.85, urbanization: 0.35,
    baseVote: { arnaoutakis: 81.5, danellis: 10.0, marinakis: 6.2, zampoulakis: 2.3 }
  },
  "Archanes-Asterousia": {
    pop: 16285, baseTurnout: 56.0, elasticity: 0.90, urbanization: 0.40,
    baseVote: { arnaoutakis: 82.0, danellis: 9.8, marinakis: 5.9, zampoulakis: 2.3 }
  },
  "Phaistos": {
    pop: 23814, baseTurnout: 55.5, elasticity: 0.95, urbanization: 0.45,
    baseVote: { arnaoutakis: 82.5, danellis: 9.2, marinakis: 6.0, zampoulakis: 2.3 }
  },
  "Gortyna": {
    pop: 14822, baseTurnout: 54.0, elasticity: 0.90, urbanization: 0.30,
    baseVote: { arnaoutakis: 83.0, danellis: 8.5, marinakis: 6.0, zampoulakis: 2.5 }
  },
  "Viannos": {
    pop: 5244, baseTurnout: 55.0, elasticity: 0.85, urbanization: 0.20,
    baseVote: { arnaoutakis: 82.0, danellis: 12.0, marinakis: 4.0, zampoulakis: 2.0 }
  },

  // ── LASITHI DISTRICT ─────────────────────────────────────────────────────────
  "Agios Nikolaos": {
    pop: 27785, baseTurnout: 56.5, elasticity: 1.05, urbanization: 0.75,
    baseVote: { arnaoutakis: 77.0, danellis: 13.5, marinakis: 6.8, zampoulakis: 2.7 }
  },
  "Oropedio Lasithiou": {
    pop: 2234, baseTurnout: 60.0, elasticity: 1.15, urbanization: 0.10,
    baseVote: { arnaoutakis: 88.0, danellis: 6.0, marinakis: 4.0, zampoulakis: 2.0 }
  },
  "Sitia": {
    pop: 17889, baseTurnout: 55.0, elasticity: 0.95, urbanization: 0.50,
    baseVote: { arnaoutakis: 78.5, danellis: 12.0, marinakis: 7.0, zampoulakis: 2.5 }
  },
  "Ierapetra": {
    pop: 27534, baseTurnout: 55.5, elasticity: 1.00, urbanization: 0.65,
    baseVote: { arnaoutakis: 78.8, danellis: 12.2, marinakis: 6.7, zampoulakis: 2.3 }
  },
};

// ─── Shared district → municipality mapping ───────────────────────────────────
// Used by all historical IIFE builders below.
const CRETE_MUNICIPALITY_DISTRICTS = {
  "Gavdos": "Chania",  "Chania": "Chania",  "Kissamos": "Chania",
  "Kandanos-Selino": "Chania",  "Platanias": "Chania",
  "Apokoronas": "Chania",  "Sfakia": "Chania",

  "Viannos": "Heraklion",  "Gortyna": "Heraklion",  "Phaistos": "Heraklion",
  "Minoa Pediados": "Heraklion",  "Archanes-Asterousia": "Heraklion",
  "Heraklion": "Heraklion",  "Malevizi": "Heraklion",  "Hersonissos": "Heraklion",

  "Ierapetra": "Lasithi",  "Oropedio Lasithiou": "Lasithi",
  "Agios Nikolaos": "Lasithi",  "Sitia": "Lasithi",

  "Agios Vasileios": "Rethymno",  "Rethymno": "Rethymno",
  "Mylopotamos": "Rethymno",  "Amari": "Rethymno",  "Anogeia": "Rethymno",
};

// ─── 2019 District-level certified results ────────────────────────────────────
// Source: Interior Ministry — May 26, 2019 Crete regional election.
const CRETE_DISTRICT_2019 = {
  Chania: {
    baseTurnout: 59.23,
    arnaoutakis: 48.96, markogiannakis: 34.72,
    syntychakis: 7.85,  piagkalakis: 3.67,
    spyropoulos: 2.81,  kritsotakis: 2.00,
  },
  Heraklion: {
    baseTurnout: 68.02,
    arnaoutakis: 67.65, markogiannakis: 20.42,
    syntychakis: 6.39,  kritsotakis: 2.14,
    spyropoulos: 1.85,  piagkalakis: 1.55,
  },
  Lasithi: {
    baseTurnout: 62.67,
    arnaoutakis: 54.42, markogiannakis: 32.97,
    syntychakis: 5.26,  kritsotakis: 3.62,
    spyropoulos: 2.13,  piagkalakis: 1.61,
  },
  Rethymno: {
    baseTurnout: 69.09,
    arnaoutakis: 62.34, markogiannakis: 28.57,
    syntychakis: 4.58,  kritsotakis: 1.67,
    spyropoulos: 1.57,  piagkalakis: 1.27,
  },
};

const CRETE_DETAILS_2019 = (() => {
  const out = {};
  for (const m in CRETE_DETAILS_2023) {
    const d = CRETE_DISTRICT_2019[CRETE_MUNICIPALITY_DISTRICTS[m] || "Heraklion"];
    out[m] = {
      pop:          CRETE_DETAILS_2023[m].pop,
      baseTurnout:  d.baseTurnout,
      elasticity:   CRETE_DETAILS_2023[m].elasticity,
      urbanization: CRETE_DETAILS_2023[m].urbanization,
      baseVote: {
        arnaoutakis:    d.arnaoutakis,
        markogiannakis: d.markogiannakis,
        syntychakis:    d.syntychakis,
        kritsotakis:    d.kritsotakis,
        spyropoulos:    d.spyropoulos,
        piagkalakis:    d.piagkalakis,
      },
    };
  }
  return out;
})();

// ─── 2014 District-level modelled data ────────────────────────────────────────
// NOTE: Official municipality-level data for the May 18, 2014 Crete election
// has not been digitised centrally. These figures are modelled from district
// totals published by the Greek Interior Ministry, proportionally distributed
// to municipalities using 2019 population weights. The district totals are:
//   Arnaoutakis (KINAL/independent list): ~48.1% region-wide (no majority → runoff)
//   Psychogios  (ND-backed list):         ~34.5%
//   Syntychakis (KKE LAIKI SYSPEIROSI):   ~9.6%
//   Psychoundakis (SYRIZA-backed):        ~5.2%
//   Others (combined):                    ~2.6%
// Arnaoutakis won the June 1, 2014 runoff with approx. 57% vs 43%.
const CRETE_DISTRICT_2014 = {
  Chania: {
    baseTurnout: 62.4,
    arnaoutakis: 43.5, psychogios: 39.2,
    syntychakis: 9.4,  psychoundakis: 5.3, others14: 2.6,
  },
  Heraklion: {
    baseTurnout: 71.6,
    arnaoutakis: 50.8, psychogios: 31.0,
    syntychakis: 10.2, psychoundakis: 5.4, others14: 2.6,
  },
  Rethymno: {
    baseTurnout: 72.3,
    arnaoutakis: 54.5, psychogios: 26.8,
    syntychakis: 9.6,  psychoundakis: 6.5, others14: 2.6,
  },
  Lasithi: {
    baseTurnout: 65.1,
    arnaoutakis: 44.0, psychogios: 37.5,
    syntychakis: 9.1,  psychoundakis: 6.8, others14: 2.6,
  },
};

const CRETE_DETAILS_2014 = (() => {
  const out = {};
  for (const m in CRETE_DETAILS_2023) {
    const d = CRETE_DISTRICT_2014[CRETE_MUNICIPALITY_DISTRICTS[m] || "Heraklion"];
    out[m] = {
      pop:          CRETE_DETAILS_2023[m].pop,
      baseTurnout:  d.baseTurnout,
      elasticity:   CRETE_DETAILS_2023[m].elasticity,
      urbanization: CRETE_DETAILS_2023[m].urbanization,
      baseVote: {
        arnaoutakis:   d.arnaoutakis,
        psychogios:    d.psychogios,
        syntychakis:   d.syntychakis,
        psychoundakis: d.psychoundakis,
        others14:      d.others14,
      },
    };
  }
  return out;
})();

// ─── SVG map ──────────────────────────────────────────────────────────────────
const CRETE_SVG_CONTENT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2687 1076" id="map-svg" style="width:100%; height:100%;">
  <path id="municipality-1" class="municipality" data-name="Gavdos" d="M595,941 L599,944 L601,953 L626,974 L662,995 L671,991 L656,975 L653,967 L657,949 L666,942 L663,937 L654,939 L650,936 L650,930 L628,930 L616,925 L618,930 L611,941 Z" />
  <path id="municipality-4" class="municipality" data-name="Viannos" d="M1714,678 L1712,683 L1722,688 L1725,697 L1716,703 L1716,720 L1710,723 L1714,728 L1710,740 L1713,750 L1710,766 L1705,773 L1706,786 L1694,793 L1691,801 L1707,802 L1714,795 L1730,793 L1745,783 L1761,786 L1781,796 L1783,793 L1817,791 L1840,799 L1853,800 L1874,788 L1890,793 L1895,789 L1891,779 L1894,771 L1891,764 L1876,757 L1873,745 L1858,743 L1848,736 L1848,731 L1857,725 L1866,713 L1851,699 L1824,689 L1807,670 L1781,665 L1782,649 L1756,652 L1741,666 L1729,667 Z" />
  <path id="municipality-5" class="municipality" data-name="Ierapetra" d="M2352,752 L2351,739 L2346,733 L2351,721 L2340,706 L2326,700 L2333,693 L2326,687 L2304,676 L2303,686 L2293,691 L2291,682 L2282,671 L2277,674 L2265,670 L2260,648 L2256,648 L2252,654 L2232,655 L2193,651 L2174,640 L2174,633 L2180,622 L2174,614 L2167,614 L2163,620 L2157,613 L2149,615 L2146,620 L2146,634 L2141,635 L2142,638 L2134,645 L2129,657 L2117,665 L2109,660 L2098,661 L2087,654 L2089,669 L2073,669 L2077,677 L2068,694 L2063,694 L2053,680 L2045,678 L2040,672 L2033,681 L2022,679 L2018,690 L2017,707 L1996,688 L1985,692 L1977,677 L1979,673 L1939,674 L1923,668 L1920,660 L1905,665 L1896,661 L1857,663 L1850,660 L1849,674 L1829,687 L1851,695 L1871,714 L1851,734 L1857,739 L1877,744 L1879,754 L1888,757 L1898,769 L1895,778 L1898,786 L1900,783 L1914,783 L1920,777 L1933,773 L1994,774 L2001,766 L2010,764 L2032,765 L2054,774 L2064,767 L2089,778 L2117,778 L2144,766 L2148,760 L2172,756 L2186,748 L2192,749 L2194,746 L2222,739 L2250,740 L2265,733 L2278,738 L2284,744 L2283,752 L2290,753 L2298,749 L2306,758 L2313,752 L2325,754 L2341,749 Z M2013,917 L2033,921 L2051,913 L2051,909 L2035,914 L2016,909 Z" />
  <path id="municipality-6" class="municipality" data-name="Gortyna" d="M1336,573 L1337,583 L1343,591 L1348,607 L1348,614 L1343,618 L1341,625 L1342,638 L1349,647 L1352,663 L1358,666 L1370,664 L1378,695 L1377,706 L1371,712 L1366,708 L1357,712 L1363,723 L1373,726 L1360,738 L1358,747 L1350,747 L1349,750 L1358,753 L1358,758 L1346,761 L1340,773 L1343,778 L1332,787 L1340,792 L1336,805 L1343,820 L1343,838 L1337,859 L1352,864 L1355,859 L1382,856 L1386,864 L1391,865 L1391,858 L1395,856 L1425,856 L1435,860 L1439,852 L1447,855 L1455,846 L1469,849 L1473,846 L1477,850 L1482,847 L1486,851 L1500,849 L1506,855 L1510,850 L1502,822 L1507,808 L1514,804 L1516,797 L1498,763 L1511,757 L1518,745 L1539,739 L1548,724 L1545,720 L1545,708 L1537,708 L1538,703 L1531,690 L1508,691 L1504,689 L1505,682 L1494,680 L1494,669 L1486,661 L1509,654 L1497,646 L1491,629 L1471,613 L1472,607 L1456,606 L1450,619 L1440,619 L1435,612 L1420,611 L1414,615 L1384,599 L1376,604 L1360,582 Z" />
  <path id="municipality-7" class="municipality" data-name="Phaistos" d="M1335,586 L1315,610 L1297,598 L1280,604 L1265,601 L1267,580 L1259,565 L1250,559 L1244,560 L1250,599 L1241,615 L1242,630 L1238,649 L1243,659 L1233,667 L1222,662 L1214,670 L1190,673 L1184,684 L1184,692 L1201,707 L1211,738 L1217,780 L1205,788 L1208,795 L1203,799 L1208,805 L1208,818 L1204,827 L1209,831 L1209,839 L1213,841 L1207,849 L1209,851 L1202,858 L1194,860 L1193,869 L1209,864 L1211,868 L1215,864 L1220,866 L1224,862 L1229,868 L1244,867 L1259,852 L1278,852 L1283,848 L1319,855 L1328,861 L1334,858 L1340,836 L1339,818 L1333,806 L1336,793 L1328,787 L1338,778 L1336,772 L1342,760 L1355,755 L1345,752 L1347,744 L1356,743 L1358,735 L1368,727 L1357,722 L1353,711 L1365,705 L1370,708 L1375,701 L1368,669 L1357,669 L1348,664 L1346,649 L1338,638 L1338,621 L1345,609 Z" />
  <path id="municipality-8" class="municipality" data-name="Oropedio Lasithiou" d="M1854,545 L1837,546 L1823,563 L1806,574 L1797,574 L1782,566 L1776,569 L1775,579 L1781,586 L1781,595 L1765,606 L1767,613 L1777,620 L1777,635 L1774,641 L1779,641 L1787,651 L1784,662 L1807,666 L1825,685 L1845,673 L1848,656 L1859,660 L1866,659 L1865,625 L1872,612 L1878,606 L1914,590 L1904,576 L1900,581 L1890,584 L1886,583 L1882,575 L1865,583 L1850,560 Z" />
  <path id="municipality-9" class="municipality" data-name="Minoa Pediados" d="M1694,507 L1672,516 L1673,525 L1666,536 L1660,537 L1655,532 L1648,539 L1634,540 L1618,547 L1616,556 L1628,564 L1618,567 L1615,571 L1624,581 L1625,603 L1620,604 L1621,608 L1603,623 L1587,613 L1578,612 L1573,621 L1572,664 L1580,670 L1588,671 L1595,668 L1599,681 L1599,701 L1592,704 L1593,716 L1600,718 L1604,713 L1604,705 L1607,704 L1613,713 L1631,723 L1632,734 L1624,738 L1619,737 L1615,744 L1623,756 L1634,758 L1648,777 L1658,783 L1668,799 L1688,800 L1690,792 L1702,785 L1702,771 L1706,766 L1709,752 L1707,738 L1710,729 L1705,722 L1712,719 L1713,701 L1721,696 L1718,689 L1708,684 L1710,678 L1727,664 L1738,664 L1756,648 L1779,645 L1770,642 L1773,621 L1764,615 L1761,607 L1778,592 L1772,581 L1772,570 L1766,564 L1763,545 L1755,541 L1751,546 L1745,546 L1740,540 L1732,540 L1724,524 L1725,518 L1702,515 Z" />
  <path id="municipality-10" class="municipality" data-name="Agios Vasileios" d="M1181,691 L1181,679 L1171,669 L1173,657 L1165,652 L1163,645 L1152,643 L1151,629 L1114,619 L1100,612 L1091,602 L1055,587 L1057,579 L1037,557 L1038,541 L1031,538 L1032,514 L1046,506 L1033,506 L1031,500 L1020,505 L1008,517 L1001,520 L983,518 L972,529 L954,523 L937,527 L922,523 L907,537 L881,535 L871,538 L863,550 L846,550 L838,544 L823,541 L811,563 L810,583 L805,589 L805,601 L818,596 L820,591 L847,589 L862,595 L872,585 L889,583 L899,589 L906,598 L906,605 L900,606 L899,609 L918,607 L923,612 L924,619 L954,633 L976,630 L1009,639 L1030,661 L1031,667 L1037,668 L1043,683 L1055,678 L1067,687 L1085,684 L1090,687 L1102,685 L1111,689 L1139,684 L1153,689 L1158,686 L1169,691 Z" />
  <path id="municipality-11" class="municipality" data-name="Archanes-Asterousia" d="M1569,496 L1562,497 L1560,508 L1552,521 L1539,525 L1542,529 L1539,553 L1527,552 L1523,555 L1545,586 L1545,597 L1549,607 L1539,610 L1537,625 L1530,633 L1508,630 L1498,623 L1494,627 L1500,644 L1513,655 L1510,659 L1492,662 L1497,667 L1497,677 L1508,679 L1508,687 L1511,688 L1535,687 L1541,705 L1548,706 L1548,718 L1552,723 L1539,744 L1520,748 L1513,760 L1502,764 L1519,796 L1517,806 L1510,810 L1506,821 L1513,850 L1527,839 L1546,832 L1553,834 L1561,829 L1572,835 L1583,833 L1587,841 L1603,833 L1613,834 L1628,826 L1633,828 L1643,819 L1654,817 L1656,809 L1664,800 L1655,785 L1646,780 L1634,762 L1621,759 L1611,744 L1618,733 L1628,733 L1629,726 L1611,716 L1608,711 L1600,722 L1590,719 L1588,703 L1596,699 L1593,672 L1588,675 L1580,674 L1568,665 L1571,646 L1570,618 L1573,612 L1579,608 L1587,609 L1605,619 L1617,607 L1616,602 L1622,600 L1621,584 L1611,572 L1617,563 L1621,563 L1612,557 L1614,545 L1600,524 L1600,517 L1594,516 L1588,507 Z" />
  <path id="municipality-12" class="municipality" data-name="Amari" d="M1034,497 L1035,502 L1043,501 L1052,506 L1036,516 L1037,523 L1034,529 L1035,536 L1042,540 L1041,556 L1057,571 L1061,579 L1059,586 L1093,599 L1100,608 L1116,616 L1153,626 L1156,641 L1167,643 L1168,651 L1177,656 L1175,668 L1183,676 L1187,670 L1214,666 L1222,658 L1232,663 L1239,658 L1234,649 L1238,632 L1237,614 L1246,600 L1241,561 L1232,562 L1218,556 L1200,534 L1205,529 L1198,522 L1147,505 L1132,492 L1127,497 L1098,495 L1095,492 L1085,493 L1076,488 L1066,490 L1054,487 Z" />
  <path id="municipality-14" class="municipality" data-name="Sitia" d="M2527,472 L2503,478 L2497,487 L2488,483 L2488,476 L2479,482 L2485,487 L2473,494 L2471,499 L2474,507 L2463,522 L2457,519 L2459,525 L2451,533 L2438,536 L2442,549 L2434,550 L2428,559 L2418,566 L2394,568 L2376,562 L2370,557 L2378,538 L2373,536 L2366,542 L2353,544 L2350,548 L2346,543 L2334,543 L2327,534 L2322,541 L2314,541 L2309,535 L2302,535 L2284,552 L2287,560 L2277,568 L2269,568 L2258,573 L2253,567 L2249,567 L2242,577 L2241,585 L2236,584 L2229,590 L2210,591 L2190,584 L2188,588 L2192,598 L2183,599 L2177,610 L2184,622 L2178,639 L2195,648 L2212,648 L2218,651 L2247,651 L2255,644 L2261,644 L2268,661 L2267,667 L2274,670 L2283,667 L2294,680 L2295,687 L2299,685 L2303,671 L2329,685 L2337,693 L2332,700 L2342,703 L2355,720 L2350,733 L2354,738 L2355,752 L2361,754 L2369,767 L2367,775 L2379,776 L2388,771 L2406,768 L2404,764 L2411,758 L2417,758 L2419,753 L2425,756 L2435,751 L2448,754 L2451,745 L2462,745 L2462,739 L2468,732 L2480,732 L2480,728 L2491,714 L2492,701 L2496,700 L2504,686 L2515,678 L2506,668 L2522,650 L2524,627 L2517,616 L2517,609 L2521,606 L2521,591 L2527,590 L2530,585 L2540,587 L2551,579 L2550,562 L2545,571 L2539,574 L2523,570 L2516,562 L2517,557 L2508,552 L2508,544 L2513,542 L2514,527 L2508,516 L2509,507 L2504,503 L2503,490 L2511,481 L2525,479 Z M2395,841 L2399,839 L2405,844 L2418,835 L2399,827 L2396,829 L2398,832 Z" />
  <path id="municipality-15" class="municipality" data-name="Anogeia" d="M1302,463 L1296,472 L1298,502 L1280,513 L1275,536 L1266,545 L1262,564 L1270,578 L1269,599 L1278,601 L1298,594 L1314,606 L1333,584 L1330,558 L1350,530 L1350,523 L1341,507 L1351,484 L1347,477 L1336,477 L1330,470 Z" />
  <path id="municipality-16" class="municipality" data-name="Hersonissos" d="M1590,440 L1596,476 L1593,482 L1597,495 L1593,509 L1596,513 L1603,514 L1603,522 L1617,544 L1634,536 L1646,536 L1655,528 L1664,533 L1669,525 L1668,516 L1675,509 L1694,503 L1703,511 L1728,515 L1728,524 L1734,537 L1741,536 L1747,543 L1754,537 L1759,537 L1766,543 L1769,562 L1774,567 L1782,562 L1799,571 L1806,570 L1820,561 L1835,543 L1854,541 L1841,522 L1842,505 L1850,498 L1847,482 L1838,480 L1836,472 L1826,477 L1786,477 L1777,464 L1771,464 L1753,453 L1754,447 L1748,443 L1745,431 L1734,429 L1684,437 L1676,433 L1664,438 L1654,436 L1642,440 L1626,438 L1618,441 L1611,437 Z M1576,323 L1583,323 L1588,328 L1594,326 L1597,332 L1600,327 L1606,327 L1608,334 L1615,332 L1620,340 L1621,320 L1626,318 L1619,316 L1601,302 L1594,315 Z" />
  <path id="municipality-17" class="municipality" data-name="Heraklion" d="M1587,439 L1582,438 L1581,432 L1573,425 L1551,425 L1549,429 L1533,428 L1505,434 L1501,460 L1496,464 L1481,465 L1483,481 L1473,498 L1462,507 L1465,518 L1463,520 L1453,516 L1437,517 L1438,548 L1428,551 L1424,563 L1418,569 L1405,568 L1391,581 L1380,585 L1376,593 L1377,599 L1383,595 L1413,611 L1419,608 L1436,608 L1440,615 L1450,615 L1455,602 L1476,604 L1475,612 L1491,625 L1498,619 L1507,626 L1530,629 L1534,623 L1535,609 L1544,606 L1542,588 L1535,575 L1521,561 L1519,554 L1529,548 L1536,550 L1539,531 L1535,524 L1552,516 L1561,493 L1571,493 L1578,499 L1591,503 L1592,476 Z" />
  <path id="municipality-18" class="municipality" data-name="Sfakia" d="M444,541 L445,544 L461,541 L494,559 L512,557 L522,551 L551,551 L563,559 L563,564 L571,568 L574,577 L591,584 L606,583 L614,577 L619,577 L624,585 L631,575 L643,576 L645,579 L653,575 L657,578 L678,576 L681,585 L691,586 L702,581 L730,577 L758,598 L774,595 L781,600 L792,598 L800,602 L801,588 L806,583 L807,563 L815,547 L795,543 L777,521 L771,506 L760,495 L770,482 L768,471 L741,466 L736,459 L704,470 L676,457 L661,445 L649,462 L638,463 L631,458 L617,460 L603,438 L597,434 L590,435 L580,424 L568,427 L569,438 L559,448 L542,453 L539,445 L533,440 L522,438 L515,453 L498,458 L484,484 L474,489 L467,505 L448,528 Z" />
  <path id="municipality-19" class="municipality" data-name="Agios Nikolaos" d="M1842,472 L1841,477 L1851,480 L1851,492 L1855,498 L1846,505 L1845,522 L1858,541 L1855,562 L1867,579 L1884,571 L1888,579 L1892,580 L1905,572 L1919,590 L1878,610 L1869,625 L1870,659 L1898,658 L1907,661 L1922,656 L1927,667 L1937,670 L1982,670 L1984,673 L1981,677 L1985,687 L1996,684 L2014,702 L2019,677 L2032,677 L2039,668 L2047,675 L2055,677 L2066,691 L2073,677 L2069,668 L2073,665 L2085,667 L2084,654 L2075,650 L2074,645 L2068,650 L2065,644 L2065,648 L2061,649 L2056,647 L2056,643 L2052,648 L2042,643 L2044,626 L2038,625 L2040,620 L2031,607 L2028,592 L2033,582 L2038,580 L2031,573 L2034,563 L2030,559 L2030,549 L2052,536 L2045,526 L2046,511 L2037,505 L2038,487 L2043,479 L2039,462 L2061,451 L2066,444 L2072,443 L2077,425 L2072,424 L2065,429 L2058,426 L2026,426 L2016,430 L2001,427 L1995,421 L1990,422 L1983,418 L1976,423 L1949,429 L1933,436 L1925,435 L1909,449 L1898,449 L1893,445 L1879,452 L1873,460 L1859,461 Z M2054,472 L2052,482 L2058,484 L2054,492 L2058,499 L2053,508 L2058,507 L2069,514 L2062,505 L2067,490 L2060,494 L2058,489 L2067,480 L2060,473 Z" />
  <path id="municipality-20" class="municipality" data-name="Kandanos-Selino" d="M474,459 L463,448 L462,438 L456,432 L449,436 L442,435 L438,429 L429,432 L417,425 L402,423 L394,418 L387,421 L382,411 L351,409 L340,397 L338,386 L331,384 L325,376 L311,379 L313,412 L300,416 L298,431 L291,433 L280,448 L265,455 L265,440 L261,434 L248,431 L231,436 L222,450 L214,450 L202,460 L193,456 L189,463 L184,463 L184,479 L190,488 L174,495 L166,506 L169,509 L184,509 L196,514 L202,521 L201,529 L197,532 L197,540 L207,547 L210,544 L218,544 L223,548 L229,546 L231,549 L243,549 L253,544 L272,541 L287,550 L301,541 L320,543 L329,539 L337,543 L344,540 L353,541 L359,551 L369,547 L375,548 L377,539 L387,541 L392,532 L404,533 L410,529 L429,534 L432,540 L440,541 L444,528 L461,508 L470,490 L453,487 L448,482 L448,477 L457,468 Z" />
  <path id="municipality-21" class="municipality" data-name="Mylopotamos" d="M1116,354 L1112,363 L1118,373 L1114,381 L1119,394 L1115,403 L1115,416 L1121,424 L1122,432 L1133,432 L1135,439 L1142,444 L1142,452 L1158,481 L1158,491 L1163,500 L1178,513 L1201,520 L1211,530 L1205,535 L1220,553 L1234,559 L1250,555 L1258,560 L1266,538 L1271,535 L1276,513 L1294,501 L1295,484 L1292,473 L1301,459 L1308,459 L1311,454 L1323,454 L1334,443 L1322,429 L1317,402 L1324,393 L1351,397 L1356,391 L1352,378 L1353,365 L1348,372 L1338,362 L1324,358 L1318,351 L1312,352 L1315,359 L1311,360 L1308,366 L1288,364 L1287,368 L1279,368 L1270,364 L1241,365 L1237,371 L1229,363 L1232,356 L1230,352 L1224,357 L1217,358 L1210,352 L1194,355 L1188,348 L1160,349 L1155,356 L1150,357 L1147,354 Z" />
  <path id="municipality-22" class="municipality" data-name="Malevizi" d="M1430,351 L1419,351 L1407,360 L1392,346 L1387,357 L1388,365 L1383,371 L1368,366 L1356,369 L1360,392 L1350,402 L1327,396 L1323,397 L1320,403 L1325,415 L1326,428 L1338,444 L1324,458 L1311,460 L1331,467 L1338,474 L1351,475 L1354,481 L1354,489 L1345,506 L1354,523 L1354,530 L1335,556 L1336,569 L1360,578 L1373,591 L1377,582 L1388,579 L1405,564 L1414,566 L1422,560 L1426,547 L1434,547 L1433,516 L1439,512 L1461,515 L1459,505 L1471,495 L1479,481 L1477,463 L1498,458 L1501,434 L1481,435 L1457,428 L1447,396 L1449,384 L1456,378 L1452,372 L1445,371 L1440,375 L1431,366 L1433,362 L1430,359 Z" />
  <path id="municipality-24" class="municipality" data-name="Apokoronas" d="M660,323 L641,358 L632,360 L629,379 L621,394 L623,400 L599,431 L608,438 L617,450 L618,456 L633,455 L638,459 L646,459 L661,441 L679,455 L689,457 L704,466 L737,455 L744,463 L770,468 L774,482 L764,494 L774,504 L781,521 L788,529 L789,524 L802,512 L828,496 L841,492 L840,470 L833,452 L828,426 L787,419 L782,412 L783,406 L778,397 L783,383 L783,354 L776,343 L780,335 L779,318 L775,317 L765,300 L757,305 L752,315 L739,313 L734,327 L708,324 L693,310 L679,327 Z" />
  <path id="municipality-25" class="municipality" data-name="Chania" d="M708,182 L682,175 L669,168 L646,171 L643,178 L629,176 L628,181 L621,186 L626,190 L624,194 L631,200 L635,216 L616,225 L606,220 L607,231 L602,236 L601,248 L583,257 L577,253 L566,256 L564,260 L550,262 L549,257 L545,256 L535,262 L515,260 L500,251 L487,254 L490,271 L486,275 L488,287 L482,295 L484,307 L497,314 L508,314 L530,329 L530,361 L548,383 L543,404 L534,414 L541,424 L544,449 L559,444 L565,438 L564,427 L568,422 L581,420 L591,431 L596,430 L619,400 L617,394 L625,380 L628,358 L638,356 L657,321 L661,319 L677,324 L688,313 L688,305 L658,304 L641,292 L629,290 L629,286 L611,284 L608,278 L611,270 L629,261 L635,265 L651,262 L678,274 L684,272 L700,276 L698,272 L707,265 L715,266 L717,250 L728,238 L730,231 L726,230 L727,225 L720,204 Z" />
  <path id="municipality-26" class="municipality" data-name="Kissamos" d="M217,150 L211,185 L209,187 L202,179 L198,180 L200,184 L206,184 L207,190 L203,196 L207,206 L202,209 L196,220 L197,229 L190,244 L195,256 L188,261 L191,261 L201,273 L200,287 L193,295 L187,297 L186,306 L179,306 L179,315 L183,321 L193,323 L192,346 L184,359 L180,358 L178,363 L171,364 L170,367 L177,378 L167,391 L160,391 L165,398 L159,416 L166,426 L159,438 L164,444 L172,444 L176,450 L170,460 L164,463 L159,461 L159,468 L152,467 L149,477 L153,484 L147,488 L157,488 L162,494 L163,503 L172,492 L185,487 L180,479 L181,461 L187,460 L192,452 L202,456 L214,446 L221,446 L229,433 L250,427 L261,429 L268,438 L267,451 L278,445 L290,429 L295,429 L297,414 L309,411 L308,377 L323,373 L318,363 L325,341 L322,337 L323,330 L318,327 L324,311 L332,309 L333,300 L328,295 L331,275 L315,267 L283,275 L261,276 L253,271 L246,258 L241,260 L224,251 L225,205 L219,200 L220,187 L216,177 L221,173 L222,155 Z" />
  <path id="municipality-27" class="municipality" data-name="Platanias" d="M335,71 L334,76 L337,79 L327,84 L327,90 L322,91 L320,98 L312,105 L313,112 L309,123 L314,134 L312,139 L318,147 L312,159 L312,171 L316,175 L315,183 L325,196 L325,215 L329,223 L323,236 L324,258 L319,265 L333,272 L335,276 L331,293 L336,299 L334,313 L328,313 L323,325 L326,327 L325,335 L329,342 L323,354 L325,361 L322,364 L330,378 L341,384 L343,395 L351,405 L384,408 L388,416 L396,415 L429,428 L439,425 L444,432 L457,428 L466,438 L467,448 L479,461 L460,470 L451,480 L455,484 L473,486 L481,482 L496,455 L514,449 L520,434 L531,435 L539,441 L538,426 L530,414 L539,404 L545,385 L527,363 L527,350 L523,343 L527,337 L526,329 L511,319 L495,317 L481,309 L478,295 L485,286 L481,276 L486,270 L483,254 L433,248 L413,238 L403,241 L367,225 L368,174 L365,172 L361,152 L362,138 L358,132 L360,128 L356,125 L354,110 L363,95 Z" />
  <path id="municipality-28" class="municipality" data-name="Rethymno" d="M1164,506 L1154,490 L1154,480 L1139,454 L1138,445 L1132,441 L1132,435 L1119,435 L1117,423 L1111,416 L1112,400 L1115,396 L1111,383 L1114,373 L1107,366 L1092,376 L1088,382 L1058,396 L982,412 L971,410 L967,406 L962,413 L945,413 L944,408 L934,411 L926,407 L910,421 L904,414 L895,420 L881,418 L868,427 L832,426 L835,447 L843,469 L844,495 L835,496 L802,516 L793,524 L791,533 L802,542 L816,543 L825,537 L848,547 L860,547 L872,534 L883,531 L894,534 L908,533 L921,519 L936,523 L950,519 L970,525 L983,514 L1002,516 L1009,513 L1017,503 L1055,483 L1068,487 L1078,485 L1085,489 L1096,488 L1100,492 L1127,493 L1132,488 L1147,501 Z" />
</svg>
`;

// ─── Export ───────────────────────────────────────────────────────────────────
export default {
  id:        "crete",
  icon:      "🌊",
  color:     "#F59E0B",
  available: true,
  name:      "Crete Region",

  // ── Seat Rules ────────────────────────────────────────────────────────────
  seatsTotal:          61,
  bonusSeats:          37,  // winner's guaranteed allocation (3/5 of 61)
  distributableSeats:  24,  // remaining seats split by Hare quota
  threshold:           3,   // minimum % to receive proportional seats
  winThreshold:        50,  // % needed to win outright in round 1 (50%+1)

  baseTurnout:    57.0,
  referencePop:   25000,
  baseShift:      6.5,

  // ── Map Source ────────────────────────────────────────────────────────────
  mapType:    "inline",
  svgContent: CRETE_SVG_CONTENT,

  // ── Municipality List ─────────────────────────────────────────────────────
  munis: [
    // Chania Prefecture
    "Chania", "Platanias", "Apokoronas", "Kissamos", "Kandanos-Selino", "Sfakia", "Gavdos",
    // Rethymno Prefecture
    "Rethymno", "Mylopotamos", "Amari", "Agios Vasileios", "Anogeia",
    // Heraklion Prefecture
    "Heraklion", "Malevizi", "Hersonissos", "Minoa Pediados",
    "Archanes-Asterousia", "Phaistos", "Gortyna", "Viannos",
    // Lasithi Prefecture
    "Agios Nikolaos", "Oropedio Lasithiou", "Sitia", "Ierapetra",
  ],

  // ── Default (2023) Details & Candidates ──────────────────────────────────
  details: CRETE_DETAILS_2023,

  candidates: [
    { id: "arnaoutakis", name: "Arnaoutakis Stavros", party: "ΓΙΑ ΤΗΝ ΚΡΗΤΗ ΜΑΣ",   color: "#10B981", percent: 78.3, ideology:  0, isLocked: false },
    { id: "danellis",    name: "Danellis Spyridon",   party: "Η ΚΡΗΤΗ ΜΑΣ ΑΛΛΙΩΣ",  color: "#EF4444", percent: 11.1, ideology: -1, isLocked: false },
    { id: "marinakis",   name: "Marinakis Alexandros",party: "ΛΑΪΚΗ ΣΥΣΠΕΙΡΩΣΗ",     color: "#991B1B", percent:  8.2, ideology: -3, isLocked: false },
    { id: "zampoulakis", name: "Zampoulakis Nikolaos",party: "ΑΝΥΠΟΤΑΚΤΗ ΚΡΗΤΗ",     color: "#059669", percent:  2.4, ideology: -1, isLocked: false },
  ],

  // ── SVG ID → Municipality Name ─────────────────────────────────────────────
  svgMap: {
    "municipality-1":  "Gavdos",
    "municipality-4":  "Viannos",
    "municipality-5":  "Ierapetra",
    "municipality-6":  "Gortyna",
    "municipality-7":  "Phaistos",
    "municipality-8":  "Oropedio Lasithiou",
    "municipality-9":  "Minoa Pediados",
    "municipality-10": "Agios Vasileios",
    "municipality-11": "Archanes-Asterousia",
    "municipality-12": "Amari",
    "municipality-14": "Sitia",
    "municipality-15": "Anogeia",
    "municipality-16": "Hersonissos",
    "municipality-17": "Heraklion",
    "municipality-18": "Sfakia",
    "municipality-19": "Agios Nikolaos",
    "municipality-20": "Kandanos-Selino",
    "municipality-21": "Mylopotamos",
    "municipality-22": "Malevizi",
    "municipality-24": "Apokoronas",
    "municipality-25": "Chania",
    "municipality-26": "Kissamos",
    "municipality-27": "Platanias",
    "municipality-28": "Rethymno",
  },

  // ── Historical Scenarios ──────────────────────────────────────────────────
  scenarios: {
    "2019": {
      name: "May 2019",
      note: "Arnaoutakis won outright (60.8%). Markogiannakis ran ND-aligned. Runoff tab not used.",
      details: CRETE_DETAILS_2019,
      candidates: [
        { id: "arnaoutakis",    name: "Arnaoutakis Stavros",       party: "ΚΡΗΤΗ Η ΖΩΗ ΜΑΣ",           color: "#10B981", percent: 60.82, ideology: -1, isLocked: false },
        { id: "markogiannakis", name: "Markogiannakis Alexandros", party: "Η ΚΡΗΤΗ ΜΠΡΟΣΤΑ",            color: "#0284C7", percent: 26.52, ideology:  1, isLocked: false },
        { id: "syntychakis",    name: "Syntychakis Emmanouil",     party: "ΛΑΪΚΗ ΣΥΣΠΕΙΡΩΣΗ ΚΡΗΤΗΣ",   color: "#DC2626", percent:  6.35, ideology: -3, isLocked: false },
        { id: "kritsotakis",    name: "Kritsotakis Michail",       party: "ΞΑΣΤΕΡΙΑ! ΑΝΑΤΡΟΠΗ",        color: "#EC4899", percent:  2.21, ideology: -2, isLocked: false },
        { id: "spyropoulos",    name: "Spyropoulos Georgios",      party: "ΕΛΛΗΝΙΚΗ ΑΥΓΗ",             color: "#475569", percent:  2.08, ideology:  4, isLocked: false },
        { id: "piagkalakis",    name: "Piagkalakis Georgios",      party: "ΑΝΥΠΟΤΑΚΤΗ ΚΡΗΤΗ 2019",     color: "#059669", percent:  2.02, ideology: -2, isLocked: false },
      ],
    },

    "2014": {
      name: "May 2014 (Round 1)",
      note: "Nobody cleared 50%+1. Arnaoutakis (~48%) defeated Psychogios (~35%) in the June runoff. Use the Runoff tab to simulate.",
      details: CRETE_DETAILS_2014,
      candidates: [
        { id: "arnaoutakis",   name: "Arnaoutakis Stavros",     party: "ΚΡΗΤΗ - ΙΣΤΟΡΙΑ & ΜΕΛΛΟΝ",  color: "#10B981", percent: 48.1, ideology: -1, isLocked: false },
        { id: "psychogios",    name: "Psychogios Konstantinos", party: "ΔΥΝΑΜΗ ΚΡΗΤΗΣ (ΝΔ)",         color: "#1D4ED8", percent: 34.5, ideology:  1, isLocked: false },
        { id: "syntychakis",   name: "Syntychakis Emmanouil",   party: "ΛΑΪΚΗ ΣΥΣΠΕΙΡΩΣΗ ΚΡΗΤΗΣ",   color: "#DC2626", percent:  9.6, ideology: -3, isLocked: false },
        { id: "psychoundakis", name: "Psychoundakis Manousos",  party: "ΚΡΗΤΗ ΑΡΙΣΤΕΡΑ (ΣΥΡΙΖΑ)",   color: "#F59E0B", percent:  5.2, ideology: -2, isLocked: false },
        { id: "others14",      name: "Other Lists",             party: "Combined",                   color: "#64748B", percent:  2.6, ideology:  0, isLocked: false },
      ],
    },
  },
};