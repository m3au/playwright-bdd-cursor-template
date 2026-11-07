import type { APIRequestContext } from '@playwright/test';

type ApiResponse = Awaited<
  ReturnType<
    | APIRequestContext['get']
    | APIRequestContext['post']
    | APIRequestContext['put']
    | APIRequestContext['delete']
  >
>;

let lastResponse: ApiResponse | undefined;

export function setLastResponse(response: ApiResponse): void {
  lastResponse = response;
}

export function getLastResponse(): ApiResponse | undefined {
  return lastResponse;
}

export function clearLastResponse(): void {
  lastResponse = undefined;
}
