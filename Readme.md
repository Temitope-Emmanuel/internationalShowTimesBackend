# Internation ShowTimes Backend

Original templates by Josiah Adegboye.

## How to run

First clone the repo with


Then 

```
cd ./internationalShowTimesBackend
```

Next, start the services with docker

```
docker-compose up
```

Or start the services individually i.e

```
docker-compose up mongodb //For the mongodb database
docker-compose up server //For the express server
```

## Testing

To run tests, first start the mongodb service by running

```
docker-compose up mongodb
```

Next run

```
yarn run test
```

Created by Temitope Emamnuel Ojo