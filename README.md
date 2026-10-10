# Pegboard Studio 1.0.1

A focused visual builder for 3D-printable pegboards. The finished HTML includes its model engine and preview assets, works offline, and needs no CAD installation or account. The online version and offline file have the same controls.

## Start

Open the finished `index.html` or `Pegboard_Studio.html` in a current Chrome or Edge browser. Choose a starting style, set dimensions, inspect **3D preview** or **Hole layout**, and download STL or 3MF. Start with **Download fit test** to check your hook and screw before printing a full panel.

Five styles: SKÅDIS-style slots, classic round, hexagonal, square grid, and wide slots. Presets change hole settings, not your board dimensions or screw mounts. Every setting remains editable.

The SKÅDIS-style preset uses 5 × 15 mm vertical rounded slots, a 40 mm horizontal repeat, 20 mm between rows, half-repeat stagger, and a 5 mm board. These match the earlier shelf tool's default 5 mm slot width, 5 mm board thickness, and 40 mm horizontal hook spacing. This is an editable starting point; the original IKEA board's surface recesses are not modeled. Measure your printed board or accessory and test fit. Changing width, thickness, pitch, or slot orientation can change compatibility. Independent tool; not an IKEA product.

## Board and peg holes

- Board width and height: 40–1500 mm; thickness: 2–20 mm.
- Outlines: rounded rectangle, rectangle, oval/circle, and hexagonal. Use equal width and height for a circle. A regular hexagon uses height = width × 0.866.
- Six peg-hole shapes: rounded slot, circle, square, regular hexagon, diamond, and keyhole. Round width is its diameter; square width is side length; hexagonal width is across flats; diamond width is its unrotated diagonal. Slot/keyhole length includes the rounded ends. Keyholes have an adjustable entry diameter and neck width.
- Hole rotation, X repeat, row spacing, straight/staggered rows, solid edge border, and X/Y grid shifts are editable.
- Hole placement uses conservative clearance from the outer edge and protects material around mounts and seams. Some nominal grid positions are intentionally absent. The counters show the actual remaining holes.
- The tool rejects touching holes, thin webs below 1.2 mm, and settings that remove or split a panel. There is a limit of 1,200 pattern holes, 6,000 candidate positions, and 36 tiles per design to keep the browser responsive.

## Screw mounts

Mount layouts: four corners, two at the top, six along top/bottom, custom positions, or none. Automatic layouts repeat per tile. Custom mount positions use X/Y in millimeters from the overall board center; positive Y is up. Up to twelve custom mounts are allowed. Positions are assigned to the tile they fall in.

Mounts can be round, elongated rounded slots, or keyholes. Adjust screw/neck width, total slot length, and slot angle. Angle zero is vertical; 90° is horizontal. A keyhole's large entry is below the narrow neck: insert the screw head and lower the board to seat it.

Round and slotted mounts offer plain holes, flat recessed seats (counterbores), or tapered seats (countersinks). Set the head diameter and recess depth for your actual screw. Taper angle follows those dimensions; it is not locked to a standard screw angle. Recesses leave at least 1 mm of board. Keyhole mounts use plain openings.

**Rear clearance** adds integrated spacers around the mounts; zero leaves a flat back. Spacer walls are adjustable. With no mounts, no spacers are generated. Account for the full board-plus-spacer thickness when choosing real screws and wall anchors. The tool does not determine load capacity.

Mounts outside a curved outline are omitted and reported; a custom position outside the board or too close to an edge is rejected. Inspect **Hole layout**: amber marks identify screw mounts. In the 3D preview, orange outlines mark the same mounts and are not exported geometry.

## Printer and tiles

Printer defaults: 260 × 260 × 255 mm, with a 5 mm edge allowance on each side. Enter any usable X/Y/Z volume from 20 to 2000 mm. The fit check can turn a tile 90° on the bed; diagonal and tilted packing are not searched.

Enable **Split a large board to fit my printer** for automatic tiles. The planner compares two bed orientations, divides the board into equal rectangular cells, and preserves the overall hole-grid phase. **Solid seam border** omits openings that would run into tile edges. Outline curves are retained on outside tiles. No interlocking tabs or connector strips are generated. Mount the tiles separately, edge-to-edge.

Select a tile to inspect it or export it. With **Whole board** selected, the individual STL/3MF buttons export the first tile, clearly labeled R1-C1. **All tiles ZIP** includes an STL and 3MF for every tile, the editable project, and an assembly guide. Row 1 is the bottom row and column 1 is the left column in front view.

Models export **front face down**, centered in X/Y with the lowest point at Z = 0. Rear spacers then print above the board. Units are millimeters. Files contain models, not sliced G-code, supports, printer profiles, or multi-plate slicer projects. Open them in your slicer and inspect recessed screw seats and orientation.

The fit coupon has a smaller board with the current hole pattern, thickness, and one current-style mount. If mounts are disabled, the test has none. It is subject to the same printer checks. The coupon is a fit check, not a load test.

## Projects

**Save project** downloads a `.pegboard.json` containing all controls and printer dimensions. **Open** reloads that format, not arbitrary meshes or the older shelf/Print Studio projects. Valid designs are also saved in the current browser when browser storage is available; this does not synchronize across devices or website addresses. Keep downloaded project files for backups.

**Reset** in the top toolbar restores the default board and printer settings after an in-page confirmation that also works when the tool is embedded. Cancel or Escape keeps your current design. **Undo** restores your previous design if you change your mind.

Ctrl/Cmd+S saves, Ctrl/Cmd+O opens, Ctrl/Cmd+Z undoes, and Ctrl/Cmd+Shift+Z or Ctrl+Y redoes. Text controls retain normal editing. On phones, use **Customize board** and **Preview & download** to switch panels.

## Share or host yourself

The versioned ZIP contains a **finished `index.html` directly at its root**. Extract the ZIP and upload that file to the root of your GitHub Pages repository. No Node.js or build step is needed to host the finished HTML. `VERSION.txt` identifies this release. To offer downloads from Help on your own site, also upload `Pegboard_Studio.html` and the versioned ZIP beside `index.html`. It includes all runtime assets. Do not publish `index.template.html`: it contains source placeholders. Alternatively, rename the finished offline `Pegboard_Studio.html` to `index.html`.

The source is optional for hosting. To modify it with Node.js 22+:

```sh
npm ci
npm run build
npm test
```

The build writes root and `dist/index.html`, the offline `dist/Pegboard_Studio.html`, and matching `dist/Pegboard_Studio_v1.0.1.zip` / `dist/Pegboard_Studio_Source.zip` downloads together. Dependency licenses are preserved in `THIRD_PARTY_NOTICES.txt`. The WASM asset is embedded in `src/wasm-data.js` and must match the Manifold dependency version if deliberately upgrading it.

## Verification and limits

Geometry checks cover 57 designs / 60 panels: every hole shape, all four outlines, mount layouts, keyholes, counterbores/countersinks, rear spacers, automatic tiles, fit coupons, projects, and printer limits. Serialized STL edges are checked for closed surfaces and non-collapsed faces; volume and orientation remain correct after placing the front face on the bed. Vertical ray checks confirm real through holes and a physically recessed head seat. 3MF checks verify units, mesh contents, and package namespaces.

Reset is additionally checked inside a sandboxed iframe without browser popup permission, including Cancel, Escape, defaults, Undo/Redo, and reload. The versioned ZIP is extracted and its ready-to-host index.html is checked separately.

Browser QA checks offline startup, live 3D and layout previews, all controls, custom positions, invalid values, individual and zipped downloads, projects, undo/redo, reload, and 360/390-pixel layouts. Optional WebMCP tools are feature-detected; validation in a browser with native WebMCP support is unavailable in this environment. Their absence does not affect normal use.

This builder does not import meshes, add lettering, compute mechanical load ratings, generate connector tabs, or slice printer instructions. Curves are polygonal approximations. Material, slicing, screw selection, and printed tolerances affect the final object; use the fit test first.
