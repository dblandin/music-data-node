Music data node
=====================


Node JS application based on Express used to populate a PostgreSQL database with music data.

----------


Installation
---------

Once Node and npm are installed in your machine, checkout this repository and do **npm install**, then **node app.js**.

```
npm install
node app.js
```

Configuration
---------

Configuration for development and production can be set in **config.js**

In order to run the application in production mode, prepend **NODE_ENV=production** to the usual starting command (normally **node app.js**) or set the var **NODE_ENV** to **production**.

```
NODE_ENV=production node app.js
```

Phases
---------

Each phase contains fetchers, models, logs and a worker to orchestrate all of this together.



