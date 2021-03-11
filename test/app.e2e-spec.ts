/* eslint-disable @typescript-eslint/no-var-requires */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { Role } from '../src/common/enums/role.enum';
import { CreateAuctionPayload } from '../src/auction/createAuction.payload';
import { AuctionStatus } from '../src/auction/auctionStatus.enum';

const Chance = require('chance');

async function placeBid(
  httpServer: any,
  auctionId: number,
  buyerApiKey: string,
  amount?: number,
) {
  const chance = new Chance();
  return request(httpServer)
    .post(`/auction/${auctionId}/bid`)
    .set('X-API-KEY', buyerApiKey)
    .send({
      amount: amount || chance.integer({ min: 3000, max: 7000 }),
    });
}

async function updateBid(
  httpServer: any,
  auctionId: number,
  buyerApiKey: string,
  amount?: number,
) {
  const chance = new Chance();
  return request(httpServer)
    .put(`/auction/${auctionId}/bid`)
    .set('X-API-KEY', buyerApiKey)
    .send({
      amount: amount || chance.integer({ min: 3000, max: 7000 }),
    });
}

async function withdrawBid(
  httpServer: any,
  auctionId: number,
  buyerApiKey: string,
) {
  return request(httpServer)
    .delete(`/auction/${auctionId}/bid`)
    .set('X-API-KEY', buyerApiKey);
}

async function createAuction(
  httpServer: any,
  sellerApiKey: string,
  auction?: Partial<CreateAuctionPayload>,
) {
  const chance = new Chance();
  const payload: CreateAuctionPayload = {
    name: auction?.name ?? chance.string({ alpha: true, length: 10 }),
    description: auction?.description ?? chance.paragraph(),
    minimumBid: auction?.minimumBid ?? chance.integer({ min: 1000, max: 2000 }),
    highestBid:
      auction?.highestBid ?? chance.integer({ min: 8000, max: 10000 }),
  };
  return request(httpServer)
    .post('/auction')
    .set('X-API-KEY', sellerApiKey)
    .send(payload);
}

async function closeAuction(
  httpServer: any,
  sellerApiKey: string,
  auctionId: number,
) {
  return request(httpServer)
    .post(`/auction/${auctionId}/close`)
    .set('X-API-KEY', sellerApiKey);
}

async function getAuctionDetails(
  httpServer: any,
  sellerApiKey: string,
  auctionId: number,
) {
  return request(httpServer)
    .post(`/auction/${auctionId}/statement`)
    .set('X-API-KEY', sellerApiKey);
}

async function createUser(httpServer: any, role: Role, username?: string) {
  const chance = new Chance();
  return request(httpServer)
    .post('/user')
    .send({
      username: username || chance.string({ alpha: true, length: 10 }),
      role,
    });
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  const chance = new Chance();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(httpServer).get('/').expect(200).expect('');
  });

  it('should create buyer', async () => {
    const chance = new Chance();
    const username = chance.string({ alpha: true, length: 10 });
    const response = await createUser(httpServer, Role.BUYER, username);
    expect(response.status).toStrictEqual(201);
    expect(response.body.username).toStrictEqual(username);
    expect(response.body.role).toStrictEqual(Role.BUYER);
    expect(response.body.apiKey).toBeDefined();
  });

  it('should create seller', async () => {
    const chance = new Chance();
    const username = chance.string({ alpha: true, length: 10 });
    const response = await createUser(httpServer, Role.SELLER, username);
    expect(response.status).toStrictEqual(201);
    expect(response.body.username).toStrictEqual(username);
    expect(response.body.role).toStrictEqual(Role.SELLER);
    expect(response.body.apiKey).toBeDefined();
  });

  it('should create auction by seller', async () => {
    const chance = new Chance();
    const {
      body: { apiKey },
    } = await createUser(httpServer, Role.SELLER);

    const payload: CreateAuctionPayload = {
      name: chance.string({ alpha: true, length: 10 }),
      description: chance.paragraph(),
      minimumBid: chance.integer({ min: 1000, max: 2000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    };
    const createAuctionResponse = await createAuction(
      httpServer,
      apiKey,
      payload,
    );

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

    expect(createAuctionResponse.body.status).toStrictEqual(AuctionStatus.OPEN);
    expect(createAuctionResponse.body.platformCharge).toBeNull();
    expect(createAuctionResponse.body.sellerWinnings).toBeNull();
  });

  it('should fail when auction created by buyer', async () => {
    const chance = new Chance();
    const response = await createUser(httpServer, Role.BUYER);
    const apiKey = response.body.apiKey;

    const payload: CreateAuctionPayload = {
      name: chance.string({ alpha: true, length: 10 }),
      description: chance.paragraph(),
      minimumBid: chance.integer({ min: 1000, max: 2000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    };

    const createAuctionResponse = await createAuction(
      httpServer,
      apiKey,
      payload,
    );

    expect(createAuctionResponse.status).toStrictEqual(403);
  });

  it('should fail when tried without api key', async () => {
    const chance = new Chance();
    const payload: CreateAuctionPayload = {
      name: chance.string({ alpha: true, length: 10 }),
      description: chance.paragraph(),
      minimumBid: chance.integer({ min: 1000, max: 2000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    };
    const createAuctionResponse = await request(httpServer)
      .post('/auction')
      .send(payload);

    expect(createAuctionResponse.status).toStrictEqual(401);
  });

  it('should test placing bid on open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const placeBidResponse = await placeBid(httpServer, auctionId, buyerApiKey);

    expect(placeBidResponse.status).toBe(201);
    expect(placeBidResponse.body).toBeDefined();
  });

  it('should fail placing bid again on open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const bid1Response = await placeBid(httpServer, auctionId, buyerApiKey);
    const bid2Response = await placeBid(httpServer, auctionId, buyerApiKey);
    expect(bid1Response.status).toBe(201);
    expect(bid1Response.body).toBeDefined();
    expect(bid2Response.status).toBe(403);
    expect(bid2Response.body.message).toStrictEqual(
      'Bid already exists for the given auction, please use update bid API',
    );
  });

  it('should fail when placing bid higher than max bid amount set for auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const highestBid = chance.integer({ min: 9000, max: 10000 });
    const minimumBid = chance.integer({ min: 1000, max: 2000 });
    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      highestBid: highestBid,
      minimumBid: minimumBid,
    });

    const bidResponse = await placeBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: highestBid + 1, max: highestBid + 1000 }),
    );
    expect(bidResponse.status).toBe(403);
    expect(bidResponse.body.message).toStrictEqual(
      `Amount should be greater than or equal to ${minimumBid} and less than or equal to ${highestBid} `,
    );
  });

  it('should fail when placing bid lower than minimum bid amount set for auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const highestBid = chance.integer({ min: 9000, max: 10000 });
    const minimumBid = chance.integer({ min: 1000, max: 2000 });
    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      highestBid: highestBid,
      minimumBid: minimumBid,
    });

    const bidResponse = await placeBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: minimumBid - 1000, max: minimumBid - 1 }),
    );
    expect(bidResponse.status).toBe(403);
    expect(bidResponse.body.message).toStrictEqual(
      `Amount should be greater than or equal to ${minimumBid} and less than or equal to ${highestBid} `,
    );
  });

  it('should fail placing bid again on auction which does not exist', async () => {
    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const chance = new Chance();
    const auctionId = chance.integer({ min: 2000, max: 3000 });
    const bidResponse = await placeBid(httpServer, auctionId, buyerApiKey);
    expect(bidResponse.status).toBe(403);
    expect(bidResponse.body.message).toStrictEqual(
      `Open Auction with id ${auctionId} does not exist`,
    );
  });

  it('should update bid for an open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const placeBidResponse = await placeBid(httpServer, auctionId, buyerApiKey);
    const updateBidResponse = await updateBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(placeBidResponse.status).toBe(201);
    expect(placeBidResponse.body).toBeDefined();
    expect(updateBidResponse.status).toBe(200);
  });

  it('should fail when updating bid to higher value than max bid amount set for auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const highestBid = chance.integer({ min: 9000, max: 10000 });
    const minimumBid = chance.integer({ min: 1000, max: 2000 });
    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      highestBid: highestBid,
      minimumBid: minimumBid,
    });

    const bidResponse = await placeBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: minimumBid, max: highestBid }),
    );

    const updateBidResponse = await updateBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: highestBid + 1, max: highestBid + 1000 }),
    );

    expect(bidResponse.status).toStrictEqual(201);
    expect(updateBidResponse.status).toBe(403);
    expect(updateBidResponse.body.message).toStrictEqual(
      `Amount should be greater than or equal to ${minimumBid} and less than or equal to ${highestBid} `,
    );
  });

  it('should fail when updating bid to lower value than minimum bid amount set for auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const highestBid = chance.integer({ min: 9000, max: 10000 });
    const minimumBid = chance.integer({ min: 1000, max: 2000 });
    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      highestBid: highestBid,
      minimumBid: minimumBid,
    });

    const bidResponse = await placeBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: minimumBid, max: highestBid }),
    );

    const updateBidResponse = await updateBid(
      httpServer,
      auctionId,
      buyerApiKey,
      chance.integer({ min: minimumBid - 1000, max: minimumBid - 1 }),
    );

    expect(bidResponse.status).toStrictEqual(201);
    expect(updateBidResponse.status).toBe(403);
    expect(updateBidResponse.body.message).toStrictEqual(
      `Amount should be greater than or equal to ${minimumBid} and less than or equal to ${highestBid} `,
    );
  });

  it('should fail when try to update non existing bid for an open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const updateBidResponse = await updateBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(updateBidResponse.status).toBe(403);
    expect(updateBidResponse.body.message).toStrictEqual(
      `No bid has been placed to update, please use place bid API`,
    );
  });

  it('should fail when updating bid for an auction which does not exist', async () => {
    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const auctionId = chance.integer({ min: 10, max: 1000 });
    const updateBidResponse = await updateBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(updateBidResponse.status).toBe(403);
    expect(updateBidResponse.body.message).toStrictEqual(
      `Open Auction with id ${auctionId} does not exist`,
    );
  });

  it('should withdraw bid for an open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const placeBidResponse = await placeBid(httpServer, auctionId, buyerApiKey);
    const withdrawBidResponse = await withdrawBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(placeBidResponse.status).toBe(201);
    expect(placeBidResponse.body).toBeDefined();
    expect(withdrawBidResponse.status).toBe(200);
  });

  it('should fail when trying to withdraw to a non existing bid in auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const withdrawBidResponse = await withdrawBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(withdrawBidResponse.status).toBe(403);
    expect(withdrawBidResponse.body.message).toStrictEqual(
      `No bid has been placed to update, please use place bid API`,
    );
  });

  it('should fail when trying to withdraw bid for an non existing auction', async () => {
    const {
      body: { apiKey: buyerApiKey },
    } = await createUser(httpServer, Role.BUYER);

    const auctionId = chance.integer({ min: 8000, max: 10000 });
    const withdrawBidResponse = await withdrawBid(
      httpServer,
      auctionId,
      buyerApiKey,
    );

    expect(withdrawBidResponse.status).toBe(403);
    expect(withdrawBidResponse.body.message).toStrictEqual(
      `Open Auction with id ${auctionId} does not exist`,
    );
  });

  it('should close on open auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      minimumBid: chance.integer({ min: 1, max: 1000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    });

    const amounts = [4000, 4000, 2500, 1500, 3500, 3000];

    for (let i = 0; i < amounts.length; i += 1) {
      const {
        body: { apiKey: buyerApiKey },
      } = await createUser(httpServer, Role.BUYER);

      const bid1Response = await placeBid(
        httpServer,
        auctionId,
        buyerApiKey,
        amounts[i],
      );
      expect(bid1Response.status).toBe(201);
    }

    const closeAuctionResponse = await closeAuction(
      httpServer,
      sellerApiKey,
      auctionId,
    );

    expect(closeAuctionResponse.status).toBe(201);
    expect(closeAuctionResponse.body.amount).toBe(3500);
  });

  it('should fail to close an open auction due to no unique bids placed', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      minimumBid: chance.integer({ min: 1, max: 1000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    });

    const amounts = [4000, 4000, 2500, 2500, 3500, 3500];

    for (let i = 0; i < amounts.length; i += 1) {
      const {
        body: { apiKey: buyerApiKey },
      } = await createUser(httpServer, Role.BUYER);

      const bid1Response = await placeBid(
        httpServer,
        auctionId,
        buyerApiKey,
        amounts[i],
      );
      expect(bid1Response.status).toBe(201);
    }

    const closeAuctionResponse = await closeAuction(
      httpServer,
      sellerApiKey,
      auctionId,
    );

    expect(closeAuctionResponse.status).toBe(403);
    expect(closeAuctionResponse.body.message).toStrictEqual(
      'Unable to determine winning bid due to no unique bids placed',
    );
  });

  it('should fail to close an open auction due to no bids placed', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey);

    const closeAuctionResponse = await closeAuction(
      httpServer,
      sellerApiKey,
      auctionId,
    );

    expect(closeAuctionResponse.status).toBe(403);
    expect(closeAuctionResponse.body.message).toStrictEqual(
      'Cannot close auction, no bids have been placed yet',
    );
  });

  it('should get details of auction', async () => {
    const {
      body: { apiKey: sellerApiKey },
    } = await createUser(httpServer, Role.SELLER);

    const {
      body: { id: auctionId },
    } = await createAuction(httpServer, sellerApiKey, {
      minimumBid: chance.integer({ min: 1, max: 1000 }),
      highestBid: chance.integer({ min: 8000, max: 10000 }),
    });

    const amounts = [4000, 4000, 2500, 1500, 3500, 3000];

    for (let i = 0; i < amounts.length; i += 1) {
      const {
        body: { apiKey: buyerApiKey },
      } = await createUser(httpServer, Role.BUYER);

      const bid1Response = await placeBid(
        httpServer,
        auctionId,
        buyerApiKey,
        amounts[i],
      );
      expect(bid1Response.status).toBe(201);
    }

    const closeAuctionResponse = await closeAuction(
      httpServer,
      sellerApiKey,
      auctionId,
    );

    const auctionStatementResponse = await getAuctionDetails(
      httpServer,
      sellerApiKey,
      auctionId,
    );

    expect(closeAuctionResponse.status).toBe(201);
    expect(closeAuctionResponse.body.amount).toBe(3500);
    expect(auctionStatementResponse.status).toBe(201);
    expect(auctionStatementResponse.body.sellerWinnings).toStrictEqual(3325);
    expect(auctionStatementResponse.body.platformCharge).toStrictEqual(175);
  });
});
