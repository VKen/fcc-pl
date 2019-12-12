/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const mongo = new MongoClient(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true });
let col;

mongo.connect((err, client) => {
    if (err) {
        console.error('connection error to db');
    } else {
        console.log('db connection successful');
        col = mongo.db().collection('books');
    }
});

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(async function (req, res){
      var title = req.body.title;
      if (!title) {
          return res.status(422).send('Require `title` field input');
      }
      let r = await col.insertOne({title: title});
      if (r.insertedCount == 1) {
          return res.json(r.ops[0]);
      }
      return res.status(500).send('DB insertion failed');
      //response will contain new book object including atleast _id and title
    })

    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })

    .delete(async function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });

};
