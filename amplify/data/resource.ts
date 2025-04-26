import { a, defineData,type ClientSchema } from "@aws-amplify/backend";



import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Stock: a
    .model({
      name: a.string(),
      symbol: a.string(),
      price: a.float(),            // was string
      change: a.float().default(0),// was string
      volume: a.int().default(0),  // was string
      last: a.float().default(0),  // was string
      mentions: a.int().default(0),// was string
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  Marketvalue: a
    .model({
      value: a.float().default(0),
      time: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  Markethours: a
    .model({
      close: a.string(),
      open: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  Marketdays: a
    .model({
      closedays: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  Transaction: a
    .model({
      type: a.string(),              
      amount: a.float(),          
      date: a.string(),
      stock: a.string(),            
      owns: a.boolean().default(false),
      success: a.boolean().default(false),
      stockId: a.string(),
      shares: a.float(),           
    })
    .authorization((allow) => [
      allow.owner(),
    ]),

  Ownedstock: a
    .model({
      currentPrice: a.float(),      
      stockName: a.string(),
      owns: a.boolean().default(false),
      stockId: a.string(),
      shares: a.float(),           
    })
    .authorization((allow) => [
      allow.owner(),
    ]),

  Account: a
    .model({
      accountvalue: a.float().default(0), 
      balance: a.float().default(0),      
    })
    .authorization((allow) => [
      allow.owner(),
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});






export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
