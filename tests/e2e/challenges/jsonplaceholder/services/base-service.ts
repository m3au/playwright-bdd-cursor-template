import type { APIRequestContext } from '@playwright/test';

type ApiResponse = Awaited<
  ReturnType<
    | APIRequestContext['get']
    | APIRequestContext['post']
    | APIRequestContext['put']
    | APIRequestContext['delete']
  >
>;

export abstract class BaseService {
  protected lastResponse: ApiResponse | undefined;

  constructor(protected request: APIRequestContext) {}
}
