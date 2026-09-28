/* =====================================================================
   GINGR LINKS  -  yeh site ki EK hi jagah hai jahan links daalne hain.
   Client se jo URLs milein, neeche quotes ('') ke andar paste kar do.
   Kisi bhi page ko edit karne ki zaroorat nahi.

   Khali chhod diya to button chalega nahi (kahin nahi jayega).
   Agar sirf `portal` bhar diya aur baaki khali hain, to har Book /
   Login button portal par jayega.

   portal     -> Login button, "Book now" button, footer ka "Book an Appointment",
                 aur jis service ka link khali ho uska fallback
   grooming   -> Grooming ke Book buttons (home slider, grooming page)
   daycare    -> Daycare ke Book buttons (home slider, daycare page, banner)
   boarding   -> Pet Hotel ke Book buttons (home slider, hotel page)
   transport  -> Pet Transport ke Book buttons (home slider, transport page)
   membership -> Membership page ke 3 "Choose ..." buttons
   ===================================================================== */
const GINGR = {
  portal:     '',   // Customer Portal / Login URL
  grooming:   '',   // Grooming booking link
  daycare:    '',   // Daycare booking link
  boarding:   '',   // Pet Hotel / Boarding booking link
  transport:  '',   // Pet Transport link (agar Gingr mein nahi hai to khali chhod do, portal par jayega)
  membership: ''    // Membership purchase link
};

/* ---------------- Neeche kuch edit karne ki zaroorat nahi ---------------- */
(function () {
  const isUrl = u => /^https?:\/\//i.test(u || '');
  function wire(root) {
    (root || document).querySelectorAll('[data-gingr]').forEach(a => {
      if (a.dataset.gingrWired) return;
      a.dataset.gingrWired = '1';
      const url = GINGR[a.dataset.gingr] || GINGR.portal;
      if (isUrl(url)) {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.href = '#';
        a.addEventListener('click', e => e.preventDefault());
      }
    });
  }
  window.gingrWire = wire;
  wire(document);
})();
