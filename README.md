# messy

A lightweight framework for building Facebook Messenger apps

## Installation

```bash
$ npm install messy
```

## Getting started

Messy handles the boring stuff for you, and exposes a number of callback methods that you must define. These are:

- `getMfaCode`
- `promptCredentials`
- `onMessage`
- `onThreadEvent`

Have a look at the type definitions for how they should be implemented.

### Example usage

```js
const messy = new Messy();

messy.onMessage = ev => {
  console.log(ev);
};

// login to messy
messy.login({ email: 'test@mailnator.com', password: 'P4ssw0rd' }).then(() => {
  // start listening to events, like messages, reactions, etc.
  messy.listen();
});
```
