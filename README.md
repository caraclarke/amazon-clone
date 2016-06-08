# Raising Records
---

This eCommerce website is an online 'record' store where users can view different genres of albums, search keywords and purchase music. Users have to create an account to purchase items, but from their account they are able to see their purchase history.

The project uses JavaScript on the front and back end. It uses EJS templating for Node.js for the views and Node.js with a MongoDB database on the back end, as well as express and passport middleware. It also uses other libraries such as Stripe and Elasticsearch for product checkout and search functionality.

The data was made using [faker.js](https://github.com/marak/Faker.js/).

####Features

- Login in or create account using Facebook
- Explore different 'genres' through links at navbar
- Search specific terms using search in navbar
- Once logged in, instant search available from homepage
- Checkout using Stripe

####Installation

Install the project by:

```
$ git clone git@github.com:caraclarke/amazon-clone.git
$ cd amazon-clone/
$ npm install

```

####To view page locally

```
$ nodemon server

```