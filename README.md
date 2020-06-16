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
 ./node_modules/.bin/jsdoc public routes server -r -c ./documentation/configuration.json
```

For help see:

[JSDoc documentation](https://jsdoc.app/index.html)

## Testing framework

We are using **Mocha** as our testing framework, see the files `sum.js` and `sumTest.js` for inspiration or check out [this guide](https://blog.logrocket.com/a-quick-and-complete-guide-to-mocha-testing-d0e0ea09f09d/) or [this official guide](https://mochajs.org/#assertions) 

## Setting up db on local machine

4. Add file ```database.json``` to ```routes/```
2. It just works!

