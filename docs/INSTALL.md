# testero

## Installing

### Linux Debian/Ubuntu

Install Node.js and NPM from Ubuntu 18.04 repository:

`sudo apt install nodejs npm`

For Ubuntu before 18.04 see original instruction from <https://nodejs.org>.

Install Redis:

`sudo apt install redis-server`

Install MongoDB from Ubuntu 18.04 repository:

``` sh
sudo apt install mongodb
```

Install MongoDB (before 18.04):

Full instructions see on
[official site](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/).

``` sh
sudo apt install mongodb-org
```

Also will be installed `mongodb-org-server`, `mongodb-org-mongos`,
`mongodb-org-shell`, `mongodb-org-tools`.

Clone latest Testero:

`git clone https://github.com/severe-island/testero.git`

Install packages:

``` sh
npm install
```

## Running

Run MongoDB

``` sh
sudo service mongod start
```

Then

``` sh
npm start
```

Goto <http://localhost:3000>.

## Code testing

``` sh
npm test
```

``` sh
npm run coverage
```

---

(c) 2015 -- 2018, Severe Island Team
