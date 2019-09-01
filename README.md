# VocsTest
A Node.js app using [Express 4](http://expressjs.com/), [MySQL 2](https://www.npmjs.com/package/mysql2).

## Getting Started
This application was created to make it easier to learn vocabulary words between French and English from my classes *(It is only available in French)*  
It allows you to train in Multiple-Choice Questionnaire as well as in time attack  

[*Application demo*](https://trad.maner.fr/ "Application demo")

## Running Locally
> You must set up a database *(SQL/DB.sql to import the data)*  

```shell
$ git clone https://github.com/Manerr/VocsTest.git && cd VocsTest/
$ npm install
$ mv config_template.json config.json && nano config.json
$ npm start
```

If everything went well, your app should now be running on [localhost:3004](http://localhost:3004/).