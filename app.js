var express = require('express'),
	mustachio = require("mustachio"),
	fs = require('fs'),
	app = express.createServer();

app.configure(function() {
  app.register('.mustache', mustachio);
  app.set('view engine', 'mustache');
	app.use(express.static(__dirname + '/public'));
});

// db
var Posts = JSON.parse(fs.readFileSync('db.json'), 'UTF-8');

// routes
app.get('/.:format?', function(req, res){
	res.render('main', {posts: Posts, layout: !req.xhr});
});

app.get('/posts/:id.:format?', function(req, res){
	var post = Posts.filter(function(p) {return p._id === req.params.id;})[0];
	res.render('post', {post: post, layout: !req.xhr});
});

app.get('/tags/:tag.:format?', function(req, res){
	var posts = Posts.filter(function(p) {return p.tags.indexOf(req.params.tag) > -1;});
	res.render('main', {posts: posts, layout: !req.xhr});
});

app.listen(3000);
