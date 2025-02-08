export function getRecordsPerPage(url: URL) {
  const params = url.searchParams;
  const page = params.get("recordsPerPage");
  if (page) {
    return parseInt(page);
  }
  return 25;
}

export function getCurrentPage(url: URL) {
  const params = url.searchParams;
  const page = params.get("page");
  if (page) {
    return parseInt(page);
  }
  return 1;
}
