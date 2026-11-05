// DfE tech radar: interactive radar, grid view, filters and detail drawer.
//
// Reads the JSON in #tech-radar-data (generated from data/tech_radar.yml) and
// builds the radar inside #tech-radar. The per-area pages work without
// JavaScript, so this is an enhancement. Plain ES5 on purpose so the asset
// pipeline can minify it.
(function () {
  'use strict';

  var dataElement = document.getElementById('tech-radar-data');
  var mount = document.getElementById('tech-radar');

  if (!dataElement || !mount) {
    return;
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SIZE = 800;
  var CENTRE = 400;
  var RADIUS = 372;
  var RING_STOPS = [0.42, 0.68, 0.86, 1];
  var RING_FILLS = ['#e0efe3', '#e5edf6', '#f3efdf', '#f5e3df'];
  var DOT_SIZE = 6;
  var MIN_ZOOM_WIDTH = 200;

  var data = JSON.parse(dataElement.textContent);

  // ---------------------------------------------------------------- helpers

  function decorate(node, attrs, parent, text) {
    var key;
    if (attrs) {
      for (key in attrs) {
        if (attrs.hasOwnProperty(key) && attrs[key] !== null && attrs[key] !== undefined) {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    if (parent) {
      parent.appendChild(node);
    }
    return node;
  }

  function make(tag, attrs, parent, text) {
    return decorate(document.createElement(tag), attrs, parent, text);
  }

  function makeSvg(tag, attrs, parent, text) {
    return decorate(document.createElementNS(SVG_NS, tag), attrs, parent, text);
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function byName(a, b) {
    var left = a.name.toLowerCase();
    var right = b.name.toLowerCase();
    if (left < right) { return -1; }
    if (left > right) { return 1; }
    return 0;
  }

  // Draws a quadrant's shape (circle, square, triangle, diamond) so colour is
  // never the only way to tell the quadrants apart.
  function makeShape(quadrant, parent) {
    var fill = quadrant.colour;
    if (quadrant.shape === 'square') {
      return makeSvg('rect', { x: -5.5, y: -5.5, width: 11, height: 11, fill: fill }, parent);
    }
    if (quadrant.shape === 'triangle') {
      return makeSvg('polygon', { points: '0,-7.5 7,5.5 -7,5.5', fill: fill }, parent);
    }
    if (quadrant.shape === 'diamond') {
      return makeSvg('polygon', { points: '0,-8.5 8.5,0 0,8.5 -8.5,0', fill: fill }, parent);
    }
    return makeSvg('circle', { r: DOT_SIZE, fill: fill }, parent);
  }

  function shapeIcon(quadrant) {
    var icon = makeSvg('svg', {
      'class': 'radar-icon',
      width: 16,
      height: 16,
      viewBox: '-9 -9 18 18',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    makeShape(quadrant, icon);
    return icon;
  }

  // ------------------------------------------------------------------ model

  var ringById = {};
  var quadrantById = {};
  var quadrantIndex = {};
  var areaById = {};

  data.rings.forEach(function (ring) { ringById[ring.id] = ring; });
  data.quadrants.forEach(function (quadrant, index) {
    quadrantById[quadrant.id] = quadrant;
    quadrantIndex[quadrant.id] = index;
  });
  data.areas.forEach(function (area) { areaById[area.id] = area; });

  var items = data.entries
    .filter(function (entry) { return areaById[entry.area] && ringById[entry.ring]; })
    .map(function (entry, index) {
      var area = areaById[entry.area];
      return {
        id: index,
        name: entry.name,
        ring: entry.ring,
        area: entry.area,
        areaName: area.name,
        quadrant: area.quadrant,
        core: !!entry.core,
        note: entry.note || '',
        link: entry.link || '',
        x: 0,
        y: 0,
        visible: true,
        dot: null
      };
    });

  // ----------------------------------------------------------------- layout
  // Positions are worked out once, from the name of each technology, so the
  // radar looks the same on every visit and dots do not move when filtering.

  function hashString(text) {
    var hash = 2166136261;
    var i;
    for (i = 0; i < text.length; i++) {
      hash = (hash ^ text.charCodeAt(i)) >>> 0;
      hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
    }
    return hash;
  }

  function makeRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  function isClear(candidate, placed, gap) {
    var i, dx, dy;
    for (i = 0; i < placed.length; i++) {
      dx = candidate.x - placed[i].x;
      dy = candidate.y - placed[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < gap) {
        return false;
      }
    }
    return true;
  }

  // Quadrant 0 is top right, then clockwise. Angles are measured
  // anti-clockwise from the right-hand horizontal, so quadrant q covers
  // -90 * q to -90 * q + 90 degrees (0 to 90 is top right, -90 to 0 is bottom
  // right and so on). The margin keeps dots off the quadrant dividing lines.
  function placeSegment(list, quadrant, ring) {
    var inner = ring === 0 ? 0 : RING_STOPS[ring - 1] * RADIUS;
    var outer = RING_STOPS[ring] * RADIUS;
    var low = ring === 0 ? 46 : inner + DOT_SIZE + 4;
    var high = outer - DOT_SIZE - 4;
    var startAngle = -90 * quadrant;
    var placed = [];

    list.sort(byName);

    list.forEach(function (item) {
      var random = makeRandom(hashString(item.name));
      var gap = DOT_SIZE * 2 + 5;
      var attempts = 0;
      var spot = null;
      var distance, margin, angle, radians, candidate;

      while (!spot) {
        distance = Math.sqrt(low * low + random() * (high * high - low * low));
        margin = Math.asin(clamp(22 / distance, 0, 0.7)) * 180 / Math.PI;
        angle = startAngle + margin + random() * (90 - 2 * margin);
        radians = angle * Math.PI / 180;
        candidate = {
          x: CENTRE + distance * Math.cos(radians),
          y: CENTRE - distance * Math.sin(radians)
        };
        attempts++;
        if (attempts % 40 === 0) {
          gap = gap * 0.9;
        }
        if (gap < 4 || isClear(candidate, placed, gap)) {
          spot = candidate;
        }
      }

      item.x = spot.x;
      item.y = spot.y;
      placed.push(spot);
    });
  }

  data.quadrants.forEach(function (quadrant, q) {
    data.rings.forEach(function (ring, r) {
      var list = items.filter(function (item) {
        return quadrantIndex[item.quadrant] === q && item.ring === ring.id;
      });
      placeSegment(list, q, r);
    });
  });

  // ------------------------------------------------------------------ state

  var state = {
    view: 'radar',
    quadrant: '',
    area: '',
    ring: '',
    core: false,
    search: '',
    selected: null
  };

  var els = {};
  var viewBox = { x: 0, y: 0, w: SIZE, h: SIZE };

  function matches(item) {
    if (state.quadrant && item.quadrant !== state.quadrant) { return false; }
    if (state.area && item.area !== state.area) { return false; }
    if (state.ring && item.ring !== state.ring) { return false; }
    if (state.core && !item.core) { return false; }
    if (state.search) {
      var text = (item.name + ' ' + item.note + ' ' + item.areaName).toLowerCase();
      if (text.indexOf(state.search) === -1) { return false; }
    }
    return true;
  }

  // ------------------------------------------------------------- radar view

  function applyViewBox() {
    els.svg.setAttribute('viewBox', viewBox.x + ' ' + viewBox.y + ' ' + viewBox.w + ' ' + viewBox.h);
  }

  function zoomBy(factor, focusX, focusY) {
    var width = clamp(viewBox.w * factor, MIN_ZOOM_WIDTH, SIZE);
    var ratio = width / viewBox.w;
    var fx = focusX === undefined ? viewBox.x + viewBox.w / 2 : focusX;
    var fy = focusY === undefined ? viewBox.y + viewBox.h / 2 : focusY;

    viewBox.x = clamp(fx - (fx - viewBox.x) * ratio, 0, SIZE - width);
    viewBox.y = clamp(fy - (fy - viewBox.y) * ratio, 0, SIZE - width);
    viewBox.w = width;
    viewBox.h = width;
    applyViewBox();
  }

  function resetZoom() {
    viewBox = { x: 0, y: 0, w: SIZE, h: SIZE };
    applyViewBox();
  }

  function pointerToSvg(event) {
    var rect = els.svg.getBoundingClientRect();
    return {
      x: viewBox.x + (event.clientX - rect.left) / rect.width * viewBox.w,
      y: viewBox.y + (event.clientY - rect.top) / rect.height * viewBox.h
    };
  }

  function enablePanAndWheel() {
    var drag = null;

    els.svg.addEventListener('wheel', function (event) {
      if (!event.shiftKey) { return; }
      event.preventDefault();
      var point = pointerToSvg(event);
      zoomBy(event.deltaY < 0 ? 0.8 : 1.25, point.x, point.y);
    }, { passive: false });

    els.svg.addEventListener('pointerdown', function (event) {
      if (event.target.closest && event.target.closest('.radar-dot')) { return; }
      if (viewBox.w >= SIZE) { return; }
      drag = { x: event.clientX, y: event.clientY, vx: viewBox.x, vy: viewBox.y };
      els.svg.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', function (event) {
      if (!drag) { return; }
      var rect = els.svg.getBoundingClientRect();
      var scale = viewBox.w / rect.width;
      viewBox.x = clamp(drag.vx - (event.clientX - drag.x) * scale, 0, SIZE - viewBox.w);
      viewBox.y = clamp(drag.vy - (event.clientY - drag.y) * scale, 0, SIZE - viewBox.h);
      applyViewBox();
    });

    window.addEventListener('pointerup', function () {
      drag = null;
      els.svg.classList.remove('is-dragging');
    });
  }

  function wedgePath(quadrant, outerRadius) {
    var start = (-90 * quadrant) * Math.PI / 180;
    var end = (-90 * quadrant + 90) * Math.PI / 180;
    var x1 = CENTRE + outerRadius * Math.cos(start);
    var y1 = CENTRE - outerRadius * Math.sin(start);
    var x2 = CENTRE + outerRadius * Math.cos(end);
    var y2 = CENTRE - outerRadius * Math.sin(end);
    // Sweep flag 0 = anti-clockwise on screen, matching increasing angle.
    return 'M' + CENTRE + ' ' + CENTRE + ' L' + x1 + ' ' + y1 +
      ' A' + outerRadius + ' ' + outerRadius + ' 0 0 0 ' + x2 + ' ' + y2 + ' Z';
  }

  function buildBackground(svg) {
    var back = makeSvg('g', { 'aria-hidden': 'true' }, svg);

    // Ring bands for each quadrant, drawn outermost first so inner ones sit on top.
    data.quadrants.forEach(function (quadrant, q) {
      var r;
      for (r = data.rings.length - 1; r >= 0; r--) {
        makeSvg('path', {
          d: wedgePath(q, RING_STOPS[r] * RADIUS),
          fill: RING_FILLS[r],
          stroke: '#ffffff',
          'stroke-width': 2
        }, back);
      }
    });

    makeSvg('line', { x1: CENTRE - RADIUS, y1: CENTRE, x2: CENTRE + RADIUS, y2: CENTRE, stroke: '#505a5f', 'stroke-width': 1.5 }, back);
    makeSvg('line', { x1: CENTRE, y1: CENTRE - RADIUS, x2: CENTRE, y2: CENTRE + RADIUS, stroke: '#505a5f', 'stroke-width': 1.5 }, back);

    data.rings.forEach(function (ring, r) {
      var outer = RING_STOPS[r] * RADIUS;
      var inner = r === 0 ? 0 : RING_STOPS[r - 1] * RADIUS;
      makeSvg('circle', { cx: CENTRE, cy: CENTRE, r: outer, fill: 'none', stroke: '#b1b4b6', 'stroke-width': 1 }, back);
      makeSvg('text', {
        x: CENTRE,
        y: CENTRE - (inner + outer) / 2 + 4,
        'text-anchor': 'middle',
        'class': 'radar-ring-label'
      }, back, ring.name.toUpperCase());
    });

    data.quadrants.forEach(function (quadrant, q) {
      var right = q === 0 || q === 1;
      var top = q === 0 || q === 3;
      makeSvg('text', {
        x: right ? SIZE - 8 : 8,
        y: top ? 22 : SIZE - 12,
        'text-anchor': right ? 'end' : 'start',
        'class': 'radar-quadrant-label',
        fill: quadrant.colour
      }, back, quadrant.name);
    });
  }

  function buildDots(svg) {
    var layer = makeSvg('g', null, svg);

    items.forEach(function (item) {
      var quadrant = quadrantById[item.quadrant];
      var ring = ringById[item.ring];
      var dot = makeSvg('g', {
        'class': 'radar-dot',
        transform: 'translate(' + item.x.toFixed(1) + ',' + item.y.toFixed(1) + ')',
        tabindex: 0,
        role: 'button',
        'aria-label': item.name + ', ' + ring.name + ', ' + quadrant.name
      }, layer);

      makeSvg('circle', { r: 11, fill: 'transparent' }, dot);
      makeShape(quadrant, dot);

      dot.addEventListener('click', function () { select(item); });
      dot.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select(item);
        }
      });
      dot.addEventListener('mouseenter', function () { showLabel(item); });
      dot.addEventListener('focus', function () { showLabel(item); });
      dot.addEventListener('mouseleave', hideLabel);
      dot.addEventListener('blur', hideLabel);

      item.dot = dot;
    });
  }

  function buildHoverLabel(svg) {
    els.label = makeSvg('g', { 'class': 'radar-hover-label', 'pointer-events': 'none', visibility: 'hidden' }, svg);
    els.labelBg = makeSvg('rect', { rx: 3, height: 20, fill: '#0b0c0c' }, els.label);
    els.labelText = makeSvg('text', { 'class': 'radar-hover-text', y: 14, 'text-anchor': 'middle' }, els.label);
  }

  function showLabel(item) {
    var width = Math.max(30, item.name.length * 7 + 14);
    var x = clamp(item.x - width / 2, 4, SIZE - width - 4);
    var y = item.y - 30 < 4 ? item.y + 14 : item.y - 30;

    els.labelText.textContent = item.name;
    els.labelBg.setAttribute('width', width);
    els.labelText.setAttribute('x', width / 2);
    els.label.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    els.label.setAttribute('visibility', 'visible');
  }

  function hideLabel() {
    els.label.setAttribute('visibility', 'hidden');
  }

  // ---------------------------------------------------------- detail panel

  var lastTrigger = null;

  function badge(text, className) {
    return make('span', { 'class': 'radar-badge ' + className }, null, text);
  }

  function select(item, trigger) {
    state.selected = item;
    lastTrigger = trigger || item.dot;
    renderDetail();
    items.forEach(function (other) {
      if (other.dot) {
        other.dot.setAttribute('class', 'radar-dot' + (other === item ? ' is-selected' : '') + (other.visible ? '' : ' is-hidden'));
      }
    });
    els.detailTitle.focus();
  }

  function closeDetail() {
    var trigger = lastTrigger;
    state.selected = null;
    renderDetail();
    items.forEach(function (item) {
      if (item.dot) {
        item.dot.setAttribute('class', 'radar-dot' + (item.visible ? '' : ' is-hidden'));
      }
    });
    if (trigger && trigger.focus && document.body.contains(trigger)) {
      trigger.focus();
    }
  }

  function renderDetail() {
    var item = state.selected;
    var body = els.detailBody;
    var quadrant, ring, list, term;

    clear(body);

    if (!item) {
      els.detail.classList.remove('is-open');
      els.detailTitle.textContent = 'Technology details';
      make('p', { 'class': 'govuk-body radar-detail-empty' }, body,
        'Select a technology on the radar or in the grid to see what it is and how we recommend using it.');
      return;
    }

    quadrant = quadrantById[item.quadrant];
    ring = ringById[item.ring];
    els.detail.classList.add('is-open');
    els.detailTitle.textContent = item.name;

    list = make('div', { 'class': 'radar-badges' }, body);
    list.appendChild(badge(ring.name, 'radar-badge--' + ring.id));
    term = badge(quadrant.name, 'radar-badge--quadrant');
    term.insertBefore(shapeIcon(quadrant), term.firstChild);
    list.appendChild(term);
    if (item.core) {
      list.appendChild(badge('Core DfE stack', 'radar-badge--core'));
    }

    make('p', { 'class': 'govuk-body radar-detail-ring' }, body, ring.description);

    if (item.note) {
      make('h3', { 'class': 'govuk-heading-s' }, body, 'Guidance');
      make('p', { 'class': 'govuk-body' }, body, item.note);
    }

    make('h3', { 'class': 'govuk-heading-s' }, body, 'Area');
    list = make('p', { 'class': 'govuk-body' }, body);
    make('a', { 'class': 'govuk-link', href: (data.meta.base_path || '/tech-radar/') + item.area + '/' }, list, item.areaName);

    if (item.link) {
      list = make('p', { 'class': 'govuk-body' }, body);
      make('a', { 'class': 'govuk-link', href: item.link }, list, 'Read the DfE guidance');
    }

    list = make('p', { 'class': 'govuk-body govuk-!-font-size-16' }, body);
    make('a', {
      'class': 'govuk-link',
      href: data.meta.issues_url + '?title=' + encodeURIComponent('Tech radar: ' + item.name)
    }, list, 'Suggest a change to this entry');
  }

  // --------------------------------------------------------------- grid view

  function renderGrid() {
    var grid = els.grid;
    clear(grid);

    data.rings.forEach(function (ring) {
      var inRing = items.filter(function (item) { return item.visible && item.ring === ring.id; }).sort(byName);
      var section, cards;

      if (!inRing.length) { return; }

      section = make('section', { 'class': 'radar-grid-section', 'aria-labelledby': 'radar-grid-' + ring.id }, grid);
      make('h3', { 'class': 'govuk-heading-m', id: 'radar-grid-' + ring.id }, section, ring.name + ' (' + inRing.length + ')');
      make('p', { 'class': 'govuk-body radar-grid-intro' }, section, ring.description);
      cards = make('ul', { 'class': 'radar-cards' }, section);

      inRing.forEach(function (item) {
        var quadrant = quadrantById[item.quadrant];
        var li = make('li', null, cards);
        var button = make('button', {
          type: 'button',
          'class': 'radar-card',
          style: 'border-left-color:' + quadrant.colour
        }, li);
        var title = make('span', { 'class': 'radar-card-title' }, button);

        title.appendChild(shapeIcon(quadrant));
        title.appendChild(document.createTextNode(' ' + item.name));
        make('span', { 'class': 'radar-card-area' }, button, item.areaName);
        button.addEventListener('click', function () { select(item, button); });
      });
    });

    if (!grid.firstChild) {
      make('p', { 'class': 'govuk-body' }, grid, 'No technologies match these filters.');
    }
  }

  // ------------------------------------------------------ filters and toolbar

  function applyFilters() {
    var shown = 0;

    items.forEach(function (item) {
      item.visible = matches(item);
      if (item.visible) { shown++; }
      if (item.dot) {
        item.dot.setAttribute('class', 'radar-dot' +
          (state.selected === item ? ' is-selected' : '') +
          (item.visible ? '' : ' is-hidden'));
        item.dot.setAttribute('tabindex', item.visible ? '0' : '-1');
        item.dot.setAttribute('aria-hidden', item.visible ? 'false' : 'true');
      }
    });

    els.count.textContent = 'Showing ' + shown + ' of ' + items.length + ' technologies';
    renderGrid();
  }

  function setView(view) {
    state.view = view;
    els.radarWrap.hidden = view !== 'radar';
    els.grid.hidden = view !== 'grid';
    els.radarButton.setAttribute('aria-pressed', view === 'radar' ? 'true' : 'false');
    els.gridButton.setAttribute('aria-pressed', view === 'grid' ? 'true' : 'false');
  }

  function field(parent, labelText, id) {
    var wrap = make('div', { 'class': 'radar-field' }, parent);
    make('label', { 'class': 'radar-label', 'for': id }, wrap, labelText);
    return wrap;
  }

  function makeSelect(parent, labelText, id, options, onChange) {
    var wrap = field(parent, labelText, id);
    var dropdown = make('select', { 'class': 'radar-select', id: id }, wrap);

    make('option', { value: '' }, dropdown, 'All');
    options.forEach(function (option) {
      make('option', { value: option.id }, dropdown, option.name);
    });
    dropdown.addEventListener('change', function () { onChange(dropdown.value); });
    return dropdown;
  }

  function buildToolbar(parent) {
    var bar = make('div', { 'class': 'radar-toolbar', role: 'search', 'aria-label': 'Filter the tech radar' }, parent);
    var views = make('div', { 'class': 'radar-views', role: 'group', 'aria-label': 'View' }, bar);
    var searchWrap = field(bar, 'Search', 'radar-search');
    var coreWrap;

    els.radarButton = make('button', { type: 'button', 'class': 'radar-toggle', 'aria-pressed': 'true' }, views, 'Radar view');
    els.gridButton = make('button', { type: 'button', 'class': 'radar-toggle', 'aria-pressed': 'false' }, views, 'Grid view');
    els.radarButton.addEventListener('click', function () { setView('radar'); });
    els.gridButton.addEventListener('click', function () { setView('grid'); });

    els.search = make('input', { 'class': 'govuk-input', id: 'radar-search', type: 'search', autocomplete: 'off' }, searchWrap);
    els.search.addEventListener('input', function () {
      state.search = els.search.value.trim().toLowerCase();
      applyFilters();
    });

    els.area = makeSelect(bar, 'Area', 'radar-area', data.areas, function (value) { state.area = value; applyFilters(); });
    els.quadrant = makeSelect(bar, 'Quadrant', 'radar-quadrant', data.quadrants, function (value) { state.quadrant = value; applyFilters(); });
    els.ring = makeSelect(bar, 'Ring', 'radar-ring', data.rings, function (value) { state.ring = value; applyFilters(); });

    coreWrap = make('div', { 'class': 'radar-field radar-field--check' }, bar);
    els.core = make('input', { type: 'checkbox', id: 'radar-core', 'class': 'radar-check' }, coreWrap);
    make('label', { 'class': 'radar-label radar-label--inline', 'for': 'radar-core' }, coreWrap, 'Core DfE stack only');
    els.core.addEventListener('change', function () { state.core = els.core.checked; applyFilters(); });

    els.reset = make('button', { type: 'button', 'class': 'radar-button radar-reset' }, bar, 'Reset filters');
    els.reset.addEventListener('click', function () {
      state.quadrant = state.area = state.ring = state.search = '';
      state.core = false;
      els.search.value = '';
      els.area.value = els.quadrant.value = els.ring.value = '';
      els.core.checked = false;
      applyFilters();
      resetZoom();
    });

    els.count = make('p', { 'class': 'govuk-body radar-count', 'aria-live': 'polite' }, parent);
  }

  function zoomButton(parent, label, symbol, handler) {
    var button = make('button', { type: 'button', 'class': 'radar-zoom', 'aria-label': label, title: label }, parent, symbol);
    button.addEventListener('click', handler);
    return button;
  }

  function buildLegend(parent) {
    var legend = make('div', { 'class': 'radar-legend' }, parent);
    var quadrants = make('ul', { 'class': 'radar-legend-list', 'aria-label': 'Quadrants' }, legend);

    data.quadrants.forEach(function (quadrant) {
      var li = make('li', null, quadrants);
      li.appendChild(shapeIcon(quadrant));
      li.appendChild(document.createTextNode(' ' + quadrant.name));
    });

    make('p', { 'class': 'radar-legend-hint' }, legend,
      'Rings from the centre outwards: ' + data.rings.map(function (ring) { return ring.name; }).join(', ') +
      '. Hold Shift and scroll to zoom the radar, then drag to move around.');
  }

  // Lets other pages link straight to a filtered radar, for example
  // /tech-radar/?area=languages&ring=adopt, /tech-radar/?view=grid or
  // /tech-radar/?tech=Python
  function readQueryString() {
    var pairs = window.location.search.replace(/^\?/, '').split('&');
    var wanted = {};

    pairs.forEach(function (pair) {
      var parts = pair.split('=');
      if (parts[0]) {
        try {
          wanted[decodeURIComponent(parts[0])] = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
        } catch (error) {
          // Ignore malformed query strings.
        }
      }
    });

    if (wanted.area && areaById[wanted.area]) {
      state.area = wanted.area;
      els.area.value = wanted.area;
    }
    if (wanted.quadrant && quadrantById[wanted.quadrant]) {
      state.quadrant = wanted.quadrant;
      els.quadrant.value = wanted.quadrant;
    }
    if (wanted.ring && ringById[wanted.ring]) {
      state.ring = wanted.ring;
      els.ring.value = wanted.ring;
    }
    if (wanted.core === 'true') {
      state.core = true;
      els.core.checked = true;
    }

    return wanted;
  }

  // ------------------------------------------------------------------- start

  function init() {
    var layout, main, controls, detailHeader, closeButton, fallback, wanted;

    clear(mount);
    mount.classList.add('is-ready');

    buildToolbar(mount);

    layout = make('div', { 'class': 'radar-layout' }, mount);
    main = make('div', { 'class': 'radar-main' }, layout);

    // Radar view
    els.radarWrap = make('div', { 'class': 'radar-wrap' }, main);
    els.svg = makeSvg('svg', {
      'class': 'radar-svg',
      viewBox: '0 0 ' + SIZE + ' ' + SIZE,
      role: 'group',
      'aria-label': 'Tech radar. Use Grid view or the area pages for a text version.'
    }, els.radarWrap);
    buildBackground(els.svg);
    buildDots(els.svg);
    buildHoverLabel(els.svg);
    enablePanAndWheel();

    controls = make('div', { 'class': 'radar-zoom-controls', role: 'group', 'aria-label': 'Zoom' }, els.radarWrap);
    zoomButton(controls, 'Zoom in', '+', function () { zoomBy(0.75); });
    zoomButton(controls, 'Zoom out', '\u2212', function () { zoomBy(1.33); });
    zoomButton(controls, 'Reset zoom', '\u21BA', resetZoom);

    // Grid view
    els.grid = make('div', { 'class': 'radar-grid', hidden: 'hidden' }, main);

    buildLegend(main);

    // Detail panel
    els.detail = make('aside', { 'class': 'radar-detail', 'aria-label': 'Technology details' }, layout);
    detailHeader = make('div', { 'class': 'radar-detail-header' }, els.detail);
    els.detailTitle = make('h2', { 'class': 'govuk-heading-m radar-detail-title', tabindex: '-1' }, detailHeader);
    closeButton = make('button', { type: 'button', 'class': 'radar-detail-close', 'aria-label': 'Close details' }, detailHeader, '\u00D7');
    closeButton.addEventListener('click', closeDetail);
    els.detailBody = make('div', { 'class': 'radar-detail-body' }, els.detail);

    els.detail.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeDetail(); }
    });

    wanted = readQueryString();
    renderDetail();
    applyFilters();
    setView(wanted.view === 'grid' ? 'grid' : 'radar');

    // /tech-radar/?tech=Python opens the details for that technology.
    if (wanted.tech) {
      items.forEach(function (item) {
        if (item.name.toLowerCase() === wanted.tech.toLowerCase()) {
          select(item);
        }
      });
    }

    // Remove the "needs JavaScript" fallback message if the page has one.
    fallback = document.getElementById('tech-radar-fallback');
    if (fallback && fallback.parentNode) {
      fallback.parentNode.removeChild(fallback);
    }
  }

  init();
})();
