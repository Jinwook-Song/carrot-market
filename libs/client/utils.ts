export function cls(...classnames: string[]) {
  return classnames.join(' ');
}

export function fetcher(url: string) {
  return fetch(url).then((response) => response.json());
}
