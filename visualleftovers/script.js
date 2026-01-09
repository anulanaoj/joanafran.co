fetch("images.json")
  .then(res => res.json())
  .then(images => {
    const grid = document.getElementById("grid");

    images.forEach(img => {
      const item = document.createElement("div");
      item.className = "item";

      const image = document.createElement("img");
      image.src = img.thumb; // load thumbnail first
      image.loading = "lazy";

      const date = document.createElement("div");
      date.className = "date";
      date.textContent = img.date;

      // Click toggles date visibility
      item.addEventListener("click", () => {
        item.classList.toggle("show-date");
      });

      item.appendChild(image);
      item.appendChild(date);
      grid.appendChild(item);
    });
  })
  .catch(err => console.error("Error loading images.json", err));
