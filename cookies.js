const cookieBanner = document.getElementById("cookie-banner");
const acceptButton = document.getElementById("cookie-accept");
const declineButton = document.getElementById("cookie-decline");

const cookieChoice = localStorage.getItem("kielo_cookie_choice");

let analyticsLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;

  // Microsoft Clarity
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", "YOUR_CLARITY_PROJECT_ID");

  // Google Analytics
  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id="G-XXXXXXXXXX";
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", "G-17QVK7HG47");
}

if (cookieChoice === "accepted") {
  loadAnalytics();
}

if (!cookieChoice && cookieBanner) {
  cookieBanner.classList.add("show");
}

acceptButton?.addEventListener("click", () => {
  localStorage.setItem("kielo_cookie_choice", "accepted");
  cookieBanner.classList.remove("show");
  loadAnalytics();
});

declineButton?.addEventListener("click", () => {
  localStorage.setItem("kielo_cookie_choice", "declined");
  cookieBanner.classList.remove("show");
});