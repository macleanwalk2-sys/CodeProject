/* Oakwood Marketing Services
   Scroll root: one root grows down the gutter as far as the reader has got,
   putting out a branch each time it passes a section.

   Tuning lab (shape, thickness, growth):
   https://claude.ai/code/artifact/8f9d949f-59ce-4ec6-9824-280671de0253

   To use on a page: add <div class="root-layer"><svg></svg></div> as the first
   element in <body>, mark the sections you want branches on with
   data-root-branch, and load this file. Everything else is CONFIG below. */

(function () {
  "use strict";

  var CONFIG = {
    gutter:      46,    // px to the left of the content column
    width0:      21,    // thickness where it starts
    width1:      3,     // thickness at the tip
    segment:     158,   // px per straight run. Lower = more kinks
    swing:       48,    // furthest a kink can jump sideways
    lead:        0.82,  // how far below the fold the tip sits, 0 to 1 of a screen
    minViewport: 1200,  // below this there is no gutter to spare
    seed:        71     // change for a different set of kinks
  };

  var layer = document.querySelector(".root-layer");
  if (!layer) return;
  var svg = layer.querySelector("svg");
  var col = document.querySelector(".container");
  var spine = null, branches = [], pageH = 0, group = null;

  function rng(s) {
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

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

  function build() {
    pageH = document.documentElement.scrollHeight;
    var pageW = document.documentElement.clientWidth;
    layer.style.height = pageH + "px";
    svg.setAttribute("viewBox", "0 0 " + pageW + " " + pageH);
    svg.textContent = "";

    // Sit just outside the content column, so the root keeps its distance from
    // the text at every window width instead of being pinned to the viewport.
    var colLeft = col ? col.getBoundingClientRect().left + window.pageXOffset : 120;
    var baseX = Math.max(26, colLeft - CONFIG.gutter);

    var rand = rng(CONFIG.seed);
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("fill", "var(--green)");
    svg.appendChild(group);

    // Long straight runs with a decided kink between them. The shape reads as
    // angular because direction changes at points, not continuously.
    var pts = [], n = Math.max(7, Math.round(pageH / CONFIG.segment)), x = baseX;
    for (var i = 0; i <= n; i++) {
      var y = pageH * (i / n);
      if (i === 0 || i === n) { pts.push([baseX, y]); continue; }
      x += (rand() - 0.5) * CONFIG.swing;
      x = Math.max(baseX - 24, Math.min(baseX + 24, x));
      pts.push([x, y]);
    }
    spine = mk(pts, CONFIG.width0, CONFIG.width1);
    spine.node = document.createElementNS("http://www.w3.org/2000/svg", "path");
    group.appendChild(spine.node);

    // A branch cannot exist before the spine has grown past the point it
    // sprouts from, which is also what ties it to the section it marks.
    branches = [];
    Array.prototype.forEach.call(document.querySelectorAll("[data-root-branch]"), function (sec) {
      var anchor = sec.getBoundingClientRect().top + window.pageYOffset + 92;
      var f = Math.min(0.985, anchor / pageH);
      var at = sampleAt(spine, f);
      var p1 = [at.x + 20 + rand() * 9,  at.y - 15 - rand() * 7];
      var p2 = [p1[0] + 22 + rand() * 9, p1[1] - 5  - rand() * 7];
      var p3 = [p2[0] + 16 + rand() * 9, p2[1] + 2  + rand() * 5];
      var b = mk([[at.x, at.y], p1, p2, p3], Math.max(2.2, at.w * 0.5), 1.1);
      b.at = f;
      b.span = Math.min(0.055, (b.total / pageH) * 3.2);
      b.node = document.createElementNS("http://www.w3.org/2000/svg", "path");
      group.appendChild(b.node);
      branches.push(b);
    });

    draw();
  }

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw() {
    // The tip sits a little below the reading position, so the root always
    // feels like it is arriving just ahead of you.
    var p = still ? 1 : Math.max(0, Math.min(1,
      (window.pageYOffset + window.innerHeight * CONFIG.lead) / pageH));
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
  function schedule() { clearTimeout(rt); rt = setTimeout(build, 150); }
  window.addEventListener("resize", schedule);
  window.addEventListener("load", build);

  if (window.innerWidth >= CONFIG.minViewport) build();
})();
