import type { APIRequestContext } from '@playwright/test';

import { expect, Fixture, Given, Then, When, Step } from '@world';

import { setLastResponse } from '../utils/response-tracker';
import { ResponseVerifier } from '../utils/response-verifier';

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

@Fixture('CommentsService')
export class CommentsService {
  constructor(private request: APIRequestContext) {}

  private readonly commentsEndpoint = '/comments';
  private readonly commentByIdEndpoint = (id: number) => `/comments/${id}`;
  private readonly commentsByPostEndpoint = (postId: number) => `/posts/${postId}/comments`;

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
  private lastComments: Comment[] | undefined;
  private lastComment: Comment | undefined;

  @Given('I retrieve all comments')
  async getAllComments(): Promise<void> {
    const response = await this.request.get(this.commentsEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastComments = await response.json();
  }

  @Given('I retrieve comment with ID {int}')
  async getCommentById(id: number): Promise<void> {
    const response = await this.request.get(this.commentByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastComment = await response.json();
  }

  @Given('I retrieve comments for post {int}')
  async getCommentsByPost(postId: number): Promise<void> {
    const response = await this.request.get(this.commentsByPostEndpoint(postId));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastComments = await response.json();
  }

  @Given('comment with ID {int} exists')
  async verifyCommentExists(id: number): Promise<void> {
    await this.getCommentById(id);
  }

  @When('I create a new comment for post {int} with name {string} and body {string}')
  async createComment(postId: number, name: string, body: string): Promise<void> {
    const response = await this.request.post(this.commentsEndpoint, {
      data: { postId, name, email: 'test@example.com', body },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastComment = await response.json();
  }

  @When('I update comment {int} with body {string}')
  async updateComment(id: number, body: string): Promise<void> {
    const response = await this.request.put(this.commentByIdEndpoint(id), {
      data: { id, postId: 1, name: 'Updated', email: 'updated@example.com', body },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastComment = await response.json();
  }

  @When('I delete comment {int}')
  async deleteComment(id: number): Promise<void> {
    const response = await this.request.delete(this.commentByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of comments')
  async verifyCommentsList(): Promise<void> {
    if (!this.lastComments) {
      throw new Error('No comments retrieved. Call "I retrieve all comments" first.');
    }
    await this.iVerifyCommentsList(this.lastComments);
  }

  @Then('the comment should have ID {int}')
  async verifyCommentId(expectedId: number): Promise<void> {
    if (!this.lastComment) {
      throw new Error('No comment retrieved. Call "I retrieve comment with ID" first.');
    }
    await this.iVerifyCommentId(this.lastComment, expectedId);
  }

  @Then('the comment should have postId {int}')
  async verifyCommentPostId(expectedPostId: number): Promise<void> {
    if (!this.lastComment) {
      throw new Error('No comment retrieved. Perform a comment operation first.');
    }
    await this.iVerifyCommentPostId(this.lastComment, expectedPostId);
  }

  @Then('the comment should have body {string}')
  async verifyCommentBody(expectedBody: string): Promise<void> {
    if (!this.lastComment) {
      throw new Error('No comment retrieved. Perform a comment operation first.');
    }
    await this.iVerifyCommentBody(this.lastComment, expectedBody);
  }

  @Then('each comment should have id, postId, name, email, and body')
  async verifyCommentsStructure(): Promise<void> {
    if (!this.lastComments) {
      throw new Error('No comments retrieved. Call "I retrieve all comments" first.');
    }
    await this.iVerifyCommentsStructure(this.lastComments);
  }

  @Step
  private async iVerifyCommentsList(comments: Comment[]): Promise<void> {
    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyCommentId(comment: Comment, expectedId: number): Promise<void> {
    expect(comment).toHaveProperty('id');
    expect(comment.id).toBe(expectedId);
  }

  @Step
  private async iVerifyCommentPostId(comment: Comment, expectedPostId: number): Promise<void> {
    expect(comment).toHaveProperty('postId');
    expect(comment.postId).toBe(expectedPostId);
  }

  @Step
  private async iVerifyCommentBody(comment: Comment, expectedBody: string): Promise<void> {
    expect(comment).toHaveProperty('body');
    expect(comment.body).toBe(expectedBody);
  }

  @Step
  private async iVerifyCommentsStructure(comments: Comment[]): Promise<void> {
    for (const comment of comments) {
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('postId');
      expect(comment).toHaveProperty('name');
      expect(comment).toHaveProperty('email');
      expect(comment).toHaveProperty('body');
      expect(typeof comment.id).toBe('number');
      expect(typeof comment.postId).toBe('number');
      expect(typeof comment.name).toBe('string');
      expect(typeof comment.email).toBe('string');
      expect(typeof comment.body).toBe('string');
    }
  }
}
