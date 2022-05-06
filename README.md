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

- **For Ethersjs:** Just call the above methods directly

```JavaScript
  const tx = await makerOrder(params)
  await tx.wait

  const tx = await cancelOrder(params)
  await tx.wait

  const tx = await takeOrder(params)
  await tx.wait
```

- **For Web3js**

## Contributing

Contributions to the Niftyconnect JavaScript SDK are welcome.
