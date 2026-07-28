(() => {
  const cmsOrigin = "https://simsiment-entertainment.djfjjd.chatgpt.site";
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
  const mediaUrl = (item) => item.imageUrl
    ? (item.imageUrl.startsWith("http") ? item.imageUrl : `${cmsOrigin}${item.imageUrl}`)
    : "";
  const media = (item, label) => {
    const url = mediaUrl(item);
    if (!url) return `<div class="placeholder" aria-label="${escapeHtml(label)} 이미지 준비 중"><span>SIMSI</span><i></i></div>`;
    if (/\.(mp4|webm|mov)$/i.test(item.imageKey || "")) {
      return `<video src="${escapeHtml(url)}" aria-label="${escapeHtml(label)}" autoplay muted loop playsinline></video>`;
    }
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(label)}">`;
  };
  const href = (item, fallback) => escapeHtml(item.link || fallback);

  fetch(`${cmsOrigin}/api/content`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("콘텐츠를 불러오지 못했습니다.");
      return response.json();
    })
    .then(({ items = [] }) => {
      const artists = items.filter((item) => item.type === "artist");
      const releases = items.filter((item) => item.type === "release");
      const news = items.filter((item) => item.type === "news");
      document.querySelector("#artist-count").textContent = `${String(artists.length).padStart(2, "0")} ARTISTS`;
      document.querySelector("#artist-grid").innerHTML = artists.map((item, index) => `
        <article class="artist-card">
          <div class="media-frame">${media(item, `${item.title} 프로필`)}<span class="number">${String(index + 1).padStart(2, "0")}</span></div>
          <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle)}</p><small>${escapeHtml(item.description)}</small></div>
        </article>`).join("");
      document.querySelector("#release-grid").innerHTML = releases.map((item) => `
        <a class="release-card" href="${href(item, "#releases")}">
          <div class="album-art">${media(item, `${item.title} 앨범 아트`)}</div>
          <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle)}</p><small>${escapeHtml(item.description)}</small>
        </a>`).join("");
      document.querySelector("#news-list").innerHTML = news.map((item) => `
        <a href="${href(item, "#news")}"><time>${escapeHtml(item.subtitle)}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><span>↗</span></a>
      `).join("");
    })
    .catch(() => {
      document.documentElement.dataset.contentStatus = "unavailable";
    });
})();
