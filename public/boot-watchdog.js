// If the app never mounts (entry script blocked, failed or threw), #root stays
// empty and the visitor sees a blank page. External, not inline: the CSP's
// script-src 'self' blocks inline scripts.
setTimeout(function () {
  var root = document.getElementById("root");
  if (!root || root.childElementCount) return;
  var msg = document.createElement("p");
  msg.style.cssText = "font:20px sans-serif;padding:2rem;color:inherit";
  msg.textContent = "Something went wrong loading the site. ";
  var link = document.createElement("a");
  link.href = "/";
  link.textContent = "Reload";
  link.style.color = "inherit";
  msg.appendChild(link);
  root.appendChild(msg);
  // No analytics call: PostHog ships in the same bundle that failed. Boot
  // failures show up as $pageview without a matching app_mounted.
}, 8000);
