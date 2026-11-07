import type { APIRequestContext } from '@playwright/test';

import { expect, Fixture, Given, Then, When, Step } from '@world';

import { setLastResponse } from '../utils/response-tracker';
import { ResponseVerifier } from '../utils/response-verifier';

export interface Album {
  id: number;
  userId: number;
  title: string;
}

@Fixture('AlbumsService')
export class AlbumsService {
  constructor(private request: APIRequestContext) {}

  private readonly albumsEndpoint = '/albums';
  private readonly albumByIdEndpoint = (id: number) => `/albums/${id}`;
  private readonly albumsByUserEndpoint = (userId: number) => `/users/${userId}/albums`;

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
  private lastAlbums: Album[] | undefined;
  private lastAlbum: Album | undefined;

  @Given('I retrieve all albums')
  async getAllAlbums(): Promise<void> {
    const response = await this.request.get(this.albumsEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastAlbums = await response.json();
  }

  @Given('I retrieve album with ID {int}')
  async getAlbumById(id: number): Promise<void> {
    const response = await this.request.get(this.albumByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastAlbum = await response.json();
  }

  @Given('I retrieve albums for user {int}')
  async getAlbumsByUser(userId: number): Promise<void> {
    const response = await this.request.get(this.albumsByUserEndpoint(userId));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastAlbums = await response.json();
  }

  @Given('album with ID {int} exists')
  async verifyAlbumExists(id: number): Promise<void> {
    await this.getAlbumById(id);
  }

  @When('I create a new album for user {int} with title {string}')
  async createAlbum(userId: number, title: string): Promise<void> {
    const response = await this.request.post(this.albumsEndpoint, {
      data: { userId, title },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastAlbum = await response.json();
  }

  @When('I update album {int} with title {string}')
  async updateAlbum(id: number, title: string): Promise<void> {
    const response = await this.request.put(this.albumByIdEndpoint(id), {
      data: { id, userId: 1, title },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastAlbum = await response.json();
  }

  @When('I delete album {int}')
  async deleteAlbum(id: number): Promise<void> {
    const response = await this.request.delete(this.albumByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of albums')
  async verifyAlbumsList(): Promise<void> {
    if (!this.lastAlbums) {
      throw new Error('No albums retrieved. Call "I retrieve all albums" first.');
    }
    await this.iVerifyAlbumsList(this.lastAlbums);
  }

  @Then('the album should have ID {int}')
  async verifyAlbumId(expectedId: number): Promise<void> {
    if (!this.lastAlbum) {
      throw new Error('No album retrieved. Call "I retrieve album with ID" first.');
    }
    await this.iVerifyAlbumId(this.lastAlbum, expectedId);
  }

  @Then('the album should have title {string}')
  async verifyAlbumTitle(expectedTitle: string): Promise<void> {
    if (!this.lastAlbum) {
      throw new Error('No album retrieved. Perform an album operation first.');
    }
    await this.iVerifyAlbumTitle(this.lastAlbum, expectedTitle);
  }

  @Then('each album should have id, userId, and title')
  async verifyAlbumsStructure(): Promise<void> {
    if (!this.lastAlbums) {
      throw new Error('No albums retrieved. Call "I retrieve all albums" first.');
    }
    await this.iVerifyAlbumsStructure(this.lastAlbums);
  }

  @Step
  private async iVerifyAlbumsList(albums: Album[]): Promise<void> {
    expect(Array.isArray(albums)).toBeTruthy();
    expect(albums.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyAlbumId(album: Album, expectedId: number): Promise<void> {
    expect(album).toHaveProperty('id');
    expect(album.id).toBe(expectedId);
  }

  @Step
  private async iVerifyAlbumTitle(album: Album, expectedTitle: string): Promise<void> {
    expect(album).toHaveProperty('title');
    expect(album.title).toBe(expectedTitle);
  }

  @Step
  private async iVerifyAlbumsStructure(albums: Album[]): Promise<void> {
    for (const album of albums) {
      expect(album).toHaveProperty('id');
      expect(album).toHaveProperty('userId');
      expect(album).toHaveProperty('title');
      expect(typeof album.id).toBe('number');
      expect(typeof album.userId).toBe('number');
      expect(typeof album.title).toBe('string');
    }
  }
}
