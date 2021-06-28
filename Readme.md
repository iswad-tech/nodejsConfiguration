# Setup a nodejs api
- Clone the repository
- npm install
- Note: If you would like to update the version of package being used in the package.json; you can change it manually from package.json file and then run npm install or you can take the following steps:
`npm uninstall express mongoose cookie-parser morgan nodemon dotenv cors` --> General Packages <br>
`npm uninstall express-validator jsonwebtoken express-jwt shortid lodash @sendgrid/mail google-auth-library` --> User Authentication packages <br>
`npm uninstall express mongoose cookie-parser morgan nodemon dotenv cors` --> General Packages <br>
`npm uninstall express-validator jsonwebtoken express-jwt shortid lodash @sendgrid/mail google-auth-library` --> User Authentication packages <br>
- In the root directory of app create .env file and write env variables in that <br>
`NODE_ENV=development` <br>
`PORT=8000` <br>
`APP_NAME=SeoBlog` <br>
`CLIENT_URL=http://localhost:3000` <br>
`DATABASE_CLOUD='MONGODB_CLOUD_URI'` <br>
`DATABASE_LOCAL='mongodb://localhost:27017/seoblog'` <br>
`JWT_SECRET=RANDOM_TEXT_1` <br>
`JWT_ACCOUNT_ACTIVATION=RANDOM_TEXT_2` <br>
`JWT_RESET_PASSWORD=RANDOM_TEXT_3` <br>
`SENDGRID_API_KEY=KEY` <br>
`EMAIL_TO=EMAIL_ADDRESS1` <br>
`CONTACT_FORM_MAIL_FROM=EMAIL_ADDRESS2` <br>
`AUTH_MAIL_FROM=EMAIL_ADDRESS_3` <br>
`GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID` <br>
`GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET` <br>
- Auth routes are used for authentication of users; i.e. user registration, login, logout, and so on. If you do not need them you can remove all these files with the relevant npm packages.
- In order to use mongodb locally youcan follow the instructions below: <br>
1. Installation of MongoDB locally on windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
2. Installation of Robo3T: https://robomongo.org/
- To activate google login api, use the following link: https://console.cloud.google.com