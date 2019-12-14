/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let book_id,
      invalid_id = '5df0d8b60ddb3b196b5494f2';

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
              title: 'new title',
          })
          .end(function(err, res){
            if (err) {
                return  assert.fail("some error happened");
            }
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.equal(res.body.title, 'new title');
            book_id = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            if (err) {
                return  assert.fail("some error happened");
            }
            assert.equal(res.status, 422);
            assert.equal(res.text, 'Require `title` field input');
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get(`/api/books/${invalid_id}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.isEmpty(res.body);
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${book_id}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body.title, 'new title');
            assert.property(res.body, 'comments', 'Book should contain comment');
            assert.isArray(res.body.comments, 'response should be an array');
            assert.isEmpty(res.body.comments);  // tested item is empty
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        let comment = "comment on book";
        chai.request(server)
          .post(`/api/books/${book_id}`)
          .send({
              comment: comment,
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.equal(res.body._id, book_id);
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body.title, 'new title');
            assert.property(res.body, 'comments', 'Book should contain comment');
            assert.isArray(res.body.comments, 'response should be an array');
            assert.equal(res.body.comments[0], comment);
            done();
          });
      });

    });

    suite('POST /api/books/[id] => delete book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .delete(`/api/books/${book_id}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

    });

  });

});
