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
      let r = await col.aggregate([
          {$unwind: {path: "$comments", preserveNullAndEmptyArrays: true}},
          {$addFields: {commentcount: {$sum: "$comments"}}},
          {$unset: "comments"}
      ]).toArray();
      res.json(r);
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
    })

    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        let r = await col.drop();
        if (r === true) {
            return res.send('complete delete successful');
        }
        return res.status(500).send('DB collection deletion failed');
      } catch (e) {
        if (e.codeName == 'NamespaceNotFound') return res.send('Collection already deleted');
        return res.status(500).send(e.errmsg);
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      var bookid = req.params.id;
      let r = await col.aggregate([
          { $match: { _id: new ObjectId(bookid) } },
          { $addFields: { comments: { $ifNull: [ "$comments", [] ] } } }
      ]).toArray();
      if (r.length == 1) {
        return res.json(r[0]);
      } else {
        return res.json({});
      }
    })

    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      // add the empty array first
      let r = await col.findOneAndUpdate({
        _id: new ObjectId(bookid),
        comments: { $exists: false }
      },
      {
        $set: { comments: [] }
      });
      // insert to array
      let r2 = await col.findOneAndUpdate({
        _id: new ObjectId(bookid),
      },
      {
        $push: { comments: comment }
      },
      {
        returnOriginal: false,
      });

      if (r2.ok) {
        return res.json(r2.value);
      }
      res.status(500).send('error writing to DB');
    })

    .delete(async function(req, res){
      var bookid = req.params.id;
      let r = await col.findOneAndDelete({
        _id: new ObjectId(bookid),
      });
      //if successful response will be 'delete successful'
      if (r.ok) {
         return res.send('delete successful');
      }
      res.status(500).send('error writing to DB');
    });

};
