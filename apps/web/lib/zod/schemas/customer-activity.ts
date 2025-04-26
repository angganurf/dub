import { z } from "zod";
import { clickEventResponseSchema } from "./clicks";
import { leadEventResponseSchema } from "./leads";
import { LinkSchema } from "./links";
import { saleEventResponseSchema } from "./sales";

export const customerActivityEventSchema = z.discriminatedUnion("event", [
  clickEventResponseSchema,
  leadEventResponseSchema.omit({ customer: true }),
  saleEventResponseSchema.omit({ customer: true }),
]);

export const customerActivityResponseSchema = z.object({
  ltv: z.number(),
  timeToLead: z.number().nullable(),
  timeToSale: z.number().nullable(),
  events: z.array(customerActivityEventSchema),
  link: LinkSchema.pick({
    id: true,
    domain: true,
    key: true,
    shortLink: true,
  }).nullish(),
});
