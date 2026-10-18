import * as pdfjsLib from './vendor/pdfjs/pdf.min.mjs';

const pdfjsAssets = new URL('./vendor/pdfjs/', import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', pdfjsAssets).href;

export async function initializePdfViewer(viewer, source) {
	const pagesContainer = viewer.querySelector('.project-pdf-pages');
	const pageCount = viewer.querySelector('.project-pdf-page-count');
	const previousButton = viewer.querySelector('[data-pdf-action="previous"]');
	const nextButton = viewer.querySelector('[data-pdf-action="next"]');
	const pages = [];
	let currentPage = 1;

	const updateControls = () => {
		pageCount.textContent = `${currentPage} / ${pages.length}`;
		previousButton.disabled = currentPage <= 1;
		nextButton.disabled = currentPage >= pages.length;
	};

	const navigateToPage = (pageNumber) => {
		const page = Math.max(1, Math.min(pages.length, pageNumber));
		if (pages[page - 1]) {
			pagesContainer.scrollTo({
				top: pages[page - 1].element.offsetTop - 16,
				behavior: 'smooth',
			});
		}
	};

	previousButton.addEventListener('click', () => navigateToPage(currentPage - 1));
	nextButton.addEventListener('click', () => navigateToPage(currentPage + 1));

	try {
		const loadingTask = pdfjsLib.getDocument({
			url: new URL(source, document.baseURI).href,
			cMapUrl: new URL('cmaps/', pdfjsAssets).href,
			cMapPacked: true,
			iccUrl: new URL('iccs/', pdfjsAssets).href,
			standardFontDataUrl: new URL('standard_fonts/', pdfjsAssets).href,
			wasmUrl: new URL('wasm/', pdfjsAssets).href,
		});
		const pdf = await loadingTask.promise;

		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
			const page = await pdf.getPage(pageNumber);
			const baseViewport = page.getViewport({ scale: 1 });
			const element = document.createElement('div');
			element.className = 'project-pdf-page';
			element.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`;

			const canvas = document.createElement('canvas');
			canvas.className = 'project-pdf-canvas';
			canvas.setAttribute('aria-hidden', 'true');

			const textLayer = document.createElement('div');
			textLayer.className = 'textLayer project-pdf-text-layer';

			element.append(canvas, textLayer);
			pagesContainer.appendChild(element);
			pages.push({
				page,
				baseViewport,
				element,
				canvas,
				textLayer,
				renderedWidth: 0,
				rendering: false,
				rerender: false,
			});
		}

		const renderPage = async (page) => {
			if (page.rendering) {
				page.rerender = true;
				return;
			}

			const styles = getComputedStyle(pagesContainer);
			const width = pagesContainer.clientWidth -
				parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
			if (!width || page.renderedWidth === width) return;

			page.rendering = true;
			try {
				const scale = Math.min(1, width / page.baseViewport.width);
				const viewport = page.page.getViewport({ scale });
				const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
				page.canvas.width = Math.ceil(viewport.width * pixelRatio);
				page.canvas.height = Math.ceil(viewport.height * pixelRatio);
				page.canvas.style.width = `${viewport.width}px`;
				page.canvas.style.height = `${viewport.height}px`;
				page.element.style.width = `${viewport.width}px`;
				page.element.style.height = `${viewport.height}px`;
				page.textLayer.style.width = `${viewport.width}px`;
				page.textLayer.style.height = `${viewport.height}px`;
				page.textLayer.style.setProperty('--total-scale-factor', scale);
				page.textLayer.replaceChildren();

				const context = page.canvas.getContext('2d');
				const renderTask = page.page.render({
					canvas: page.canvas,
					canvasContext: context,
					viewport,
					transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
				}).promise;
				const textLayerTask = page.page.getTextContent().then((textContent) =>
					new pdfjsLib.TextLayer({
						textContentSource: textContent,
						container: page.textLayer,
						viewport,
					}).render()
				);
				await Promise.all([renderTask, textLayerTask]);
				page.renderedWidth = width;
			} catch (error) {
				console.error(`Could not render PDF page ${pages.indexOf(page) + 1}:`, error);
				page.element.classList.add('project-pdf-page-error');
			} finally {
				page.rendering = false;
				if (page.rerender) {
					page.rerender = false;
					page.renderedWidth = 0;
					void renderPage(page);
				}
			}
		};

		const renderVisiblePages = () => {
			const scrollTop = pagesContainer.scrollTop;
			const buffer = pagesContainer.clientHeight;
			pages.forEach((page) => {
				const top = page.element.offsetTop;
				const bottom = top + page.element.offsetHeight;
				if (bottom >= scrollTop - buffer &&
					top <= scrollTop + pagesContainer.clientHeight + buffer) {
					void renderPage(page);
				}
			});
		};

		const updateCurrentPage = () => {
			const containerTop = pagesContainer.getBoundingClientRect().top;
			const visiblePage = pages.findIndex((page) =>
				page.element.getBoundingClientRect().bottom > containerTop + 16
			);
			if (visiblePage >= 0) {
				currentPage = visiblePage + 1;
				updateControls();
			}
		};

		pagesContainer.addEventListener('scroll', () => {
			updateCurrentPage();
			renderVisiblePages();
		}, { passive: true });
		const resizeObserver = new ResizeObserver(() => {
			const styles = getComputedStyle(pagesContainer);
			const width = pagesContainer.clientWidth -
				parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
			pages.forEach((page) => {
				if (page.renderedWidth && Math.abs(page.renderedWidth - width) > 1) {
					void renderPage(page);
				}
			});
			renderVisiblePages();
		});
		resizeObserver.observe(pagesContainer);

		updateControls();
		renderVisiblePages();
	} catch (error) {
		pageCount.textContent = 'Could not load PDF';
		console.error('Could not load project PDF:', error);
	}
}
