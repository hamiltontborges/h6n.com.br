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

	function startIdentityCycle() {
		if (!identityEl) return;
		let wIdx = 0;
		identityEl.textContent = '';

		function typeWord(word, cb) {
			let i = 0;
			const t = setInterval(() => {
				identityEl.textContent += word[i++];
				if (i >= word.length) { clearInterval(t); setTimeout(cb, 1800); }
			}, 95);
		}

		function eraseWord(cb) {
			const t = setInterval(() => {
				identityEl.textContent = identityEl.textContent.slice(0, -1);
				if (!identityEl.textContent.length) { clearInterval(t); setTimeout(cb, 250); }
			}, 60);
		}

		function cycle() {
			wIdx = (wIdx + 1) % ROLES.length;
			eraseWord(() => typeWord(ROLES[wIdx], cycle));
		}

		typeWord(ROLES[0], cycle);
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

	/* ════════════════════════════════════════
		 13. PRELOADER
	════════════════════════════════════════ */
	(function initPreloader() {
		const el = document.getElementById('preloader');
		const textEl = document.getElementById('plText');
		if (!el || !textEl) return;

		const msg = 'h6n_';
		let i = 0;
		const interval = setInterval(() => {
			textEl.textContent = msg.slice(0, ++i);
			if (i >= msg.length) clearInterval(interval);
		}, 120);

		const hide = () => el.classList.add('hidden');
		if (document.readyState === 'complete') {
			setTimeout(hide, 600);
		} else {
			window.addEventListener('load', () => setTimeout(hide, 600));
		}
	})();

	/* ════════════════════════════════════════
		 14. READ PROGRESS BAR
	════════════════════════════════════════ */
	(function initProgress() {
		const bar = document.getElementById('read-progress');
		if (!bar) return;
		const update = () => {
			const scrolled = window.scrollY;
			const total = document.documentElement.scrollHeight - window.innerHeight;
			bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
		};
		window.addEventListener('scroll', update, { passive: true });
	})();

	/* ════════════════════════════════════════
		 15. BACK TO TOP
	════════════════════════════════════════ */
	(function initBackToTop() {
		const btn = document.getElementById('back-to-top');
		if (!btn) return;
		window.addEventListener('scroll', () => {
			btn.classList.toggle('visible', window.scrollY > 400);
		}, { passive: true });
		btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
	})();

	/* ════════════════════════════════════════
		 18. CAREER YEAR COUNTERS (animados)
	════════════════════════════════════════ */
	(function initYearCounters() {
		const now = new Date().getFullYear();
		const counters = [
			{ el: document.getElementById('yr-kitchen'), target: 7 },
			{ el: document.getElementById('yr-law'), target: now - 2014 },
			{ el: document.getElementById('yr-dev'), target: now - 2019 },
		];
		// Valores reais imediatos (fallback sem JS)
		counters.forEach(({ el, target }) => { if (el) el.textContent = target; });

		const statsEl = document.querySelector('.career-stats');
		if (!statsEl || !window.IntersectionObserver) return;

		const obs = new IntersectionObserver(entries => {
			if (!entries[0].isIntersecting) return;
			obs.disconnect();
			counters.forEach(({ el, target }) => {
				if (!el) return;
				let cur = 0;
				const inc = target / 30;
				const t = setInterval(() => {
					cur = Math.min(cur + inc, target);
					el.textContent = Math.ceil(cur);
					if (cur >= target) clearInterval(t);
				}, 40);
			});
		}, { threshold: 0.6 });

		obs.observe(statsEl);
	})();

	/* ════════════════════════════════════════
		 19. TERMINAL EASTER EGG (whoami / help)
	════════════════════════════════════════ */
	(function initTerminalInput() {
		const inputRow = document.getElementById('termInputRow');
		const field = document.getElementById('termInputField');
		const body = document.getElementById('termBody');
		if (!inputRow || !field || !body) return;

		// Show input row once terminal body has been filled
		const observer = new MutationObserver(() => {
			if (body.children.length > 0) {
				inputRow.style.display = 'flex';
				observer.disconnect();
			}
		});
		observer.observe(body, { childList: true });

		const cmdHistory = [];
		const RESPONSES = {
			whoami: '<span style="color:#c8d0b0">hamilton tumenas borges — gastrônomo, advogado, <span style="color:#a0d468">dev</span>.</span>',
			help: '<span style="color:#7da0a0">comandos:</span> <span style="color:#c8d0b0">whoami, skills, contato, ls, cat sobre.txt, history, clear</span>',
			skills: '<span style="color:#c8d0b0">ruby · rails · python · js · sql · linux · n8n · cloudflare · git</span>',
			contato: '<span style="color:#c8d0b0">hamiltontubo@gmail.com · +55 (19) 99299-0279</span>',
			ls: '<span style="color:#7da0a0">sobre.txt&nbsp;&nbsp;projetos/&nbsp;&nbsp;contato.txt&nbsp;&nbsp;.gitconfig&nbsp;&nbsp;README.md</span>',
			'cat sobre.txt': '<span style="color:#c8d0b0">gastrônomo → chef no InterContinental SP. advogado → OAB/SP 357.236. dev → ruby on rails, python, sql.</span>',
			history: '__HISTORY__',
			clear: '__CLEAR__',
		};

		const addLine = html => {
			const p = document.createElement('p');
			p.className = 't-output';
			p.innerHTML = html;
			body.appendChild(p);
			body.scrollTop = body.scrollHeight;
		};

		field.addEventListener('keydown', e => {
			if (e.key !== 'Enter') return;
			const cmd = field.value.trim().toLowerCase();
			field.value = '';
			if (!cmd) return;

			// guarda no histórico (exceto o próprio 'history' e 'clear')
			if (cmd !== 'history' && cmd !== 'clear') cmdHistory.push(cmd);

			// echo do comando
			const echo = document.createElement('p');
			echo.className = 't-line';
			echo.innerHTML = `<span class="t-prompt">$ </span><span>${cmd}</span>`;
			body.appendChild(echo);

			const resp = RESPONSES[cmd];
			if (resp === '__CLEAR__') {
				body.innerHTML = '';
				cmdHistory.length = 0;
			} else if (resp === '__HISTORY__') {
				addLine(cmdHistory.length
					? cmdHistory.map((c, i) => `<span style="color:#7da0a0">${i + 1}</span> ${c}`).join('&nbsp;&nbsp;')
					: '<span style="color:#7da0a0">(histórico vazio)</span>');
			} else if (resp) {
				addLine(resp);
			} else {
				addLine(`<span style="color:#e06c75">comando não encontrado: ${cmd}. Digite <em>help</em>.</span>`);
			}
		});
	})();

	/* ════════════════════════════════════════
		 20. CARIMBO DISPONÍVEL
	════════════════════════════════════════ */
	(function initStamp() {
		const stamp = document.getElementById('contatoStamp');
		if (!stamp || !window.IntersectionObserver) return;

		const obs = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting) {
				setTimeout(() => stamp.classList.add('stamped'), 1400);
				obs.disconnect();
			}
		}, { threshold: 0.4 });

		obs.observe(stamp);
	})();

	/* ════════════════════════════════════════
		 21. KONAMI CODE
	════════════════════════════════════════ */
	(function initKonami() {
		const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
		let idx = 0;
		document.addEventListener('keydown', e => {
			if (e.key === SEQ[idx]) {
				idx++;
				if (idx === SEQ.length) { idx = 0; fireKonami(); }
			} else {
				idx = e.key === SEQ[0] ? 1 : 0;
			}
		});

		function fireKonami() {
			const box = document.createElement('div');
			box.id = 'konami-overlay';
			box.innerHTML = `
				<div class="konami-box">
					<div class="konami-code">h6n_</div>
					<p class="konami-msg">você encontrou o easter egg 🥚</p>
					<p class="konami-ascii">gastrônomo&nbsp;·&nbsp;advogado&nbsp;·&nbsp;dev</p>
					<button class="konami-close" id="konamiClose">[ fechar ]</button>
				</div>`;
			document.body.appendChild(box);
			document.getElementById('konamiClose').addEventListener('click', () => box.remove());
			document.addEventListener('keydown', e => { if (e.key === 'Escape') box.remove(); }, { once: true });
		}
	})();

})();
