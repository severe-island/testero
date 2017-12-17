# testero

## Installing

### Linux Debian/Ubuntu

Install Node.js:

`sudo apt-get install nodejs`

Install Redis:

`sudo apt install redis-server`

Install MongoDB:

Full instructions see on
[official site](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/).

``` sh
sudo apt install mongodb-org
```

Also will be installed `mongodb-org-server`, `mongodb-org-mongos`,
`mongodb-org-shell`, `mongodb-org-tools`.

Clone latest Testero:

`git clone https://github.com/severe-island/testero.git`

## Running

Run MongoDB

``` sh
sudo service mongod start
```

Then

``` sh
npm start
```

## Code testing

``` sh
npm test
```

---

(c) 2015 -- 2017, Severe Island Team
