/* eslint-disable @typescript-eslint/no-var-requires */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { Role } from '../src/common/enums/role.enum';
import { CreateAuctionPayload } from '../src/auction/createAuction.payload';
import { AuctionStatus } from '../src/auction/auctionStatus.enum';
const Chance = require('chance');

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(httpServer).get('/').expect(200).expect('');
  });

  describe('Create user tests', () => {
    it('should create buyer', async () => {
      const chance = new Chance();
      const username = chance.name();
      const response = await request(httpServer)
        .post('/user')
        .send({ username, role: Role.BUYER });
      expect(response.status).toStrictEqual(201);
      expect(response.body.username).toStrictEqual(username);
      expect(response.body.role).toStrictEqual(Role.BUYER);
      expect(response.body.apiKey).toBeDefined();
    });

    it('should create seller', async () => {
      const chance = new Chance();
      const username = chance.name();
      const response = await request(httpServer)
        .post('/user')
        .send({ username, role: Role.SELLER });
      expect(response.status).toStrictEqual(201);
      expect(response.body.username).toStrictEqual(username);
      expect(response.body.role).toStrictEqual(Role.SELLER);
      expect(response.body.apiKey).toBeDefined();
    });
  });

  describe('Create auction tests', () => {
    it('should create auction by seller', async () => {
      const chance = new Chance();
      const username = chance.name();
      const {
        body: { apiKey },
      } = await request(httpServer)
        .post('/user')
        .send({ username, role: Role.SELLER });

      const payload: CreateAuctionPayload = {
        name: chance.name(),
        description: chance.paragraph(),
        minimumBid: chance.integer({ min: 1000, max: 2000 }),
        highestBid: chance.integer({ min: 8000, max: 10000 }),
      };
      const createAuctionResponse = await request(httpServer)
        .post('/auction')
        .set('X-API-KEY', apiKey)
        .send(payload);

      expect(createAuctionResponse.status).toStrictEqual(201);
      expect(createAuctionResponse.body.name).toStrictEqual(payload.name);
      expect(createAuctionResponse.body.highestBid).toStrictEqual(
        payload.highestBid,
      );
      expect(createAuctionResponse.body.minimumBid).toStrictEqual(
        payload.minimumBid,
      );
      expect(createAuctionResponse.body.description).toStrictEqual(
        payload.description,
      );

      expect(createAuctionResponse.body.status).toStrictEqual(
        AuctionStatus.OPEN,
      );
      expect(createAuctionResponse.body.platformCharge).toBeNull();
      expect(createAuctionResponse.body.sellerWinnings).toBeNull();
    });

    it('should fail when auction created by buyer', async () => {
      const chance = new Chance();
      const username = chance.name();
      const response = await request(httpServer)
        .post('/user')
        .send({ username, role: Role.BUYER });
      const apiKey = response.body.apiKey;

      const payload: CreateAuctionPayload = {
        name: chance.name(),
        description: chance.paragraph(),
        minimumBid: chance.integer({ min: 1000, max: 2000 }),
        highestBid: chance.integer({ min: 8000, max: 10000 }),
      };
      const createAuctionResponse = await request(httpServer)
        .post('/auction')
        .set('X-API-KEY', apiKey)
        .send(payload);

      expect(createAuctionResponse.status).toStrictEqual(403);
    });

    it('should fail when tried without api key', async () => {
      const chance = new Chance();
      const payload: CreateAuctionPayload = {
        name: chance.name(),
        description: chance.paragraph(),
        minimumBid: chance.integer({ min: 1000, max: 2000 }),
        highestBid: chance.integer({ min: 8000, max: 10000 }),
      };
      const createAuctionResponse = await request(httpServer)
        .post('/auction')
        .send(payload);

      expect(createAuctionResponse.status).toStrictEqual(401);
    });
  });

  describe('Place bid tests', () => {
    let buyerApiKey: string;
    let auctionId: string;
    const chance = new Chance();

    beforeAll(async () => {
      const {
        body: { apiKey: sellerApiKey },
      } = await request(httpServer)
        .post('/user')
        .send({ username: chance.name(), role: Role.SELLER });

      ({
        body: { apiKey: buyerApiKey },
      } = await request(httpServer)
        .post('/user')
        .send({ username: chance.name(), role: Role.BUYER }));

      const payload: CreateAuctionPayload = {
        name: chance.name(),
        description: chance.paragraph(),
        minimumBid: chance.integer({ min: 1000, max: 2000 }),
        highestBid: chance.integer({ min: 8000, max: 10000 }),
      };
      ({
        body: { id: auctionId },
      } = await request(httpServer)
        .post('/auction')
        .set('X-API-KEY', sellerApiKey)
        .send(payload));
    });

    it('should test placing bid on auction', async () => {
      const placeBidResponse = await request(httpServer)
        .post(`/auction/${auctionId}/bid`)
        .set('X-API-KEY', buyerApiKey)
        .send({
          amount: chance.integer({ min: 3000, max: 7000 }),
        });

      expect(placeBidResponse.status).toBe(201);
      expect(placeBidResponse.body).toBeDefined();
    });
  });
});
