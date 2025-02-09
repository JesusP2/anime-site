export function getRecordsPerPage(searchParams: URLSearchParams) {
  const page = searchParams.get("recordsPerPage");
  if (page) {
    return parseInt(page);
  }
  return 25;
}

export function getCurrentPage(searchParams: URLSearchParams) {
  const page =  searchParams.get("page");
  if (page) {
    return parseInt(page);
  }
  return 1;
}
