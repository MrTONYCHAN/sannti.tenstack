const SPLASH_KEY = "saanti-splash-seen";

export function shouldShowSplash() {
  if (typeof window === "undefined") return false;
  return !sessionStorage.getItem(SPLASH_KEY);
}

export function markSplashSeen() {
  sessionStorage.setItem(SPLASH_KEY, "1");
}
