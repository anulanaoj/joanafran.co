// Shared site script
// Initializes automatically based on which elements exist on the page.

(function () {
	const isMobile = window.matchMedia("(max-width: 1000px)").matches;

	// --- Archive works: auto-gallery from generated manifest ---
	const archiveGallery = document.querySelector(".gallery[data-auto-manifest]");
	if (archiveGallery) {
		const manifestPath = archiveGallery.getAttribute("data-auto-manifest");

		if (manifestPath) {
			fetch(manifestPath, { cache: "no-store" })
				.then((response) => {
					if (!response.ok) {
						throw new Error("Could not load archive image manifest");
					}
					return response.json();
				})
				.then((manifest) => {
					const folder = typeof manifest?.folder === "string" ? manifest.folder : "";
					const images = Array.isArray(manifest?.images) ? [...manifest.images] : [];

					for (let i = images.length - 1; i > 0; i -= 1) {
						const j = Math.floor(Math.random() * (i + 1));
						[images[i], images[j]] = [images[j], images[i]];
					}

					archiveGallery.innerHTML = "";
					if (!images.length) {
						archiveGallery.innerHTML = '<p class="gallery-empty">No images yet in archive_images.</p>';
						return;
					}

					images.forEach((name, index) => {
						const figure = document.createElement("figure");
						figure.className = "gallery-item";

						const alignments = ["start", "center", "end"];
						const align = alignments[Math.floor(Math.random() * alignments.length)];
						const widthPercent = 26 + Math.floor(Math.random() * 11);
						const offsetPercent = Math.floor(Math.random() * 12);

						figure.style.width = `${widthPercent}%`;
						figure.style.justifySelf = align;
						figure.style.marginLeft = "";
						figure.style.marginRight = "";
						if (align === "start") {
							figure.style.marginLeft = `${offsetPercent}%`;
						} else if (align === "end") {
							figure.style.marginRight = `${offsetPercent}%`;
						}

						const img = document.createElement("img");
						img.src = folder ? `${folder}/${name}` : name;
						img.alt = `Archive work ${index + 1}`;

						figure.appendChild(img);
						archiveGallery.appendChild(figure);
					});
				})
				.catch(() => {
					archiveGallery.innerHTML = '<p class="gallery-empty">Could not load archive-images.json.</p>';
				});
		}
	}

	// --- Mobile: open iframe links and CV in slide-up panel ---
	if (isMobile) {
		const slidePanel = document.getElementById("slide-panel");
		const slidePanelContent = document.getElementById("slide-panel-content");

		if (slidePanel && slidePanelContent) {
			let sTouchStartY = 0;
			let sTouchCurrentY = 0;
			let sIsDragging = false;

			function openSlidePanel(html) {
				slidePanelContent.innerHTML = html;
				slidePanel.style.display = "block";
				requestAnimationFrame(() => slidePanel.classList.add("slide-up"));
				document.body.style.overflow = "hidden";
			}

			function closeSlidePanel() {
				slidePanel.classList.remove("slide-up");
				slidePanel.style.transform = "";
				document.body.style.overflow = "";
				slidePanel.addEventListener("transitionend", function handler() {
					slidePanel.style.display = "none";
					slidePanelContent.innerHTML = "";
					slidePanel.removeEventListener("transitionend", handler);
				});
			}

			slidePanel.addEventListener("touchstart", (e) => {
				if (slidePanel.scrollTop <= 0) {
					sTouchStartY = e.touches[0].clientY;
					sIsDragging = true;
				}
			}, { passive: true });

			slidePanel.addEventListener("touchmove", (e) => {
				if (!sIsDragging) return;
				sTouchCurrentY = e.touches[0].clientY;
				const diff = sTouchCurrentY - sTouchStartY;
				if (diff > 0) {
					slidePanel.style.transition = "none";
					slidePanel.style.transform = `translateY(${diff}px)`;
				}
			}, { passive: true });

			slidePanel.addEventListener("touchend", () => {
				if (!sIsDragging) return;
				sIsDragging = false;
				slidePanel.style.transition = "";
				const diff = sTouchCurrentY - sTouchStartY;
				if (diff > 120) {
					closeSlidePanel();
				} else {
					slidePanel.style.transform = "";
					slidePanel.classList.add("slide-up");
				}
				sTouchStartY = 0;
				sTouchCurrentY = 0;
			}, { passive: true });

			// Intercept iframe links (visual leftovers, shouffle me)
			document.querySelectorAll("a[data-hover-iframe]").forEach(link => {
				link.addEventListener("click", (e) => {
					e.preventDefault();
					const src = link.getAttribute("href");
					openSlidePanel(`<iframe src="${src}" title="${link.textContent}"></iframe>`);
				});
			});

		}
	}

	// --- Index hover preview ---
	const previewImage = document.getElementById("preview-image");
	const previewIframe = document.getElementById("preview-iframe");
	const menuLinks = document.querySelectorAll(
		".menu-one a[data-hover-image], .menu-two a[data-hover-image], .menu-three a[data-hover-image], .menu-three a[data-hover-iframe], .menu-four a[data-hover-image], .hover-trigger[data-hover-image]"
	);

	if (previewImage && menuLinks.length > 0) {
		const defaultSrc = previewImage.getAttribute("src") || "";
		let iframeLocked = false;

		// Custom "click click" cursor for iframe links (desktop only)
		if (!isMobile) {
			const cursorLabel = document.createElement("span");
			cursorLabel.textContent = "click click";
			cursorLabel.style.cssText = "position:fixed;pointer-events:none;z-index:9999;font-size:0.8em;font-family:'Libertinus Mono',monospace;color:rgb(66,66,66);display:none;";
			document.body.appendChild(cursorLabel);

			const clickClickTargets = document.querySelectorAll("a[data-hover-iframe], #cv-link");
			clickClickTargets.forEach((link) => {
				link.addEventListener("mouseenter", () => { cursorLabel.style.display = "block"; });
				link.addEventListener("mouseleave", () => { cursorLabel.style.display = "none"; });
				link.addEventListener("mousemove", (e) => {
					cursorLabel.style.left = (e.clientX + 12) + "px";
					cursorLabel.style.top = (e.clientY + 2) + "px";
				});
			});

			const newTabCursorLabel = document.createElement("span");
			newTabCursorLabel.textContent = "opens in new tab";
			newTabCursorLabel.style.cssText = "position:fixed;pointer-events:none;z-index:9999;font-size:0.8em;font-family:'Libertinus Mono',monospace;color:rgb(66,66,66);display:none;";
			document.body.appendChild(newTabCursorLabel);

			const newTabLinks = document.querySelectorAll("a[data-new-tab-label='true']");
			newTabLinks.forEach((link) => {
				link.addEventListener("mouseenter", () => { newTabCursorLabel.style.display = "block"; });
				link.addEventListener("mouseleave", () => { newTabCursorLabel.style.display = "none"; });
				link.addEventListener("mousemove", (e) => {
					newTabCursorLabel.style.left = (e.clientX + 12) + "px";
					newTabCursorLabel.style.top = (e.clientY + 2) + "px";
				});
			});
		}

		function showIframe(src) {
			if (!previewIframe) return;
			previewIframe.src = src;
			previewIframe.classList.add("active");
			previewImage.style.display = "none";
		}

		function hideIframe() {
			if (!previewIframe || iframeLocked) return;
			previewIframe.classList.remove("active");
			previewIframe.src = "";
			previewImage.style.display = "";
		}

		menuLinks.forEach((link) => {
			const hoverSrc = link.getAttribute("data-hover-image");
			const iframeSrc = link.getAttribute("data-hover-iframe");

			if (iframeSrc) {
				link.addEventListener("click", (e) => {
					e.preventDefault();
					iframeLocked = true;
					showIframe(iframeSrc);
				});
			}

			link.addEventListener("mouseenter", () => {
				if (iframeSrc) {
					showIframe(iframeSrc);
				} else if (hoverSrc) {
					if (iframeLocked) {
						iframeLocked = false;
					}
					hideIframe();
					previewImage.src = hoverSrc;
				}
			});
			link.addEventListener("mouseleave", () => {
				if (!iframeLocked) {
					hideIframe();
					previewImage.src = defaultSrc;
				}
			});
			link.addEventListener("focus", () => {
				if (iframeSrc) {
					showIframe(iframeSrc);
				} else if (hoverSrc) {
					if (iframeLocked) {
						iframeLocked = false;
					}
					hideIframe();
					previewImage.src = hoverSrc;
				}
			});
			link.addEventListener("blur", () => {
				if (!iframeLocked) {
					hideIframe();
					previewImage.src = defaultSrc;
				}
			});
		});
	}

	// --- CV preview ---
	const cvLink = document.getElementById("cv-link");
	const previewText = document.getElementById("preview-text");
	if (cvLink && previewText && previewImage) {
		const cvContent = `<b>Education</b><br>
2019-2021. Royal Academy of Art, The Hague<br>
2021-2023. AkiArtez Academy of Art and Design, Enschede<br>
2023-2025. Frank Mohr Institute, Groningen<br><br>

<b>Exhibitions</b><br><br>
<i>Individual</i><br>
2021. Of Inside Of, Cultural Institute of Ponta Delgada, A\u00e7ores<br><br>

<i>Collective</i><br>
2025. Frank Mohr Institute graduation show (On Touch,), NP3 . Re:Search:Gallery, Groningen<br>
2025. RE:Store #4, NP3 . Re:Search:Gallery, Groningen<br>
2025. RE:Store #3, NP3 . Re:Search:Gallery, Groningen<br>
2025. RE:Store #1, NP3 . Re:Search:Gallery, Groningen<br>
2024. Sometimes It Snows in April, Galerie Pouloeuff, Naarden<br>
2023. Alter House Opening, I'm Studio, Amsterdam<br>
2023. Fresh Cacao, De Cacao Fabriek, Helmond<br>
2023. AKI graduation show ('Assuming Material Form'), AKI ArtEZ, Enschede<br>
2023. RMTxAKI, Rijksmuseum Twenthe, Enschede<br>
2021. Wind Polinators, SoZa, The Hague<br>
2020. We Never Say Never, VAGA, Ponta Delgada<br><br>

<b>Articles</b><br>
2025. Metropolis M, Graduation Magazine, Eva Waterbolk<br>
2024. Liter 112, Maarten Buser<br>
2024. De Lage Landen, Maarten Buser<br><br>

<b>Awards</b><br>
2023. Nominated Carat Lucas Gassel-Prijs<br>
2019. (Residency) Young Creators Award, Walk&Talk Azores`;

		let cvVisible = false;

		cvLink.addEventListener("click", () => {
			if (isMobile) {
				const slidePanel = document.getElementById("slide-panel");
				const slidePanelContent = document.getElementById("slide-panel-content");
				if (slidePanel && slidePanelContent) {
					slidePanelContent.innerHTML = '<div style="line-height:1.6;">' + cvContent + '</div>';
					slidePanel.style.display = "block";
					requestAnimationFrame(() => slidePanel.classList.add("slide-up"));
					document.body.style.overflow = "hidden";
				}
				return;
			}
			if (cvVisible) {
				previewText.classList.remove("active");
				previewText.innerHTML = "";
				previewImage.style.display = "";
				cvVisible = false;
			} else {
				previewImage.style.display = "none";
				if (previewIframe) {
					previewIframe.classList.remove("active");
					previewIframe.src = "";
				}
				previewText.innerHTML = cvContent;
				previewText.classList.add("active");
				cvVisible = true;
			}
		});

		// Hide CV when hovering other menu items
		menuLinks.forEach((link) => {
			link.addEventListener("mouseenter", () => {
				if (cvVisible) {
					previewText.classList.remove("active");
					previewText.innerHTML = "";
					cvVisible = false;
				}
			});
		});
	}

	// --- Zoom overlay (only on pages with gallery images) ---
	if (typeof projectData !== "undefined" && typeof noZoom === "undefined") {
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

	const zoomMedia = document.createElement("div");
	zoomMedia.className = "zoom-media";

	zoomOverlay.appendChild(prevBtn);
	zoomOverlay.appendChild(zoomMedia);
	zoomOverlay.appendChild(nextBtn);
	document.body.appendChild(zoomOverlay);

	let zoomIndex = 0;

	function getGalleryMedia() {
		return Array.from(document.querySelectorAll(".project-image")).filter(el => el.tagName === "IMG" || el.tagName === "VIDEO");
	}

	function showZoomIndex(index) {
		const items = getGalleryMedia();
		if (!items.length) return;
		zoomIndex = ((index % items.length) + items.length) % items.length;
		const source = items[zoomIndex];
		zoomMedia.innerHTML = "";
		if (source.tagName === "VIDEO") {
			const video = document.createElement("video");
			video.src = source.src;
			video.controls = true;
			video.autoplay = true;
			video.loop = true;
			video.playsInline = true;
			zoomMedia.appendChild(video);
		} else {
			const img = document.createElement("img");
			img.src = source.src;
			img.alt = "zoomed image";
			zoomMedia.appendChild(img);
		}
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
		if (e.target.classList.contains("project-image") && (e.target.tagName === "IMG" || e.target.tagName === "VIDEO")) {
			e.preventDefault();
			const items = getGalleryMedia();
			zoomIndex = items.indexOf(e.target);
			showZoomIndex(zoomIndex);
			zoomOverlay.classList.add("active");
		}
	});
	} // end zoom overlay guard

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
			if (project.iframe) {
				const iframe = document.createElement("iframe");
				iframe.src = project.iframe;
				iframe.className = "project-iframe";
				iframe.title = "project preview";
				gallery.appendChild(iframe);
			} else if (project.previews) {
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

		// --- Index page: project links in main menu ---
		const projectLinks = document.querySelectorAll(".menu-one a[data-project], .menu-two a[data-project]");
		const indexProjectView = document.getElementById("index-project-view");
		const gridRight = document.querySelector(".grid-right");

		if (projectLinks.length > 0 && indexProjectView) {
			// --- Mobile: slide-up panel with swipe-down to dismiss ---
			if (isMobile) {
				let touchStartY = 0;
				let touchCurrentY = 0;
				let isDragging = false;

				function openPanel(projectKey) {
					indexProjectView.style.display = "block";
					renderProject(projectKey);
					requestAnimationFrame(() => {
						indexProjectView.classList.add("slide-up");
					});
					document.body.style.overflow = "hidden";
				}

				function closePanel() {
					indexProjectView.classList.remove("slide-up");
					indexProjectView.style.transform = "";
					projectLinks.forEach(l => l.classList.remove("active"));
					document.body.style.overflow = "";
					indexProjectView.addEventListener("transitionend", function handler() {
						indexProjectView.style.display = "none";
						indexProjectView.removeEventListener("transitionend", handler);
					});
				}

				indexProjectView.addEventListener("touchstart", (e) => {
					if (indexProjectView.scrollTop <= 0) {
						touchStartY = e.touches[0].clientY;
						isDragging = true;
					}
				}, { passive: true });

				indexProjectView.addEventListener("touchmove", (e) => {
					if (!isDragging) return;
					touchCurrentY = e.touches[0].clientY;
					const diff = touchCurrentY - touchStartY;
					if (diff > 0) {
						indexProjectView.style.transition = "none";
						indexProjectView.style.transform = `translateY(${diff}px)`;
					}
				}, { passive: true });

				indexProjectView.addEventListener("touchend", () => {
					if (!isDragging) return;
					isDragging = false;
					indexProjectView.style.transition = "";
					const diff = touchCurrentY - touchStartY;
					if (diff > 120) {
						closePanel();
					} else {
						indexProjectView.style.transform = "";
						indexProjectView.classList.add("slide-up");
					}
					touchStartY = 0;
					touchCurrentY = 0;
				}, { passive: true });

				projectLinks.forEach(link => {
					link.addEventListener("click", (e) => {
						e.preventDefault();
						const projectKey = link.dataset.project;
						if (!projectData[projectKey]) return;
						projectLinks.forEach(l => l.classList.remove("active"));
						link.classList.add("active");
						openPanel(projectKey);
					});
				});
			} else {
			// --- Desktop: toggle in right column ---
			projectLinks.forEach(link => {
				link.addEventListener("click", (e) => {
					e.preventDefault();
					const projectKey = link.dataset.project;
					if (!projectData[projectKey]) return;

					const wasActive = link.classList.contains("active");
					projectLinks.forEach(l => l.classList.remove("active"));

					if (wasActive) {
						indexProjectView.style.display = "none";
						if (gridRight) gridRight.style.display = "";
						return;
					}

					link.classList.add("active");
					if (gridRight) gridRight.style.display = "none";
					indexProjectView.style.display = "block";
					renderProject(projectKey);
				});
			});
			} // end mobile/desktop branch
		}

		if (typeof autoRenderProject !== "undefined") {
			renderProject(autoRenderProject);
		}
	}
})();
