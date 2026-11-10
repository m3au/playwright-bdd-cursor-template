import type { APIRequestContext } from '@playwright/test';

import { expect, Fixture, Given, Then, When, Step } from '@world';

import { setLastResponse } from '../utils/response-tracker';
import { ResponseVerifier } from '../utils/response-verifier';

export interface Photo {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

@Fixture('PhotosService')
export class PhotosService {
  constructor(private request: APIRequestContext) {}

  private readonly photosEndpoint = '/photos';
  private readonly photoByIdEndpoint = (id: number) => `/photos/${id}`;
  private readonly photosByAlbumEndpoint = (albumId: number) => `/albums/${albumId}/photos`;

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
  private lastPhotos: Photo[] | undefined;
  private lastPhoto: Photo | undefined;

  @Given('I retrieve all photos')
  async getAllPhotos(): Promise<void> {
    const response = await this.request.get(this.photosEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPhotos = await response.json();
  }

  @Given('I retrieve photo with ID {int}')
  async getPhotoById(id: number): Promise<void> {
    const response = await this.request.get(this.photoByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPhoto = await response.json();
  }

  @Given('I retrieve photos for album {int}')
  async getPhotosByAlbum(albumId: number): Promise<void> {
    const response = await this.request.get(this.photosByAlbumEndpoint(albumId));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPhotos = await response.json();
  }

  @Given('photo with ID {int} exists')
  async verifyPhotoExists(id: number): Promise<void> {
    await this.getPhotoById(id);
  }

  @When('I create a new photo for album {int} with title {string}')
  async createPhoto(albumId: number, title: string): Promise<void> {
    const response = await this.request.post(this.photosEndpoint, {
      data: {
        albumId,
        title,
        url: 'https://via.placeholder.com/600/92c952',
        thumbnailUrl: 'https://via.placeholder.com/150/92c952',
      },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastPhoto = await response.json();
  }

  @When('I update photo {int} with title {string}')
  async updatePhoto(id: number, title: string): Promise<void> {
    const response = await this.request.put(this.photoByIdEndpoint(id), {
      data: {
        id,
        albumId: 1,
        title,
        url: 'https://via.placeholder.com/600/92c952',
        thumbnailUrl: 'https://via.placeholder.com/150/92c952',
      },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPhoto = await response.json();
  }

  @When('I delete photo {int}')
  async deletePhoto(id: number): Promise<void> {
    const response = await this.request.delete(this.photoByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of photos')
  async verifyPhotosList(): Promise<void> {
    if (!this.lastPhotos) {
      throw new Error('No photos retrieved. Call "I retrieve all photos" first.');
    }
    await this.iVerifyPhotosList(this.lastPhotos);
  }

  @Then('the photo should have ID {int}')
  async verifyPhotoId(expectedId: number): Promise<void> {
    if (!this.lastPhoto) {
      throw new Error('No photo retrieved. Call "I retrieve photo with ID" first.');
    }
    await this.iVerifyPhotoId(this.lastPhoto, expectedId);
  }

  @Then('the photo should have title {string}')
  async verifyPhotoTitle(expectedTitle: string): Promise<void> {
    if (!this.lastPhoto) {
      throw new Error('No photo retrieved. Perform a photo operation first.');
    }
    await this.iVerifyPhotoTitle(this.lastPhoto, expectedTitle);
  }

  @Then('each photo should have id, albumId, title, url, and thumbnailUrl')
  async verifyPhotosStructure(): Promise<void> {
    if (!this.lastPhotos) {
      throw new Error('No photos retrieved. Call "I retrieve all photos" first.');
    }
    await this.iVerifyPhotosStructure(this.lastPhotos);
  }

  @Step
  private async iVerifyPhotosList(photos: Photo[]): Promise<void> {
    expect(Array.isArray(photos)).toBeTruthy();
    expect(photos.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyPhotoId(photo: Photo, expectedId: number): Promise<void> {
    expect(photo).toHaveProperty('id');
    expect(photo.id).toBe(expectedId);
  }

  @Step
  private async iVerifyPhotoTitle(photo: Photo, expectedTitle: string): Promise<void> {
    expect(photo).toHaveProperty('title');
    expect(photo.title).toBe(expectedTitle);
  }

  @Step
  private async iVerifyPhotosStructure(photos: Photo[]): Promise<void> {
    for (const photo of photos) {
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('albumId');
      expect(photo).toHaveProperty('title');
      expect(photo).toHaveProperty('url');
      expect(photo).toHaveProperty('thumbnailUrl');
      expect(typeof photo.id).toBe('number');
      expect(typeof photo.albumId).toBe('number');
      expect(typeof photo.title).toBe('string');
      expect(typeof photo.url).toBe('string');
      expect(typeof photo.thumbnailUrl).toBe('string');
    }
  }
}
