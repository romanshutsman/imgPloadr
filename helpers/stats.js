var models = require('../models'),
    async = require('async');
module.exports = function (callback) {
    async.parallel([
        function (next) {
            models.Image.countDocuments({}, next);
        },
        function (next) {
            models.Comment.countDocuments({}, next);
        },
        function (next) {
            models.Image.aggregate()
            .group({_id: '1',viewsTotal: { $sum: '$views'}})
            .exec(function (err, result) {
                var viewsTotal = 0;
                if (result.length > 0) {
                    viewsTotal += result[0].viewsTotal;
                }
                next(null, viewsTotal);
            })
        },
        function (next) {
            models.Image.aggregate()
                .group({_id: '1',likesTotal: { $sum: '$likes'}})
                .exec(function (err, result) {
                    var likesTotal = 0;
                    if (result.length > 0) {
                        likesTotal += result[0].likesTotal;
                    }
                    next(null, likesTotal);
                })
        }
    ], function (err, results) {
        callback(null, {
            images: results[0],
            comments: results[1],
            views: results[2],
            likes: results[3]
        });
    });
};