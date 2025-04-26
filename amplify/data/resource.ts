import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Stock: a.model({
    name: a.string(),
    symbol: a.string(),
    price: a.string(),
    change: a.string().default("0"),
    volume: a.integer().default(0),
    last: a.string().default("0"),
    mentions: a.integer().default(0),
  }).authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.owner(),
  ]),

  Marketvalue: a.model({
    value: a.string().default("0"),
    time: a.string(),
  }).authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.owner(),
  ]),

  Markethours: a.model({
    open: a.string(),
    close: a.string(),
  }).authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.owner(),
  ]),

  Marketdays: a.model({
    closedays: a.string(),
  }).authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.owner(),
  ]),

  Transaction: a.model({
    type: a.string(),
    amount: a.string(),
    date: a.string(),
    stock: a.string(),
    owns: a.boolean().default(false),
    success: a.boolean().default(false),
    stockId: a.string(),
    shares: a.string(),
  }).authorization((allow) => [
    allow.owner(),
  ]),

  Ownedstock: a.model({
    stockName: a.string(),
    currentPrice: a.string(),
    owns: a.boolean().default(false),
    stockId: a.string(),
    shares: a.string(),
  }).authorization((allow) => [
    allow.owner(),
  ]),

  Account: a.model({
    accountvalue: a.string().default("0"),
    balance: a.string().default("0"),
  }).authorization((allow) => [
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
