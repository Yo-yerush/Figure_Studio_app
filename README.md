# Figure Studio

Browser-native scientific figure editor for combining, arranging, and fine-tuning SVG/PDF/image plots in an Illustrator-like workspace.

Author: Yonatan Yerushalmy  
Plant's metabolism and molecular genetic lab, Prof. Rachel Amir group

Repository: https://github.com/Yo-yerush/Figure_Studio_app

## Run

Double-click:

```bat
run_app.bat
```

The launcher starts a local static server at:

```text
http://127.0.0.1:4173/
```

If Python is not available, the launcher opens `index.html` directly.

## Features

- Load multiple SVG, PDF, PNG, JPG, and JPEG files into one final canvas.
- Place imported SVGs side by side on a shared blank artboard.
- Edit SVG elements directly in the browser.
- Illustrator-style tool rail with Select, Direct Select, Text, Pan, and shape tools.
- Add labels, rectangles, ellipses, lines, arrows, triangles, diamonds, stars, hexagons, plus/cross marks, brackets, and scale bars.
- Text mode highlights editable SVG text and supports content, size, font, bold, and italic editing.
- Selection inspector for transform, rotation, fill, stroke, line width, dash, arrowhead, opacity, point size, and text style.
- Resize selected elements directly on the canvas with corner and side handles.
- Resize the canvas directly with canvas handles.
- Rich Layers panel with visibility, lock, rename, nested expandable SVG element groups, individual elements, element counts, and fill/line color swatches.
- Reorder whole figures or inner SVG elements when selected elements share the same parent.
- Group/ungroup, select same fill/line/font/shape, and select all text/points/lines/bars/shapes/images.
- Align and distribute selected elements.
- Canvas presets for scientific figure layouts, crop to content, and canvas to selection.
- Dark workspace theme with a prominent bright artboard and separated edit, zoom, and export toolbar groups.
- Resizable and collapsible left/right side panels for a larger canvas view.
- Undo/redo, duplicate, delete, drag/drop loading, and keyboard movement.
- Export final figures as SVG, PNG, JPEG, or browser print/save-as-PDF, with export scope and DPI controls.

## Notes

PDF uploads are represented as movable placeholders in the canvas. Direct internal PDF element editing requires a PDF renderer and is outside this dependency-free static app.

Some SVGs export text as paths. Those labels are no longer real text and cannot be edited as text unless the source figure is re-exported with text preserved.

The old Shiny prototype remains in `app_040626/` as a legacy reference. The current app runs from root `index.html` with source files in `src/`.
