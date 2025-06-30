/*
Name: Simplify SEO - Main Scripts
Version: 1.1
Author: Grandmaster AI for Bukit Besi
*/
document.documentElement.classList.remove('no-js');

// --- UTILITY FUNCTIONS ---
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// --- CORE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

  // DARK MODE TOGGLE
  const darkModeToggle = $('#darkModeToggle');
  const themeColorMeta = $('#theme-color-meta');
  const root = document.documentElement;
  
  const applyTheme = (theme, isInitial = false) => {
    root.classList.toggle('dark-mode', theme === 'dark-mode');
    if (!isInitial) localStorage.setItem('simplify-theme', theme);
    const newThemeColor = getComputedStyle(root).getPropertyValue('--header-bg').trim();
    if(themeColorMeta) themeColorMeta.content = newThemeColor;
  };
  
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const newTheme = root.classList.contains('dark-mode') ? '' : 'dark-mode';
      applyTheme(newTheme);
    });
    const savedTheme = localStorage.getItem('simplify-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : '');
    applyTheme(savedTheme, true);
  }

  // STICKY HEADER & BACK TO TOP
  const header = $('#header');
  const backToTop = $('#back-to-top');
  
  const handleScroll = () => {
    if (header) header.classList.toggle('is-pinned', window.scrollY > 50);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 300);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // MOBILE MENU
  const mobileToggle = $('#mobile-menu-toggle');
  const mainNav = $('#main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('is-mobile-open');
    });
  }
  
  // LIVE SEARCH
  const searchInput = $('#search-input');
  const resultsContainer = $('#search-results');
  const spinner = $('.search-spinner');
  let debounceTimer;

  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchResults(e.target.value), 300);
    });
    
    searchInput.closest('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
    });

    const fetchResults = (query) => {
      if (query.length < 3) {
        resultsContainer.style.display = 'none';
        return;
      }
      spinner.style.display = 'block';
      fetch(`/feeds/posts/default?q=${encodeURIComponent(query)}&alt=json&max-results=5`)
        .then(res => res.text())
        .then(text => JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)))
        .then(data => {
          let html = '';
          if (data.feed.entry) {
            data.feed.entry.forEach(post => {
              const postUrl = post.link.find(link => link.rel === 'alternate').href;
              html += `<a href="${postUrl}">${post.title.$t}</a>`;
            });
          } else {
            html = '<a>No results found</a>';
          }
          resultsContainer.innerHTML = html;
          resultsContainer.style.display = 'block';
        })
        .catch(console.error)
        .finally(() => spinner.style.display = 'none');
    };
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) resultsContainer.style.display = 'none';
    });
  }
  
  // BREAKING NEWS TICKER
  const newsList = $('#breaking-news-list');
  if (newsList) {
    fetch('/feeds/posts/default?alt=json&max-results=5&orderby=published')
      .then(res => res.text())
      .then(text => JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)))
      .then(data => {
        if (!data.feed.entry) return;
        const posts = data.feed.entry.map(post => ({
          title: post.title.$t,
          url: post.link.find(link => link.rel === 'alternate').href
        }));
        newsList.innerHTML = posts.map(p => `<li><a href="${p.url}">${p.title}</a></li>`).join('');
        
        let currentIndex = 0;
        const items = $$('li', newsList);
        if(items.length <= 1) return;
        
        items[0].classList.add('active');
        setInterval(() => {
          items[currentIndex].classList.remove('active');
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex].classList.add('active');
        }, 5000);
      });
  }
  
  // TABLE OF CONTENTS (TOC) GENERATOR
  const tocContainer = $('#toc-container');
  if (tocContainer && $('#post-body-item')) {
    const headings = $$('#post-body-item h2, #post-body-item h3');
    if (headings.length > 1) {
      let tocHtml = '<p id="toc-title">Table of Contents</p><ul id="toc-list">';
      headings.forEach((h, i) => {
        const id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        h.id = id;
        const level = h.tagName.toLowerCase();
        tocHtml += `<li class="toc-level-${level.charAt(1)}"><a href="#${id}">${h.textContent}</a></li>`;
      });
      tocHtml += '</ul>';
      tocContainer.innerHTML = tocHtml;
    } else {
      tocContainer.style.display = 'none';
    }
  }

  // FOOTER YEAR
  const yearSpan = $('#current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  
});
