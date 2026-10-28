/**
 * First-visit intro ("Science in motion").
 *
 * A tiny inline script in <head> decides — before the first paint — whether
 * the intro plays, so returning visitors never see a flash of it and visitors
 * without JavaScript never see it at all:
 *
 *   - public pages only (never /admin);
 *   - once per browser tab session (sessionStorage), so internal navigation
 *     and reloads in the same tab go straight to the page;
 *   - never when the visitor prefers reduced motion.
 *
 * It sets html[data-intro="play"]; CSS shows the overlay and runs the whole
 * timeline (about 2 s; any tap or key skips it). The overlay hides itself at
 * the end of its own CSS animation, IntroSplash removes the attribute when that
 * animation ends, and
 * the script's own timer removes it after INTRO_FAILSAFE_MS in case React
 * never loads — so the intro can never block the site.
 */

export const INTRO_KEY = "gpl-intro";
export const INTRO_FAILSAFE_MS = 3500;

export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(location.pathname.indexOf("/admin")===0)return;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("${INTRO_KEY}"))return;sessionStorage.setItem("${INTRO_KEY}","1");d.setAttribute("data-intro","play");setTimeout(function(){d.removeAttribute("data-intro")},${INTRO_FAILSAFE_MS})}catch(e){}})();`;
