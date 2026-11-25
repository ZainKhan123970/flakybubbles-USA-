/* FlakyBubbles shared header. Edit the menu HERE once and every page updates.
   Usage on every page: put <header id="siteHeader"></header><script src="nav.js"></script> where the old <header> was. */
(function () {
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (file === '') file = 'index.html';

  var plans = ['membership.html', 'packages.html'];
  var services = ['service-grooming.html', 'service-daycare.html', 'service-hotel.html', 'service-transport.html', 'transport-booking.html'];
  var more = ['gallery.html', 'career.html'];

  var on = 'bg-brand-light text-brand-dark font-semibold';
  var off = 'hover:bg-brand-light';
  var cur = function (f) { return file === f ? ' aria-current="page"' : ''; };
  var cls = function (match) { return 'px-3 py-2 rounded-md ' + (match ? on : off); };
  var sub = function (f) { return 'block px-3 py-2 rounded-lg hover:bg-brand-light' + (file === f ? ' bg-brand-light text-brand-dark font-semibold' : ''); };
  var msub = function (f) { return 'block py-2.5' + (file === f ? ' text-brand-dark font-semibold' : ''); };
  var mrow = function (f) { return 'block py-3 border-b border-brand-border/60' + (file === f ? ' text-brand-dark font-semibold' : ''); };
  var chev = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 6 5-6z"/></svg>';
  var mchev = function (id) { return '<svg class="w-4 h-4 transition-transform" id="' + id + '" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 6 5-6z"/></svg>'; };

  var html =
  '<div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">' +
    '<a href="index.html" class="flex items-center shrink-0"><img src="logo.png" alt="FlakyBubbles - Organic Pet Spa" class="h-11 sm:h-12 w-auto object-contain"></a>' +
    '<nav class="hidden lg:flex items-center gap-0.5 text-[13px] font-medium" aria-label="Main">' +
      '<a href="index.html"' + cur('index.html') + ' class="' + cls(file === 'index.html') + '">Home</a>' +
      '<a href="about.html"' + cur('about.html') + ' class="' + cls(file === 'about.html') + '">About Us</a>' +
      '<div class="relative group"><button class="' + cls(plans.indexOf(file) > -1) + ' flex items-center gap-1" aria-haspopup="true">Plans ' + chev + '</button>' +
        '<div class="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block z-50"><div class="w-52 bg-white border border-brand-border rounded-xl shadow-lg p-1.5">' +
          '<a href="membership.html" class="' + sub('membership.html') + '">Membership</a>' +
          '<a href="packages.html" class="' + sub('packages.html') + '">Packages</a>' +
        '</div></div></div>' +
      '<a href="shop.html"' + cur('shop.html') + ' class="' + cls(file === 'shop.html') + '">Shop</a>' +
      '<div class="relative group"><button class="' + cls(services.indexOf(file) > -1) + ' flex items-center gap-1" aria-haspopup="true">Services ' + chev + '</button>' +
        '<div class="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block z-50"><div class="w-52 bg-white border border-brand-border rounded-xl shadow-lg p-1.5">' +
          '<a href="service-grooming.html" class="' + sub('service-grooming.html') + '">Pet Grooming</a>' +
          '<a href="service-daycare.html" class="' + sub('service-daycare.html') + '">Pet DayCare</a>' +
          '<a href="service-hotel.html" class="' + sub('service-hotel.html') + '">Pet Hotel</a>' +
          '<a href="service-transport.html" class="' + sub('service-transport.html') + '">Pet Transport</a>' +
        '</div></div></div>' +
      '<a href="events.html"' + cur('events.html') + ' class="' + cls(file === 'events.html') + '">Events</a>' +
      '<a href="contact.html"' + cur('contact.html') + ' class="' + cls(file === 'contact.html') + '">Contact</a>' +
      '<div class="relative" id="moreWrap"><button id="moreBtn" type="button" class="' + cls(more.indexOf(file) > -1) + ' flex items-center gap-1" aria-haspopup="true" aria-expanded="false" aria-controls="moreMenu">More ' + chev + '</button>' +
        '<div id="moreMenu" class="more-menu absolute right-0 top-full pt-2 z-50"><div class="w-52 bg-white border border-brand-border rounded-xl shadow-lg p-1.5">' +
          '<a href="gallery.html" class="' + sub('gallery.html') + '">Gallery</a>' +
          '<a href="career.html" class="' + sub('career.html') + '">Career</a>' +
          /* TODO: add the third "More" tab here:
             '<a href="your-page.html" class="' + sub('your-page.html') + '">Tab Name</a>' + */
        '</div></div></div>' +
    '</nav>' +
    '<div class="flex items-center gap-2">' +
      '<a href="https://flakybubbles.portal.gingrapp.com" target="_blank" rel="noopener" class="hidden sm:inline-block border border-brand-sage/60 hover:bg-brand-light text-brand-dark text-sm font-semibold px-4 py-2 rounded-full transition-colors">Login|Book Now</a>' +
      '<button id="menuBtn" class="lg:hidden w-10 h-10 rounded-lg border border-brand-border bg-white flex items-center justify-center" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
    '</div>' +
  '</div>' +
  '<nav id="mobileNav" class="hidden lg:hidden border-t border-brand-border bg-brand-cream px-4 pb-4 pt-2 text-base font-medium max-h-[calc(100vh-4rem)] overflow-y-auto" aria-label="Mobile">' +
    '<a href="index.html" class="' + mrow('index.html') + '">Home</a>' +
    '<a href="about.html" class="' + mrow('about.html') + '">About Us</a>' +
    '<button id="memBtn" class="w-full flex items-center justify-between py-3 border-b border-brand-border/60" aria-expanded="false">Plans ' + mchev('memIcon') + '</button>' +
    '<div id="memSub" class="hidden pl-4 text-sm text-brand-muted"><a href="membership.html" class="' + msub('membership.html') + '">Membership</a><a href="packages.html" class="' + msub('packages.html') + '">Packages</a></div>' +
    '<a href="shop.html" class="' + mrow('shop.html') + '">Shop</a>' +
    '<button id="svcBtn" class="w-full flex items-center justify-between py-3 border-b border-brand-border/60" aria-expanded="false">Services ' + mchev('svcIcon') + '</button>' +
    '<div id="svcSub" class="hidden pl-4 text-sm text-brand-muted">' +
      '<a href="service-grooming.html" class="' + msub('service-grooming.html') + '">Pet Grooming</a><a href="service-daycare.html" class="' + msub('service-daycare.html') + '">Pet DayCare</a>' +
      '<a href="service-hotel.html" class="' + msub('service-hotel.html') + '">Pet Hotel</a><a href="service-transport.html" class="' + msub('service-transport.html') + '">Pet Transport</a></div>' +
    '<a href="events.html" class="' + mrow('events.html') + '">Events</a>' +
    '<a href="contact.html" class="' + mrow('contact.html') + '">Contact</a>' +
    '<button id="moreMBtn" class="w-full flex items-center justify-between py-3" aria-expanded="false">More ' + mchev('moreMIcon') + '</button>' +
    '<div id="moreMSub" class="hidden pl-4 text-sm text-brand-muted"><a href="gallery.html" class="' + msub('gallery.html') + '">Gallery</a><a href="career.html" class="' + msub('career.html') + '">Career</a></div>' +
    '<div class="mt-3 grid grid-cols-1 gap-2"><a href="https://flakybubbles.portal.gingrapp.com" target="_blank" rel="noopener" class="text-center border border-brand-sage/60 text-brand-dark font-semibold py-3 rounded-full">Login</a></div>' +
  '</nav>';

  // CSS for the click dropdown (so pages don't need it)
  if (!document.getElementById('navCss')) {
    var st = document.createElement('style'); st.id = 'navCss';
    st.textContent = '.more-menu{opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .2s ease,transform .2s ease,visibility 0s linear .2s}.more-menu.open{opacity:1;visibility:visible;transform:none;transition:opacity .2s ease,transform .2s ease}#moreBtn svg{transition:transform .25s ease}#moreBtn[aria-expanded="true"] svg{transform:rotate(180deg)}@media (prefers-reduced-motion:reduce){.more-menu,#moreBtn svg{transition:none}}';
    document.head.appendChild(st);
  }

  var header = document.getElementById('siteHeader');
  if (!header) { header = document.createElement('header'); header.id = 'siteHeader'; document.body.insertBefore(header, document.body.firstChild); }
  header.className = 'sticky top-0 z-50 bg-brand-cream/95 backdrop-blur border-b border-brand-border';
  header.innerHTML = html;

  var q = function (s) { return document.querySelector(s); };
  // Mobile menu + accordions (use onclick so page scripts that set the same handlers don't double-toggle)
  var menuBtn = q('#menuBtn'), mNav = q('#mobileNav');
  menuBtn.onclick = function () { var o = mNav.classList.toggle('hidden'); menuBtn.setAttribute('aria-expanded', !o); };
  mNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mNav.classList.add('hidden'); menuBtn.setAttribute('aria-expanded', false); }); });
  [['#memBtn', '#memSub', '#memIcon'], ['#svcBtn', '#svcSub', '#svcIcon'], ['#moreMBtn', '#moreMSub', '#moreMIcon']].forEach(function (t) {
    q(t[0]).onclick = function (e) { var h = q(t[1]).classList.toggle('hidden'); q(t[2]).style.transform = h ? '' : 'rotate(180deg)'; e.currentTarget.setAttribute('aria-expanded', !h); };
  });
  // Desktop "More": click to open, click outside / Esc to close
  var btn = q('#moreBtn'), menu = q('#moreMenu'), wrap = q('#moreWrap');
  var setOpen = function (o) { menu.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
  btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
})();
