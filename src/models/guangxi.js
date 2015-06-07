"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var GuangxiSchema = new Schema({
  type: String,
  properties: {
      file_name: { type: String, unique: true },
      file_type: { type: String, default: "JPG" },
      camera_type: Number,
      camera_subtype: Number,
      sequence_id: Number,
      timestamp: Number,
      GPS_time: Number,
      GPS_time_us: Number,
      alt: Number,
      attitude_x: Number,
      attitude_y: Number,
      attitude_z: { type: Number, min: -180, max: 180 },
      trigger_id: Number,
      frame_id: Number,
      created: { type: Date, default: Date.now },
      updated: { type: Date, default: Date.now }
  },
  geometry: {
      type: { type: String },
      coordinates: { type: [Number], index: '2dsphere' }
  }
});

GuangxiSchema.index({ 'loc' : '2dsphere' });
GuangxiSchema.pre("save", function (next) {
    this.updated = new Date();
    next();
});
GuangxiSchema.statics.findOneSite = function(sid, cb) {
    return this.findOne({
        _id : sid
    }).exec(cb);
};
GuangxiSchema.statics.findAll = function(cb) {
    return this.find({}).exec(cb);
};
mongoose.model("Guangxi", GuangxiSchema);
