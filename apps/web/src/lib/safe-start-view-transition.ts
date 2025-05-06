export function safeStartViewTransition(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  return document.startViewTransition(callback);
}
