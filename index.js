function setupSectionToggles() {
	const aboutLink = document.getElementById('about-link');
	const researchLink = document.getElementById('research-link');
	const selectedWorkLink = document.getElementById('selected-work-link');
	const aboutSection = document.getElementById('about-section');
	const researchSection = document.getElementById('research-section');
	const selectedWorkSection = document.getElementById('selected-work-section');

	const allSections = [aboutSection, researchSection, selectedWorkSection].filter(Boolean);

	function syncMobileNavSectionState() {
		const isMobile = window.matchMedia('(max-width: 880px)').matches;
		if (!isMobile) {
			document.body.classList.remove('nav-section-open');
			return;
		}

		const hasActiveSection = allSections.some((section) => section.classList.contains('active'));
		document.body.classList.toggle('nav-section-open', hasActiveSection);
	}

	function openSection(section) {
		const isMobile = window.matchMedia('(max-width: 880px)').matches;
		if (isMobile) {
			const isActive = section.classList.contains('active');
			allSections.forEach(s => s.classList.remove('active'));
			if (!isActive) section.classList.add('active');
			syncMobileNavSectionState();
		} else {
			section.classList.toggle('active');
			document.body.classList.remove('nav-section-open');
		}
	}

	if (aboutLink && aboutSection) {
		aboutLink.addEventListener('click', function(e) {
			e.preventDefault();
			openSection(aboutSection);
		});
	}

	if (researchLink && researchSection) {
		researchLink.addEventListener('click', function(e) {
			e.preventDefault();
			openSection(researchSection);
		});
	}

	if (selectedWorkLink && selectedWorkSection) {
		selectedWorkLink.addEventListener('click', function(e) {
			e.preventDefault();
			openSection(selectedWorkSection);
		});
	}
}

function normalizePathSegment(segment) {
	return String(segment || '').replace(/^\/+|\/+$/g, '');
}

function getMediaFromPath(pathValue, mediaIndex) {
	const normalized = normalizePathSegment(pathValue);
	if (!normalized || !mediaIndex || typeof mediaIndex !== 'object') {
		return [];
	}

	if (Array.isArray(mediaIndex[normalized])) {
		return mediaIndex[normalized];
	}

	const withProjectsPrefix = `projects/${normalized}`;
	if (Array.isArray(mediaIndex[withProjectsPrefix])) {
		return mediaIndex[withProjectsPrefix];
	}

	return [];
}

function createMediaElement(filePath, altText) {
	const extension = filePath.split('.').pop().toLowerCase();
	const videoExtensions = new Set(['mp4', 'webm', 'ogg', 'm4v', 'mov']);

	if (videoExtensions.has(extension)) {
		const video = document.createElement('video');
		video.src = filePath;
		video.controls = true;
		video.preload = 'metadata';
		video.setAttribute('playsinline', '');
		return video;
	}

	const image = document.createElement('img');
	image.src = filePath;
	image.alt = altText;
	image.loading = 'lazy';
	return image;
}

function getCarouselScrollStep(carouselTrack) {
	const firstItem = carouselTrack.firstElementChild;
	if (!firstItem) {
		return Math.max(200, Math.round(carouselTrack.clientWidth * 0.8));
	}

	const firstItemWidth = firstItem.getBoundingClientRect().width;
	const computedStyles = window.getComputedStyle(carouselTrack);
	const gap = Number.parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0;
	return firstItemWidth + gap;
}

function createCarouselControlButton(direction, carouselTrack) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `carousel-control carousel-control-${direction}`;
	button.textContent = direction === 'prev' ? '<' : '>';
	button.setAttribute('aria-label', direction === 'prev' ? 'Previous media' : 'Next media');

	button.addEventListener('click', () => {
		const step = getCarouselScrollStep(carouselTrack);
		carouselTrack.scrollBy({
			left: direction === 'prev' ? -step : step,
			behavior: 'smooth'
		});

		requestAnimationFrame(() => {
			button.dispatchEvent(new CustomEvent('carousel:post-scroll'));
		});
	});

	return button;
}

function updateCarouselControls(carouselTrack, prevButton, nextButton) {
	const maxScrollLeft = Math.max(0, carouselTrack.scrollWidth - carouselTrack.clientWidth);
	const threshold = 2;
	const atStart = carouselTrack.scrollLeft <= threshold;
	const atEnd = carouselTrack.scrollLeft >= maxScrollLeft - threshold;

	prevButton.disabled = atStart;
	nextButton.disabled = atEnd;
}

const imageLightboxState = {
	overlay: null,
	media: null,
	prevButton: null,
	nextButton: null,
	files: [],
	index: 0
};

function getImageFiles(files) {
	const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
	return files.filter((filePath) => {
		const extension = filePath.split('.').pop().toLowerCase();
		return imageExtensions.has(extension);
	});
}

function getAllOpenProjectImages() {
	const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
	const images = [];
	document.querySelectorAll('.containertwo.active img.clickable-media').forEach(img => {
		const src = img.currentSrc || img.src || img.getAttribute('src');
		if (src) {
			const ext = src.split('.').pop().toLowerCase().split('?')[0].split('#')[0];
			if (imageExtensions.has(ext)) {
				images.push(src);
			}
		}
	});
	return images;
}

function updateImageLightboxView() {
	if (!imageLightboxState.overlay || !imageLightboxState.media) {
		return;
	}

	const currentFile = imageLightboxState.files[imageLightboxState.index];
	if (!currentFile) {
		return;
	}

	imageLightboxState.media.src = currentFile;
	imageLightboxState.prevButton.disabled = imageLightboxState.index <= 0;
	imageLightboxState.nextButton.disabled = imageLightboxState.index >= imageLightboxState.files.length - 1;
}

function closeImageLightbox() {
	if (!imageLightboxState.overlay) {
		return;
	}

	imageLightboxState.overlay.classList.remove('active');
	document.body.classList.remove('lightbox-open');
}

function openImageLightbox(files, index) {
	if (!Array.isArray(files) || files.length === 0) {
		return;
	}

	imageLightboxState.files = files;
	imageLightboxState.index = Math.min(Math.max(index, 0), files.length - 1);
	imageLightboxState.overlay.classList.add('active');
	document.body.classList.add('lightbox-open');
	updateImageLightboxView();
}

function setupImageLightbox() {
	const overlay = document.createElement('div');
	overlay.className = 'lightbox-overlay';
	overlay.innerHTML = `
		<div class="lightbox-content">
			<div class="carousel-controls lightbox-controls">
				<button type="button" class="carousel-control lightbox-back-btn" aria-label="Close lightbox">&#x2715;</button>
				<button type="button" class="carousel-control lightbox-prev-btn" aria-label="Previous image">&lt;</button>
				<button type="button" class="carousel-control lightbox-next-btn" aria-label="Next image">&gt;</button>
			</div>
			<img class="lightbox-media" alt="enlarged project media">
		</div>
	`;

	document.body.appendChild(overlay);

	const backButton = overlay.querySelector('.lightbox-back-btn');
	const prevButton = overlay.querySelector('.lightbox-prev-btn');
	const nextButton = overlay.querySelector('.lightbox-next-btn');
	const media = overlay.querySelector('.lightbox-media');

	imageLightboxState.overlay = overlay;
	imageLightboxState.prevButton = prevButton;
	imageLightboxState.nextButton = nextButton;
	imageLightboxState.media = media;

	backButton.addEventListener('click', () => {
		closeImageLightbox();
	});

	prevButton.addEventListener('click', () => {
		if (imageLightboxState.index > 0) {
			imageLightboxState.index -= 1;
			updateImageLightboxView();
		}
	});

	nextButton.addEventListener('click', () => {
		if (imageLightboxState.index < imageLightboxState.files.length - 1) {
			imageLightboxState.index += 1;
			updateImageLightboxView();
		}
	});

	overlay.addEventListener('click', (event) => {
		if (event.target === overlay) {
			closeImageLightbox();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (!imageLightboxState.overlay || !imageLightboxState.overlay.classList.contains('active')) {
			return;
		}

		if (event.key === 'Escape') {
			closeImageLightbox();
		}

		if (event.key === 'ArrowLeft' && imageLightboxState.index > 0) {
			imageLightboxState.index -= 1;
			updateImageLightboxView();
		}

		if (event.key === 'ArrowRight' && imageLightboxState.index < imageLightboxState.files.length - 1) {
			imageLightboxState.index += 1;
			updateImageLightboxView();
		}
	});
}

function renderProjectSection(section, mediaIndex) {
	const sectionElement = document.createElement('section');
	const sectionType = section.type || 'grid';
	sectionElement.className = `project-section layout-${sectionType}`;

	if (section.label) {
		const heading = document.createElement('h3');
		heading.className = 'project-section-title';
		heading.textContent = section.label;
		sectionElement.appendChild(heading);
	}

	const mediaWrapper = document.createElement('div');
	mediaWrapper.className = 'project-media';
	let refreshCarouselControls = null;

	if (sectionType === 'carousel') {
		const carouselContainer = document.createElement('div');
		carouselContainer.className = 'carousel-container';
		const prevButton = createCarouselControlButton('prev', mediaWrapper);
		const nextButton = createCarouselControlButton('next', mediaWrapper);
		refreshCarouselControls = () => updateCarouselControls(mediaWrapper, prevButton, nextButton);

		const controlsRow = document.createElement('div');
		controlsRow.className = 'carousel-controls';
		controlsRow.appendChild(prevButton);
		controlsRow.appendChild(nextButton);

		carouselContainer.appendChild(controlsRow);
		carouselContainer.appendChild(mediaWrapper);
		sectionElement.appendChild(carouselContainer);

		mediaWrapper._refreshCarouselControls = refreshCarouselControls;

		mediaWrapper.addEventListener('scroll', () => {
			refreshCarouselControls();
		});

		window.addEventListener('resize', () => {
			refreshCarouselControls();
		});

		prevButton.addEventListener('carousel:post-scroll', () => {
			refreshCarouselControls();
		});

		nextButton.addEventListener('carousel:post-scroll', () => {
			refreshCarouselControls();
		});
	} else {
		if (sectionType === 'grid') {
			const mediaOuter = document.createElement('div');
			mediaOuter.className = 'project-media-outer';
			const scrollHint = document.createElement('div');
			scrollHint.className = 'scroll-hint';
			scrollHint.setAttribute('aria-hidden', 'true');
			scrollHint.textContent = '›';
			mediaOuter.appendChild(mediaWrapper);
			mediaOuter.appendChild(scrollHint);
			sectionElement.appendChild(mediaOuter);
		} else {
			sectionElement.appendChild(mediaWrapper);
		}
	}

	if (section.description) {
		const description = document.createElement('p');
		description.className = 'project-section-description';
		description.innerHTML = section.description;
		sectionElement.appendChild(description);
	}

	const declaredMedia = Array.isArray(section.media) ? section.media : [];
	const indexedMedia = declaredMedia.length > 0 ? [] : getMediaFromPath(section.path, mediaIndex);
	const mediaFiles = declaredMedia.length > 0 ? declaredMedia : indexedMedia;

	mediaFiles.forEach((filePath) => {
		const altText = section.alt || section.label || 'project media';
		const mediaElement = createMediaElement(filePath, altText);
		mediaWrapper.appendChild(mediaElement);

		if (mediaElement.tagName === 'IMG') {
			mediaElement.classList.add('clickable-media');
			mediaElement.addEventListener('click', () => {
				const allImages = getAllOpenProjectImages();
				const src = mediaElement.currentSrc || mediaElement.src || mediaElement.getAttribute('src');
				const clickedIndex = allImages.indexOf(src);
				openImageLightbox(allImages, clickedIndex >= 0 ? clickedIndex : 0);
			});
		}

		if (refreshCarouselControls) {
			const updateOnMediaReady = () => {
				refreshCarouselControls();
			};

			if (mediaElement.tagName === 'IMG') {
				if (mediaElement.complete) {
					refreshCarouselControls();
				} else {
					mediaElement.addEventListener('load', updateOnMediaReady, { once: true });
					mediaElement.addEventListener('error', updateOnMediaReady, { once: true });
				}
			}

			if (mediaElement.tagName === 'VIDEO') {
				mediaElement.addEventListener('loadedmetadata', updateOnMediaReady, { once: true });
				mediaElement.addEventListener('error', updateOnMediaReady, { once: true });
			}
		}
	});

	if (refreshCarouselControls) {
		requestAnimationFrame(() => {
			refreshCarouselControls();
		});
	}

	if ((sectionType === 'carousel' || sectionType === 'grid') && mediaFiles.length <= 1) {
		const controls = sectionElement.querySelectorAll('.carousel-control');
		controls.forEach((control) => {
			control.disabled = true;
			control.setAttribute('aria-hidden', 'true');
		});
	}

	if (section.caption) {
		const caption = document.createElement('p');
		caption.className = 'project-section-caption';
		caption.innerHTML = section.caption;
		sectionElement.appendChild(caption);
	}

	return sectionElement;
}

function mergeProjectSectionsForMobile(sections) {
	if (!window.matchMedia('(max-width: 880px)').matches) return sections;
	const hasSingle = sections.some(s => (s.type || 'grid') === 'single');
	if (!hasSingle || sections.length <= 1) return sections;

	const allMedia = [];
	sections.forEach(s => {
		if (Array.isArray(s.media)) allMedia.push(...s.media);
	});
	return [{ label: '', type: 'carousel', media: allMedia }];
}

function renderProject(projectId, projectConfig, mediaIndex) {
	const projectContainer = document.getElementById(projectId);
	if (!projectContainer || !projectConfig) {
		return;
	}

	projectContainer.innerHTML = '';
	projectContainer.classList.add('project-container');

	const projectHeader = document.createElement('header');
	projectHeader.className = 'project-header';

	if (projectConfig.title) {
		const title = document.createElement('h2');
		title.className = 'project-title';
		title.textContent = projectConfig.title;
		projectHeader.appendChild(title);
	}

	if (projectConfig.meta) {
		const infoToggle = document.createElement('button');
		infoToggle.type = 'button';
		infoToggle.className = 'project-info-toggle';
		infoToggle.textContent = 'info';

		const meta = document.createElement('p');
		meta.className = 'project-meta';
		meta.hidden = true;
		meta.innerHTML = projectConfig.meta;

		infoToggle.addEventListener('click', () => {
			meta.hidden = !meta.hidden;
			infoToggle.classList.toggle('active', !meta.hidden);
		});

		projectHeader.appendChild(infoToggle);
		projectHeader.appendChild(meta);
	}

	if (projectHeader.childNodes.length > 0) {
		projectContainer.appendChild(projectHeader);
	}

	const rawSections = Array.isArray(projectConfig.sections) ? projectConfig.sections : [];
	const sections = mergeProjectSectionsForMobile(rawSections);
	sections.forEach((section) => {
		projectContainer.appendChild(renderProjectSection(section, mediaIndex));
	});
}

async function loadProjectConfig() {
	try {
		const response = await fetch('projects/project-config.json');
		if (!response.ok) {
			throw new Error(`Could not load project config (${response.status})`);
		}
		return await response.json();
	} catch (error) {
		console.warn(error.message);
		return { projects: {} };
	}
}

async function initializeProjectRendering() {
	const config = await loadProjectConfig();
	const mediaIndex = window.generatedProjectMediaIndex || {};
	const projects = config.projects || {};

	Object.keys(projects).forEach((projectId) => {
		renderProject(projectId, projects[projectId], mediaIndex);
	});
}

function setupProjectToggles() {
    const projectLinks = document.querySelectorAll('.selected-work-item');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
			const href = this.getAttribute('href') || '';
			const projectId = href.startsWith('#') ? href.substring(1) : href;

			if (!projectId.startsWith('project-')) {
				return;
			}

			e.preventDefault();
            const projectSection = document.getElementById(projectId);

            if (projectSection) {
				document.body.classList.add('menu-accessed');
                projectSection.classList.add('active');
                projectSection.querySelectorAll('.project-media').forEach(track => {
                    if (typeof track._refreshCarouselControls === 'function') {
                        requestAnimationFrame(() => track._refreshCarouselControls());
                    }
                });
                requestAnimationFrame(() => {
                    projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        });
    });
}

function setupArchiveMenu() {
	const archiveToggleLink = document.getElementById('archive-toggle-link');
	const archiveList = document.getElementById('archive-list');

	if (!archiveToggleLink || !archiveList) {
		return;
	}

	archiveToggleLink.addEventListener('click', function(event) {
		event.preventDefault();
		const isActive = archiveList.classList.toggle('active');
		archiveToggleLink.classList.toggle('active', isActive);
		archiveToggleLink.setAttribute('aria-expanded', String(isActive));
		archiveList.setAttribute('aria-hidden', String(!isActive));
	});
}

function setupNewsletterToggle() {
	const newsletterToggleLink = document.getElementById('newsletter-toggle-link');
	const newsletterSubscribeNote = document.getElementById('newsletter-subscribe-note');

	if (!newsletterToggleLink || !newsletterSubscribeNote) {
		return;
	}

	newsletterToggleLink.addEventListener('click', function(event) {
		event.preventDefault();
		const willShow = newsletterSubscribeNote.hidden;
		newsletterSubscribeNote.hidden = !willShow;
		newsletterToggleLink.setAttribute('aria-expanded', String(willShow));
	});
}

function setupHomeReset() {
	const homeTitle = document.querySelector('.containerone__textleft h1');
	if (!homeTitle) {
		return;
	}

	homeTitle.style.cursor = 'pointer';

	homeTitle.addEventListener('click', function() {
		document
			.querySelectorAll('#about-section, #research-section, #selected-work-section, .containertwo.active')
			.forEach((section) => {
				section.classList.remove('active');
			});

		const newsletterToggleLink = document.getElementById('newsletter-toggle-link');
		const newsletterSubscribeNote = document.getElementById('newsletter-subscribe-note');
		if (newsletterToggleLink && newsletterSubscribeNote) {
			newsletterSubscribeNote.hidden = true;
			newsletterToggleLink.setAttribute('aria-expanded', 'false');
		}

		const archiveToggleLink = document.getElementById('archive-toggle-link');
		const archiveList = document.getElementById('archive-list');
		if (archiveToggleLink && archiveList) {
			archiveToggleLink.classList.remove('active');
			archiveToggleLink.setAttribute('aria-expanded', 'false');
			archiveList.classList.remove('active');
			archiveList.setAttribute('aria-hidden', 'true');
		}

		document.body.classList.remove('menu-accessed');
		document.body.classList.remove('nav-section-open');
		closeImageLightbox();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
}

function setupInitialTextReveal() {
	const revealText = () => {
		window.setTimeout(() => {
			document.body.classList.remove('initial-text-hidden');
		}, 200);
	};

	if (document.readyState === 'complete') {
		revealText();
		return;
	}

	window.addEventListener('load', revealText, { once: true });
}

setupInitialTextReveal();
setupSectionToggles();
setupImageLightbox();
initializeProjectRendering();
setupProjectToggles();
setupArchiveMenu();
setupNewsletterToggle();
setupHomeReset();
