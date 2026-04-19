import React, { useState, useEffect, useRef } from 'react';

// ─── EMBEDDED GLOBAL STYLES ────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --crimson:    #C0392B;
    --blood:      #8B0000;
    --scarlet:    #E74C3C;
    --cream:      #FAF7F2;
    --warm-white: #FFFBF5;
    --charcoal:   #1C1C1E;
    --slate:      #4A4A4A;
    --gold:       #C9A84C;
    --gold-light: #F0D080;
    --muted:      #9B9B9B;
    --border:     rgba(192,57,43,0.15);
    --shadow-sm:  0 2px 12px rgba(192,57,43,0.08);
    --shadow-md:  0 8px 32px rgba(192,57,43,0.12);
    --shadow-lg:  0 20px 60px rgba(192,57,43,0.18);
    --radius:     16px;
    --radius-lg:  28px;
    --radius-xl:  48px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;
    --font-mono:    'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--warm-white);
    color: var(--charcoal);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* Scroll progress bar */
  #scroll-bar {
    position: fixed; top: 0; left: 0; height: 3px; z-index: 9999;
    background: linear-gradient(90deg, var(--blood), var(--scarlet), var(--gold));
    transition: width 0.1s linear;
  }

  /* ── NOISE TEXTURE OVERLAY ── */
  body::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── NAV ── */
  .rakt-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 60px;
    background: rgba(255,251,245,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .rakt-nav .logo {
    font-family: var(--font-display);
    font-size: 1.75rem; font-weight: 900;
    color: var(--blood);
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .rakt-nav .logo span { color: var(--gold); }
  .logo-drop {
    width: 10px; height: 14px;
    background: var(--crimson);
    border-radius: 50% 50% 50% 0 / 60% 60% 40% 0;
    transform: rotate(-30deg);
    animation: drip 3s ease-in-out infinite;
  }
  @keyframes drip {
    0%,100% { transform: rotate(-30deg) translateY(0); }
    50%      { transform: rotate(-30deg) translateY(3px); }
  }
  .nav-links { display: flex; gap: 36px; align-items: center; }
  .nav-links a {
    text-decoration: none; color: var(--slate);
    font-size: 0.95rem; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--crimson); }
  .nav-cta {
    background: var(--blood); color: white !important;
    padding: 10px 24px; border-radius: 100px;
    font-weight: 600 !important;
    transition: transform 0.2s, box-shadow 0.2s !important;
  }
  .nav-cta:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(139,0,0,0.3) !important;
  }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 120px 60px 80px;
    position: relative; overflow: hidden;
    gap: 60px;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 70% at 80% 50%, rgba(192,57,43,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-text {}
  .hero-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--crimson);
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 28px;
  }
  .hero-eyebrow::before {
    content: ''; display: block; width: 32px; height: 1px; background: var(--crimson);
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(3rem, 5vw, 5.5rem);
    font-weight: 900; line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--charcoal);
    margin-bottom: 28px;
  }
  .hero h1 em {
    font-style: italic; color: var(--crimson);
    display: block;
  }
  .hero-sub {
    font-size: 1.15rem; line-height: 1.7;
    color: var(--slate); max-width: 440px;
    margin-bottom: 44px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--blood); color: white;
    padding: 16px 32px; border-radius: 100px;
    font-size: 1rem; font-weight: 600;
    text-decoration: none; border: none; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 4px 20px rgba(139,0,0,0.25);
  }
  .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(139,0,0,0.35);
    background: var(--crimson);
  }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: var(--blood);
    padding: 15px 30px; border-radius: 100px;
    font-size: 1rem; font-weight: 600;
    text-decoration: none; border: 2px solid var(--blood); cursor: pointer;
    transition: all 0.3s;
  }
  .btn-secondary:hover {
    background: var(--blood); color: white;
    transform: translateY(-3px);
  }

  /* Hero visual */
  .hero-visual {
    position: relative;
    display: flex; justify-content: center; align-items: center;
  }
  .hero-img-wrap {
    position: relative; width: 100%; max-width: 520px;
  }
  .hero-img-wrap img {
    width: 100%; border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    object-fit: cover; aspect-ratio: 4/5;
    display: block;
  }
  .hero-badge {
    position: absolute; bottom: -24px; left: -24px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    box-shadow: var(--shadow-md);
    display: flex; align-items: center; gap: 14px;
    max-width: 240px;
    animation: float 5s ease-in-out infinite;
  }
  .hero-badge-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, var(--blood), var(--scarlet));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .hero-badge-icon svg { width: 22px; height: 22px; fill: white; }
  .hero-badge strong { display: block; font-size: 0.95rem; color: var(--charcoal); }
  .hero-badge span { font-size: 0.78rem; color: var(--muted); }

  .hero-stat-pill {
    position: absolute; top: 24px; right: -20px;
    background: var(--blood); color: white;
    border-radius: 100px; padding: 12px 20px;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(139,0,0,0.3);
    animation: float 5s 1.5s ease-in-out infinite;
  }
  .hero-stat-pill .num { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; }
  .hero-stat-pill .lbl { font-size: 0.78rem; opacity: 0.85; }

  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }

  /* Decorative bg shape */
  .hero-bg-blob {
    position: absolute; right: -80px; top: 50%;
    transform: translateY(-50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(192,57,43,0.07) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: -1;
  }

  /* ── TICKER ── */
  .ticker-wrap {
    background: var(--blood); color: white;
    padding: 14px 0; overflow: hidden;
    position: relative;
  }
  .ticker {
    display: flex; gap: 60px;
    animation: ticker 25s linear infinite;
    white-space: nowrap;
  }
  .ticker-item {
    display: flex; align-items: center; gap: 12px;
    font-size: 0.88rem; font-weight: 500; letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .ticker-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-light); flex-shrink: 0; }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* ── STATS ── */
  .stats-section {
    padding: 100px 60px;
    background: var(--cream);
    position: relative; overflow: hidden;
  }
  .stats-section::before {
    content: 'रक्त'; position: absolute;
    font-family: var(--font-display); font-size: 22vw; font-weight: 900;
    color: var(--crimson); opacity: 0.03;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none; white-space: nowrap;
  }
  .section-header { text-align: center; margin-bottom: 72px; }
  .section-eyebrow {
    font-family: var(--font-mono); font-size: 0.75rem;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--crimson); margin-bottom: 16px;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 700; line-height: 1.15;
    color: var(--charcoal); letter-spacing: -0.025em;
  }
  .section-title strong { color: var(--crimson); font-style: italic; }

  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .stat-card {
    background: white; border-radius: var(--radius-lg);
    padding: 40px 32px;
    border: 1px solid var(--border);
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute;
    bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blood), var(--scarlet));
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.4s ease;
  }
  .stat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-md); }
  .stat-card:hover::after { transform: scaleX(1); }
  .stat-icon {
    width: 60px; height: 60px; border-radius: 18px;
    background: linear-gradient(135deg, var(--blood), var(--scarlet));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 8px 20px rgba(139,0,0,0.22);
  }
  .stat-icon svg { width: 26px; height: 26px; fill: white; }
  .stat-num {
    font-family: var(--font-display);
    font-size: 2.8rem; font-weight: 900;
    color: var(--blood); letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 8px;
  }
  .stat-label { font-size: 0.92rem; color: var(--muted); font-weight: 500; }

  /* ── WHY DONATE ── */
  .why-section {
    padding: 100px 60px;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 80px;
    position: relative; overflow: hidden;
  }
  .why-image-col { position: relative; }
  .why-img-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .why-img-grid img {
    width: 100%; border-radius: var(--radius);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
    transition: transform 0.4s ease;
  }
  .why-img-grid img:hover { transform: scale(1.03); }
  .why-img-grid img:first-child {
    grid-column: 1 / -1;
    aspect-ratio: 16/7;
  }
  .why-img-grid img:nth-child(2) { aspect-ratio: 1; }
  .why-img-grid img:nth-child(3) { aspect-ratio: 1; }
  .why-quote-box {
    position: absolute; bottom: -28px; right: -24px;
    background: var(--blood); color: white;
    border-radius: var(--radius); padding: 20px 24px;
    max-width: 200px; box-shadow: var(--shadow-md);
  }
  .why-quote-box p { font-family: var(--font-display); font-size: 1rem; font-style: italic; line-height: 1.4; }
  .why-quote-box span { font-size: 0.78rem; opacity: 0.75; display: block; margin-top: 8px; }

  .why-text-col {}
  .why-features { margin-top: 44px; display: flex; flex-direction: column; gap: 20px; }
  .why-feature {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 24px; border-radius: var(--radius);
    border: 1px solid var(--border);
    background: white;
    transition: all 0.3s;
    cursor: default;
  }
  .why-feature:hover {
    border-color: var(--crimson);
    box-shadow: var(--shadow-sm);
    transform: translateX(6px);
  }
  .why-feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, rgba(192,57,43,0.1), rgba(231,76,60,0.05));
    border: 1.5px solid rgba(192,57,43,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .why-feature-icon svg { width: 22px; height: 22px; stroke: var(--crimson); fill: none; stroke-width: 2; }
  .why-feature-body strong { display: block; font-size: 1rem; font-weight: 600; color: var(--charcoal); margin-bottom: 4px; }
  .why-feature-body p { font-size: 0.88rem; color: var(--muted); line-height: 1.6; }

  /* ── PROCESS ── */
  .process-section {
    padding: 100px 60px;
    background: var(--charcoal);
    color: white; position: relative; overflow: hidden;
  }
  .process-section::before {
    content: ''; position: absolute;
    top: -200px; right: -200px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(192,57,43,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .process-section .section-title { color: white; }
  .process-section .section-title strong { color: var(--gold-light); }
  .process-steps {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; margin-top: 64px; position: relative;
  }
  .process-steps::before {
    content: ''; position: absolute;
    top: 40px; left: calc(12.5%); right: calc(12.5%);
    height: 1px;
    background: linear-gradient(90deg, var(--crimson), var(--gold));
    opacity: 0.4;
  }
  .process-step { text-align: center; padding: 0 20px; position: relative; z-index: 1; }
  .step-num {
    width: 80px; height: 80px; border-radius: 50%;
    border: 2px solid rgba(192,57,43,0.5);
    background: rgba(192,57,43,0.1);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: var(--gold-light);
    transition: all 0.3s;
  }
  .process-step:hover .step-num {
    background: var(--crimson); border-color: var(--crimson);
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(192,57,43,0.4);
  }
  .step-title { font-weight: 600; font-size: 1.05rem; margin-bottom: 10px; color: white; }
  .step-desc { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.65; }

  /* ── TESTIMONIALS ── */
  .testimonials-section { padding: 100px 60px; background: var(--cream); }
  .testimonials-grid {
    display: grid; grid-template-columns: 1.4fr 1fr 1fr;
    gap: 24px; align-items: start;
    margin-top: 64px;
  }
  .testimonial-card {
    background: white; border-radius: var(--radius-lg);
    padding: 36px; border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    transition: all 0.35s;
    position: relative; overflow: hidden;
  }
  .testimonial-card::before {
    content: '"';
    position: absolute; top: -10px; left: 20px;
    font-family: var(--font-display); font-size: 7rem;
    color: var(--crimson); opacity: 0.07; line-height: 1;
    pointer-events: none;
  }
  .testimonial-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: rgba(192,57,43,0.2); }
  .testimonial-card.featured { background: var(--blood); border-color: transparent; }
  .testimonial-card.featured::before { color: white; }
  .testimonial-card.featured .t-quote { color: rgba(255,255,255,0.9); }
  .testimonial-card.featured .t-name { color: white; }
  .testimonial-card.featured .t-role { color: rgba(255,255,255,0.65); }
  .testimonial-card.featured .stars span { color: var(--gold-light); }
  .stars { display: flex; gap: 3px; margin-bottom: 16px; }
  .stars span { color: var(--gold); font-size: 1rem; }
  .t-quote { font-size: 1rem; line-height: 1.7; color: var(--slate); margin-bottom: 24px; position: relative; z-index: 1; }
  .t-author { display: flex; align-items: center; gap: 14px; }
  .t-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--crimson), var(--blood)); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
  .t-name { font-weight: 600; font-size: 0.95rem; color: var(--charcoal); }
  .t-role { font-size: 0.8rem; color: var(--muted); }

  /* ── BLOOD TYPES ── */
  .blood-section { padding: 100px 60px; }
  .blood-grid {
    display: grid; grid-template-columns: repeat(8, 1fr);
    gap: 16px; margin-top: 64px;
  }
  .blood-card {
    border-radius: var(--radius); padding: 24px 16px;
    text-align: center; border: 1.5px solid var(--border);
    background: white; transition: all 0.3s; cursor: default;
  }
  .blood-card:hover {
    border-color: var(--crimson);
    transform: translateY(-6px);
    box-shadow: var(--shadow-md);
  }
  .blood-card.urgent { background: var(--blood); border-color: var(--blood); }
  .blood-type {
    font-family: var(--font-display); font-size: 2rem; font-weight: 900;
    color: var(--crimson); line-height: 1;
    margin-bottom: 8px;
  }
  .blood-card.urgent .blood-type { color: white; }
  .blood-card.urgent .blood-info { color: rgba(255,255,255,0.75); }
  .blood-card.urgent .blood-tag { background: rgba(255,255,255,0.2); color: white; border-color: transparent; }
  .blood-info { font-size: 0.72rem; color: var(--muted); margin-bottom: 12px; }
  .blood-tag {
    display: inline-block; font-size: 0.65rem; font-weight: 600;
    padding: 3px 10px; border-radius: 100px;
    border: 1px solid var(--border); color: var(--slate);
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  /* ── CTA ── */
  .cta-section {
    padding: 80px 60px; margin: 0 60px 80px;
    border-radius: var(--radius-xl);
    background: linear-gradient(135deg, var(--blood) 0%, #6B0000 100%);
    position: relative; overflow: hidden;
    display: grid; grid-template-columns: 1fr auto;
    align-items: center; gap: 60px;
  }
  .cta-section::before {
    content: ''; position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    border-radius: 50%; background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .cta-section::after {
    content: ''; position: absolute;
    bottom: -80px; left: 30%;
    width: 300px; height: 300px;
    border-radius: 50%; background: rgba(255,255,255,0.03);
    pointer-events: none;
  }
  .cta-text { position: relative; z-index: 1; }
  .cta-eyebrow {
    font-family: var(--font-mono); font-size: 0.72rem;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold-light); margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .cta-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--gold-light); }
  .cta-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 900; color: white;
    line-height: 1.15; letter-spacing: -0.025em;
    margin-bottom: 16px;
  }
  .cta-sub { color: rgba(255,255,255,0.7); font-size: 1.05rem; line-height: 1.6; }
  .cta-actions { display: flex; gap: 14px; flex-direction: column; flex-shrink: 0; position: relative; z-index: 1; }
  .btn-white {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: white; color: var(--blood);
    padding: 16px 32px; border-radius: 100px;
    font-size: 1rem; font-weight: 700;
    text-decoration: none; border: none; cursor: pointer;
    transition: all 0.3s; white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
  .btn-white:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.85);
    padding: 14px 28px; border-radius: 100px;
    font-size: 0.95rem; font-weight: 600;
    text-decoration: none; border: 1.5px solid rgba(255,255,255,0.3); cursor: pointer;
    transition: all 0.3s; white-space: nowrap;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }

  /* ── FOOTER ── */
  footer {
    background: var(--charcoal); color: white;
    padding: 72px 60px 40px;
  }
  .footer-top {
    display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 60px; padding-bottom: 56px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .footer-brand .logo { color: white; margin-bottom: 16px; display: inline-flex; }
  .footer-brand .logo span { color: var(--gold-light); }
  .footer-brand p { color: rgba(255,255,255,0.5); font-size: 0.9rem; line-height: 1.7; margin-bottom: 24px; }
  .footer-socials { display: flex; gap: 10px; }
  .social-btn {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.5); font-size: 0.85rem;
    text-decoration: none; transition: all 0.25s; cursor: pointer;
  }
  .social-btn:hover { background: var(--crimson); border-color: var(--crimson); color: white; }
  .footer-col h4 { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 20px; }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-col ul li a { text-decoration: none; color: rgba(255,255,255,0.65); font-size: 0.92rem; transition: color 0.2s; }
  .footer-col ul li a:hover { color: white; }
  .footer-bottom {
    padding-top: 32px; display: flex;
    justify-content: space-between; align-items: center;
  }
  .footer-bottom p { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
  .footer-bottom-links { display: flex; gap: 24px; }
  .footer-bottom-links a { font-size: 0.82rem; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.2s; }
  .footer-bottom-links a:hover { color: rgba(255,255,255,0.7); }

  /* ── CHAT ── */
  .chat-fab {
    position: fixed; bottom: 28px; right: 28px; z-index: 200;
    width: 58px; height: 58px; border-radius: 50%;
    background: linear-gradient(135deg, var(--blood), var(--crimson));
    border: none; cursor: pointer; color: white;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(139,0,0,0.35);
    transition: all 0.3s;
  }
  .chat-fab:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(139,0,0,0.45); }
  .chat-fab svg { width: 24px; height: 24px; fill: white; }
  .chat-panel {
    position: fixed; bottom: 100px; right: 28px; z-index: 199;
    width: 360px; border-radius: 20px;
    background: white; box-shadow: 0 24px 64px rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.06);
    display: flex; flex-direction: column;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .chat-panel.hidden { opacity: 0; pointer-events: none; transform: translateY(20px) scale(0.97); }
  .chat-header {
    background: linear-gradient(135deg, var(--blood), var(--crimson));
    padding: 18px 20px;
    display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  }
  .chat-header-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .chat-header-avatar svg { width: 18px; height: 18px; fill: white; }
  .chat-header-info strong { display: block; color: white; font-size: 0.95rem; font-weight: 600; }
  .chat-header-info span { font-size: 0.75rem; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 5px; }
  .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .chat-close { margin-left: auto; background: rgba(255,255,255,0.15); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display:flex;align-items:center;justify-content:center; font-size:1rem; transition:background 0.2s; }
  .chat-close:hover { background: rgba(255,255,255,0.3); }
  .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; max-height: 320px; }
  .chat-messages::-webkit-scrollbar { width: 3px; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(192,57,43,0.25); border-radius:3px; }
  .chat-bubble { max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 0.88rem; line-height: 1.6; }
  .chat-bubble.bot { background: #F5F5F5; color: var(--charcoal); border-bottom-left-radius: 4px; align-self:flex-start; }
  .chat-bubble.user { background: var(--blood); color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
  .chat-bubble.error { background: #FEE2E2; color: #991B1B; }
  .chat-time { font-size: 0.65rem; opacity: 0.5; margin-top: 4px; }
  .typing-wrap { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
  .typing-wrap span { width: 7px; height: 7px; border-radius: 50%; background: var(--crimson); animation: bounce 1.2s infinite; }
  .typing-wrap span:nth-child(2) { animation-delay: 0.2s; }
  .typing-wrap span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-5px);opacity:1} }
  .chat-quick { padding: 12px 16px 0; display:flex;flex-wrap:wrap;gap:6px; border-top: 1px solid #f0f0f0; }
  .quick-chip { background: #FFF0EE; color: var(--crimson); border: 1px solid rgba(192,57,43,0.2); border-radius:100px; padding:5px 12px; font-size:0.75rem; font-weight:500; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .quick-chip:hover { background: var(--crimson); color: white; }
  .chat-input-row { padding: 14px 16px; display:flex;gap:8px; }
  .chat-input {
    flex:1; padding: 10px 14px; border-radius: 100px;
    border: 1.5px solid #eee; font-family: var(--font-body); font-size:0.9rem;
    outline:none; transition:border-color 0.2s;
    background: #fafafa;
  }
  .chat-input:focus { border-color: var(--crimson); background: white; }
  .chat-send {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--blood); border: none; cursor: pointer;
    display:flex;align-items:center;justify-content:center;
    transition:all 0.2s;
  }
  .chat-send:hover { transform:scale(1.08); background: var(--crimson); }
  .chat-send:disabled { background: #ddd; cursor: default; transform:none; }
  .chat-send svg { width:16px;height:16px;fill:white; }

  /* ── RESPONSIVE ── */
  @media (max-width:1100px) {
    .hero { grid-template-columns:1fr; padding:100px 32px 60px; gap:40px; }
    .hero-visual { display:none; }
    .hero { text-align:center; }
    .hero-sub { margin:0 auto 44px; }
    .hero-actions { justify-content:center; }
    .stats-grid { grid-template-columns:repeat(2,1fr); }
    .why-section { grid-template-columns:1fr; padding:60px 32px; }
    .why-image-col { display:none; }
    .process-steps { grid-template-columns:repeat(2,1fr); gap:32px; }
    .process-steps::before { display:none; }
    .testimonials-grid { grid-template-columns:1fr; }
    .blood-grid { grid-template-columns:repeat(4,1fr); }
    .cta-section { grid-template-columns:1fr; margin:0 32px 60px; gap:40px; }
    .cta-actions { flex-direction:row; }
    .footer-top { grid-template-columns:1fr 1fr; gap:40px; }
    .rakt-nav { padding:16px 24px; }
    .nav-links { display:none; }
    .stats-section,.blood-section,.testimonials-section { padding:60px 32px; }
    .process-section { padding:60px 32px; }
  }
  @media (max-width:640px) {
    .stats-grid { grid-template-columns:1fr 1fr; }
    .blood-grid { grid-template-columns:repeat(4,1fr); }
    .footer-top { grid-template-columns:1fr; }
    .cta-actions { flex-direction:column; }
    .chat-panel { width:calc(100vw - 40px); right:20px; bottom:90px; }
  }

  /* fade-in on scroll */
  .fade-up { opacity:0; transform:translateY(30px); transition:all 0.6s cubic-bezier(0.4,0,0.2,1); }
  .fade-up.visible { opacity:1; transform:translateY(0); }
`;

// ─── SVG ICONS ─────────────────────────────────────────────────────────────────
const IconHeart = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
  </svg>
);
const IconBlood = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8 7 5 11.5 5 14.5A7 7 0 0 0 19 14.5C19 11.5 16 7 12 2Z"/>
  </svg>
);
const IconPeople = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);
const IconHospital = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
  </svg>
);
const IconBot = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// ─── CHAT HOOK ─────────────────────────────────────────────────────────────────
const useChat = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hi! I'm the Rakt assistant. Ask me anything about blood donation, eligibility, or how to get started.", time: new Date() }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text, time: new Date() };
    setMessages(p => [...p, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBcZ6WbedsRd6bPdiOw6N-M6VUEze7bJ4U', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a warm, knowledgeable assistant for Rakt, a blood donation platform. Keep responses concise and helpful. Question: ${text}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      });
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response. Please try again.';
      setMessages(p => [...p, { role: 'bot', text: reply, time: new Date() }]);
    } catch {
      setMessages(p => [...p, { role: 'bot', text: 'Network error. Please check your connection.', time: new Date(), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, send };
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function RaktApp() {
  const [scrollPct, setScrollPct] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const { messages, loading, send } = useChat();
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer for fade-up
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleChatSend = () => {
    if (chatInput.trim()) {
      send(chatInput);
      setChatInput('');
    }
  };

  const QUICK = ['Who can donate?', 'How often?', 'Side effects?', 'Blood types needed?'];

  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div id="scroll-bar" style={{ width: `${scrollPct}%` }} />

      {/* ── NAV ── */}
      <nav className="rakt-nav">
        <div className="logo">
          <div className="logo-drop" />
          Rakt<span>.</span>
        </div>
        <div className="nav-links">
          <a href="#why">Why Donate</a>
          <a href="#process">How It Works</a>
          <a href="#blood-types">Blood Types</a>
          <a href="#donate" className="nav-cta">Donate Now →</a>
        </div>
      </nav>

      {/* ── TICKER ── */}
      {/* placed after hero, but we render it after hero section */}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-blob" />
        <div className="hero-text">
          <div className="hero-eyebrow">India's most trusted donation platform</div>
          <h1>
            Give Blood,<br />
            <em>Give Life.</em>
          </h1>
          <p className="hero-sub">
            One donation can save up to three lives. Join 25,000+ heroes across India who make a difference every single day.
          </p>
          <div className="hero-actions">
            <a href="#donate" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
              Become a Donor
            </a>
            <a href="#request" className="btn-secondary">
              Request Blood →
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&auto=format&fit=crop&q=80"
              alt="Blood donation"
            />
            <div className="hero-badge">
              <div className="hero-badge-icon"><IconBlood /></div>
              <div>
                <strong>Every donation counts</strong>
                <span>Saves up to 3 lives</span>
              </div>
            </div>
            <div className="hero-stat-pill">
              <span className="num">50K+</span>
              <span className="lbl">Lives<br />saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {['O+ is the most needed blood type','Donate every 56 days','Takes only 10 minutes','Free health check-up included','200+ partner hospitals','98% success rate','You can save 3 lives today','Safe, simple, impactful'].map((t, j) => (
                <div className="ticker-item" key={j}>
                  <span className="ticker-dot" />
                  {t}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section" id="stats">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Our impact</div>
          <h2 className="section-title">Numbers that <strong>matter</strong></h2>
        </div>
        <div className="stats-grid">
          {[
            { num: '50,000+', label: 'Lives Saved', icon: <IconHeart /> },
            { num: '25,000+', label: 'Active Donors', icon: <IconPeople /> },
            { num: '98%',     label: 'Success Rate', icon: <IconShield /> },
            { num: '200+',    label: 'Partner Hospitals', icon: <IconHospital /> },
          ].map((s, i) => (
            <div className="stat-card fade-up" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY DONATE ── */}
      <section className="why-section" id="why">
        <div className="why-image-col fade-up">
          <div className="why-img-grid">
            <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80" alt="Medical" />
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&auto=format&fit=crop&q=80" alt="Donation" />
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80" alt="Hospital" />
          </div>
          <div className="why-quote-box">
            <p>"Blood is the most precious gift anyone can give to another person."</p>
            <span>— WHO</span>
          </div>
        </div>
        <div className="why-text-col">
          <div className="fade-up">
            <div className="section-eyebrow">Why it matters</div>
            <h2 className="section-title">Every drop of blood <strong>carries hope</strong></h2>
          </div>
          <div className="why-features">
            {[
              {
                title: 'Save up to 3 lives',
                desc: 'A single donation is separated into red cells, platelets, and plasma — each helping a different patient.',
                icon: <svg viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
              },
              {
                title: 'Free health screening',
                desc: 'Every donation includes a complimentary health check for blood pressure, hemoglobin, and infectious diseases.',
                icon: <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/></svg>
              },
              {
                title: 'Reduces your health risks',
                desc: 'Regular donation helps reduce excess iron, lowers cardiovascular risk, and encourages healthy red cell renewal.',
                icon: <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              },
            ].map((f, i) => (
              <div className="why-feature fade-up" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="why-feature-icon">{f.icon}</div>
                <div className="why-feature-body">
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process-section" id="process">
        <div className="section-header fade-up">
          <div className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Simple steps</div>
          <h2 className="section-title">How donation <strong>works</strong></h2>
        </div>
        <div className="process-steps">
          {[
            { n: '01', title: 'Register', desc: 'Create your free Rakt account in under 2 minutes. Verify your identity and fill basic health info.' },
            { n: '02', title: 'Health Check', desc: 'A quick on-site screening: blood pressure, pulse, hemoglobin, and a few eligibility questions.' },
            { n: '03', title: 'Donate',     desc: 'The actual donation takes about 8–10 minutes. You relax while our trained staff takes care of everything.' },
            { n: '04', title: 'Recover',    desc: "Enjoy refreshments, rest for 15 minutes, and you're done! Your blood is tested and processed immediately." },
          ].map((s, i) => (
            <div className="process-step fade-up" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Stories</div>
          <h2 className="section-title">Words from our <strong>community</strong></h2>
        </div>
        <div className="testimonials-grid">
          {[
            {
              name: 'Anita Sharma', role: 'Regular Donor — Mumbai',
              avatar: '👩‍⚕️', featured: true,
              quote: 'Rakt has completely changed how I think about giving back. The process is smooth, the staff is warm, and knowing I\'ve helped save multiple lives is the most rewarding feeling I\'ve ever had.',
            },
            {
              name: 'Dr. Rajesh Kumar', role: 'Medical Director — AIIMS',
              avatar: '👨‍⚕️', featured: false,
              quote: 'As a medical professional, I trust Rakt completely. Their safety protocols are exceptional and their donor network has genuinely saved critical cases at our hospital.',
            },
            {
              name: 'Priya Singh', role: 'Recipient\'s Family',
              avatar: '🙏', featured: false,
              quote: 'My brother needed rare O− blood urgently. Rakt found a donor in under 3 hours. This platform is a genuine lifeline for families in crisis.',
            },
          ].map((t, i) => (
            <div className={`testimonial-card fade-up${t.featured ? ' featured' : ''}`} key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="stars">
                {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
              </div>
              <p className="t-quote">{t.quote}</p>
              <div className="t-author">
                <div className="t-avatar">{t.avatar}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOOD TYPES ── */}
      <section className="blood-section" id="blood-types">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Compatibility guide</div>
          <h2 className="section-title">All blood types, <strong>all lives</strong></h2>
        </div>
        <div className="blood-grid">
          {[
            { type: 'O+',  info: 'Universal donor\n(RBCs)', tag: 'High demand',  urgent: true  },
            { type: 'O−',  info: 'Universal donor\n(all)',  tag: 'Critical',      urgent: true  },
            { type: 'A+',  info: 'Donate to A+, AB+',      tag: 'Common',        urgent: false },
            { type: 'A−',  info: 'Donate to A, AB',        tag: 'Needed',        urgent: false },
            { type: 'B+',  info: 'Donate to B+, AB+',      tag: 'Common',        urgent: false },
            { type: 'B−',  info: 'Donate to B, AB',        tag: 'Rare',          urgent: false },
            { type: 'AB+', info: 'Universal recipient',    tag: 'Any donor',     urgent: false },
            { type: 'AB−', info: 'Universal plasma\ndonor',tag: 'Very rare',     urgent: false },
          ].map((b, i) => (
            <div className={`blood-card fade-up${b.urgent ? ' urgent' : ''}`} key={i} style={{ transitionDelay: `${i * 0.06}s` }}>
              <div className="blood-type">{b.type}</div>
              <div className="blood-info" style={{ whiteSpace: 'pre-line' }}>{b.info}</div>
              <span className="blood-tag">{b.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div id="donate">
        <div className="cta-section fade-up">
          <div className="cta-text">
            <div className="cta-eyebrow">Join thousands of donors</div>
            <h2 className="cta-title">Ready to save a life today?</h2>
            <p className="cta-sub">Your donation takes 30 minutes and can make all the difference for up to three people and their families.</p>
          </div>
          <div className="cta-actions">
            <a href="#register" className="btn-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#8B0000"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
              Register as Donor
            </a>
            <a href="#request" className="btn-ghost">Request Blood →</a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo footer-brand">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 11, background: '#E74C3C', borderRadius: '50% 50% 50% 0 / 60% 60% 40% 0', transform: 'rotate(-30deg)', display: 'inline-block' }} />
                Rakt<span style={{ color: 'var(--gold-light)' }}>.</span>
              </span>
            </div>
            <p>Connecting donors with recipients to save lives. Every drop matters, every donor is a hero.</p>
            <div className="footer-socials">
              {['𝕏', 'f', 'in', '▶'].map((s, i) => (
                <a key={i} className="social-btn" href="#" title={s}>{s}</a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              {['Find a Center', 'Become a Donor', 'Request Blood', 'Blood Type Guide', 'Eligibility Check'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {['About Rakt', 'Our Mission', 'Partner Hospitals', 'Press & Media', 'Careers'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="#">help@rakt.org</a></li>
              <li><a href="#">+91 1800-000-RAKT</a></li>
              <li><a href="#">Support center</a></li>
              <li><a href="#">Report an issue</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Rakt Blood Donation Platform. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* ── CHAT ── */}
      <div className={`chat-panel${chatOpen ? '' : ' hidden'}`}>
        <div className="chat-header">
          <div className="chat-header-avatar"><IconBot /></div>
          <div className="chat-header-info">
            <strong>Rakt Assistant</strong>
            <span><span className="online-dot" />{loading ? 'Typing…' : 'Online'}</span>
          </div>
          <button className="chat-close" onClick={() => setChatOpen(false)}><IconClose /></button>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`chat-bubble ${m.role === 'bot' ? (m.error ? 'bot error' : 'bot') : 'user'}`}>
                {m.text}
              </div>
              <div className="chat-time">{fmt(m.time)}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot">
              <div className="typing-wrap">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-quick">
          {QUICK.map(q => (
            <button key={q} className="quick-chip" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            ref={chatInputRef}
            className="chat-input"
            placeholder="Ask anything…"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChatSend()}
            disabled={loading}
          />
          <button className="chat-send" onClick={handleChatSend} disabled={loading || !chatInput.trim()}>
            <IconSend />
          </button>
        </div>
      </div>

      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Chat with Rakt Assistant">
        {chatOpen ? <IconClose /> : <IconBot />}
      </button>
    </>
  );
}