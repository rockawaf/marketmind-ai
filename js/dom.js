const $ = (id) => document.getElementById(id);

function setText(id, text) {
  const element = $(id);

  if (element) {
    element.textContent = text;
  }
}

function setColor(id, color) {
  const element = $(id);

  if (element) {
    element.style.color = color;
  }
}

function setPercent(element, value) {
  if (!element) return;

  if (value > 0) {
    element.textContent = `🟢 +${value.toFixed(2)}%`;
    element.style.color = "lime";
  } else if (value < 0) {
    element.textContent = `🔴 ${value.toFixed(2)}%`;
    element.style.color = "red";
  } else {
    element.textContent = "0.00%";
    element.style.color = "white";
  }
}

function fetchJSON(url) {
  return fetch(url).then((response) => response.json());
}