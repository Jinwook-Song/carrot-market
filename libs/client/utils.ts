export function cls(...classnames: string[]) {
  return classnames.join(' ');
}

export function fetcher(url: string) {
  return fetch(url).then((response) => response.json());
}

export const EMAIL_VALIDATION_CHECK = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export function prismaTranslate<T>(data: T) {
  return JSON.parse(JSON.stringify(data));
}
