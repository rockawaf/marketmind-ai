function loadNews() {
  fetch(`https://finnhub.io/api/v1/news?category=general&token=${CONFIG.finnhubKey}`)
    .then(response => response.json())
    .then(data => {
      console.log("Finnhub news:", data);

      const newsContainer = document.getElementById("news-container");
      newsContainer.innerHTML = "";

      const topNews = data.slice(0, 5);
      marketState.newsHeadline = topNews[0].headline;
      generateAIInsight();

      for (const article of topNews) {
        const newsItem = document.createElement("div");

        newsItem.className = "news-card";

        newsItem.innerHTML = `
        <a href="${article.url}" target="_blank" class="news-link">

            <img src="${article.image}" class="news-image">

            <div class="news-content">
                <h3>${article.headline}</h3>

                <p>${article.summary}</p>

                <small>${article.source} • ${new Date(article.datetime * 1000).toLocaleDateString()}</small>

            </div>

        </a>
    `;
        

        newsContainer.appendChild(newsItem);
      }
    });
}
