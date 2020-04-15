# Over-engineered Sprouts

[TOC]

## Information

Benjamin Starostka Jakobsen - s184198

Wictor Lang Jensen - s184197

Mikkel Rosenfeldt Anderson - s184230

Laura Sønderskov Hansen - s184234

## Push stuff to production:

Contact Mikkel if issues occur!

```bash
git remote add production ssh://pi@starostka.tplinkdns.com:10300/~/project
```

> You might need to enter credentials here..

Push develop to production server, server only accepts develop branch:

```bash
git push production develop
```

> You might need to enter credentials here as well..

## Update documentation

Documentation is placed in 

```
out/index.html
```

To generate documentation for public folder, run this command:

```
./node_modules/.bin/jsdoc public -r -c ./documentation/configuration.json
```

For help see:

[JSDoc documentation](https://jsdoc.app/index.html)

## Testing framework

We are using **Mocha** as our testing framework, see the files `sum.js` and `sumTest.js` for inspiration or check out [this guide](https://blog.logrocket.com/a-quick-and-complete-guide-to-mocha-testing-d0e0ea09f09d/) or [this official guide](https://mochajs.org/#assertions) 

## Installing MongoDB on local machine

[MacOS Download](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)

[Windows Download](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

1. Start MongoDB Server
2. Make file `.env` and fill information from your system, default values can be found in `.env.default`
3. To populate db:
   1. Run POST request "Create Collection"
   2. Run POST request "Create Test user" or "Create user", you can change name and score in body of POST
4. Go to `/scoreboard`to see if it works!