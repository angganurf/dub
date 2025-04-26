import { DATE_RANGE_INTERVAL_PRESETS } from "@/lib/analytics/constants";
import { CommissionStatus } from "@dub/prisma/client";
import { z } from "zod";
import { CustomerSchema } from "./customers";
import { getPaginationQuerySchema } from "./misc";
import { PartnerSchema } from "./partners";
import { parseDateSchema } from "./utils";

export const CommissionSchema = z.object({
  id: z.string(),
  type: z.enum(["click", "lead", "sale"]).optional(),
  amount: z.number(),
  earnings: z.number(),
  currency: z.string(),
  status: z.nativeEnum(CommissionStatus),
  invoiceId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CommissionResponseSchema = CommissionSchema.merge(
  z.object({
    quantity: z.number(),
    partner: PartnerSchema,
    customer: CustomerSchema.nullable(), // customer can be null for click-based commissions
  }),
);

export const getCommissionsQuerySchema = z
  .object({
    type: z.enum(["click", "lead", "sale"]).optional(),
    customerId: z.string().optional(),
    payoutId: z.string().optional(),
    partnerId: z.string().optional(),
    status: z.nativeEnum(CommissionStatus).optional(),
    sortBy: z.enum(["createdAt", "amount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    interval: z.enum(DATE_RANGE_INTERVAL_PRESETS).default("all"),
    start: parseDateSchema.optional(),
    end: parseDateSchema.optional(),
  })
  .merge(getPaginationQuerySchema({ pageSize: 100 }));

export const getCommissionsCountQuerySchema = getCommissionsQuerySchema.omit({
  page: true,
  pageSize: true,
  sortOrder: true,
  sortBy: true,
});

export const createCommissionSchema = z.object({
  workspaceId: z.string(),
  programId: z.string(),
  partnerId: z.string(),
  linkId: z.string(),
  customerId: z.string(),
  saleEventDate: parseDateSchema.nullish(),
  saleAmount: z.number().min(0).nullish(),
  invoiceId: z.string().nullish(),
  leadEventDate: parseDateSchema.nullish(),
  leadEventName: z.string().nullish(),
});
