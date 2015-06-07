"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Guangxi = mongoose.model("Guangxi");
var ObjectId = Schema.ObjectId;
var _ = require("lodash");

function trans(s) {
    return {
        _id: s._id,
        title: s.properties.file_name,
        position: s.geometry.coordinates,
        drift: s.properties.attitude_z + 180,
        src: s.properties.file_name,
    };
}

exports.getSitesAll = function *() {
  var gx = yield Guangxi.findAll();
  if (!gx) {
    gx = { error: "empty" };
  }
  this.body = _.map(gx, trans); 
};

exports.getSitesCount = function *() {
    var gxc = yield Guangxi.count().exec();
    this.body = gxc;
};

exports.postSite = function *() {
    if (this.request.type !== 'application/json' || !this.request.body) {
        this.throw('Sites2: broken POST', 400);
    }
    try {
         var gx = new Guangxi(this.request.body);
         gx = yield Guangxi.save();
         this.body = gx;
    } catch (err) {
        this.throw(err);
    }
};

exports.getSiteById = function *() {
    var gx = yield Guangxi.findOneSite(this.params.id);
    this.body = trans(gx);
};

exports.getNear2Sites = function *() {
    var ctx = this;
    var site, sites;
    
    yield Guangxi.findOne({_id: this.params.id}, function (err, res){
       site = res;
    });
    site = JSON.parse(JSON.stringify(site));
    yield Guangxi.find({
        'geometry' : { $near : site.geometry },
        _id : { $ne : site._id },
    }, {
        // all fields
    }).limit(this.params.num || 2).exec(function(err, res) {
        if (err) throw err;
        sites = res;
    });
    ctx.body = _.map(sites, function(site){
        return {
            _id: site._id,
            position: site.geometry.coordinates
        };
    }); 
};
