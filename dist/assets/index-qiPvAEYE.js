(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={refresh:{prices:3e4,macro:3e4,trending:3e4,fearGreed:3e5,news:3e5}},t=e=>document.getElementById(e);function n(e,n){let r=t(e);r&&(r.textContent=n)}function r(e,n){let r=t(e);r&&(r.style.color=n)}function i(e,t){e&&(t>0?(e.textContent=`🟢 +${t.toFixed(2)}%`,e.style.color=`lime`):t<0?(e.textContent=`🔴 ${t.toFixed(2)}%`,e.style.color=`red`):(e.textContent=`0.00%`,e.style.color=`white`))}function a(e){return fetch(e).then(e=>e.json())}var o={btcChange:0,ethChange:0,fearGreed:0,fearLabel:``,newsHeadline:``,topStock:``};function s(){let e=document.getElementById(`market-summary`);if(!e)return;let t,n,r;t=o.btcChange>0&&o.ethChange>0?`Bitcoin and Ethereum are both gaining today.`:o.btcChange<0&&o.ethChange<0?`Bitcoin and Ethereum are both trading lower today.`:`Major cryptocurrencies are moving in different directions today.`,o.fearGreed>=75?(n=`Investor sentiment is extremely optimistic.`,r=`Markets appear comfortable taking on risk.`):o.fearGreed>=55?(n=`Overall market sentiment remains positive.`,r=`Buyers continue to show confidence.`):o.fearGreed>=45?(n=`Market sentiment is relatively balanced.`,r=`Investors are waiting for stronger signals.`):o.fearGreed>=25?(n=`Investors are becoming increasingly cautious.`,r=`Risk appetite is fading.`):(n=`Markets are experiencing extreme fear.`,r=`Investors are avoiding risk assets.`),e.innerHTML=`
   <p>${t}</p>

   <p>${n}</p>

   <ul>
     <li>📊 Fear & Greed Index: <strong>${o.fearGreed}</strong> (${o.fearLabel})</li>
     <li>📰 Top headline: ${o.newsHeadline}</li>
   </ul>

  <p>
  <strong>AI Outlook:</strong> ${r}
  </p>
  `}function c(){a(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd&include_24hr_change=true`).then(e=>{let n=Object.keys(e);for(let r of n){let n=e[r];if(typeof n?.usd!=`number`||typeof n?.usd_24h_change!=`number`)continue;let a=n.usd,o=n.usd_24h_change,s=t(r+`-price`),c=t(r+`-change`),l=t(`pulse-`+r+`-price`),u=t(`pulse-`+r+`-change`);s&&(s.textContent=`$`+a.toLocaleString()),l&&(l.textContent=`$`+a.toLocaleString()),i(c,o),i(u,o)}o.btcChange=e.bitcoin.usd_24h_change,o.ethChange=e.ethereum.usd_24h_change,s()}).catch(e=>{console.error(`Crypto loading error:`,e),n(`bitcoin-price`,`Unavailable`),n(`ethereum-price`,`Unavailable`),n(`dogecoin-price`,`Unavailable`),n(`pulse-bitcoin-price`,`Unavailable`),n(`pulse-ethereum-price`,`Unavailable`)})}function l(e){return a(`http://localhost:3000/api/quote?symbol=${encodeURIComponent(e)}`)}function u(e,a){l(e).then(n=>{if(!(typeof n.dp==`number`&&Number.isFinite(n.dp)))throw Error(`No valid quote data returned for ${e}`);for(let e of a)i(t(e),n.dp)}).catch(t=>{console.error(`${e} loading error:`,t);for(let e of a)n(e,`Unavailable`),r(e,`white`)})}function d(){u(`SPY`,[`sp500-value`,`pulse-sp500-value`])}function f(){u(`QQQ`,[`nasdaq-value`,`pulse-nasdaq-value`])}function p(){a(`https://api.alternative.me/fng/?limit=1`).then(e=>{let r=e?.data?.[0];if(!r)throw Error(`No Fear & Greed data returned`);let i=Number(r.value),a=r.value_classification;if(!Number.isFinite(i))throw Error(`Invalid Fear & Greed value`);o.fearGreed=i,o.fearLabel=a,n(`fear-value`,i),n(`fear-label`,a);let c=t(`fear-value`);c&&(i>=75?c.style.color=`lime`:i>=55?c.style.color=`#5CDB95`:i>=45?c.style.color=`gold`:i>=25?c.style.color=`orange`:c.style.color=`red`),s()}).catch(e=>{console.error(`Fear & Greed loading error:`,e),n(`fear-value`,`Unavailable`),n(`fear-label`,``)})}function m(){for(let e of[{symbol:`GLD`,id:`gold-price`},{symbol:`BNO`,id:`oil-price`},{symbol:`UUP`,id:`dxy-price`},{symbol:`VXX`,id:`vix-price`}])l(e.symbol).then(t=>{typeof t.c==`number`&&Number.isFinite(t.c)&&t.c>0?n(e.id,`$${t.c.toFixed(2)}`):n(e.id,`Unavailable`)}).catch(t=>{console.error(`${e.symbol} loading error:`,t),n(e.id,`Unavailable`)})}function h(){for(let e of[{symbol:`AAPL`,id:`aapl`},{symbol:`NVDA`,id:`nvda`},{symbol:`MSFT`,id:`msft`},{symbol:`GOOG`,id:`goog`}])l(e.symbol).then(r=>{let a=t(e.id+`-price`),o=t(e.id+`-change`);if(!a||!o)return;let s=typeof r.c==`number`&&Number.isFinite(r.c)&&r.c>0,c=typeof r.dp==`number`&&Number.isFinite(r.dp);if(!s||!c){n(e.id+`-price`,`Unavailable`),n(e.id+`-change`,``);return}n(e.id+`-price`,`$${r.c.toFixed(2)}`),i(o,r.dp)}).catch(t=>{console.error(`${e.symbol} loading error:`,t),n(e.id+`-price`,`Unavailable`),n(e.id+`-change`,``)})}function g(){a(`http://localhost:3000/api/news`).then(e=>{let n=t(`news-container`);if(!n)return;if(!Array.isArray(e)||e.length===0)throw Error(`No news articles returned`);n.innerHTML=``;let r=e.slice(0,5);o.newsHeadline=r[0].headline,s();for(let e of r){let t=document.createElement(`div`);t.className=`news-card`,t.innerHTML=`
          <a
            href="${e.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="news-link"
          >
            <img
              src="${e.image}"
              alt=""
              class="news-image"
            >

            <div class="news-content">
              <h3>${e.headline}</h3>
              <p>${e.summary}</p>

              <small>
                ${e.source} •
                ${new Date(e.datetime*1e3).toLocaleDateString()}
              </small>
            </div>
          </a>
        `,n.appendChild(t)}}).catch(e=>{console.error(`News loading error:`,e);let n=t(`news-container`);n&&(n.innerHTML=`<p>Market news is currently unavailable.</p>`)})}c(),d(),f(),g(),h(),p(),m(),setInterval(c,e.refresh.prices),setInterval(g,e.refresh.news),setInterval(p,e.refresh.fearGreed),setInterval(h,e.refresh.trending),setInterval(m,e.refresh.macro);