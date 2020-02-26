# Over-engineered Sprouts
Title says it all

![Node.js CI](https://github.com/mikk5829/over-engineered-sprouts/workflows/Node.js%20CI/badge.svg?branch=develop)

## Add production as remote:

```bash
git remote add production ssh://pi@starostka.tplinkdns.com:10300/~/deploy-folder/project
```

> You might need to enter credentials here..

Push develop to production server:

```bash
git push production develop
```

