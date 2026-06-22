# Adding a New Region to the Swingometer

Follow this checklist to quickly add a new Greek region to the simulator without breaking the app.

## 1. Setup the File
1. Copy `TEMPLATE.js` and rename it to `your_region_name.js` (e.g., `crete.js`).
2. Keep `available: false` at the top of the file. This ensures the region shows up in the UI as "Coming Soon" so you don't accidentally expose an unfinished map to users.

## 2. Finding & Prepping the Map
1. Go to **Wikimedia Commons**.
2. Search for `"[Region Name] municipalities.svg"` (e.g., "Crete municipalities.svg").
3. Look for the standard grey/colored Greek municipality maps. 
4. **Important:** Click on the image until you get to the raw `.svg` URL (it should end in `.svg`).
5. Paste this URL into the `mapUrl` field and set `mapType: "url"`.
   *(If the SVG has CORS issues or fails to load, copy the raw code, set `mapType: "inline"`, and paste the code into `svgContent`)*.

## 3. Extracting Path IDs
The engine needs to know which SVG shape corresponds to which municipality.
1. Open the raw SVG URL in your browser.
2. Right-click on a municipality and select **"Inspect Element"**.
3. Look at the `<path>` or `<polygon>` tag in the DevTools. Find its `id` attribute (e.g., `id="path3845"` or `id="mun_12"`).
4. Add it to the `svgMap` object: `path3845: "Chania"`.
5. Repeat for all municipalities. 

## 4. Tuning the Swing Variables
To make the simulation feel realistic, adjust these variables based on the region's profile:
* **`baseShift` (Regional Level):**
  * `8.0 - 10.0`: Heavy urban/rural divide (e.g., Attica, Central Macedonia).
  * `6.0 - 7.9`: Mixed regions with prominent capitals but large rural outskirts (e.g., Epirus, Thessaly).
  * `4.0 - 5.9`: Homogeneous or largely rural regions with low variance.
* **`elasticity` (Municipality Level):**
  * `1.0 - 1.2`: Swing districts. Highly competitive urban or suburban areas.
  * `0.8 - 0.9`: Lean districts. Predictable but can swing in waves.
  * `0.5 - 0.7`: Safe districts. Deep rural or deeply entrenched ideological strongholds.

## 5. Testing & Deployment Checklist
Before publishing, run through this 3-step checklist:

- [ ] **Data Entry:** Fill out all `munis`, `details` (demographics), and `candidates` (starting votes).
- [ ] **Register the Region:** Open `regions/index.js` and import your new file. Add it to the `REGIONS_DB` export object.
- [ ] **Test Drive:** In your new region file, change `available: false` to `available: true`. Load the app, click the region, and test the sliders to ensure the map colors update and the Math doesn't return `NaN`.