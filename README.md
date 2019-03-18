# Klendathu

[![CircleCI](https://circleci.com/gh/viridia/klendathu.svg?style=svg)](https://circleci.com/gh/viridia/klendathu)

Klendathu is an open-source bug tracking and project management application.

## Features

Klendathu has been designed from the ground up to be an efficient, versatile project management
system for developers and managers who want to work fast:

  * Lightning fast, responsive UI. No more waiting for page loads!
  * Data views update in real time (powered via GraphQL subscriptions).
  * Flexible issue templates and customizable workflows.
  * Powerful query builder and bulk editing of issues.
  * Markdown formatting support in issue descriptions and comments.
  * View recent changes with the timeline view.
  * Highly-customizable list views, choose which columns or labels you want to see.
  * Simple and fast UI for workflow transitions.
  * Supports both ledger and "Kanban" progress views.
  * "Enterprise" features such as permissions and roles.
  * Multi-user, multi-tenant account model.
  * Projects and issues can be public or private.
  * Social login via Github, Google or Twitter.
  * Milestone management for Agile workflows.
  * Stats and metrics.
  * Themeing support.
  * Comprehensive API (also powered by GraphQL).
  * Entirely open-source.

## Some early screenshots

![Image Summary List](./docs/screenshots/k4_1.png)

![Image Details](./docs/screenshots/k4_2.png)

## Running locally

```sh
npm install
docker-compose up db db-admin imaginary
CLIENT_PROXY=true npm start
```

Then browse to http://localhost:4000.

## Running integration tests

```sh
npm test
```

## Frameworks, languages and technologies used:

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

# About the name:

"Klendathu" is the name of the Bug homeworld from _Starship Troopers_. You'll find several
references to characters from both the book and the movie embedded in the unit test source code.
