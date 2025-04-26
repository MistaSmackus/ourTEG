import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Stock: a.model({
    name: a.string(),
    symbol: a.string(),
    price: a.float(),
    change: a.float().default(0),
    volume: a.integer().default(0),
    last: a.float().default(0),
    mentions: a.integer().default(0),
  }).authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.owner(),
  ]),

  Marketvalue: a.model({
    value: a.float().default(0),
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
    type: a.string(),             // "BUY" or "SELL"
    amount: a.float(),             // amount bought/sold
    date: a.string(),              // date of transaction
    stock: a.string(),             // name of stock
    owns: a.boolean().default(false),
    success: a.boolean().default(false),
    stockId: a.string(),           // reference to stock id
    shares: a.float(),             // number of shares
  }).authorization((allow) => [
    allow.owner(),
  ]),

  Ownedstock: a.model({
    stockName: a.string(),
    currentPrice: a.float(),
    owns: a.boolean().default(false),
    stockId: a.string(),
    shares: a.float(),
  }).authorization((allow) => [
    allow.owner(),
  ]),

  Account: a.model({
    accountvalue: a.float().default(0),
    balance: a.float().default(0),
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
