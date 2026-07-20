import { marketState } from "./state.js";
import { $, fetchJSON } from "./dom.js";


export function loadNews() {
  fetchJSON("http://localhost:3000/api/news")
    .then(data => {
      const newsContainer = $("news-container");

      if (!newsContainer) return;

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No news articles returned");
      }

      newsContainer.innerHTML = "";

      const topNews = data.slice(0, 5);

      marketState.newsHeadline = topNews[0].headline;
      

      for (const article of topNews) {
        const newsItem = document.createElement("div");

        newsItem.className = "news-card";

        newsItem.innerHTML = `
          <a
            href="${article.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="news-link"
          >
            <img
              src="${article.image}"
              alt=""
              class="news-image"
            >

            <div class="news-content">
              <h3>${article.headline}</h3>
              <p>${article.summary}</p>

              <small>
                ${article.source} •
                ${new Date(article.datetime * 1000).toLocaleDateString()}
              </small>
            </div>
          </a>
        `;

        newsContainer.appendChild(newsItem);
      }
    })
    .catch(error => {
      console.error("News loading error:", error);

      const newsContainer = $("news-container");

      if (newsContainer) {
        newsContainer.innerHTML =
          "<p>Market news is currently unavailable.</p>";
      }
    });
}