The JavaScript SDK/Sample to interact
with Niftyconnect contracts. It includes the following three methods.

- **makeOrder** - Approve an order and optionally mark it for orderbook inclusion
- **cancelOrder** - Cancel an order, preventing it from being matched
- **takeOrder** - Atomically match two orders, ensuring validity of the match, and execute all associated state transitions

You can find more detailed documentation in our
[Documentation](https://github.com/NiftyConnect/document)
pages.

## Installation

```bash
$ npm i niftyconnect-js
# Or:
$ yarn add niftyconnect-js
```

### Getting Started

> It uses ethersjs and ethereum provider(provided by metamask) by default

Make an fixed price order

```JavaScript
  import { makeOrder } from 'niftyconnect-js'
  import moment from 'moment'

  const params = {
    nft_address: 'xxxx', //The asset's contract address
    payment_token:'xxxx', //payment token contract address
    list_price:2,//
    list_time:moment(),
    expire_time:moment('xxxx'),
    token_id: 1111,
    amount: 1,
    side: 1, // sell=1, buy=0
    saleKind: 0, //FixedPrice=0, TimedAuction = 1
    token_standard: 1, // erc1155=1, erc721=0
    orderType: 'Normal', //'Normal' | 'Collection' | 'Trait'
  }

  const tx = makeOrder(params)
```

## Contributing

Contributions to the Niftyconnect JavaScript SDK are welcome.
