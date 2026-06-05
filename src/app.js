const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const state = {
  selected: [],
  groups: new Map(),
  files: [],
  expandedLayers: new Set(),
  expandedLayerGroups: new Set(),
  nextFileId: 1,
  nextElementId: 1,
  history: [],
  historyIndex: -1,
  drag: null,
  marquee: null,
  pan: null,
  panelResize: null,
  resizeDrag: null,
  transformEdit: null,
  background: '#ffffff',
  transparentBackground: false,
  textMode: false,
  activeTool: 'select',
  zoom: 1,
  exportDpi: 300,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false
};

const els = {
  mainLayout: document.getElementById('mainLayout'),
  leftPanel: document.getElementById('leftPanel'),
  rightPanel: document.getElementById('rightPanel'),
  leftPanelToggle: document.getElementById('leftPanelToggle'),
  rightPanelToggle: document.getElementById('rightPanelToggle'),
  leftResizeHandle: document.getElementById('leftResizeHandle'),
  rightResizeHandle: document.getElementById('rightResizeHandle'),
  fileInput: document.getElementById('fileInput'),
  fileList: document.getElementById('fileList'),
  svg: document.getElementById('compositionSvg'),
  content: document.getElementById('contentLayer'),
  background: document.getElementById('canvasBackground'),
  marquee: document.getElementById('selectionMarquee'),
  selectionResizeOverlay: document.getElementById('selectionResizeOverlay'),
  canvasResizeOverlay: document.getElementById('canvasResizeOverlay'),
  canvasArea: document.getElementById('canvasArea'),
  canvasFrame: document.getElementById('canvasFrame'),
  canvasWidth: document.getElementById('canvasWidth'),
  canvasWidthValue: document.getElementById('canvasWidthValue'),
  canvasWidthNumber: document.getElementById('canvasWidthNumber'),
  canvasHeight: document.getElementById('canvasHeight'),
  canvasHeightValue: document.getElementById('canvasHeightValue'),
  canvasHeightNumber: document.getElementById('canvasHeightNumber'),
  artboardPreset: document.getElementById('artboardPreset'),
  cropContentBtn: document.getElementById('cropContentBtn'),
  resizeSelectionBtn: document.getElementById('resizeSelectionBtn'),
  backgroundColor: document.getElementById('backgroundColor'),
  transparentBg: document.getElementById('transparentBg'),
  dropOverlay: document.getElementById('dropOverlay'),
  selectionSummary: document.getElementById('selectionSummary'),
  styleControls: document.getElementById('styleControls'),
  layerList: document.getElementById('layerList'),
  clearBtn: document.getElementById('clearBtn'),
  addTextBtn: document.getElementById('addTextBtn'),
  textModeBtn: document.getElementById('textModeBtn'),
  selectToolBtn: document.getElementById('selectToolBtn'),
  directSelectToolBtn: document.getElementById('directSelectToolBtn'),
  panToolBtn: document.getElementById('panToolBtn'),
  addRectBtn: document.getElementById('addRectBtn'),
  addEllipseBtn: document.getElementById('addEllipseBtn'),
  addLineBtn: document.getElementById('addLineBtn'),
  addArrowBtn: document.getElementById('addArrowBtn'),
  addTriangleBtn: document.getElementById('addTriangleBtn'),
  addDiamondBtn: document.getElementById('addDiamondBtn'),
  addStarBtn: document.getElementById('addStarBtn'),
  toolButtons: Array.from(document.querySelectorAll('[data-tool]')),
  selectNoneBtn: document.getElementById('selectNoneBtn'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  duplicateBtn: document.getElementById('duplicateBtn'),
  deleteBtn: document.getElementById('deleteBtn'),
  fitBtn: document.getElementById('fitBtn'),
  zoomOutBtn: document.getElementById('zoomOutBtn'),
  zoomInBtn: document.getElementById('zoomInBtn'),
  zoomValue: document.getElementById('zoomValue'),
  exportBtn: document.getElementById('exportBtn'),
  exportFormat: document.getElementById('exportFormat'),
  exportScope: document.getElementById('exportScope'),
  exportDpi: document.getElementById('exportDpi'),
  exportDpiValue: document.getElementById('exportDpiValue'),
  exportDpiNumber: document.getElementById('exportDpiNumber'),
  frontBtn: document.getElementById('frontBtn'),
  upBtn: document.getElementById('upBtn'),
  downBtn: document.getElementById('downBtn'),
  backBtn: document.getElementById('backBtn'),
  groupBtn: document.getElementById('groupBtn'),
  ungroupBtn: document.getElementById('ungroupBtn'),
  selectSameFillBtn: document.getElementById('selectSameFillBtn'),
  selectSameStrokeBtn: document.getElementById('selectSameStrokeBtn'),
  selectSameFontBtn: document.getElementById('selectSameFontBtn'),
  selectSameShapeBtn: document.getElementById('selectSameShapeBtn'),
  selectSameSizeBtn: document.getElementById('selectSameSizeBtn'),
  selectSameOpacityBtn: document.getElementById('selectSameOpacityBtn'),
  selectAllTextBtn: document.getElementById('selectAllTextBtn'),
  selectAllPointsBtn: document.getElementById('selectAllPointsBtn'),
  selectAllLinesBtn: document.getElementById('selectAllLinesBtn'),
  selectAllBarsBtn: document.getElementById('selectAllBarsBtn'),
  selectAllShapesBtn: document.getElementById('selectAllShapesBtn'),
  selectAllImagesBtn: document.getElementById('selectAllImagesBtn'),
  alignLeftBtn: document.getElementById('alignLeftBtn'),
  alignCenterBtn: document.getElementById('alignCenterBtn'),
  alignRightBtn: document.getElementById('alignRightBtn'),
  alignTopBtn: document.getElementById('alignTopBtn'),
  alignMiddleBtn: document.getElementById('alignMiddleBtn'),
  alignBottomBtn: document.getElementById('alignBottomBtn'),
  distributeHBtn: document.getElementById('distributeHBtn'),
  distributeVBtn: document.getElementById('distributeVBtn'),
  activeToolStatus: document.getElementById('activeToolStatus'),
  selectionStatus: document.getElementById('selectionStatus')
};

const FONT_CHOICES = [
  'Arial',
  'Helvetica',
  'Calibri',
  'Cambria',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Tahoma',
  'Courier New',
  'Inter'
];

const SHAPE_TOOLS = ['rect', 'ellipse', 'line', 'arrow', 'triangle', 'diamond', 'star', 'hexagon', 'plus', 'bracket', 'scaleBar', 'addText'];

const TOOL_LABELS = {
  select: 'Select',
  directSelect: 'Direct select',
  text: 'Text mode',
  pan: 'Pan',
  rect: 'Rectangle',
  ellipse: 'Ellipse',
  line: 'Line',
  arrow: 'Arrow',
  triangle: 'Triangle',
  diamond: 'Diamond',
  star: 'Star',
  addText: 'Add label'
};

const ARTBOARD_PRESETS = {
  custom: null,
  'nature-single': { width: 1060, height: 760 },
  'nature-double': { width: 2200, height: 1500 },
  'a4-landscape': { width: 3508, height: 2480 },
  'letter-landscape': { width: 3300, height: 2550 },
  square: { width: 1600, height: 1600 }
};

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'href') {
      el.setAttributeNS(XLINK_NS, 'href', value);
      el.setAttribute('href', value);
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

function assignId(el) {
  if (!el.dataset.editorId) el.dataset.editorId = `el-${state.nextElementId++}`;
  return el.dataset.editorId;
}

function allEditableElements() {
  return Array.from(els.content.querySelectorAll('[data-editor-id], circle, ellipse, rect, line, path, polyline, polygon, text, tspan, image, use, g.figure-object'))
    .filter(el => el !== els.background && el.closest('#contentLayer') && !el.closest('defs, clipPath, mask, pattern, symbol'));
}

function assignIds() {
  allEditableElements().forEach(assignId);
}

function canvasPoint(event) {
  const point = els.svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(els.svg.getScreenCTM().inverse());
}

function isLayerHidden(el) {
  return Boolean(el?.closest?.('[data-hidden="true"]'));
}

function isLayerLocked(el) {
  return Boolean(el?.closest?.('[data-locked="true"]'));
}

function selectableElement(el) {
  return el && !isLayerHidden(el) && !isLayerLocked(el);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[ch]));
}

function firstPaint(...values) {
  for (const value of values) {
    const v = String(value || '').trim();
    if (v && v !== 'none' && v !== 'transparent' && v !== 'rgba(0, 0, 0, 0)') return v;
  }
  return '';
}

function numberFrom(value) {
  const match = String(value || '').match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function isText(el) {
  return el && ['text', 'tspan'].includes(el.tagName.toLowerCase());
}

function textTargetsFor(el) {
  if (!el) return [];
  if (isText(el)) return [el];
  const textNodes = Array.from(el.querySelectorAll ? el.querySelectorAll('text') : []);
  if (textNodes.length) return textNodes;
  return Array.from(el.querySelectorAll ? el.querySelectorAll('tspan') : []);
}

function textTargetsForSelection() {
  return uniqueElements(state.selected.flatMap(el => textTargetsFor(el)));
}

function styleOf(el) {
  const cs = getComputedStyle(el);
  const textTarget = textTargetsFor(el)[0];
  const textCs = textTarget ? getComputedStyle(textTarget) : cs;
  const tag = el.tagName.toLowerCase();
  let pointSize = null;
  if (tag === 'circle') pointSize = numberFrom(el.getAttribute('r'));
  if (tag === 'ellipse') pointSize = numberFrom(el.getAttribute('rx')) || numberFrom(el.getAttribute('ry'));
  return {
    fill: firstPaint(el.getAttribute('fill'), el.style.fill, cs.getPropertyValue('fill')),
    stroke: firstPaint(el.getAttribute('stroke'), el.style.stroke, cs.getPropertyValue('stroke')),
    lineWidth: numberFrom(el.getAttribute('stroke-width') || el.style.strokeWidth || cs.getPropertyValue('stroke-width')),
    dash: el.getAttribute('stroke-dasharray') || el.style.strokeDasharray || 'solid',
    arrowhead: el.getAttribute('marker-end') ? 'end' : 'none',
    opacity: numberFrom(el.getAttribute('opacity') || el.style.opacity || cs.getPropertyValue('opacity')),
    textSize: textTarget ? numberFrom(textTarget.getAttribute('font-size') || textTarget.style.fontSize || textCs.getPropertyValue('font-size')) : null,
    fontFamily: textTarget ? textTarget.getAttribute('font-family') || textTarget.style.fontFamily || textCs.getPropertyValue('font-family') || 'Arial' : 'Arial',
    fontWeight: textTarget ? textTarget.getAttribute('font-weight') || textTarget.style.fontWeight || textCs.getPropertyValue('font-weight') || 'normal' : 'normal',
    fontStyle: textTarget ? textTarget.getAttribute('font-style') || textTarget.style.fontStyle || textCs.getPropertyValue('font-style') || 'normal' : 'normal',
    pointSize,
    text: textTarget ? textTarget.textContent : ''
  };
}

function hasPaint(el, prop) {
  const cs = getComputedStyle(el);
  return firstPaint(el.getAttribute(prop), el.style[prop], cs.getPropertyValue(prop)) !== '';
}

function elementKind(el) {
  const tag = el.tagName.toLowerCase();
  if (el.classList.contains('figure-object')) return 'Imported figures';
  if (['circle', 'ellipse'].includes(tag)) return 'Points';
  if (['text', 'tspan'].includes(tag)) return 'Text';
  if (['line', 'polyline'].includes(tag)) return 'Lines';
  if (tag === 'path' && hasPaint(el, 'stroke') && !hasPaint(el, 'fill')) return 'Lines';
  if (['rect', 'path', 'polygon'].includes(tag) || hasPaint(el, 'fill')) return 'Filled shapes';
  if (tag === 'image') return 'Images';
  if (hasPaint(el, 'stroke')) return 'Lines';
  return 'Other';
}

function capabilitiesFor(elements) {
  const caps = { point: false, line: false, fill: false, text: false, textContent: false, font: false, opacity: false };
  let textTargetCount = 0;
  elements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    const kind = elementKind(el);
    const textTargets = textTargetsFor(el);
    textTargetCount += textTargets.length;
    caps.point = caps.point || kind === 'Points';
    caps.line = caps.line || kind === 'Lines' || ['circle', 'ellipse', 'rect', 'polygon'].includes(tag) || hasPaint(el, 'stroke');
    caps.fill = caps.fill || ['Points', 'Filled shapes', 'Text'].includes(kind) || hasPaint(el, 'fill');
    caps.text = caps.text || textTargets.length > 0;
    caps.font = caps.font || textTargets.length > 0;
    caps.opacity = true;
  });
  caps.textContent = elements.length === 1 && textTargetCount === 1;
  return caps;
}

function groupKey(el) {
  const s = styleOf(el);
  const kind = elementKind(el);
  if (kind === 'Points') return [kind, s.fill, s.stroke, s.pointSize, s.lineWidth, s.opacity].join('|');
  if (kind === 'Lines') return [kind, s.stroke, s.lineWidth, s.opacity].join('|');
  if (kind === 'Text') return [kind, s.fill, s.textSize, s.fontFamily, s.opacity].join('|');
  if (kind === 'Filled shapes') return [kind, s.fill, s.stroke, s.lineWidth, s.opacity].join('|');
  if (kind === 'Imported figures') return [kind, el.dataset.fileId || el.dataset.editorId].join('|');
  return [kind, s.fill, s.stroke, s.opacity].join('|');
}

function buildGroups() {
  const groups = new Map();
  allEditableElements().forEach((el, index) => {
    const key = groupKey(el);
    if (!groups.has(key)) {
      groups.set(key, { id: key, kind: elementKind(el), elements: [], style: styleOf(el), firstIndex: index });
    }
    groups.get(key).elements.push(el);
  });
  const order = ['Imported figures', 'Points', 'Lines', 'Text', 'Filled shapes', 'Images', 'Other'];
  return Array.from(groups.values()).sort((a, b) => {
    const d = order.indexOf(a.kind) - order.indexOf(b.kind);
    return d !== 0 ? d : a.firstIndex - b.firstIndex;
  });
}

function groupLabel(group) {
  const s = group.style;
  if (group.kind === 'Imported figures') return `Imported figure (${group.elements.length})`;
  if (group.kind === 'Points') return `Points (${group.elements.length}) - fill ${s.fill || 'none'}, size ${s.pointSize || '?'}`;
  if (group.kind === 'Lines') return `Lines (${group.elements.length}) - ${s.stroke || 'none'}, width ${s.lineWidth || '?'}`;
  if (group.kind === 'Text') return `Text (${group.elements.length}) - size ${s.textSize || '?'}, ${cleanFont(s.fontFamily)}`;
  if (group.kind === 'Filled shapes') return `Shapes (${group.elements.length}) - fill ${s.fill || 'none'}, line ${s.stroke || 'none'}`;
  if (group.kind === 'Images') return `Images (${group.elements.length})`;
  return `${group.kind} (${group.elements.length})`;
}

function cleanFont(value) {
  return String(value || 'Arial').replace(/["']/g, '').split(',')[0].trim();
}

function normalizeFontWeight(value) {
  const weight = String(value || 'normal').toLowerCase();
  return weight === 'bold' || Number(weight) >= 600 ? 'bold' : 'normal';
}

function selectedGroupId() {
  if (!state.selected.length) return '';
  const selectedIds = state.selected.map(assignId).sort().join('|');
  for (const group of state.groups.values()) {
    const groupIds = group.elements.map(assignId).sort().join('|');
    if (groupIds === selectedIds) return group.id;
  }
  return '';
}

function updateGroups() {
  assignIds();
  const groups = buildGroups();
  state.groups = new Map(groups.map(group => [group.id, group]));
  renderLayerList();
}

function renderLayerList() {
  const layers = topLevelLayers().slice().reverse();
  els.layerList.innerHTML = '';

  if (!layers.length) {
    const empty = document.createElement('div');
    empty.className = 'layer-empty';
    empty.textContent = 'No layers';
    els.layerList.appendChild(empty);
    return;
  }

  const activePanel = activeLayerPanel();
  layers.forEach((layer, index) => {
    const row = layerRow(layer, `${index + 1}. ${layerLabel(layer)}`);
    if (layer === activePanel) row.classList.add('active');
    els.layerList.appendChild(row);

    if (state.expandedLayers.has(assignId(layer))) {
      const groups = panelElementGroups(layer);
      const childWrap = document.createElement('div');
      childWrap.className = 'layer-children';
      if (groups.length) {
        groups.forEach(group => {
          const groupId = layerGroupId(layer, group);
          childWrap.appendChild(layerGroupRow(group, groupId));
          if (state.expandedLayerGroups.has(groupId)) {
            const elementWrap = document.createElement('div');
            elementWrap.className = 'layer-elements';
            group.elements.forEach((el, elementIndex) => {
              elementWrap.appendChild(layerElementRow(el, elementIndex));
            });
            childWrap.appendChild(elementWrap);
          }
        });
      } else {
        const empty = document.createElement('div');
        empty.className = 'layer-empty child';
        empty.textContent = 'No editable child elements';
        childWrap.appendChild(empty);
      }
      els.layerList.appendChild(childWrap);
    }
  });
}

function layerRow(layer, label) {
  const row = document.createElement('div');
  row.className = 'layer-row';
  if (layer.dataset.hidden === 'true') row.classList.add('is-hidden');
  if (layer.dataset.locked === 'true') row.classList.add('is-locked');
  if (selectionMatches([layer])) row.classList.add('selected');

  const layerId = assignId(layer);
  const expanded = state.expandedLayers.has(layerId);
  const groups = panelElementGroups(layer);

  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'layer-expand';
  expand.textContent = expanded ? '–' : '+';
  expand.title = expanded ? 'Collapse layer elements' : 'Show layer elements';
  expand.addEventListener('click', event => {
    event.stopPropagation();
    if (state.expandedLayers.has(layerId)) state.expandedLayers.delete(layerId);
    else state.expandedLayers.add(layerId);
    renderLayerList();
  });

  const visible = document.createElement('button');
  visible.type = 'button';
  visible.className = 'layer-icon';
  visible.textContent = layer.dataset.hidden === 'true' ? ' ' : '👁';
  visible.title = 'Toggle visibility';
  visible.addEventListener('click', event => {
    event.stopPropagation();
    toggleLayerVisibility(layer);
  });

  const lock = document.createElement('button');
  lock.type = 'button';
  lock.className = 'layer-icon';
  lock.title = 'Toggle lock';
  lock.textContent = layer.dataset.locked === 'true' ? '🔒︎' : 'ꗃ';
  lock.addEventListener('click', event => {
    event.stopPropagation();
    toggleLayerLock(layer);
  });

  const input = document.createElement('input');
  input.className = 'layer-name';
  input.value = label.replace(/^\d+\.\s*/, '');
  input.title = 'Layer name';
  if (selectionMatches([layer])) input.classList.add('active');
  input.addEventListener('click', event => {
    event.stopPropagation();
    selectElements([layer]);
  });
  input.addEventListener('change', () => {
    layer.dataset.label = input.value.trim() || layerLabel(layer);
    commitHistory();
    updateGroups();
  });

  const meta = layerMeta(layer, groups);
  row.append(
    expand,
    visible,
    lock,
    input,
    layerMetaCell(meta.count)
  );
  return row;
}

function layerGroupId(layer, group) {
  return `${assignId(layer)}::${group.id}`;
}

function layerGroupRow(group, groupId) {
  const row = document.createElement('div');
  row.className = 'layer-group-row';
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  if (selectionMatches(group.elements)) row.classList.add('active');
  row.addEventListener('click', () => selectElements(group.elements));
  row.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectElements(group.elements);
  });
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'layer-group-expand';
  expand.textContent = group.elements.length > 1 ? (state.expandedLayerGroups.has(groupId) ? '-' : '+') : '';
  expand.title = group.elements.length > 1 ? 'Show elements in this group' : '';
  expand.disabled = group.elements.length <= 1;
  expand.addEventListener('click', event => {
    event.stopPropagation();
    if (state.expandedLayerGroups.has(groupId)) state.expandedLayerGroups.delete(groupId);
    else state.expandedLayerGroups.add(groupId);
    renderLayerList();
  });
  row.append(
    layerMetaCell(group.kind),
    layerMetaCell(group.elements.length),
    swatchCell(group.style.fill, group.elements, 'fill'),
    swatchCell(group.style.stroke, group.elements, 'stroke'),
    layerMetaCell(compactGroupLabel(group), 'layer-group-name'),
    expand
  );
  return row;
}

function layerElementRow(el, index) {
  const row = document.createElement('div');
  row.className = 'layer-element-row';
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  if (selectionMatches([el])) row.classList.add('active');
  row.addEventListener('click', () => selectElements([el]));
  row.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectElements([el]);
  });
  row.append(
    layerMetaCell(`#${index + 1}`),
    layerMetaCell(elementKind(el)),
    swatchCell(styleOf(el).fill, [el], 'fill'),
    swatchCell(styleOf(el).stroke, [el], 'stroke'),
    layerMetaCell(layerElementLabel(el), 'layer-group-name')
  );
  return row;
}

function layerElementLabel(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'text' || tag === 'tspan') return (el.textContent || 'Text').trim().slice(0, 36) || 'Text';
  const label = el.dataset.label;
  if (label) return label;
  return tag;
}

function compactGroupLabel(group) {
  if (group.kind === 'Text') return `${cleanFont(group.style.fontFamily)} ${group.style.textSize || ''}`;
  if (group.kind === 'Points') return `size ${group.style.pointSize || '?'}`;
  if (group.kind === 'Lines') return `width ${group.style.lineWidth || '?'}`;
  if (group.kind === 'Filled shapes') return 'shapes';
  return group.kind;
}

function layerMeta(layer, groups) {
  const kind = elementKind(layer);
  const count = groups.reduce((sum, group) => sum + group.elements.length, 0) || 1;
  const firstStyled = groups.find(group => group.style.fill || group.style.stroke)?.style || styleOf(layer);
  return {
    type: kind === 'Imported figures' ? 'Figure' : kind,
    count,
    fill: firstStyled.fill,
    stroke: firstStyled.stroke
  };
}

function layerMetaCell(value, className = '') {
  const span = document.createElement('span');
  span.className = `layer-meta ${className}`.trim();
  span.textContent = value || '-';
  return span;
}

function swatchCell(value, targets = [], key = 'fill') {
  const label = document.createElement('label');
  label.className = 'layer-swatch-cell';
  label.title = key === 'fill' ? 'Change fill color' : 'Change line color';
  label.addEventListener('click', event => event.stopPropagation());
  const input = document.createElement('input');
  input.type = 'color';
  const color = toHex(value);
  input.value = color;
  const swatch = document.createElement('span');
  swatch.className = 'color-swatch';
  if (value) swatch.style.background = color;
  else swatch.classList.add('empty');
  input.addEventListener('click', event => event.stopPropagation());
  input.addEventListener('input', () => {
    swatch.style.background = input.value;
    swatch.classList.remove('empty');
    targets.forEach(el => applyStyleToElement(el, { [key]: input.value }));
    renderSelection();
  });
  input.addEventListener('change', () => {
    commitHistory();
    updateGroups();
    renderSelection();
  });
  label.append(input, swatch);
  return label;
}

function layerLabel(layer) {
  const label = layer.dataset.label;
  if (label) return label;
  const kind = elementKind(layer);
  if (kind === 'Text') {
    const text = String(styleOf(layer).text || '').trim();
    return text ? `Text - ${text.slice(0, 28)}` : 'Text';
  }
  return kind;
}

function toggleLayerVisibility(layer) {
  const hidden = layer.dataset.hidden === 'true';
  layer.dataset.hidden = hidden ? 'false' : 'true';
  layer.style.display = hidden ? '' : 'none';
  if (!hidden && state.selected.some(el => el === layer || topLevelElement(el) === layer)) clearSelection();
  commitHistory();
  updateGroups();
  renderSelection();
}

function toggleLayerLock(layer) {
  layer.dataset.locked = layer.dataset.locked === 'true' ? 'false' : 'true';
  if (layer.dataset.locked === 'true' && state.selected.some(el => el === layer || topLevelElement(el) === layer)) clearSelection();
  commitHistory();
  updateGroups();
  renderSelection();
}

function activeLayerPanel() {
  if (!state.selected.length) return null;
  return topLevelElement(state.selected[0]);
}

function panelElementGroups(panel) {
  const elements = detailedSelectableElements().filter(el => topLevelElement(el) === panel);
  const groups = new Map();
  elements.forEach((el, index) => {
    const key = groupKey(el);
    if (!groups.has(key)) {
      groups.set(key, { id: key, kind: elementKind(el), elements: [], style: styleOf(el), firstIndex: index });
    }
    groups.get(key).elements.push(el);
  });
  return Array.from(groups.values()).sort((a, b) => a.firstIndex - b.firstIndex);
}

function selectionMatches(elements) {
  if (!state.selected.length || state.selected.length !== elements.length) return false;
  const selected = new Set(state.selected);
  return elements.every(el => selected.has(el));
}

function clearSelection() {
  els.svg.querySelectorAll('.svg-selected-element').forEach(el => el.classList.remove('svg-selected-element'));
  state.selected = [];
}

function selectElements(elements) {
  clearSelection();
  state.selected = uniqueElements(elements).filter(selectableElement);
  state.selected.forEach(el => {
    assignId(el);
    el.classList.add('svg-selected-element');
  });
  updateGroups();
  renderSelection();
}

function addElementsToSelection(elements) {
  selectElements([...state.selected, ...elements]);
}

function toggleElementSelection(el) {
  if (!el) return;
  if (state.selected.includes(el)) {
    selectElements(state.selected.filter(item => item !== el));
  } else {
    addElementsToSelection([el]);
  }
}

function uniqueElements(elements) {
  return Array.from(new Set(elements.filter(Boolean)));
}

function startMarquee(point, additive = false, clientPoint = null) {
  if (!additive) clearSelection();
  state.marquee = {
    start: point,
    current: point,
    screenStart: clientPoint,
    screenCurrent: clientPoint,
    moved: false,
    additive
  };
  updateMarquee(point, point);
  els.marquee.classList.add('visible');
}

function updateMarquee(start, current) {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  els.marquee.setAttribute('x', x);
  els.marquee.setAttribute('y', y);
  els.marquee.setAttribute('width', width);
  els.marquee.setAttribute('height', height);
}

function finishMarquee() {
  if (!state.marquee) return;
  const box = normalizedBox(state.marquee.start, state.marquee.current);
  const screenBox = state.marquee.screenStart && state.marquee.screenCurrent
    ? normalizedBox(state.marquee.screenStart, state.marquee.screenCurrent)
    : box;
  els.marquee.classList.remove('visible');
  els.marquee.setAttribute('width', 0);
  els.marquee.setAttribute('height', 0);

  if (screenBox.width > 4 && screenBox.height > 4) {
    const hits = elementsInMarquee(screenBox);
    if (state.marquee.additive) addElementsToSelection(hits);
    else selectElements(hits);
    if (state.textMode && hits.length) focusTextEditor();
  } else if (!state.marquee.additive) {
    clearSelection();
    renderSelection();
    updateGroups();
  }
  state.marquee = null;
}

function normalizedBox(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
}

function topLevelSelectableElements() {
  return Array.from(els.content.children).filter(el => el.getBBox && !isLayerHidden(el));
}

function topLevelLayers() {
  return Array.from(els.content.children).filter(el => el.getBBox);
}

function elementsInMarquee(box) {
  if (state.textMode) return textElementsInMarquee(box);
  if (state.activeTool === 'select') {
    return topLevelSelectableElements().filter(el => selectableElement(el) && containsBox(box, elementClientBox(el)));
  }
  let hits = detailedSelectableElements().filter(el => containsBox(box, elementClientBox(el)));
  if (!hits.length) hits = topLevelSelectableElements().filter(el => containsBox(box, elementClientBox(el)));
  return uniqueElements(hits).filter(el => !hasSelectedAncestor(el, hits));
}

function textElementsInMarquee(box) {
  return editableTextElements().filter(el => containsBox(box, elementClientBox(el)));
}

function detailedSelectableElements() {
  return allEditableElements().filter(el => {
    const tag = el.tagName.toLowerCase();
    if (el.classList.contains('figure-object')) return false;
    if (tag === 'tspan' && el.closest('text')) return false;
    if (!selectableElement(el)) return false;
    return typeof el.getBBox === 'function';
  });
}

function editableTextElements() {
  return uniqueElements(Array.from(els.content.querySelectorAll('text, tspan'))
    .filter(el => el.closest('#contentLayer') && !el.closest('defs, clipPath, mask, pattern, symbol') && selectableElement(el))
    .map(el => el.closest('text') || el));
}

function editableTextTargetFromPointer(target) {
  const text = target.closest('text, tspan');
  return text && text.closest('#contentLayer') ? text.closest('text') || text : null;
}

function editableTargetFromPointer(target) {
  const text = target.closest('text, tspan');
  if (text && text.closest('#contentLayer')) return text.closest('text') || text;
  return target.closest('[data-editor-id], circle, ellipse, rect, line, path, polyline, polygon, text, tspan, image, use, g.figure-object');
}

function hasSelectedAncestor(el, selected) {
  const selectedSet = new Set(selected);
  let parent = el.parentElement;
  while (parent && parent !== els.content) {
    if (selectedSet.has(parent)) return true;
    parent = parent.parentElement;
  }
  return false;
}

function elementScreenBox(el) {
  try {
    const box = el.getBBox();
    const matrix = el.getCTM();
    if (!matrix) return null;
    return pointsToBox([
      svgPoint(box.x, box.y).matrixTransform(matrix),
      svgPoint(box.x + box.width, box.y).matrixTransform(matrix),
      svgPoint(box.x, box.y + box.height).matrixTransform(matrix),
      svgPoint(box.x + box.width, box.y + box.height).matrixTransform(matrix)
    ]);
  } catch (error) {
    return null;
  }
}

function elementClientBox(el) {
  try {
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width < 0 || rect.height < 0) return null;
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  } catch (error) {
    return null;
  }
}

function containsBox(outer, inner) {
  if (!outer || !inner) return false;
  const tolerance = 1;
  return inner.x >= outer.x - tolerance &&
    inner.y >= outer.y - tolerance &&
    inner.x + inner.width <= outer.x + outer.width + tolerance &&
    inner.y + inner.height <= outer.y + outer.height + tolerance;
}

function renderSelection() {
  renderSelectionResizeOverlay();
  renderCanvasResizeOverlay();
  if (!state.selected.length) {
    els.selectionSummary.textContent = state.textMode ? 'Text mode: click editable text' : 'No selection';
    els.styleControls.innerHTML = '';
    updateToolbar();
    return;
  }
  const caps = capabilitiesFor(state.selected);
  const style = styleOf(state.selected[0]);
  const label = state.selected.length > 1 ? 'Group' : elementKind(state.selected[0]);
  els.selectionSummary.textContent = `${label}: ${state.selected.length} element${state.selected.length === 1 ? '' : 's'}`;
  renderStyleControls(caps, style);
  updateToolbar();
}

function renderSelectionResizeOverlay() {
  if (!els.selectionResizeOverlay) return;
  els.selectionResizeOverlay.innerHTML = '';
  if (!state.selected.length) return;
  const box = selectionCanvasBox(state.selected);
  if (!box || box.width <= 0 || box.height <= 0) return;
  els.selectionResizeOverlay.appendChild(createSvgElement('rect', {
    class: 'selection-resize-box',
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height
  }));
  [
    ['nw', box.x, box.y],
    ['n', box.x + box.width / 2, box.y],
    ['ne', box.x + box.width, box.y],
    ['e', box.x + box.width, box.y + box.height / 2],
    ['s', box.x + box.width / 2, box.y + box.height],
    ['sw', box.x, box.y + box.height],
    ['w', box.x, box.y + box.height / 2],
    ['se', box.x + box.width, box.y + box.height]
  ].forEach(([handle, x, y]) => {
    const isSide = ['n', 'e', 's', 'w'].includes(handle);
    els.selectionResizeOverlay.appendChild(createSvgElement(isSide ? 'circle' : 'rect', {
      class: `selection-resize-handle resize-${handle}`,
      ...(isSide
        ? { cx: x, cy: y, r: 3.2 }
        : { x: x - 4, y: y - 4, width: 8, height: 8, rx: 1.8 }),
      'data-resize-type': 'selection',
      'data-resize-handle': handle
    }));
  });
}

function renderCanvasResizeOverlay() {
  if (!els.canvasResizeOverlay) return;
  els.canvasResizeOverlay.innerHTML = '';
  const width = Number(els.svg.getAttribute('width')) || 1200;
  const height = Number(els.svg.getAttribute('height')) || 800;
  els.canvasResizeOverlay.appendChild(createSvgElement('rect', {
    class: 'canvas-resize-box',
    x: 0,
    y: 0,
    width,
    height
  }));
  [
    ['e', width, height / 2],
    ['s', width / 2, height],
    ['se', width, height]
  ].forEach(([handle, x, y]) => {
    els.canvasResizeOverlay.appendChild(createSvgElement('circle', {
      class: `canvas-resize-handle resize-${handle}`,
      cx: x,
      cy: y,
      r: 5,
      'data-resize-type': 'canvas',
      'data-resize-handle': handle
    }));
  });
}

function addControlGroup(title) {
  const group = document.createElement('div');
  group.className = 'control-group';
  if (title) {
    const head = document.createElement('div');
    head.className = 'control-group-title';
    head.textContent = title;
    group.appendChild(head);
  }
  els.styleControls.appendChild(group);
  return group;
}

function renderStyleControls(caps, style) {
  els.styleControls.innerHTML = '';
  renderTransformControls();
  if (caps.text) {
    const group = addControlGroup('Text');
    const textTargets = textTargetsForSelection();
    if (caps.textContent) addTextInput(group, 'Content', 'text', style.text || '');
    else addTextTargetInputs(group, textTargets);
    addRange(group, 'Text size', 'textSize', 4, 96, 1, style.textSize || 14);
    addFontInput(group, 'Font family', 'fontFamily', cleanFont(style.fontFamily));
    addSelectControl(group, 'Weight', 'fontWeight', normalizeFontWeight(style.fontWeight), [
      ['normal', 'Regular'],
      ['bold', 'Bold']
    ]);
    addSelectControl(group, 'Style', 'fontStyle', style.fontStyle === 'italic' ? 'italic' : 'normal', [
      ['normal', 'Regular'],
      ['italic', 'Italic']
    ]);
  }
  if (caps.point) {
    const group = addControlGroup('Points');
    addRange(group, 'Point size', 'pointSize', 0.5, 60, 0.5, style.pointSize || 4);
  }
  if (caps.line) {
    const group = addControlGroup('Line');
    addNumberStyleInput(group, 'Line width', 'lineWidth', style.lineWidth || 1, 0.1, 100, 0.1);
    addColor(group, 'Line color', 'stroke', style.stroke || '#1f77b4');
    addSelectControl(group, 'Dash', 'dash', style.dash || 'solid', [
      ['solid', 'Solid'],
      ['4 4', 'Dashed'],
      ['1 4', 'Dotted']
    ]);
    addSelectControl(group, 'Arrowhead', 'arrowhead', style.arrowhead || 'none', [
      ['none', 'None'],
      ['end', 'End']
    ]);
  }
  if (caps.fill) {
    const group = addControlGroup('Fill');
    addColor(group, 'Fill color', 'fill', style.fill || '#1f77b4');
  }
  if (caps.opacity) {
    const group = addControlGroup('Transparency');
    const opacity = style.opacity === null || Number.isNaN(style.opacity) ? 1 : style.opacity;
    addRange(group, 'Opacity', 'opacity', 0, 1, 0.01, opacity);
  }
}

function renderTransformControls() {
  if (!state.selected.length) return;
  const box = selectionCanvasBox(state.selected);
  if (!box) return;
  const group = addControlGroup('Transform');
  const canvasWidth = Number(els.svg.getAttribute('width')) || 1200;
  const canvasHeight = Number(els.svg.getAttribute('height')) || 800;
  addTransformSlider(group, 'X (px)', 'x', round(box.x), -canvasWidth, canvasWidth * 2, 1);
  addTransformSlider(group, 'Y (px)', 'y', round(box.y), -canvasHeight, canvasHeight * 2, 1);
  addTransformSlider(group, 'W (px)', 'width', round(box.width), 5, Math.max(canvasWidth * 2, box.width * 3), 1);
  addTransformSlider(group, 'H (px)', 'height', round(box.height), 5, Math.max(canvasHeight * 2, box.height * 3), 1);
  addTransformSlider(group, 'Rotate (deg)', 'rotate', 0, -180, 180, 1);
  const row = document.createElement('label');
  row.className = 'check-row compact';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'keepTransformRatio';
  input.checked = state.keepTransformRatio !== false;
  input.addEventListener('change', () => {
    state.keepTransformRatio = input.checked;
  });
  row.append(input, 'Keep ratio');
  group.appendChild(row);
}

function addTransformSlider(group, label, key, value, min, max, step) {
  const row = document.createElement('label');
  row.className = 'control-row transform-row';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = Math.floor(min);
  input.max = Math.ceil(max);
  input.step = step;
  input.value = value;
  const numberInput = document.createElement('input');
  numberInput.type = 'number';
  numberInput.className = 'inline-number';
  numberInput.min = input.min;
  numberInput.max = input.max;
  numberInput.step = step;
  numberInput.value = value;
  input.addEventListener('pointerdown', () => beginTransformEdit());
  input.addEventListener('input', () => {
    const next = Number(input.value);
    if (!Number.isFinite(next)) return;
    numberInput.value = round(next);
    applyTransformSlider(key, next);
  });
  input.addEventListener('change', () => {
    commitHistory();
    state.transformEdit = null;
    updateGroups();
    renderSelection();
  });
  numberInput.addEventListener('focus', () => beginTransformEdit());
  numberInput.addEventListener('change', () => {
    const next = Number(numberInput.value);
    if (!Number.isFinite(next)) return;
    input.value = next;
    applyTransformSlider(key, next);
    commitHistory();
    state.transformEdit = null;
    updateGroups();
    renderSelection();
  });
  row.append(label, input, numberInput);
  group.appendChild(row);
}

function addRange(group, label, key, min, max, step, value) {
  const row = document.createElement('label');
  row.className = 'control-row';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  const numberInput = document.createElement('input');
  numberInput.type = 'number';
  numberInput.className = 'inline-number';
  numberInput.min = min;
  numberInput.max = max;
  numberInput.step = step;
  numberInput.value = value;
  input.addEventListener('input', () => {
    numberInput.value = input.value;
    applyStyle({ [key]: parseFloat(input.value) });
  });
  numberInput.addEventListener('change', () => {
    const next = Number(numberInput.value);
    if (!Number.isFinite(next)) return;
    input.value = next;
    applyStyle({ [key]: next });
  });
  row.append(label, input, numberInput);
  group.appendChild(row);
}

function addNumberStyleInput(group, label, key, value, min, max, step) {
  const row = document.createElement('label');
  row.className = 'control-row number-row';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.addEventListener('change', () => {
    const next = Number(input.value);
    if (Number.isFinite(next)) applyStyle({ [key]: next });
  });
  row.append(label, input);
  group.appendChild(row);
}

function addColor(group, label, key, value) {
  const row = document.createElement('label');
  row.className = 'control-row';
  const input = document.createElement('input');
  input.type = 'color';
  input.value = toHex(value);
  input.addEventListener('input', () => applyStyle({ [key]: input.value }));
  row.append(label, input);
  group.appendChild(row);
}

function addTextInput(group, label, key, value) {
  const row = document.createElement('label');
  row.className = 'control-row full';
  const input = document.createElement('input');
  input.type = 'text';
  if (key === 'text') input.dataset.textContentInput = 'true';
  input.value = value;
  input.addEventListener('input', () => applyStyle({ [key]: input.value }));
  row.append(label, input);
  group.appendChild(row);
}

function addTextTargetInputs(group, targets) {
  if (!targets.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'text-edit-list';
  const editableTargets = targets.slice(0, 40);
  editableTargets.forEach((target, index) => {
    const row = document.createElement('label');
    row.className = 'text-edit-row';
    const label = document.createElement('span');
    label.textContent = `Label ${index + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = target.textContent || '';
    input.addEventListener('input', () => {
      target.textContent = input.value;
      commitHistory();
      updateGroups();
    });
    row.append(label, input);
    wrap.appendChild(row);
  });
  if (targets.length > editableTargets.length) {
    const note = document.createElement('div');
    note.className = 'text-edit-note';
    note.textContent = `${targets.length - editableTargets.length} more labels selected. Select a smaller text group to edit all labels.`;
    wrap.appendChild(note);
  }
  group.appendChild(wrap);
}

function addFontInput(group, label, key, value) {
  const row = document.createElement('label');
  row.className = 'control-row full';
  const input = document.createElement('select');
  input.value = value;
  FONT_CHOICES.forEach(font => input.appendChild(new Option(font, font)));
  if (value && !FONT_CHOICES.includes(value)) input.appendChild(new Option(value, value));
  input.value = value || 'Arial';
  input.addEventListener('input', () => applyStyle({ [key]: input.value }));
  row.append(label, input);
  group.appendChild(row);
}

function addSelectControl(group, label, key, value, options) {
  const row = document.createElement('label');
  row.className = 'control-row full';
  const input = document.createElement('select');
  options.forEach(([optionValue, optionLabel]) => input.appendChild(new Option(optionLabel, optionValue)));
  input.value = value;
  input.addEventListener('input', () => applyStyle({ [key]: input.value }));
  row.append(label, input);
  group.appendChild(row);
}

function toHex(value) {
  const v = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  const rgb = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) return `#${rgb.slice(1, 4).map(n => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return '#1f77b4';
}

function applyStyle(style) {
  if (!state.selected.length) return;
  state.selected.forEach(el => applyStyleToElement(el, style));
  commitHistory();
  updateGroups();
}

function applyStyleToElement(el, style) {
  const tag = el.tagName.toLowerCase();
  const textTargets = textTargetsFor(el);
  if (style.text !== undefined && textTargets.length === 1) textTargets[0].textContent = style.text;
  if (style.textSize !== undefined) {
    textTargets.forEach(target => {
      target.setAttribute('font-size', style.textSize);
      target.style.fontSize = `${style.textSize}px`;
    });
  }
  if (style.fontFamily !== undefined) {
    textTargets.forEach(target => {
      target.setAttribute('font-family', style.fontFamily);
      target.style.fontFamily = style.fontFamily;
    });
  }
  if (style.fontWeight !== undefined) {
    textTargets.forEach(target => {
      target.setAttribute('font-weight', style.fontWeight);
      target.style.fontWeight = style.fontWeight;
    });
  }
  if (style.fontStyle !== undefined) {
    textTargets.forEach(target => {
      target.setAttribute('font-style', style.fontStyle);
      target.style.fontStyle = style.fontStyle;
    });
  }
  if (style.pointSize !== undefined) {
    if (tag === 'circle') el.setAttribute('r', style.pointSize);
    if (tag === 'ellipse') {
      el.setAttribute('rx', style.pointSize);
      el.setAttribute('ry', style.pointSize);
    }
  }
  if (style.lineWidth !== undefined) {
    el.setAttribute('stroke-width', style.lineWidth);
    el.style.strokeWidth = style.lineWidth;
  }
  if (style.stroke !== undefined) {
    el.setAttribute('stroke', style.stroke);
    el.style.stroke = style.stroke;
  }
  if (style.dash !== undefined) {
    if (style.dash === 'solid') {
      el.removeAttribute('stroke-dasharray');
      el.style.strokeDasharray = '';
    } else {
      el.setAttribute('stroke-dasharray', style.dash);
      el.style.strokeDasharray = style.dash;
    }
  }
  if (style.arrowhead !== undefined) {
    if (style.arrowhead === 'end') {
      ensureArrowMarker();
      el.setAttribute('marker-end', 'url(#figureEditorArrow)');
    } else {
      el.removeAttribute('marker-end');
    }
  }
  if (style.fill !== undefined) {
    el.setAttribute('fill', style.fill);
    el.style.fill = style.fill;
  }
  if (style.opacity !== undefined) {
    el.setAttribute('opacity', style.opacity);
    el.style.opacity = style.opacity;
  }
}

function nextPlacement(width = 360, height = 240) {
  const margin = 40;
  const gap = 28;
  const contentBox = safeContentBox();
  const canvasWidth = Number(els.svg.getAttribute('width')) || 1200;
  const canvasHeight = Number(els.svg.getAttribute('height')) || 800;

  if (!contentBox) return { x: margin, y: margin };

  let x = contentBox.x + contentBox.width + gap;
  let y = contentBox.y;

  if (x + width + margin > canvasWidth) {
    x = margin;
    y = contentBox.y + contentBox.height + gap;
  }

  if (y + height + margin > canvasHeight) {
    expandCanvas(Math.max(canvasWidth, x + width + margin), y + height + margin);
  }

  return { x, y };
}

function safeContentBox() {
  const items = Array.from(els.content.children).filter(el => el.getBBox);
  if (!items.length) return null;
  const boxes = [];
  items.forEach(el => {
    try {
      const box = el.getBBox();
      const matrix = el.getCTM();
      if (!matrix) return;
      const points = [
        svgPoint(box.x, box.y).matrixTransform(matrix),
        svgPoint(box.x + box.width, box.y).matrixTransform(matrix),
        svgPoint(box.x, box.y + box.height).matrixTransform(matrix),
        svgPoint(box.x + box.width, box.y + box.height).matrixTransform(matrix)
      ];
      boxes.push(pointsToBox(points));
    } catch (error) {}
  });
  if (!boxes.length) return null;
  const minX = Math.min(...boxes.map(box => box.x));
  const minY = Math.min(...boxes.map(box => box.y));
  const maxX = Math.max(...boxes.map(box => box.x + box.width));
  const maxY = Math.max(...boxes.map(box => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function svgPoint(x, y) {
  const point = els.svg.createSVGPoint();
  point.x = x;
  point.y = y;
  return point;
}

function pointsToBox(points) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY
  };
}

function selectionCanvasBox(elements = state.selected) {
  const boxes = elements.map(elementScreenBox).filter(Boolean);
  if (!boxes.length) return null;
  const minX = Math.min(...boxes.map(box => box.x));
  const minY = Math.min(...boxes.map(box => box.y));
  const maxX = Math.max(...boxes.map(box => box.x + box.width));
  const maxY = Math.max(...boxes.map(box => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function moveSelectionTo({ x, y }) {
  const box = selectionCanvasBox();
  if (!box) return;
  const dx = x === undefined ? 0 : x - box.x;
  const dy = y === undefined ? 0 : y - box.y;
  state.selected.forEach(el => appendTranslate(el, dx, dy));
  commitHistory();
  updateGroups();
  renderSelection();
}

function startResizeDrag(target, event) {
  const type = target.dataset.resizeType;
  const handle = target.dataset.resizeHandle;
  if (!type || !handle) return false;
  event.preventDefault();
  event.stopPropagation();
  const point = canvasPoint(event);
  if (type === 'selection') {
    const box = selectionCanvasBox();
    if (!box) return false;
    state.resizeDrag = {
      type,
      handle,
      start: point,
      box,
      items: state.selected.map(el => ({
        el,
        ctm: el.getCTM(),
        parentCtm: elementParentCtm(el)
      })).filter(item => item.ctm && item.parentCtm)
    };
  } else {
    state.resizeDrag = {
      type,
      handle,
      start: point,
      width: Number(els.svg.getAttribute('width')) || 1200,
      height: Number(els.svg.getAttribute('height')) || 800
    };
  }
  try { target.setPointerCapture(event.pointerId); } catch (error) {}
  return true;
}

function applyResizeDrag(event) {
  if (!state.resizeDrag) return false;
  const point = canvasPoint(event);
  const isCorner = /[ns][ew]/.test(state.resizeDrag.handle);
  if (state.resizeDrag.type === 'selection') applySelectionResize(point, isCorner || event.shiftKey);
  if (state.resizeDrag.type === 'canvas') applyCanvasResize(point);
  return true;
}

function applySelectionResize(point, keepRatio = false) {
  const drag = state.resizeDrag;
  const box = drag.box;
  if (!box?.width || !box?.height) return;
  const right = drag.handle.includes('e');
  const left = drag.handle.includes('w');
  const bottom = drag.handle.includes('s');
  const top = drag.handle.includes('n');
  const anchor = {
    x: left ? box.x + box.width : box.x,
    y: top ? box.y + box.height : box.y
  };
  let sx = right ? (point.x - anchor.x) / box.width : left ? (anchor.x - point.x) / box.width : 1;
  let sy = bottom ? (point.y - anchor.y) / box.height : top ? (anchor.y - point.y) / box.height : 1;
  sx = Math.max(0.02, sx);
  sy = Math.max(0.02, sy);
  if (keepRatio) {
    const dx = Math.abs(point.x - drag.start.x);
    const dy = Math.abs(point.y - drag.start.y);
    const scale = dx >= dy ? sx : sy;
    sx = scale;
    sy = scale;
  }
  state.selected.forEach(el => {
    const item = drag.items.find(entry => entry.el === el);
    if (!item) return;
    const localMatrix = item.parentCtm.inverse()
      .multiply(canvasScaleMatrix(anchor.x, anchor.y, sx, sy))
      .multiply(item.ctm);
    el.setAttribute('transform', matrixToTransform(localMatrix));
  });
  renderSelectionResizeOverlay();
}

function applyCanvasResize(point) {
  const drag = state.resizeDrag;
  let width = drag.width;
  let height = drag.height;
  if (drag.handle.includes('e')) width = Math.max(100, point.x);
  if (drag.handle.includes('s')) height = Math.max(100, point.y);
  syncRangeNumber(els.canvasWidth, els.canvasWidthNumber, Math.ceil(width));
  syncRangeNumber(els.canvasHeight, els.canvasHeightNumber, Math.ceil(height));
  updateCanvas(false);
}

function finishResizeDrag() {
  if (!state.resizeDrag) return false;
  const type = state.resizeDrag.type;
  state.resizeDrag = null;
  commitHistory();
  updateGroups();
  if (type === 'selection') renderSelection();
  else renderCanvasResizeOverlay();
  return true;
}

function beginTransformEdit() {
  const box = selectionCanvasBox();
  if (!box) return;
  state.transformEdit = {
    box,
    transforms: new Map(state.selected.map(el => [el, el.getAttribute('transform') || '']))
  };
}

function applyTransformSlider(key, value) {
  if (!state.transformEdit) beginTransformEdit();
  const edit = state.transformEdit;
  if (!edit?.box) return;
  const box = edit.box;

  if (key === 'x' || key === 'y') {
    const dx = key === 'x' ? value - box.x : 0;
    const dy = key === 'y' ? value - box.y : 0;
    state.selected.forEach(el => {
      const base = edit.transforms.get(el) || '';
      const delta = canvasVectorInElementParent(el, dx, dy);
      el.setAttribute('transform', `${base} translate(${round(delta.x)} ${round(delta.y)})`.trim());
    });
    return;
  }

  if (key === 'rotate') {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    state.selected.forEach(el => {
      const base = edit.transforms.get(el) || '';
      const center = canvasPointInElementParent(el, cx, cy);
      el.setAttribute('transform', `${base} rotate(${round(value)} ${round(center.x)} ${round(center.y)})`.trim());
    });
    return;
  }

  const keepRatio = state.keepTransformRatio !== false;
  let sx = 1;
  let sy = 1;
  if (key === 'width') {
    sx = Math.max(0.01, value / box.width);
    sy = keepRatio ? sx : 1;
  }
  if (key === 'height') {
    sy = Math.max(0.01, value / box.height);
    sx = keepRatio ? sy : 1;
  }

  state.selected.forEach(el => {
    const base = edit.transforms.get(el) || '';
    const anchor = canvasPointInElementParent(el, box.x, box.y);
    const transform = `translate(${round(anchor.x)} ${round(anchor.y)}) scale(${round(sx)} ${round(sy)}) translate(${-round(anchor.x)} ${-round(anchor.y)})`;
    el.setAttribute('transform', `${base} ${transform}`.trim());
  });
}

function expandCanvas(width, height) {
  setCanvasSliderValue(els.canvasWidth, width);
  setCanvasSliderValue(els.canvasHeight, height);
  syncRangeNumber(els.canvasWidth, els.canvasWidthNumber, els.canvasWidth.value);
  syncRangeNumber(els.canvasHeight, els.canvasHeightNumber, els.canvasHeight.value);
  updateCanvas(false);
}

function setCanvasSliderValue(input, value) {
  const nextValue = Math.ceil(value);
  if (nextValue > Number(input.max)) input.max = nextValue;
  input.value = nextValue;
}

function syncRangeNumber(range, number, value) {
  if (!range || !number) return;
  const next = Number(value);
  if (!Number.isFinite(next)) return;
  if (next > Number(range.max)) range.max = next;
  if (next > Number(number.max)) number.max = next;
  range.value = next;
  number.value = next;
}

async function addFiles(fileList) {
  for (const file of Array.from(fileList || [])) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const id = `file-${state.nextFileId++}`;
    const item = { id, name: file.name, kind: ext, url: URL.createObjectURL(file) };
    state.files.push(item);
    try {
      if (ext === 'svg') await importSvgFile(file, item);
      else if (['png', 'jpg', 'jpeg'].includes(ext)) await importImageFile(file, item);
      else if (ext === 'pdf') importPdfPlaceholder(item);
    } catch (error) {
      console.error(error);
    }
  }
  commitHistory();
  renderFileList();
  updateGroups();
  updateToolbar();
}

async function importSvgFile(file, item) {
  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const source = doc.documentElement;
  if (!source || source.tagName.toLowerCase() !== 'svg') return;
  source.querySelectorAll('script, foreignObject').forEach(node => node.remove());
  namespaceSvgIds(source, item.id);

  const box = svgBox(source);
  const scale = Math.min(1, 520 / Math.max(box.width, box.height));
  const p = nextPlacement(box.width * scale, box.height * scale);
  const wrapper = createSvgElement('g', {
    class: 'figure-object',
    transform: `translate(${p.x} ${p.y}) scale(${scale})`,
    'data-file-id': item.id,
    'data-label': item.name
  });
  assignId(wrapper);

  const nested = createSvgElement('svg', {
    x: 0,
    y: 0,
    width: box.width,
    height: box.height,
    viewBox: `${box.minX} ${box.minY} ${box.width} ${box.height}`,
    overflow: 'visible'
  });
  Array.from(source.childNodes).forEach(child => nested.appendChild(document.importNode(child, true)));
  wrapper.appendChild(nested);
  els.content.appendChild(wrapper);
  assignIds();
}

function namespaceSvgIds(svg, namespace) {
  const safeNamespace = String(namespace || `file-${state.nextFileId}`).replace(/[^\w-]/g, '-');
  const idMap = new Map();
  const allNodes = [svg, ...Array.from(svg.querySelectorAll('*'))];
  allNodes.filter(el => el.hasAttribute('id')).forEach(el => {
    const oldId = el.getAttribute('id');
    if (!oldId) return;
    idMap.set(oldId, `${safeNamespace}-${oldId}`);
  });
  if (!idMap.size) return;

  allNodes.filter(el => el.hasAttribute('id')).forEach(el => {
    const oldId = el.getAttribute('id');
    if (idMap.has(oldId)) el.setAttribute('id', idMap.get(oldId));
  });

  allNodes.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      let value = attr.value;
      idMap.forEach((newId, oldId) => {
        const escaped = escapeRegExp(oldId);
        value = value
          .replace(new RegExp(`url\\(\\s*(['"]?)#${escaped}\\1\\s*\\)`, 'g'), `url(#${newId})`)
          .replace(new RegExp(`^#${escaped}$`, 'g'), `#${newId}`);
      });
      if (value !== attr.value) el.setAttribute(attr.name, value);
    });
  });

  svg.querySelectorAll('style').forEach(style => {
    let css = style.textContent || '';
    idMap.forEach((newId, oldId) => {
      const escaped = escapeRegExp(oldId);
      css = css
        .replace(new RegExp(`url\\(\\s*(['"]?)#${escaped}\\1\\s*\\)`, 'g'), `url(#${newId})`)
        .replace(new RegExp(`#${escaped}(?![\\w-])`, 'g'), `#${newId}`);
    });
    style.textContent = css;
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function svgBox(svg) {
  const viewBox = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (viewBox.length === 4 && viewBox.every(n => Number.isFinite(n))) {
    return { minX: viewBox[0], minY: viewBox[1], width: viewBox[2], height: viewBox[3] };
  }
  return {
    minX: 0,
    minY: 0,
    width: numberFrom(svg.getAttribute('width')) || 800,
    height: numberFrom(svg.getAttribute('height')) || 600
  };
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function importImageFile(file, item) {
  const dataUrl = await readDataUrl(file);
  const size = await imageSize(dataUrl);
  const scale = Math.min(1, 480 / Math.max(size.width, size.height));
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  const p = nextPlacement(width, height);
  const image = createSvgElement('image', {
    href: dataUrl,
    x: p.x,
    y: p.y,
    width,
    height,
    'data-file-id': item.id
  });
  assignId(image);
  els.content.appendChild(image);
}

function imageSize(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 500, height: img.naturalHeight || 350 });
    img.onerror = () => resolve({ width: 500, height: 350 });
    img.src = url;
  });
}

function importPdfPlaceholder(item) {
  const p = nextPlacement(360, 220);
  const group = createSvgElement('g', {
    class: 'figure-object',
    transform: `translate(${p.x} ${p.y})`,
    'data-file-id': item.id,
    'data-label': item.name
  });
  assignId(group);
  group.appendChild(createSvgElement('rect', { x: 0, y: 0, width: 360, height: 220, fill: '#f8fafc', stroke: '#94a3b8', 'stroke-width': 2 }));
  const text = createSvgElement('text', { x: 24, y: 56, fill: '#334155', 'font-size': 22, 'font-family': 'Arial' });
  text.textContent = `PDF: ${item.name}`;
  group.appendChild(text);
  els.content.appendChild(group);
  assignIds();
}

function renderFileList() {
  els.fileList.innerHTML = '';
  if (!state.files.length) {
    const empty = document.createElement('div');
    empty.className = 'file-meta';
    empty.textContent = 'No files loaded';
    els.fileList.appendChild(empty);
    return;
  }
  state.files.forEach(file => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-item';
    button.innerHTML = `<span class="file-name">${escapeHtml(file.name)}</span><span class="file-meta">${file.kind.toUpperCase()}</span>`;
    button.addEventListener('click', () => {
      const group = els.content.querySelector(`[data-file-id="${file.id}"]`);
      if (group) selectElements([group]);
    });
    els.fileList.appendChild(button);
  });
}

function addText(point = { x: 120, y: 120 }) {
  const text = createSvgElement('text', {
    x: point.x,
    y: point.y,
    fill: '#111827',
    'font-size': 24,
    'font-family': 'Arial'
  });
  text.textContent = 'New text';
  assignId(text);
  els.content.appendChild(text);
  selectElements([text]);
  commitHistory();
}

function addRect(point = { x: 120, y: 120 }) {
  const rect = createSvgElement('rect', {
    x: point.x,
    y: point.y,
    width: 160,
    height: 100,
    fill: '#bfdbfe',
    stroke: '#1d4ed8',
    'stroke-width': 2
  });
  assignId(rect);
  els.content.appendChild(rect);
  selectElements([rect]);
  commitHistory();
}

function addEllipse(point = { x: 140, y: 120 }) {
  const ellipse = createSvgElement('ellipse', {
    cx: point.x + 80,
    cy: point.y + 50,
    rx: 80,
    ry: 50,
    fill: '#bbf7d0',
    stroke: '#15803d',
    'stroke-width': 2
  });
  assignId(ellipse);
  els.content.appendChild(ellipse);
  selectElements([ellipse]);
  commitHistory();
}

function addLine(point = { x: 120, y: 160 }) {
  const line = createSvgElement('line', {
    x1: point.x,
    y1: point.y,
    x2: point.x + 180,
    y2: point.y,
    stroke: '#334155',
    'stroke-width': 3,
    'stroke-linecap': 'round'
  });
  appendNewShape(line);
}

function addArrow(point = { x: 120, y: 180 }) {
  ensureArrowMarker();
  const line = createSvgElement('line', {
    x1: point.x,
    y1: point.y,
    x2: point.x + 200,
    y2: point.y,
    stroke: '#111827',
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'marker-end': 'url(#figureEditorArrow)'
  });
  appendNewShape(line);
}

function addTriangle(point = { x: 120, y: 95 }) {
  const x = point.x;
  const y = point.y;
  const triangle = createSvgElement('polygon', {
    points: `${x + 100},${y} ${x + 200},${y + 160} ${x},${y + 160}`,
    fill: '#e7e7e7',
    stroke: '#111827',
    'stroke-width': 2
  });
  appendNewShape(triangle);
}

function addDiamond(point = { x: 110, y: 95 }) {
  const x = point.x;
  const y = point.y;
  const diamond = createSvgElement('polygon', {
    points: `${x + 110},${y} ${x + 220},${y + 80} ${x + 110},${y + 160} ${x},${y + 80}`,
    fill: '#e7e7e7',
    stroke: '#111827',
    'stroke-width': 2
  });
  appendNewShape(diamond);
}

function addStar(point = { x: 132, y: 87 }) {
  const star = createSvgElement('polygon', {
    points: starPoints(point.x + 88, point.y + 88, 88, 38, 5),
    fill: '#e7e7e7',
    stroke: '#111827',
    'stroke-width': 2
  });
  appendNewShape(star);
}

function addHexagon(point = { x: 120, y: 95 }) {
  const hex = createSvgElement('polygon', {
    points: regularPolygonPoints(point.x + 90, point.y + 78, 82, 6, Math.PI / 6),
    fill: '#e7e7e7',
    stroke: '#111827',
    'stroke-width': 2
  });
  appendNewShape(hex);
}

function addPlus(point = { x: 120, y: 95 }) {
  const x = point.x;
  const y = point.y;
  const plus = createSvgElement('polygon', {
    points: `${x + 65},${y} ${x + 115},${y} ${x + 115},${y + 55} ${x + 170},${y + 55} ${x + 170},${y + 105} ${x + 115},${y + 105} ${x + 115},${y + 160} ${x + 65},${y + 160} ${x + 65},${y + 105} ${x + 10},${y + 105} ${x + 10},${y + 55} ${x + 65},${y + 55}`,
    fill: '#e7e7e7',
    stroke: '#111827',
    'stroke-width': 2
  });
  appendNewShape(plus);
}

function addBracket(point = { x: 120, y: 95 }) {
  const x = point.x;
  const y = point.y;
  const bracket = createSvgElement('path', {
    d: `M ${x + 70} ${y} H ${x} V ${y + 170} H ${x + 70}`,
    fill: 'none',
    stroke: '#111827',
    'stroke-width': 4,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
  appendNewShape(bracket);
}

function addScaleBar(point = { x: 120, y: 160 }) {
  const group = createSvgElement('g', { 'data-label': 'Scale bar' });
  const line = createSvgElement('line', {
    x1: point.x,
    y1: point.y,
    x2: point.x + 180,
    y2: point.y,
    stroke: '#111827',
    'stroke-width': 6,
    'stroke-linecap': 'butt'
  });
  const text = createSvgElement('text', {
    x: point.x + 90,
    y: point.y + 28,
    fill: '#111827',
    'font-size': 18,
    'font-family': 'Arial',
    'text-anchor': 'middle'
  });
  text.textContent = '100 um';
  group.append(line, text);
  appendNewShape(group);
}

function appendNewShape(shape) {
  assignId(shape);
  els.content.appendChild(shape);
  selectElements([shape]);
  commitHistory();
}

function addShapeForTool(tool, point) {
  if (tool === 'rect') addRect(point);
  if (tool === 'ellipse') addEllipse(point);
  if (tool === 'line') addLine(point);
  if (tool === 'arrow') addArrow(point);
  if (tool === 'triangle') addTriangle(point);
  if (tool === 'diamond') addDiamond(point);
  if (tool === 'star') addStar(point);
  if (tool === 'hexagon') addHexagon(point);
  if (tool === 'plus') addPlus(point);
  if (tool === 'bracket') addBracket(point);
  if (tool === 'scaleBar') addScaleBar(point);
  if (tool === 'addText') {
    addText(point);
    focusTextEditor();
  }
  if (SHAPE_TOOLS.includes(tool)) {
    setActiveTool(tool === 'addText' ? 'text' : 'select');
  }
}

function starPoints(cx, cy, outerRadius, innerRadius, points) {
  const coords = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + i * Math.PI / points;
    coords.push(`${round(cx + Math.cos(angle) * radius)},${round(cy + Math.sin(angle) * radius)}`);
  }
  return coords.join(' ');
}

function regularPolygonPoints(cx, cy, radius, sides, rotation = 0) {
  const coords = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation - Math.PI / 2 + (i * 2 * Math.PI) / sides;
    coords.push(`${round(cx + Math.cos(angle) * radius)},${round(cy + Math.sin(angle) * radius)}`);
  }
  return coords.join(' ');
}

function ensureArrowMarker() {
  let defs = els.svg.querySelector('defs');
  if (!defs) {
    defs = createSvgElement('defs');
    els.svg.insertBefore(defs, els.svg.firstChild);
  }
  if (defs.querySelector('#figureEditorArrow')) return;
  const marker = createSvgElement('marker', {
    id: 'figureEditorArrow',
    markerWidth: 10,
    markerHeight: 10,
    refX: 9,
    refY: 3,
    orient: 'auto',
    markerUnits: 'strokeWidth'
  });
  const path = createSvgElement('path', {
    d: 'M0,0 L0,6 L9,3 z',
    fill: 'context-stroke'
  });
  marker.appendChild(path);
  defs.appendChild(marker);
}

function commitHistory() {
  const snapshot = serializeForEditing();
  if (state.history[state.historyIndex] === snapshot) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex = state.history.length - 1;
  if (state.history.length > 100) {
    state.history.shift();
    state.historyIndex--;
  }
  updateToolbar();
}

function serializeForEditing() {
  const clone = els.content.cloneNode(true);
  clone.querySelectorAll('.svg-selected-element').forEach(el => el.classList.remove('svg-selected-element'));
  return clone.innerHTML;
}

function restoreSnapshot(html) {
  clearSelection();
  els.content.innerHTML = html;
  assignIds();
  updateGroups();
  renderSelection();
}

function undo() {
  if (state.historyIndex <= 0) return;
  state.historyIndex--;
  restoreSnapshot(state.history[state.historyIndex]);
  updateToolbar();
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) return;
  state.historyIndex++;
  restoreSnapshot(state.history[state.historyIndex]);
  updateToolbar();
}

function moveBy(dx, dy) {
  if (!state.selected.length) return;
  state.selected.forEach(el => appendTranslate(el, dx, dy));
  commitHistory();
  updateGroups();
  renderSelection();
}

function appendTranslate(el, dx, dy) {
  const current = el.getAttribute('transform') || '';
  const delta = canvasVectorInElementParent(el, dx, dy);
  el.setAttribute('transform', `${current} translate(${round(delta.x)} ${round(delta.y)})`.trim());
}

function canvasPointInElementParent(el, x, y) {
  try {
    const parent = el.parentNode && typeof el.parentNode.getCTM === 'function' ? el.parentNode : els.content;
    const matrix = parent.getCTM();
    if (!matrix) return { x, y };
    const point = svgPoint(x, y).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  } catch (error) {
    return { x, y };
  }
}

function canvasVectorInElementParent(el, dx, dy) {
  const origin = canvasPointInElementParent(el, 0, 0);
  const target = canvasPointInElementParent(el, dx, dy);
  return { x: target.x - origin.x, y: target.y - origin.y };
}

function elementParentCtm(el) {
  try {
    const parent = el.parentNode && typeof el.parentNode.getCTM === 'function' ? el.parentNode : els.content;
    return parent.getCTM();
  } catch (error) {
    return null;
  }
}

function svgMatrix(a, b, c, d, e, f) {
  const matrix = els.svg.createSVGMatrix();
  matrix.a = a;
  matrix.b = b;
  matrix.c = c;
  matrix.d = d;
  matrix.e = e;
  matrix.f = f;
  return matrix;
}

function canvasScaleMatrix(anchorX, anchorY, sx, sy) {
  return svgMatrix(1, 0, 0, 1, anchorX, anchorY)
    .multiply(svgMatrix(sx, 0, 0, sy, 0, 0))
    .multiply(svgMatrix(1, 0, 0, 1, -anchorX, -anchorY));
}

function matrixToTransform(matrix) {
  return `matrix(${round(matrix.a)} ${round(matrix.b)} ${round(matrix.c)} ${round(matrix.d)} ${round(matrix.e)} ${round(matrix.f)})`;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function deleteSelection() {
  if (!state.selected.length) return;
  state.selected.forEach(el => el.remove());
  clearSelection();
  commitHistory();
  updateGroups();
  renderSelection();
}

function duplicateSelection() {
  if (!state.selected.length) return;
  const clones = state.selected.map(el => {
    const clone = el.cloneNode(true);
    clone.dataset.editorId = `el-${state.nextElementId++}`;
    appendTranslate(clone, 16, 16);
    el.parentNode.insertBefore(clone, el.nextSibling);
    return clone;
  });
  selectElements(clones);
  commitHistory();
}

function groupSelection() {
  if (state.selected.length < 2) return;
  const sameParent = state.selected.every(el => el.parentNode === state.selected[0].parentNode);
  const items = sameParent ? state.selected : uniqueElements(state.selected.map(topLevelElement));
  const parent = sameParent ? state.selected[0].parentNode : els.content;
  const group = createSvgElement('g', { class: 'figure-object', 'data-label': 'Group' });
  assignId(group);
  const ordered = items.slice().sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  parent.insertBefore(group, ordered[0]);
  ordered.forEach(el => group.appendChild(el));
  selectElements([group]);
  commitHistory();
  updateGroups();
}

function ungroupSelection() {
  const groups = state.selected.filter(el => el.tagName.toLowerCase() === 'g');
  if (!groups.length) return;
  const moved = [];
  groups.forEach(group => {
    moved.push(...ungroupNode(group));
  });
  selectElements(moved.filter(el => el.getBBox));
  commitHistory();
  updateGroups();
}

function ungroupNode(group) {
  const parent = group.parentNode;
  if (!parent) return [];
  const nestedSvg = Array.from(group.children).find(child => child.tagName.toLowerCase() === 'svg');
  if (nestedSvg) return ungroupImportedSvg(group, nestedSvg, parent);
  return moveChildrenOutOfGroup(group, parent, group.getAttribute('transform') || '');
}

function ungroupImportedSvg(wrapper, nestedSvg, parent) {
  const moved = [];
  const wrapperTransform = wrapper.getAttribute('transform') || '';
  const nestedTransform = nestedSvgLocalTransform(nestedSvg);
  Array.from(nestedSvg.childNodes).forEach(child => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    applyTransformPrefix(child, wrapperTransform, nestedTransform);
    parent.insertBefore(child, wrapper);
    moved.push(child);
  });
  wrapper.remove();
  return moved;
}

function moveChildrenOutOfGroup(group, parent, parentTransform = '') {
  const moved = [];
  Array.from(group.childNodes).forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      applyTransformPrefix(child, parentTransform);
      moved.push(child);
    }
    parent.insertBefore(child, group);
  });
  group.remove();
  return moved;
}

function applyTransformPrefix(el, ...prefixes) {
  const prefix = prefixes.filter(Boolean).join(' ').trim();
  if (!prefix) return;
  const current = el.getAttribute('transform') || '';
  el.setAttribute('transform', `${prefix} ${current}`.trim());
}

function nestedSvgLocalTransform(svg) {
  const parts = [];
  const x = numberFrom(svg.getAttribute('x')) || 0;
  const y = numberFrom(svg.getAttribute('y')) || 0;
  const viewBox = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (x || y) parts.push(`translate(${round(x)} ${round(y)})`);
  if (viewBox.length === 4 && viewBox.every(n => Number.isFinite(n)) && (viewBox[0] || viewBox[1])) {
    parts.push(`translate(${-round(viewBox[0])} ${-round(viewBox[1])})`);
  }
  return parts.join(' ');
}

function selectSame(prop) {
  if (!state.selected.length) return;
  const seedEl = state.selected[0];
  const seed = styleOf(seedEl);
  const seedBox = elementScreenBox(seedEl);
  const seedTag = seedEl.tagName.toLowerCase();
  const seedKind = elementKind(seedEl);
  const matches = detailedSelectableElements().filter(el => {
    const style = styleOf(el);
    if (prop === 'fill') return style.fill && style.fill === seed.fill;
    if (prop === 'stroke') {
      return elementKind(el) === 'Lines' &&
        style.stroke &&
        style.stroke === seed.stroke &&
        style.lineWidth === seed.lineWidth &&
        String(style.dash || 'solid') === String(seed.dash || 'solid');
    }
    if (prop === 'font') return textTargetsFor(el).length && cleanFont(style.fontFamily) === cleanFont(seed.fontFamily);
    if (prop === 'shape') return elementKind(el) === seedKind && el.tagName.toLowerCase() === seedTag;
    if (prop === 'size') {
      const box = elementScreenBox(el);
      if (!box || !seedBox) return false;
      return Math.abs(box.width - seedBox.width) <= 1 && Math.abs(box.height - seedBox.height) <= 1;
    }
    if (prop === 'opacity') {
      const a = seed.opacity === null || Number.isNaN(seed.opacity) ? 1 : seed.opacity;
      const b = style.opacity === null || Number.isNaN(style.opacity) ? 1 : style.opacity;
      return Math.abs(a - b) < 0.001;
    }
    return false;
  });
  selectElements(matches);
}

function selectKind(kind) {
  selectElements(detailedSelectableElements().filter(el => elementKind(el) === kind));
}

function selectBars() {
  selectElements(detailedSelectableElements().filter(isBarElement));
}

function selectShapes() {
  selectElements(detailedSelectableElements().filter(el => {
    const kind = elementKind(el);
    return kind === 'Filled shapes' || kind === 'Points';
  }));
}

function selectImages() {
  selectElements(detailedSelectableElements().filter(el => elementKind(el) === 'Images' || el.tagName.toLowerCase() === 'image'));
}

function isBarElement(el) {
  const tag = el.tagName.toLowerCase();
  if (tag !== 'rect') return false;
  if (!hasPaint(el, 'fill')) return false;
  const box = elementScreenBox(el);
  if (!box) return false;
  return box.width >= 2 && box.height >= 2;
}

function moveLayers(action) {
  if (!state.selected.length) return;
  const { parent, items } = layerMoveContext();
  if (!parent || !items.length) return;
  const unique = items;
  if (action === 'front') unique.forEach(el => parent.appendChild(el));
  if (action === 'back') unique.slice().reverse().forEach(el => parent.insertBefore(el, parent.firstChild));
  if (action === 'up') unique.slice().reverse().forEach(el => {
    const next = el.nextSibling;
    if (next && !unique.includes(next)) parent.insertBefore(next, el);
  });
  if (action === 'down') unique.forEach(el => {
    const prev = el.previousSibling;
    if (prev && !unique.includes(prev)) parent.insertBefore(el, prev);
  });
  commitHistory();
  updateGroups();
}

function layerMoveContext() {
  const selected = uniqueElements(state.selected);
  if (!selected.length) return { parent: null, items: [] };
  const parents = uniqueElements(selected.map(el => el.parentNode));
  if (parents.length === 1 && parents[0] && parents[0] !== els.content) {
    return { parent: parents[0], items: selected.filter(el => el.parentNode === parents[0]) };
  }
  const topLevel = uniqueElements(selected.map(topLevelElement).filter(Boolean));
  return { parent: els.content, items: topLevel };
}

function alignSelection(kind) {
  if (state.selected.length < 2) return;
  const box = selectionCanvasBox();
  if (!box) return;
  state.selected.forEach(el => {
    const item = elementScreenBox(el);
    if (!item) return;
    let dx = 0;
    let dy = 0;
    if (kind === 'left') dx = box.x - item.x;
    if (kind === 'center') dx = box.x + box.width / 2 - (item.x + item.width / 2);
    if (kind === 'right') dx = box.x + box.width - (item.x + item.width);
    if (kind === 'top') dy = box.y - item.y;
    if (kind === 'middle') dy = box.y + box.height / 2 - (item.y + item.height / 2);
    if (kind === 'bottom') dy = box.y + box.height - (item.y + item.height);
    appendTranslate(el, dx, dy);
  });
  commitHistory();
  updateGroups();
  renderSelection();
}

function distributeSelection(axis) {
  if (state.selected.length < 3) return;
  const items = state.selected.map(el => ({ el, box: elementScreenBox(el) })).filter(item => item.box);
  const key = axis === 'h' ? 'x' : 'y';
  const size = axis === 'h' ? 'width' : 'height';
  items.sort((a, b) => a.box[key] - b.box[key]);
  const first = items[0].box[key];
  const last = items[items.length - 1].box[key] + items[items.length - 1].box[size];
  const total = items.reduce((sum, item) => sum + item.box[size], 0);
  const gap = (last - first - total) / (items.length - 1);
  let cursor = first;
  items.forEach(item => {
    const delta = cursor - item.box[key];
    appendTranslate(item.el, axis === 'h' ? delta : 0, axis === 'v' ? delta : 0);
    cursor += item.box[size] + gap;
  });
  commitHistory();
  updateGroups();
  renderSelection();
}

function topLevelElement(el) {
  let node = el;
  while (node && node.parentNode !== els.content) node = node.parentNode;
  return node && node.parentNode === els.content ? node : el;
}

function updateCanvas(saveHistory = true) {
  const width = Math.max(100, Number(els.canvasWidth.value) || 1200);
  const height = Math.max(100, Number(els.canvasHeight.value) || 800);
  if (els.canvasWidthValue) els.canvasWidthValue.textContent = `${Math.round(width)} px`;
  if (els.canvasHeightValue) els.canvasHeightValue.textContent = `${Math.round(height)} px`;
  syncRangeNumber(els.canvasWidth, els.canvasWidthNumber, width);
  syncRangeNumber(els.canvasHeight, els.canvasHeightNumber, height);
  els.svg.setAttribute('width', width);
  els.svg.setAttribute('height', height);
  els.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  els.background.setAttribute('width', width);
  els.background.setAttribute('height', height);
  state.background = els.backgroundColor.value;
  state.transparentBackground = els.transparentBg.checked;
  els.background.setAttribute('fill', state.transparentBackground ? 'none' : state.background);
  els.canvasFrame.style.setProperty('--canvas-bg', state.transparentBackground ? 'transparent' : state.background);
  renderCanvasResizeOverlay();
  if (saveHistory) commitHistory();
}

function currentExportBox() {
  const scope = els.exportScope?.value || 'canvas';
  if (scope === 'selection') return selectionCanvasBox(state.selected);
  if (scope === 'content') return safeContentBox();
  return null;
}

function cleanExportSvg() {
  const clone = els.svg.cloneNode(true);
  clone.querySelectorAll('.svg-selected-element').forEach(el => el.classList.remove('svg-selected-element'));
  clone.querySelector('#selectionResizeOverlay')?.remove();
  clone.querySelector('#canvasResizeOverlay')?.remove();
  clone.querySelector('#selectionMarquee')?.remove();
  clone.querySelectorAll('[data-editor-id]').forEach(el => el.removeAttribute('data-editor-id'));
  clone.querySelectorAll('[data-file-id]').forEach(el => el.removeAttribute('data-file-id'));
  clone.querySelectorAll('[data-label]').forEach(el => el.removeAttribute('data-label'));
  clone.querySelectorAll('[data-locked]').forEach(el => el.removeAttribute('data-locked'));
  clone.querySelectorAll('[data-hidden="true"]').forEach(el => el.remove());
  clone.querySelectorAll('[data-hidden]').forEach(el => el.removeAttribute('data-hidden'));
  clone.removeAttribute('class');
  if (state.transparentBackground) {
    clone.querySelector('#canvasBackground')?.remove();
  }
  const box = currentExportBox();
  if (box) {
    const pad = 12;
    const x = Math.max(0, box.x - pad);
    const y = Math.max(0, box.y - pad);
    const width = box.width + pad * 2;
    const height = box.height + pad * 2;
    clone.setAttribute('viewBox', `${round(x)} ${round(y)} ${round(width)} ${round(height)}`);
    clone.setAttribute('width', round(width));
    clone.setAttribute('height', round(height));
  }
  clone.setAttribute('xmlns', SVG_NS);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

function downloadText(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function exportFigure() {
  const format = els.exportFormat.value;
  const svgText = cleanExportSvg();
  if (format === 'svg') {
    downloadText('figure_final.svg', svgText, 'image/svg+xml');
  } else if (format === 'png' || format === 'jpeg') {
    exportRaster(svgText, format);
  } else {
    openPrintPdf(svgText);
  }
}

function exportRaster(svgText, format) {
  const img = new Image();
  const blob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const width = Number(els.svg.getAttribute('width'));
    const height = Number(els.svg.getAttribute('height'));
    const dpiScale = (Number(els.exportDpi?.value) || 300) / 96;
    const box = currentExportBox();
    const outWidth = box ? box.width + 24 : width;
    const outHeight = box ? box.height + 24 : height;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(outWidth * dpiScale);
    canvas.height = Math.ceil(outHeight * dpiScale);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpiScale, dpiScale);
    if (format === 'jpeg' || !state.transparentBackground) {
      ctx.fillStyle = state.transparentBackground ? '#ffffff' : state.background;
      ctx.fillRect(0, 0, outWidth, outHeight);
    }
    ctx.drawImage(img, 0, 0, outWidth, outHeight);
    URL.revokeObjectURL(url);
    canvas.toBlob(out => {
      const outUrl = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = outUrl;
      a.download = `figure_final.${format === 'jpeg' ? 'jpg' : 'png'}`;
      a.click();
      URL.revokeObjectURL(outUrl);
    }, format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.95);
  };
  img.src = url;
}

function applyArtboardPreset() {
  const preset = ARTBOARD_PRESETS[els.artboardPreset.value];
  if (!preset) return;
  setCanvasSliderValue(els.canvasWidth, preset.width);
  setCanvasSliderValue(els.canvasHeight, preset.height);
  updateCanvas(true);
}

function cropCanvasToContent(selectionOnly = false) {
  const box = selectionOnly ? selectionCanvasBox(state.selected) : safeContentBox();
  if (!box) return;
  const pad = 32;
  const dx = pad - box.x;
  const dy = pad - box.y;
  Array.from(els.content.children).forEach(el => appendTranslate(el, dx, dy));
  setCanvasSliderValue(els.canvasWidth, box.width + pad * 2);
  setCanvasSliderValue(els.canvasHeight, box.height + pad * 2);
  updateCanvas(false);
  commitHistory();
  updateGroups();
  renderSelection();
}

function openPrintPdf(svgText) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><title>figure_final.pdf</title><body style="margin:0">${svgText}<script>window.onload=()=>window.print();<\/script></body>`);
  win.document.close();
}

function updateToolbar() {
  els.undoBtn.disabled = state.historyIndex <= 0;
  els.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
  const hasSelection = state.selected.length > 0;
  [els.deleteBtn, els.duplicateBtn, els.frontBtn, els.upBtn, els.downBtn, els.backBtn, els.groupBtn, els.ungroupBtn].forEach(button => {
    button.disabled = !hasSelection;
  });
  els.textModeBtn.classList.toggle('active', state.textMode);
  els.textModeBtn.setAttribute('aria-pressed', String(state.textMode));
  els.svg.classList.toggle('text-mode', state.textMode);
  els.svg.classList.toggle('pan-mode', state.activeTool === 'pan');
  els.toolButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tool === state.activeTool);
  });
  els.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
  els.activeToolStatus.textContent = `Tool: ${TOOL_LABELS[state.activeTool] || state.activeTool}`;
  els.selectionStatus.textContent = state.selected.length ? `${state.selected.length} selected` : 'No selection';
}

function storedPanelState(side) {
  try {
    return localStorage.getItem(`figureStudio.${side}PanelCollapsed`) === 'true';
  } catch (error) {
    return false;
  }
}

function storePanelState(side, collapsed) {
  try {
    localStorage.setItem(`figureStudio.${side}PanelCollapsed`, String(collapsed));
  } catch (error) {}
}

function setSidePanel(side, collapsed, persist = false) {
  const isLeft = side === 'left';
  const panel = isLeft ? els.leftPanel : els.rightPanel;
  const button = isLeft ? els.leftPanelToggle : els.rightPanelToggle;
  const stateKey = isLeft ? 'leftPanelCollapsed' : 'rightPanelCollapsed';
  const className = isLeft ? 'left-collapsed' : 'right-collapsed';
  state[stateKey] = collapsed;
  els.mainLayout.classList.toggle(className, collapsed);
  panel.classList.toggle('is-collapsed', collapsed);
  button.classList.toggle('active', collapsed);
  button.textContent = isLeft ? (collapsed ? '›' : '‹') : (collapsed ? '‹' : '›');
  button.title = collapsed ? `Show ${side} panels` : `Collapse ${side} panels`;
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-expanded', String(!collapsed));
  if (persist) storePanelState(side, collapsed);
  requestAnimationFrame(renderSelection);
}

function clampPanelWidth(side, width) {
  const min = side === 'left' ? 180 : 200;
  const max = side === 'left' ? 360 : 460;
  return Math.round(Math.min(max, Math.max(min, width)));
}

function storedPanelWidth(side, fallback) {
  try {
    const value = Number(localStorage.getItem(`figureStudio.${side}PanelWidth`));
    return Number.isFinite(value) ? clampPanelWidth(side, value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function storePanelWidth(side, width) {
  try {
    localStorage.setItem(`figureStudio.${side}PanelWidth`, String(width));
  } catch (error) {}
}

function setPanelWidth(side, width, persist = false) {
  const next = clampPanelWidth(side, width);
  const prop = side === 'left' ? '--left-panel-width' : '--right-panel-width';
  document.documentElement.style.setProperty(prop, `${next}px`);
  if (persist) storePanelWidth(side, next);
  requestAnimationFrame(renderSelection);
}

function restorePanelWidths() {
  setPanelWidth('left', storedPanelWidth('left', 310));
  setPanelWidth('right', storedPanelWidth('right', 320));
}

function startPanelResize(side, event) {
  event.preventDefault();
  event.stopPropagation();
  const panel = side === 'left' ? els.leftPanel : els.rightPanel;
  state.panelResize = {
    side,
    startX: event.clientX,
    startWidth: panel.getBoundingClientRect().width
  };
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
  document.body.classList.add('resizing-panel');
}

function fitView() {
  els.svg.scrollIntoView({ block: 'center', inline: 'center' });
}

function setTextMode(enabled) {
  state.textMode = enabled;
  state.activeTool = enabled ? 'text' : 'select';
  els.svg.classList.toggle('text-mode', state.textMode);
  renderSelection();
}

function setActiveTool(tool) {
  state.activeTool = tool;
  state.textMode = tool === 'text';
  renderSelection();
}

function changeZoom(delta) {
  setZoom(state.zoom + delta);
}

function setZoom(value) {
  state.zoom = Math.min(3, Math.max(0.2, value));
  els.svg.style.transform = `scale(${state.zoom})`;
  updateToolbar();
}

function focusTextEditor() {
  const input = els.styleControls.querySelector('[data-text-content-input="true"]');
  if (input) {
    input.focus();
    input.select();
  }
}

els.svg.addEventListener('pointerdown', event => {
  const target = event.target;
  const resizeTarget = target.closest?.('[data-resize-type]');
  if (resizeTarget && startResizeDrag(resizeTarget, event)) return;
  const point = canvasPoint(event);
  if (SHAPE_TOOLS.includes(state.activeTool)) {
    addShapeForTool(state.activeTool, point);
    return;
  }
  if (state.activeTool === 'pan') {
    state.pan = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: els.canvasArea.scrollLeft,
      scrollTop: els.canvasArea.scrollTop
    };
    els.svg.setPointerCapture(event.pointerId);
    return;
  }
  if (target === els.svg || target === els.background) {
    startMarquee(point, event.ctrlKey || event.metaKey, { x: event.clientX, y: event.clientY });
    els.svg.setPointerCapture(event.pointerId);
    return;
  }
  if (target === els.marquee) return;
  if (state.textMode) {
    const text = editableTextTargetFromPointer(target);
    if (!text) return;
    if (event.ctrlKey || event.metaKey) toggleElementSelection(text);
    else selectElements([text]);
    focusTextEditor();
    return;
  }
  let editable = editableTargetFromPointer(target);
  if (state.activeTool === 'select' && editable) editable = topLevelElement(editable);
  if (!editable || !editable.closest('#contentLayer')) return;
  if (!selectableElement(editable)) return;
  if (event.ctrlKey || event.metaKey) {
    toggleElementSelection(editable);
    return;
  }
  if (!state.selected.includes(editable)) selectElements([editable]);
  state.drag = { last: point, moved: false };
  els.svg.setPointerCapture(event.pointerId);
});

els.svg.addEventListener('pointermove', event => {
  if (applyResizeDrag(event)) return;
  if (state.pan) {
    els.canvasArea.scrollLeft = state.pan.scrollLeft - (event.clientX - state.pan.x);
    els.canvasArea.scrollTop = state.pan.scrollTop - (event.clientY - state.pan.y);
    return;
  }
  if (state.marquee) {
    const point = canvasPoint(event);
    state.marquee.current = point;
    state.marquee.screenCurrent = { x: event.clientX, y: event.clientY };
    state.marquee.moved = true;
    updateMarquee(state.marquee.start, point);
    return;
  }
  if (!state.drag || !state.selected.length) return;
  const point = canvasPoint(event);
  const dx = point.x - state.drag.last.x;
  const dy = point.y - state.drag.last.y;
  if (Math.abs(dx) + Math.abs(dy) > 0) {
    state.selected.forEach(el => appendTranslate(el, dx, dy));
    state.drag.last = point;
    state.drag.moved = true;
    renderSelectionResizeOverlay();
  }
});

els.svg.addEventListener('pointerup', event => {
  if (finishResizeDrag()) {
    try { els.svg.releasePointerCapture(event.pointerId); } catch (error) {}
    return;
  }
  if (state.pan) {
    state.pan = null;
    try { els.svg.releasePointerCapture(event.pointerId); } catch (error) {}
    return;
  }
  if (state.marquee) {
    finishMarquee();
    try { els.svg.releasePointerCapture(event.pointerId); } catch (error) {}
    return;
  }
  if (state.drag?.moved) {
    commitHistory();
    updateGroups();
    renderSelection();
  }
  state.drag = null;
  try { els.svg.releasePointerCapture(event.pointerId); } catch (error) {}
});

els.svg.addEventListener('pointercancel', () => {
  state.resizeDrag = null;
  state.drag = null;
  state.pan = null;
  if (state.marquee) {
    els.marquee.classList.remove('visible');
    state.marquee = null;
  }
  renderSelection();
});

els.leftPanelToggle.addEventListener('click', () => {
  setSidePanel('left', !state.leftPanelCollapsed, true);
});
els.rightPanelToggle.addEventListener('click', () => {
  setSidePanel('right', !state.rightPanelCollapsed, true);
});
els.leftResizeHandle.addEventListener('pointerdown', event => startPanelResize('left', event));
els.rightResizeHandle.addEventListener('pointerdown', event => startPanelResize('right', event));
els.fileInput.addEventListener('change', event => addFiles(event.target.files));
els.clearBtn.addEventListener('click', () => {
  els.content.innerHTML = '';
  state.files.forEach(file => URL.revokeObjectURL(file.url));
  state.files = [];
  clearSelection();
  commitHistory();
  renderFileList();
  updateGroups();
  renderSelection();
});
els.toolButtons.forEach(button => {
  button.addEventListener('click', () => setActiveTool(button.dataset.tool));
});
els.selectNoneBtn.addEventListener('click', () => {
  clearSelection();
  renderSelection();
  updateGroups();
});
els.undoBtn.addEventListener('click', undo);
els.redoBtn.addEventListener('click', redo);
els.duplicateBtn.addEventListener('click', duplicateSelection);
els.deleteBtn.addEventListener('click', deleteSelection);
els.fitBtn.addEventListener('click', fitView);
els.zoomOutBtn.addEventListener('click', () => changeZoom(-0.1));
els.zoomInBtn.addEventListener('click', () => changeZoom(0.1));
els.exportBtn.addEventListener('click', exportFigure);
els.frontBtn.addEventListener('click', () => moveLayers('front'));
els.upBtn.addEventListener('click', () => moveLayers('up'));
els.downBtn.addEventListener('click', () => moveLayers('down'));
els.backBtn.addEventListener('click', () => moveLayers('back'));
els.groupBtn.addEventListener('click', groupSelection);
els.ungroupBtn.addEventListener('click', ungroupSelection);
els.selectSameFillBtn.addEventListener('click', () => selectSame('fill'));
els.selectSameStrokeBtn.addEventListener('click', () => selectSame('stroke'));
els.selectSameFontBtn.addEventListener('click', () => selectSame('font'));
els.selectSameShapeBtn.addEventListener('click', () => selectSame('shape'));
els.selectSameSizeBtn.addEventListener('click', () => selectSame('size'));
els.selectSameOpacityBtn.addEventListener('click', () => selectSame('opacity'));
els.selectAllTextBtn.addEventListener('click', () => selectKind('Text'));
els.selectAllPointsBtn.addEventListener('click', () => selectKind('Points'));
els.selectAllLinesBtn.addEventListener('click', () => selectKind('Lines'));
els.selectAllBarsBtn.addEventListener('click', selectBars);
els.selectAllShapesBtn.addEventListener('click', selectShapes);
els.selectAllImagesBtn.addEventListener('click', selectImages);
els.alignLeftBtn.addEventListener('click', () => alignSelection('left'));
els.alignCenterBtn.addEventListener('click', () => alignSelection('center'));
els.alignRightBtn.addEventListener('click', () => alignSelection('right'));
els.alignTopBtn.addEventListener('click', () => alignSelection('top'));
els.alignMiddleBtn.addEventListener('click', () => alignSelection('middle'));
els.alignBottomBtn.addEventListener('click', () => alignSelection('bottom'));
els.distributeHBtn.addEventListener('click', () => distributeSelection('h'));
els.distributeVBtn.addEventListener('click', () => distributeSelection('v'));
els.canvasWidth.addEventListener('input', () => updateCanvas(false));
els.canvasHeight.addEventListener('input', () => updateCanvas(false));
els.canvasWidth.addEventListener('change', () => updateCanvas(true));
els.canvasHeight.addEventListener('change', () => updateCanvas(true));
els.canvasWidthNumber.addEventListener('change', () => {
  syncRangeNumber(els.canvasWidth, els.canvasWidthNumber, els.canvasWidthNumber.value);
  updateCanvas(true);
});
els.canvasHeightNumber.addEventListener('change', () => {
  syncRangeNumber(els.canvasHeight, els.canvasHeightNumber, els.canvasHeightNumber.value);
  updateCanvas(true);
});
els.backgroundColor.addEventListener('input', updateCanvas);
els.transparentBg.addEventListener('change', updateCanvas);
els.artboardPreset.addEventListener('change', applyArtboardPreset);
els.cropContentBtn.addEventListener('click', () => cropCanvasToContent(false));
els.resizeSelectionBtn.addEventListener('click', () => cropCanvasToContent(true));
els.exportDpi.addEventListener('input', () => {
  state.exportDpi = Number(els.exportDpi.value) || 300;
  if (els.exportDpiValue) els.exportDpiValue.textContent = state.exportDpi;
  els.exportDpiNumber.value = state.exportDpi;
});
els.exportDpiNumber.addEventListener('change', () => {
  syncRangeNumber(els.exportDpi, els.exportDpiNumber, els.exportDpiNumber.value);
  state.exportDpi = Number(els.exportDpi.value) || 300;
  if (els.exportDpiValue) els.exportDpiValue.textContent = state.exportDpi;
});

document.addEventListener('keydown', event => {
  const tag = document.activeElement.tagName;
  const editingField = ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    redo();
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    duplicateSelection();
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    exportFigure();
  } else if (!editingField && event.key === 'Escape') {
    event.preventDefault();
    setActiveTool('select');
    clearSelection();
    renderSelection();
    updateGroups();
  } else if (!editingField && (event.key === 'Delete' || event.key === 'Backspace')) {
    event.preventDefault();
    deleteSelection();
  } else if (!editingField && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowUp') moveBy(0, -step);
    if (event.key === 'ArrowDown') moveBy(0, step);
    if (event.key === 'ArrowLeft') moveBy(-step, 0);
    if (event.key === 'ArrowRight') moveBy(step, 0);
  }
});

document.addEventListener('dragover', event => {
  event.preventDefault();
  els.dropOverlay.classList.add('visible');
});
document.addEventListener('dragleave', event => {
  if (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
    els.dropOverlay.classList.remove('visible');
  }
});
document.addEventListener('drop', event => {
  event.preventDefault();
  els.dropOverlay.classList.remove('visible');
  addFiles(event.dataTransfer.files);
});

document.addEventListener('pointermove', event => {
  if (!state.panelResize) return;
  const resize = state.panelResize;
  const delta = event.clientX - resize.startX;
  const nextWidth = resize.side === 'left'
    ? resize.startWidth + delta
    : resize.startWidth - delta;
  setPanelWidth(resize.side, nextWidth);
});

document.addEventListener('pointerup', () => {
  if (!state.panelResize) return;
  const side = state.panelResize.side;
  const panel = side === 'left' ? els.leftPanel : els.rightPanel;
  setPanelWidth(side, panel.getBoundingClientRect().width, true);
  state.panelResize = null;
  document.body.classList.remove('resizing-panel');
});

document.addEventListener('pointercancel', () => {
  state.panelResize = null;
  document.body.classList.remove('resizing-panel');
});

restorePanelWidths();
setSidePanel('left', storedPanelState('left'));
setSidePanel('right', storedPanelState('right'));
updateCanvas();
commitHistory();
renderFileList();
updateGroups();
renderSelection();
