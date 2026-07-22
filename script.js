// Mobile nav toggle
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.toggle("mobile-open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("mobile-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

// Sticky shadow on scroll
const navbar = document.querySelector(".navbar");
const onScroll = () => {
  navbar?.classList.toggle("is-scrolled", window.scrollY > 8);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Contact form — submit to Formspree
const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", (e) => {
  const button = contactForm.querySelector("button[type='submit']");
  const originalText = button?.textContent;

  if (button) {
    button.textContent = "Sending...";
    button.disabled = true;
  }

  // Let the form submit naturally to Formspree (action + method="POST" set on form)
  // Show feedback briefly
  setTimeout(() => {
    if (button) {
      button.textContent = originalText || "Send";
      button.disabled = false;
    }
  }, 3000);
});

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Smooth back-to-top
document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Lightbox for project images
const lightbox = document.getElementById('lightbox');
const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
let previouslyFocused = null;

function openLightbox(src, title) {
  if (!lightbox || !lightboxContent) return;
  previouslyFocused = document.activeElement;
  lightboxContent.querySelectorAll('img').forEach(n => n.remove());
  const imgEl = document.createElement('img');
  imgEl.src = src;
  imgEl.alt = title || 'Preview';
  lightboxContent.appendChild(imgEl);
  document.body.classList.add('no-scroll');
  lightbox.setAttribute('aria-hidden', 'false');
  setTimeout(() => lightboxClose?.focus(), 60);
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  try { previouslyFocused?.focus(); } catch (e) {}
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.open-gallery');
  if (!btn) return;
  const card = btn.closest('.project-card');
  const img = card?.querySelector('img');
  const src = img?.src || 'assets/profile.svg';
  const title = card?.querySelector('.card-title')?.textContent || 'Preview';
  openLightbox(src, title);
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

