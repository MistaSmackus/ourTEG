import { a, defineData,type ClientSchema } from "@aws-amplify/backend";


const schema = a.schema({
  Stock: a
    .model({
      id: a.id().required(),
      name: a.string(),
      symbol: a.string(),
      price: a.string(),
      change: a.string(),
      dayChange: a.string(),
      volume: a.string(),
      value: a.string(),
      last: a.string(),
      mentions: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),
  Market: a
    .model({
      time: a.time(),
      value: a.float(),
      date: a.date(),
      close: a.time(),
      open: a.time(),
    }).authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group("Admins").to(['create']),
    ]),
  Event: a
    .model({
      eventId: a.id().required(),
      date: a.datetime(),
      event: a.string(),
      forecast: a.string(),
      previous: a.string(),
    })
    .identifier(['eventId'])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group("Admins").to(['create']),
    ]),
  Transaction: a
    .model({
      type: a.string(),
      amount: a.string(),
      date: a.string(),
      stock: a.string(),
      owns: a.boolean().default(false),
      accountvalue: a.string(),
      balance: a.string(),
      success: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
