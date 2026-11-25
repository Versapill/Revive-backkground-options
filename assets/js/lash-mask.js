/* Fade the background lash artwork out softly wherever page content sits.

   For every lash element (.lashwrap) and loose-lash layer (.lashfloat) this builds a mask:
   fully visible, with soft-edged holes over the text, buttons, photos and cards of its section.
   The artwork keeps its full size, but the strands flow around the content instead of under it.
   Rebuilt on load, after the entrance animations, on resize and when scrolling stops
   (some elements, like the services slideshow, stay pinned while you scroll). */
(function () {
  var PAD = 22, BLUR = 16;
  var SKIP = '.lashwrap,.lashfloat,.shade,.bgF,.landscape,.wave';
  var MEDIA = { IMG: 1, svg: 1, BUTTON: 1, INPUT: 1, IFRAME: 1, VIDEO: 1, PICTURE: 1, SELECT: 1, TEXTAREA: 1 };

  function contentBoxes(sec) {
    var out = [], els = sec.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest(SKIP)) continue;
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      var text = false, k = el.childNodes;
      for (var j = 0; j < k.length; j++) if (k[j].nodeType === 3 && k[j].textContent.trim()) { text = true; break; }
      var boxy = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none' ||
        parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
      if (!(text || boxy || MEDIA[el.tagName])) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (text && !boxy && !MEDIA[el.tagName]) r = textBox(el, r);
      out.push(r);
    }
    return out;
  }
  // a paragraph's box can be much wider than its words; use the words' own extent
  function textBox(el, r) {
    try {
      var range = document.createRange(); range.selectNodeContents(el);
      var t = range.getBoundingClientRect();
      if (t.width > 1 && t.height > 1) return t;
    } catch (e) {}
    return r;
  }

  function maskFor(node, boxes) {
    var b = node.getBoundingClientRect(), w = Math.round(b.width), h = Math.round(b.height);
    if (w < 2 || h < 2) return;
    var holes = '';
    for (var i = 0; i < boxes.length; i++) {
      var r = boxes[i];
      var x = r.left - b.left - PAD, y = r.top - b.top - PAD, rw = r.width + PAD * 2, rh = r.height + PAD * 2;
      if (x > w || y > h || x + rw < 0 || y + rh < 0) continue;
      holes += '<rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="' + rw.toFixed(0) + '" height="' + rh.toFixed(0) + '" rx="18"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="' + BLUR + '"/></filter></defs>' +
      '<rect width="100%" height="100%" fill="#fff"/><g fill="#000" filter="url(#b)">' + holes + '</g></svg>';
    var url = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    node.style.webkitMaskImage = url; node.style.maskImage = url;
    node.classList.add('masked');
  }

  function update() {
    var secs = document.querySelectorAll('.has-lash');
    for (var i = 0; i < secs.length; i++) {
      var boxes = contentBoxes(secs[i]);
      var deco = secs[i].querySelectorAll(':scope > .lashwrap, :scope > .lashfloat');
      for (var j = 0; j < deco.length; j++) maskFor(deco[j], boxes);
    }
  }

  var t;
  function later(ms) { clearTimeout(t); t = setTimeout(update, ms); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update); else update();
  addEventListener('load', function () { update(); setTimeout(update, 1600); setTimeout(update, 3200); });
  addEventListener('resize', function () { later(150); });
  addEventListener('scroll', function () { later(120); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
})();
