# Klendathu

[![CircleCI](https://circleci.com/gh/viridia/klendathu.svg?style=svg)](https://circleci.com/gh/viridia/klendathu) [![Greenkeeper badge](https://badges.greenkeeper.io/viridia/klendathu.svg)](https://greenkeeper.io/)

Klendathu is an open-source bug tracking and project management application.

# Some early screenshots

![Image Summary List](./docs/screenshots/k4_1.png)

![Image Details](./docs/screenshots/k4_2.png)

# Running locally

```sh
npm install
docker-compose up db db-admin imaginary
CLIENT_PROXY=true npm start
```

Then browse to http://localhost:4000.

# Running integration tests

```sh
npm test
```

# Frameworks, languages and technologies used:

* TypeScript
* React.js
* MobX
* Apollo (client, server, subscriptions)
* WebSockets
* MongoDb
* Parcel
* Express.js
* Passport.js
* Styled-components
* Jest
