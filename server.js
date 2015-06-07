var assert = require('assert');
var fs = require("fs");
var util = require('util');
var zlib = require('zlib');
var path = require("path");
var fs = require('fs');
var koa = require('koa');
var serve = require('koa-static');
var bodyParser = require("koa-bodyparser");
var logger = require('koa-logger')
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
app.use(logger());

// the pano img store
var imgs;
var gform;

// configure
mongoose.connect('mongodb://localhost:27017/imgs');

var panourl = 'mongodb://localhost:27017/imgs';
var panoconn = mongoose.createConnection(panourl);
panoconn.once('open', function () {
    imgs = Grid(panoconn.db);
    gridform.db = panoconn.db;
    gridform.mongo = mongo;
    gform = gridform();
    console.log('DB connected.');
});

// models & controllers
require('/home/tzx/git/poicreator/src/models/guangxi.js');
var sitegx = require('/home/tzx/git/poicreator/src/controllers/guangxi.js');


// pack these routes
var api = new Router({ prefix: '/api' });
api.get('/', function*(){ this.body = 'CVRS Panorama APIs'; }); // /api/site/:id

// route sites, floors, links, etc
var sites = new Router();
sites.get('/', sitegx.getSitesAll );
// sites.get('/:id', function *(next) { this.body = 'site#' + this.params.id; });
sites.get('/:id', sitegx.getSiteById );
api.get('/site/:id', sites.routes()); // /api/site/:id

// use the API router
app.use(api.routes());

// serve pano img via ImgStore
var img = new Router({ prefix: '/gridfs' });
img.get('/', function *() {
    imgs.files.find({}).toArray(function (err, files) {
        console.log(files.length + new Date());
    });
    this.body = '/gridfs' + new Date();
});
img.get('/:id', function *() {
    this.body = imgs.createReadStream({ filename: this.params.id });
    this.body.pipe(zlib.createGzip()).pipe(this.res);
});
app.use(img.routes());

// app switch on
app.listen(8080);
