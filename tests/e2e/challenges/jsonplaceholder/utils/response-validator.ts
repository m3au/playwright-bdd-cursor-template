import { expect } from '@world';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export function validatePostResponse(post: Post): void {
  expect(post).toHaveProperty('id');
  expect(post).toHaveProperty('title');
  expect(post).toHaveProperty('body');
  expect(post).toHaveProperty('userId');
  expect(typeof post.id).toBe('number');
  expect(typeof post.title).toBe('string');
  expect(typeof post.body).toBe('string');
  expect(typeof post.userId).toBe('number');
}

export function validatePostsArray(posts: Post[]): void {
  expect(Array.isArray(posts)).toBeTruthy();
  expect(posts.length).toBeGreaterThan(0);
  for (const post of posts) {
    validatePostResponse(post);
  }
}
