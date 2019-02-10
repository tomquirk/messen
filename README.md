# messen

A lightweight framework for building Facebook Messenger apps

## Installation

```bash
$ npm install messen
```

## Getting started

Messen handles the boring stuff for you, and exposes a number of callback methods that you must define. These are:

- `getMfaCode`
- `promptCredentials`
- `onMessage`
- `onThreadEvent`

Have a look at the type definitions for how they should be implemented.

### Example usage

```js
const messen = new Messen();

messen.onMessage = ev => {
  console.log(ev);
};

// login to messen
messen.login({ email: 'test@mailnator.com', password: 'P4ssw0rd' }).then(() => {
  // start listening to events, like messages, reactions, etc.
  messen.listen();
});
```

## Projects using `messen`

* [Messer](https://github.com/mjkaufer/Messer) - a CLI chat application for Facebook Messenger
