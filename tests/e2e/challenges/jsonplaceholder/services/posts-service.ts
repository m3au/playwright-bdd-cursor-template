import type { APIRequestContext } from '@playwright/test';

import { expect, Fixture, Given, Then, When, Step } from '@world';

import { setLastResponse, getLastResponse } from '../utils/response-tracker';
import { ResponseVerifier } from '../utils/response-verifier';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Fixture('PostsService')
export class PostsService {
  constructor(private request: APIRequestContext) {}

  private readonly postsEndpoint = '/posts';
  private readonly postByIdEndpoint = (id: number) => `/posts/${id}`;

  private lastResponse:
    | Awaited<
        ReturnType<
          | APIRequestContext['get']
          | APIRequestContext['post']
          | APIRequestContext['put']
          | APIRequestContext['delete']
        >
      >
    | undefined;
  private lastPosts: Post[] | undefined;
  private lastPost: Post | undefined;

  @Given('I retrieve all posts')
  async getAllPosts(): Promise<void> {
    const response = await this.request.get(this.postsEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPosts = await response.json();
  }

  @Given('I retrieve post with ID {int}')
  async getPostById(id: number): Promise<void> {
    const response = await this.request.get(this.postByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPost = await response.json();
  }

  @Given('post with ID {int} exists')
  async verifyPostExists(id: number): Promise<void> {
    await this.getPostById(id);
  }

  @When('I create a new post with title {string} and body {string}')
  async createPost(title: string, body: string): Promise<void> {
    const response = await this.request.post(this.postsEndpoint, {
      data: { title, body, userId: 1 },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastPost = await response.json();
  }

  @When('I update post {int} with title {string}')
  async updatePost(id: number, title: string): Promise<void> {
    const response = await this.request.put(this.postByIdEndpoint(id), {
      data: { id, title, body: 'Updated body', userId: 1 },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPost = await response.json();
  }

  @When('I delete post {int}')
  async deletePost(id: number): Promise<void> {
    const response = await this.request.delete(this.postByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of posts')
  async verifyPostsList(): Promise<void> {
    if (!this.lastPosts) {
      throw new Error('No posts retrieved. Call "I retrieve all posts" first.');
    }
    await this.iVerifyPostsList(this.lastPosts);
  }

  @Then('the response status should be {int}')
  async verifyResponseStatus(status: number): Promise<void> {
    const response = getLastResponse();
    if (!response) {
      throw new Error('No response available. Perform an API request first.');
    }
    await ResponseVerifier.verifyResponseStatus(response, status);
  }

  @Then('the post should have ID {int}')
  async verifyPostId(expectedId: number): Promise<void> {
    if (!this.lastPost) {
      throw new Error('No post retrieved. Call "I retrieve post with ID" first.');
    }
    await this.iVerifyPostId(this.lastPost, expectedId);
  }

  @Then('the post should have a title')
  async verifyPostHasTitle(): Promise<void> {
    if (!this.lastPost) {
      throw new Error('No post retrieved. Call "I retrieve post with ID" first.');
    }
    await this.iVerifyPostHasTitle(this.lastPost);
  }

  @Then('the post should have title {string}')
  async verifyPostTitle(expectedTitle: string): Promise<void> {
    if (!this.lastPost) {
      throw new Error('No post retrieved. Perform a post operation first.');
    }
    await this.iVerifyPostTitle(this.lastPost, expectedTitle);
  }

  @Then('the created post should have title {string}')
  async verifyCreatedPostTitle(expectedTitle: string): Promise<void> {
    if (!this.lastPost) {
      throw new Error('No post created. Call "I create a new post" first.');
    }
    await this.iVerifyPostTitle(this.lastPost, expectedTitle);
  }

  @Then('the created post should have body {string}')
  async verifyCreatedPostBody(expectedBody: string): Promise<void> {
    if (!this.lastPost) {
      throw new Error('No post created. Call "I create a new post" first.');
    }
    await this.iVerifyPostBody(this.lastPost, expectedBody);
  }

  @Then('each post should have id, title, body, and userId')
  async verifyPostsStructure(): Promise<void> {
    if (!this.lastPosts) {
      throw new Error('No posts retrieved. Call "I retrieve all posts" first.');
    }
    await this.iVerifyPostsStructure(this.lastPosts);
  }

  @Step
  private async iVerifyPostsList(posts: Post[]): Promise<void> {
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyPostId(post: Post, expectedId: number): Promise<void> {
    expect(post).toHaveProperty('id');
    expect(post.id).toBe(expectedId);
  }

  @Step
  private async iVerifyPostHasTitle(post: Post): Promise<void> {
    expect(post).toHaveProperty('title');
    expect(typeof post.title).toBe('string');
    expect(post.title.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyPostTitle(post: Post, expectedTitle: string): Promise<void> {
    expect(post).toHaveProperty('title');
    expect(post.title).toBe(expectedTitle);
  }

  @Step
  private async iVerifyPostBody(post: Post, expectedBody: string): Promise<void> {
    expect(post).toHaveProperty('body');
    expect(post.body).toBe(expectedBody);
  }

  @Step
  private async iVerifyPostsStructure(posts: Post[]): Promise<void> {
    for (const post of posts) {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('body');
      expect(post).toHaveProperty('userId');
      expect(typeof post.id).toBe('number');
      expect(typeof post.title).toBe('string');
      expect(typeof post.body).toBe('string');
      expect(typeof post.userId).toBe('number');
    }
  }
}
