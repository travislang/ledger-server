# Ledger Server
[![Build Status](https://travis-ci.org/danielfsousa/express-rest-es2017-boilerplate.svg?branch=master)](https://travis-ci.org/danielfsousa/express-rest-es2017-boilerplate) [![Coverage Status](https://coveralls.io/repos/github/danielfsousa/express-rest-es2017-boilerplate/badge.svg?branch=master)](https://coveralls.io/github/danielfsousa/express-rest-es2017-boilerplate?branch=master)
![Github license](https://img.shields.io/badge/license-MIT-blue)



![Ledger logo](/public/images/ledger-logo.png)



## Features

 - ES2017 javascript
 - Express + MongoDB ([Mongoose](http://mongoosejs.com/))
 - Consistent coding styles with [editorconfig](http://editorconfig.org)
 - [Docker](https://www.docker.com/) support
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP security headers
 - Request validation with [joi](https://github.com/hapijs/joi)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Tests with [mocha](https://mochajs.org), [chai](http://chaijs.com) and [sinon](http://sinonjs.org)
 - Code coverage with [istanbul](https://istanbul.js.org) and [coveralls](https://coveralls.io)
 - Git hooks with [husky](https://github.com/typicode/husky) 
 - Logging with [morgan](https://github.com/expressjs/morgan)
 - Authentication and Authorization with [passport](http://passportjs.org)
 - Continuous integration support with [travisCI](https://travis-ci.org)

## Requirements

 - [Node v13.0+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)

## Getting Started

### Initialize project

```bash
# Clone the repo
git clone https://github.com/travislang/ledger-server.git
cd ledger-server

# install dependencies
npm install

# set enviornment variables
cp .env.example .env
```

### Running Locally

```bash
npm run dev
```

### Running in Production

```bash
npm start
```

### Lint

```bash
# lint code with ESLint
npm run lint

# try to fix ESLint errors
npm run lint:fix
```

### Testing

```bash
# run all tests with Mocha
npm run test

# run unit tests
npm run test:unit

# run integration tests
npm run test:integration

# open nyc test coverage reports
npm run coverage
```

### Validate

```bash
# run lint and tests together
npm run validate
```

### Docker

You need to have [Docker](https://www.docker.com/) installed on your system to run docker locally

```bash
# run container locally
npm run docker:dev

# run container in production
npm run docker:prod

# run tests
npm run docker:test
```


## License

[MIT License](LICENSE.md) - [Travis Lang](https://github.com/travislang)
