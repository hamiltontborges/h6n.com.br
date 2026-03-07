/* ─────────────────────────────────────────
	 h6n.com.br — main.js
	 Hamilton Tumenas Borges
───────────────────────────────────────── */

(function () {
	'use strict';

	/* ── Helpers ── */
	const $ = (s, ctx = document) => ctx.querySelector(s);
	const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

	/* ════════════════════════════════════════
		 1. TYPEWRITER — Hero name
	════════════════════════════════════════ */
	const NAME = 'Hamilton T. Borges';
	const heroNameEl = $('#heroName');

	function typeWriter(text, el, speed = 70, onDone = null) {
		let i = 0;
		el.textContent = '';

		function next() {
			if (i < text.length) {
				// Randomize typing speed slightly (ink pressure effect)
				const jitter = Math.random() * 60 - 20;
				el.textContent += text[i];
				i++;
				setTimeout(next, Math.max(30, speed + jitter));
			} else if (onDone) {
				onDone();
			}
		}
		setTimeout(next, 400);
	}

	if (heroNameEl) {
		typeWriter(NAME, heroNameEl, 72, startIdentityCycle);
	}

	/* ════════════════════════════════════════
		 2. IDENTITY WORD CYCLE
	════════════════════════════════════════ */
	const ROLES = ['Gastrônomo', 'Advogado', 'Desenvolvedor'];
	const identityEl = $('#identityWord');
	let roleIdx = 0;

	function startIdentityCycle() {
		if (!identityEl) return;
		setInterval(() => {
			identityEl.classList.add('fade');
			setTimeout(() => {
				roleIdx = (roleIdx + 1) % ROLES.length;
				identityEl.textContent = ROLES[roleIdx];
				identityEl.classList.remove('fade');
			}, 320);
		}, 2800);
	}

	/* ════════════════════════════════════════
		 3. CHAPTER TABS
	════════════════════════════════════════ */
	const tabs = $$('.c-tab');
	const chapters = $$('.chapter');

	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const target = tab.dataset.chapter;

			// Update tabs
			tabs.forEach(t => {
				t.classList.remove('active');
				t.setAttribute('aria-selected', 'false');
			});
			tab.classList.add('active');
			tab.setAttribute('aria-selected', 'true');

			// Update panels
			chapters.forEach(ch => {
				const show = ch.id === `ch-${target}`;
				ch.classList.toggle('active', show);
				ch.hidden = !show;

				if (show) {
					// Re-trigger reveal for newly visible items
					$$('.reveal-item, .reveal-block', ch).forEach(el => {
						el.classList.remove('visible');
						requestAnimationFrame(() => {
							setTimeout(() => el.classList.add('visible'), 50);
						});
					});

					// If tech tab, run terminal animation
					if (target === 'tech') {
						runTerminal();
					}
				}
			});
		});
	});

	/* ════════════════════════════════════════
		 4. TERMINAL ANIMATION
	════════════════════════════════════════ */
	const TERM_LINES = [
		{ type: 'cmd', text: 'cat formacao.txt' },
		{ type: 'out', text: '📚 ADS — UNIFEOB (2020–2022)' },
		{ type: 'out', text: '📚 Pós Full Stack — Anhanguera (2022)' },
		{ type: 'blank' },
		{ type: 'cmd', text: 'cat stack.txt' },
		{ type: 'out', text: 'Ruby on Rails · JavaScript · React · Node.js' },
		{ type: 'out', text: 'PostgreSQL · SQLite · DuckDB · MongoDB' },
		{ type: 'out', text: 'TailwindCSS · Hotwire · Git · GitHub' },
		{ type: 'out', text: 'ChatGPT · Claude · Gemini' },
		{ type: 'blank' },
		{ type: 'cmd', text: 'cat attitude.txt' },
		{ type: 'out', text: '"crescer e ajudar os outros a crescerem"' },
		{ type: 'cursor' },
	];

	let termPlayed = false;

	function runTerminal() {
		if (termPlayed) return;
		termPlayed = true;

		const body = $('#termBody');
		if (!body) return;
		body.innerHTML = '';

		let delay = 200;

		TERM_LINES.forEach((line, idx) => {
			delay += line.type === 'cmd' ? 600 : line.type === 'blank' ? 200 : 180;

			setTimeout(() => {
				const div = document.createElement('div');
				div.className = 't-line';

				if (line.type === 'cmd') {
					const prompt = document.createElement('span');
					prompt.className = 't-prompt';
					prompt.textContent = '$ ';
					const cmd = document.createElement('span');
					cmd.className = 't-cmd';
					div.appendChild(prompt);
					div.appendChild(cmd);
					body.appendChild(div);

					// Type the command
					let ci = 0;
					const typeCmd = () => {
						if (ci < line.text.length) {
							cmd.textContent += line.text[ci];
							ci++;
							setTimeout(typeCmd, 45 + Math.random() * 30);
						}
					};
					typeCmd();

				} else if (line.type === 'out') {
					div.className = 't-line t-out';
					div.textContent = line.text;
					div.style.opacity = '0';
					body.appendChild(div);
					requestAnimationFrame(() => {
						div.style.transition = 'opacity .25s';
						div.style.opacity = '1';
					});

				} else if (line.type === 'blank') {
					body.appendChild(div);

				} else if (line.type === 'cursor') {
					const prompt = document.createElement('span');
					prompt.className = 't-prompt';
					prompt.textContent = '$ ';
					const cur = document.createElement('span');
					cur.className = 't-cursor-term';
					div.appendChild(prompt);
					div.appendChild(cur);
					body.appendChild(div);
				}

				body.scrollTop = body.scrollHeight;
			}, delay);
		});
	}

	/* ════════════════════════════════════════
		 5. SCROLL REVEAL (IntersectionObserver)
	════════════════════════════════════════ */
	const revealEls = $$('.reveal-title, .reveal-block, .reveal-item');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
	);

	revealEls.forEach(el => observer.observe(el));

	/* ════════════════════════════════════════
		 6. NAV — scroll state & mobile toggle
	════════════════════════════════════════ */
	const nav = $('#nav');
	const navToggle = $('#navToggle');
	const navLinks = $('#navLinks');

	window.addEventListener('scroll', () => {
		nav.classList.toggle('scrolled', window.scrollY > 30);
	}, { passive: true });

	navToggle?.addEventListener('click', () => {
		navLinks.classList.toggle('open');
	});

	// Close mobile menu on link click
	$$('.nav-links a').forEach(a => {
		a.addEventListener('click', () => navLinks.classList.remove('open'));
	});

	/* ════════════════════════════════════════
		 7. ACTIVE NAV HIGHLIGHT on scroll
	════════════════════════════════════════ */
	const sections = $$('section[id]');

	function updateActiveNav() {
		const scrollY = window.scrollY + 80;
		sections.forEach(sec => {
			const top = sec.offsetTop;
			const bottom = top + sec.offsetHeight;
			const id = sec.getAttribute('id');
			const link = $(`a[href="#${id}"]`, nav);
			if (link) {
				link.style.color = (scrollY >= top && scrollY < bottom)
					? 'var(--ink)' : '';
			}
		});
	}

	window.addEventListener('scroll', updateActiveNav, { passive: true });

	/* ════════════════════════════════════════
		 8. KEYS — click sound feedback (visual)
	════════════════════════════════════════ */
	$$('.key').forEach(key => {
		key.addEventListener('mousedown', () => key.classList.add('pressed'));
		key.addEventListener('mouseup', () => key.classList.remove('pressed'));
		key.addEventListener('mouseleave', () => key.classList.remove('pressed'));
	});

	/* ════════════════════════════════════════
		 9. SMOOTH SCROLL for anchor links
	════════════════════════════════════════ */
	$$('a[href^="#"]').forEach(a => {
		a.addEventListener('click', e => {
			const target = $(a.getAttribute('href'));
			if (!target) return;
			e.preventDefault();
			const top = target.getBoundingClientRect().top + window.scrollY - 52;
			window.scrollTo({ top, behavior: 'smooth' });
		});
	});

	/* ════════════════════════════════════════
		 10. FRAGMENTS — subtle parallax on mouse move
	════════════════════════════════════════ */
	const frags = $$('.frag');

	document.addEventListener('mousemove', e => {
		const cx = (e.clientX / window.innerWidth - .5) * 2;
		const cy = (e.clientY / window.innerHeight - .5) * 2;

		frags.forEach((f, i) => {
			const depth = (i % 3 + 1) * 0.9;
			const x = cx * depth;
			const y = cy * depth;
			f.style.transform = `translate(${x}px, ${y}px) rotate(${f.dataset.rot || 0}deg)`;
		});
	}, { passive: true });

	// Store original rotations
	frags.forEach(f => {
		const matrix = getComputedStyle(f).transform;
		// default rotations are in CSS; we just preserve a small value per element
		f.dataset.rot = (Math.random() * 6 - 3).toFixed(1);
	});

	/* ════════════════════════════════════════
		 11. TYPEWRITER GLITCH on headings hover
				(subtle ink-flicker effect)
	════════════════════════════════════════ */
	$$('.section-title').forEach(h => {
		const original = h.childNodes[0]?.textContent?.trim();
		if (!original) return;

		h.addEventListener('mouseenter', () => {
			let count = 0;
			const glitch = setInterval(() => {
				if (count > 6) { clearInterval(glitch); return; }
				const noise = original.split('').map((c, i) =>
					(Math.random() < .08 && i < original.length - 1) ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
				).join('');
				h.childNodes[0].textContent = noise;
				setTimeout(() => { h.childNodes[0].textContent = original; }, 60);
				count++;
			}, 80);
		});
	});

	const GLITCH_CHARS = 'abcdefghijklmnopqrstuvwxyz@#$%*!?-_';

	/* ════════════════════════════════════════
		 12. CONSOLE Easter egg
	════════════════════════════════════════ */
	console.log(
		'%c h6n.com.br ',
		'background:#1a1108;color:#f4edd8;font-family:monospace;font-size:1.2em;padding:6px 12px;'
	);
	console.log(
		'%cHamilton Tumenas Borges — Gastrônomo · Advogado · Dev\nhamiltontubo@gmail.com',
		'color:#7a6347;font-family:monospace;font-size:.85em;'
	);

})();
