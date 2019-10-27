# WSE Template Project

Simple example of [``wse-cc``](https://github.com/vovchisko/wse-cc) usage in milti-server situation. Based on ``vue-webpack`` template.
May be useful for multiplayer games prototyping or if your project simply talking ``ws`` a lot.

## THIS TEMPLATE IS OUTDATED AND NOT COMPATIBLE WITH A NEW VERSIONS OF ``WSE-CC``

**Includes:**
- User auth/register/reset API.
- Auth component on frontend.
- User config component.
- Simple mailer to send verification links.
- ``wse-cc`` on frontend and backend.
- Master/Demon/Core templates.
- ``net`` component on frontend to manage all that things.
- Vue everywhere so you can start.

**See ``cfg.js`` for ports and email configurations.**

#### installation
```
//sure we need it first
npm install

// run frontend with webpack/vue and do your daily job.
npm run dev

// build all vue things to dist
npm run build

// run master server
node server.js

// run demon with name `D1`, so it can start cores
node demon.js name=D1
```

