var assert = require('assert');
var fs = require("fs");
var util = require('util');
var path = require("path");
var fs = require('fs');
var koa = require('koa');
var serve = require('koa-static');
var bodyParser = require("koa-bodyparser");
var Router = require('koa-router');
var router = Router();
var gridform = require('gridform');
var formidable = require('formidable');
var mongoose = require('mongoose');
var mongo = mongoose.mongo; // var mongo = require('mongodb');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var bodyParser = require('koa-bodyparser');

// the app
var app = module.exports = koa();
app.use(serve('./public'));

//app.use(formidable);
app.use(bodyParser());

// the pano img store
var imgs;
var gform;

// configure
var panourl = 'mongodb://localhost:27017/imgs';
var panoconn = mongoose.createConnection(panourl);
panoconn.once('open', function () {
    imgs = Grid(panoconn.db);
    gridform.db = panoconn.db;
    gridform.mongo = mongo;
    gform = gridform();
    console.log('DB connected.');
});

// pack these routes
var api = new Router({ prefix: '/api' });
api.get('/', function*(){ this.body = 'CVRS Panorama APIs'; }); // /api/site/:id

// route sites, floors, links, etc
var sites = new Router();
sites.get('/', function *(next) { this.body = 'all sites'; });
sites.get('/:id', function *(next) { this.body = 'site#' + this.params.id; });
api.get('/site/:id', sites.routes()); // /api/site/:id

// use the API router
app.use(api.routes());

// serve pano img via ImgStore
var img = new Router({ prefix: '/gridfs' });
img.get('/:id', function *() {
    this.body = imgs.createReadStream({ filename: this.params.id });
    this.body.pipe(this.res);
});
app.use(img.routes());

// app switch on
app.listen(8000);
