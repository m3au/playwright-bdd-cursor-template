import type { Post } from '../services/posts-service';

export const PostDataGenerator = {
  generatePost(overrides?: Partial<Post>): Omit<Post, 'id'> {
    return {
      title: `Test Post Title ${Date.now()}`,
      body: `Test Post Body ${Date.now()}`,
      userId: 1,
      ...overrides,
    };
  },
};
