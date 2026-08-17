/* Oakwood Marketing Services
   Scroll root: a root that starts at a knot beside the first card, then grows
   down the gutter as far as the reader has got, throwing off side branches on
   the way.

   Tuning lab (shape, thickness, growth):
   https://claude.ai/code/artifact/8f9d949f-59ce-4ec6-9824-280671de0253

   To use on a page:
     <div class="root-layer"><svg></svg></div>   first element in <body>
     data-root-start   on the element the root should begin level with
     data-root-end     on the element it should finish at
   Everything else is CONFIG below. */

(function () {
  "use strict";

  var CONFIG = {
    gutter:      46,    // px to the left of the content column
    width0:      26,    // thickness at the knot
    width1:      3,     // thickness at the tip
    segment:     150,   // px per straight run. Lower = more kinks
    swing:       48,    // furthest a kink can jump sideways
    branchEvery: 132,   // px of spine between side branches
    knot:        1.05,  // knot radius as a multiple of width0
    lead:        0.72,  // how far below the fold the tip sits, 0 to 1 of a screen
    minViewport: 1200,  // below this there is no gutter to spare
    seed:        71     // change for a different set of kinks
  };

  var layer = document.querySelector(".root-layer");
  if (!layer) return;
  var svg = layer.querySelector("svg");
  var col = document.querySelector(".container");
  var spine = null, branches = [], knot = null, startY = 0, endY = 0;

  function rng(s) {
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function top(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
  function bottom(el) { return el.getBoundingClientRect().bottom + window.pageYOffset; }

  function measure(pts) {
    var acc = [0], t = 0;
    for (var i = 1; i < pts.length; i++) {
      t += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
      acc.push(t);
    }
    return { acc: acc, total: t || 1 };
  }
  function mk(pts, w0, w1) {
    var m = measure(pts);
    return { pts: pts, acc: m.acc, total: m.total, w0: w0, w1: w1 };
  }
  function widthAt(b, s) {
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    return b.w0 + (b.w1 - b.w0) * Math.pow(s, 0.85);
  }
  function sampleAt(b, f) {
    var tg = b.total * f;
    for (var i = 1; i < b.acc.length; i++) {
      if (b.acc[i] >= tg) {
        var sp = b.acc[i] - b.acc[i-1] || 1, u = (tg - b.acc[i-1]) / sp;
        return { x: b.pts[i-1][0] + (b.pts[i][0]-b.pts[i-1][0])*u,
                 y: b.pts[i-1][1] + (b.pts[i][1]-b.pts[i-1][1])*u,
                 w: widthAt(b, f) };
      }
    }
    var L = b.pts[b.pts.length-1];
    return { x: L[0], y: L[1], w: b.w1 };
  }

  /* Filled outline rather than a stroke: a stroke is one width for its whole
     length, so it could not taper toward the tip or keep the growing end
     pointed. Offset the centre line to both sides and close the loop. */
  function outline(b, prog) {
    var vis = b.total * prog;
    if (vis <= 0.5) return "";
    var P = [], S = [];
    for (var i = 0; i < b.pts.length; i++) {
      if (b.acc[i] <= vis) { P.push(b.pts[i]); S.push(b.acc[i]); } else break;
    }
    var j = P.length;
    if (j < b.pts.length && j > 0) {
      var sp = b.acc[j] - b.acc[j-1] || 1, u = (vis - b.acc[j-1]) / sp;
      P.push([b.pts[j-1][0] + (b.pts[j][0]-b.pts[j-1][0])*u,
              b.pts[j-1][1] + (b.pts[j][1]-b.pts[j-1][1])*u]);
      S.push(vis);
    }
    if (P.length < 2) return "";
    var pinch = Math.min(b.total * 0.16, 46), L = [], R = [];
    for (var k = 0; k < P.length; k++) {
      var pv = P[k === 0 ? 0 : k-1], nx = P[k === P.length-1 ? k : k+1];
      var tx = nx[0]-pv[0], ty = nx[1]-pv[1], m = Math.hypot(tx,ty) || 1;
      var w = widthAt(b, S[k]/b.total);
      var lead = (vis - S[k]) / pinch;
      if (lead < 1) w *= Math.max(0.04, lead);
      L.push([P[k][0] + (-ty/m)*w/2, P[k][1] + (tx/m)*w/2]);
      R.push([P[k][0] - (-ty/m)*w/2, P[k][1] - (tx/m)*w/2]);
    }
    var d = "M" + L[0][0].toFixed(1) + "," + L[0][1].toFixed(1);
    for (var a = 1; a < L.length; a++) d += "L" + L[a][0].toFixed(1) + "," + L[a][1].toFixed(1);
    for (var z = R.length-1; z >= 0; z--) d += "L" + R[z][0].toFixed(1) + "," + R[z][1].toFixed(1);
    return d + "Z";
  }

  /* Rough circle: a ring of points with jittered radius, so the knot reads as
     grown rather than drawn with a compass. */
  function roughCircle(cx, cy, r, rand) {
    var n = 11, d = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var rr = r * (0.82 + rand() * 0.32);
      var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.92;
      d += (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
    }
    return d + "Z";
  }

  function build() {
    var pageW = document.documentElement.clientWidth;
    svg.textContent = "";

    var sEl = document.querySelector("[data-root-start]");
    var eEl = document.querySelector("[data-root-end]");
    if (!sEl || !eEl) return;
    startY = top(sEl) + 8;
    endY   = bottom(eEl) - 20;
    if (endY - startY < 200) return;

    // Sized to where the root finishes, never to the page. An absolutely
    // positioned box counts toward the document's scroll height, so measuring
    // the page and then setting the layer to that height grows the page a
    // little more on every rebuild.
    layer.style.height = endY + "px";
    svg.setAttribute("viewBox", "0 0 " + pageW + " " + endY);

    // Sit just outside the content column, so the root keeps its distance from
    // the text at every window width instead of being pinned to the viewport.
    var colLeft = col ? col.getBoundingClientRect().left + window.pageXOffset : 120;
    var baseX = Math.max(30, colLeft - CONFIG.gutter);

    var rand = rng(CONFIG.seed);
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("fill", "var(--green)");
    svg.appendChild(group);

    function path() {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      group.appendChild(p);
      return p;
    }

    // Knot first, so the branches and spine sit on top of it.
    knot = { cx: baseX, cy: startY, r: CONFIG.width0 * CONFIG.knot, node: path(), rand: CONFIG.seed };

    // Long straight runs with a decided kink between them. The shape reads as
    // angular because direction changes at points, not continuously.
    var span = endY - startY;
    var pts = [], n = Math.max(6, Math.round(span / CONFIG.segment)), x = baseX;
    for (var i = 0; i <= n; i++) {
      var y = startY + span * (i / n);
      if (i === 0 || i === n) { pts.push([baseX, y]); continue; }
      x += (rand() - 0.5) * CONFIG.swing;
      x = Math.max(baseX - 24, Math.min(baseX + 24, x));
      pts.push([x, y]);
    }
    spine = mk(pts, CONFIG.width0, CONFIG.width1);
    spine.node = path();

    // Side branches all the way down, not only at section boundaries. A branch
    // cannot start before the spine has grown past the point it sprouts from.
    branches = [];
    var count = Math.max(3, Math.round(span / CONFIG.branchEvery));
    for (var k = 1; k <= count; k++) {
      var f = (k / (count + 1)) + (rand() - 0.5) * 0.045;
      f = Math.max(0.05, Math.min(0.96, f));
      var at = sampleAt(spine, f);
      var big = rand() > 0.42;
      var dir = rand() > 0.38 ? 1 : -1;            // both sides, leaning inward
      var scale = big ? 1 : 0.58;
      // A left branch needs room in the margin; if there is none, send it right.
      if (dir === -1 && at.x - 62 * scale < 10) dir = 1;
      var p1 = [at.x + dir * (20 + rand() * 9) * scale, at.y - (15 + rand() * 7) * scale];
      var p2 = [p1[0] + dir * (22 + rand() * 9) * scale, p1[1] - (5 + rand() * 7) * scale];
      var p3 = [p2[0] + dir * (16 + rand() * 9) * scale, p2[1] + (2 + rand() * 5) * scale];
      var b = mk([[at.x, at.y], p1, p2, p3], Math.max(2.2, at.w * (big ? 0.52 : 0.36)), 1.1);
      b.at = f;
      b.span = Math.min(0.05, (b.total / span) * 3.2);
      b.node = path();
      branches.push(b);
    }

    draw();
  }

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw() {
    if (!spine) return;
    // The tip sits a little below the reading position, so the root always
    // feels like it is arriving just ahead of you.
    var tip = window.pageYOffset + window.innerHeight * CONFIG.lead;
    var p = still ? 1 : Math.max(0, Math.min(1, (tip - startY) / (endY - startY)));

    // The knot swells into place before the spine leaves it.
    var kp = Math.min(1, p / 0.045);
    knot.node.setAttribute("d", kp <= 0 ? "" :
      roughCircle(knot.cx, knot.cy, knot.r * kp, rng(knot.rand)));

    spine.node.setAttribute("d", outline(spine, p));
    for (var i = 0; i < branches.length; i++) {
      var b = branches[i];
      var local = (p - b.at) / b.span;
      b.node.setAttribute("d", outline(b, local < 0 ? 0 : local > 1 ? 1 : local));
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { draw(); ticking = false; });
  }, { passive: true });

  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  window.addEventListener("load", build);

  if (window.innerWidth >= CONFIG.minViewport) build();
})();
