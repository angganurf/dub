import { TrackSaleResponse } from "@/lib/types";
import { randomValue } from "@dub/utils";
import { randomId } from "tests/utils/helpers";
import {
  E2E_CUSTOMER_EXTERNAL_ID,
  E2E_CUSTOMER_ID,
} from "tests/utils/resource";
import { describe, expect, test } from "vitest";
import { IntegrationHarness } from "../utils/integration";

const expectValidSaleResponse = (
  response: { status: number; data: TrackSaleResponse },
  sale: any,
) => {
  expect(response.status).toEqual(200);
  expect(response.data).toStrictEqual({
    eventName: "Subscription",
    customer: {
      id: E2E_CUSTOMER_ID,
      name: expect.any(String),
      email: expect.any(String),
      avatar: expect.any(String),
      externalId: E2E_CUSTOMER_EXTERNAL_ID,
    },
    sale: {
      amount: sale.amount,
      currency: sale.currency,
      paymentProcessor: sale.paymentProcessor,
      invoiceId: sale.invoiceId,
      metadata: null,
    },
    amount: sale.amount,
    currency: sale.currency,
    paymentProcessor: sale.paymentProcessor,
    metadata: null,
    invoiceId: sale.invoiceId,
  });
};

const randomSaleAmount = () => {
  return randomValue([400, 900, 1900]);
};

describe("POST /track/sale", async () => {
  const h = new IntegrationHarness();
  const { http } = await h.init();

  const sale = {
    eventName: "Subscription",
    amount: randomSaleAmount(),
    currency: "usd",
    invoiceId: `INV_${randomId()}`,
    paymentProcessor: "stripe",
  };

  test("track a sale", async () => {
    const response = await http.post<TrackSaleResponse>({
      path: "/track/sale",
      body: {
        ...sale,
        externalId: E2E_CUSTOMER_EXTERNAL_ID,
      },
    });

    expectValidSaleResponse(response, sale);
  });

  test("track a sale with an invoiceId that is already processed (should return null customer and sale) ", async () => {
    const response2 = await http.post<TrackSaleResponse>({
      path: "/track/sale",
      body: {
        ...sale,
        externalId: E2E_CUSTOMER_EXTERNAL_ID,
        invoiceId: sale.invoiceId,
      },
    });

    expect(response2.status).toEqual(200);
    expect(response2.data).toStrictEqual({
      eventName: "Subscription",
      customer: null,
      sale: null,
    });
  });

  test("track a sale with an externalId that does not exist (should return null customer and sale)", async () => {
    const response3 = await http.post<TrackSaleResponse>({
      path: "/track/sale",
      body: {
        ...sale,
        invoiceId: `INV_${randomId()}`,
        externalId: "external-id-that-does-not-exist",
      },
    });

    expect(response3.status).toEqual(200);
    expect(response3.data).toStrictEqual({
      eventName: "Subscription",
      customer: null,
      sale: null,
    });
  });

  test("track a sale with `customerId` (backward compatibility)", async () => {
    const newSale = {
      ...sale,
      invoiceId: `INV_${randomId()}`,
      amount: randomSaleAmount(),
    };

    const response4 = await http.post<TrackSaleResponse>({
      path: "/track/sale",
      body: {
        ...newSale,
        customerId: E2E_CUSTOMER_EXTERNAL_ID,
      },
    });

    expectValidSaleResponse(response4, newSale);
  });
});
