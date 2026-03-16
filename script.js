// Shared site script
// Initializes automatically based on which elements exist on the page.

(function () {
	// --- Index hover preview ---
	const previewImage = document.getElementById("preview-image");
	const menuLinks = document.querySelectorAll(
		".menu-one a[data-hover-image], .menu-two a[data-hover-image], .menu-three a[data-hover-image], .hover-trigger[data-hover-image]"
	);

	if (previewImage && menuLinks.length > 0) {
		const defaultSrc = previewImage.getAttribute("src") || "";

		menuLinks.forEach((link) => {
			const hoverSrc = link.getAttribute("data-hover-image");

			link.addEventListener("mouseenter", () => {
				if (hoverSrc) previewImage.src = hoverSrc;
			});
			link.addEventListener("mouseleave", () => {
				previewImage.src = defaultSrc;
			});
			link.addEventListener("focus", () => {
				if (hoverSrc) previewImage.src = hoverSrc;
			});
			link.addEventListener("blur", () => {
				previewImage.src = defaultSrc;
			});
		});
	}

	// --- Zoom overlay ---
	const zoomOverlay = document.createElement("div");
	zoomOverlay.className = "zoom-overlay";

	const prevBtn = document.createElement("button");
	prevBtn.className = "zoom-arrow zoom-arrow--prev";
	prevBtn.textContent = "previous";
	prevBtn.setAttribute("aria-label", "Previous image");

	const nextBtn = document.createElement("button");
	nextBtn.className = "zoom-arrow zoom-arrow--next";
	nextBtn.textContent = "next";
	nextBtn.setAttribute("aria-label", "Next image");

	const zoomImg = document.createElement("img");
	zoomImg.alt = "zoomed image";

	zoomOverlay.appendChild(prevBtn);
	zoomOverlay.appendChild(zoomImg);
	zoomOverlay.appendChild(nextBtn);
	document.body.appendChild(zoomOverlay);

	let zoomIndex = 0;

	function getGalleryImages() {
		return Array.from(document.querySelectorAll(".project-image")).filter(el => el.tagName === "IMG");
	}

	function showZoomIndex(index) {
		const imgs = getGalleryImages();
		if (!imgs.length) return;
		zoomIndex = ((index % imgs.length) + imgs.length) % imgs.length;
		zoomImg.src = imgs[zoomIndex].src;
	}

	prevBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		showZoomIndex(zoomIndex - 1);
	});

	nextBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		showZoomIndex(zoomIndex + 1);
	});

	zoomOverlay.addEventListener("click", (e) => {
		if (e.target === zoomOverlay) {
			zoomOverlay.classList.remove("active");
		}
	});

	document.addEventListener("keydown", (e) => {
		if (!zoomOverlay.classList.contains("active")) return;
		if (e.key === "Escape") zoomOverlay.classList.remove("active");
		if (e.key === "ArrowLeft") showZoomIndex(zoomIndex - 1);
		if (e.key === "ArrowRight") showZoomIndex(zoomIndex + 1);
	});

	document.addEventListener("click", (e) => {
		if (e.target.classList.contains("project-image") && e.target.tagName === "IMG") {
			e.preventDefault();
			const imgs = getGalleryImages();
			zoomIndex = imgs.indexOf(e.target);
			zoomImg.src = e.target.src;
			zoomOverlay.classList.add("active");
		}
	});

	// --- Project gallery ---
	if (typeof projectData !== "undefined") {
		const buttons = document.querySelectorAll(".menu-button");
		const infoBox = document.getElementById("project-info");
		const infoImagesBox = document.getElementById("project-info-images");
		const gallery = document.getElementById("project-gallery");

		function renderProject(projectKey) {
			const project = projectData[projectKey];
			if (!project) return;

			infoBox.innerHTML = "";
			if (project.info) {
				project.info.split("\n\n").forEach((paragraph) => {
					const text = document.createElement("p");
					text.textContent = paragraph;
					infoBox.appendChild(text);
				});
			}

			infoImagesBox.innerHTML = "";
			if (project.infoImages) {
				project.infoImages.forEach((src, i) => {
					const img = document.createElement("img");
					img.className = "info-image";
					img.src = src;
					img.alt = `info image ${i + 1}`;
					infoImagesBox.appendChild(img);
				});
			}

			buttons.forEach((button) => {
				button.classList.toggle("active", button.dataset.project === projectKey);
			});

			gallery.innerHTML = "";
			if (project.previews) {
				project.previews.forEach((preview, index) => {
					const link = document.createElement("a");
					link.href = preview.url;
					link.target = "_blank";
					const image = document.createElement("img");
					image.className = "project-image";
					image.src = preview.image;
					image.alt = `preview ${index + 1}`;
					link.appendChild(image);
					gallery.appendChild(link);
				});
			} else if (project.images) {
				project.images.forEach((source, index) => {
					if (source.endsWith(".mp4")) {
						const video = document.createElement("video");
						video.className = "project-image";
						video.src = source;
						video.autoplay = true;
						video.loop = true;
						video.muted = true;
						video.playsInline = true;
						gallery.appendChild(video);
					} else {
						const image = document.createElement("img");
						image.className = "project-image";
						image.src = source;
						image.alt = `${projectKey} image ${index + 1}`;
						gallery.appendChild(image);
					}
				});
			}
		}

		buttons.forEach((button) => {
			button.addEventListener("click", () => {
				renderProject(button.dataset.project);
			});
		});

		if (typeof autoRenderProject !== "undefined") {
			renderProject(autoRenderProject);
		}
	}
})();
