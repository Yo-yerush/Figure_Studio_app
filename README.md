# Figure Studio

Browser-native scientific figure editor for combining, arranging, and fine-tuning SVG/PDF/image plots in an Illustrator-like workspace.

Author: Yonatan Yerushalmy  
Plant's metabolism and molecular genetic lab, Prof. Rachel Amir group

Repository: https://github.com/Yo-yerush/Figure_Studio_app

## Run

Double-click:

```
Figure_Editor.html
```

## Features

- Load multiple SVG, PDF, PNG, JPG, and JPEG files into one final canvas.
- Place imported SVGs side by side on a shared blank artboard.
- Edit SVG elements directly in the browser.
- Illustrator-style tool rail with Select, Direct Select, Text, Pan, and shape tools.
- Add labels, rectangles, ellipses, lines, arrows, triangles, diamonds, stars, hexagons, plus/cross marks, brackets, and scale bars.
- Text mode highlights editable SVG text and supports content, size, font, bold, italic, and selected-range rich text editing.
- Manual OCR text recovery can recognize selected path-shaped labels and insert editable SVG text after user confirmation.
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
- Export final figures as SVG, PNG, JPEG, TIFF, or browser print/save-as-PDF, with export scope and DPI controls.

## Notes

PDF uploads ask for approval before conversion. Approved PDFs are converted in the browser with a pinned PDF.js SVG renderer from a CDN, with PDF.js eval support disabled, then imported as SVG pages so vector shapes can be selected and edited. Embedded raster images remain images, and text may still arrive as paths if the PDF itself stores text that way. If SVG conversion fails for a PDF feature that PDF.js cannot express as SVG, the app reports the conversion error and imports the PDF as rendered page images instead of a blank placeholder.

Some SVGs export text as paths. Those labels are no longer real text and cannot be edited as text unless the source figure is re-exported with text preserved.

OCR text recovery uses Tesseract.js from a CDN when the Recognize text button is first pressed, so it needs internet access for the initial OCR engine/language download. OCR results should be reviewed before replacing the original path shapes.
