const fs = require('fs'),
    path = require('path'),
    Models = require('../models'),
    sidebar = require('../helpers/sidebar'),
    md5 = require('MD5');

module.exports = {
    index: (req, res) => {
        var viewModel = {
            image: {},
            comments: []
        };
        console.log('ID', req.params.image_id)
        console.log('ID', Models.Image.find({ filename: 'jd9d8w' }));

        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, (err, image) => {
            if (err) throw err;
            console.log('img', image);

            if (image) {
                image.views = image.views + 1;
                viewModel.image = image;
                image.save();

                Models.Comment.find({ image_id: image._id }, {}, {
                    sort: {
                        'timestamp': 1
                    }
                },
                    function (err, comments) {
                        if (err) { throw err; }
                        viewModel.comments = comments;
                    });
            } else {
                // res.redirect('/');
                // res.finished = true;
                // res.end()
            }
            sidebar(viewModel, function (viewModel) {
                res.render('image', viewModel);
            });
        })
    },
    create: (req, res) => {
        var saveImage = function () {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';
            for (var i = 0; i < 6; i += 1) {
                imgUrl += possible.charAt(Math.floor(Math.random() *
                    possible.length));
            }
            /* Start new code: */
            // search for an image with the same filename by performing a find:
            Models.Image.find({ filename: imgUrl }, function (err, images) {
                console.log('A', err);
                console.log('B', images);
                if (images.length > 0) {
                    // if a matching image was found, try again (start over):
                    saveImage();
                } else {
                    /* end new code:*/
                    var tempPath = req.files.aPhoto.path,
                        ext = '.' + req.files.aPhoto.extension,
                        targetPath = path.resolve(__dirname + './../public/upload/' + imgUrl + ext);
                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext ===
                        '.gif') {
                        fs.rename(tempPath, targetPath, function (err) {
                            if (err) { throw err; }
                            /* Start new code: */
                            // create a new Image model, populate its details:
                            var newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            // and save the new Image
                            newImg.save(function (err, image) {
                                res.redirect('/images/' + image.uniqueId);
                            });
                            /* End new code: */
                        });
                    } else {
                        fs.unlink(tempPath, function () {
                            if (err) { throw err; }
                            res.json(500, { error: 'Only image files are allowed.' });
                        });
                    }
                    /* Start new code: */
                }
            });
            /* End new code: */
        };
        saveImage();
    },
    like: (req, res) => {
        Models.Image.findOne({
            filename: { $regex: req.params.image_id }
        },
            function (err, image) {
                if (!err && image) {
                    image.likes = image.likes + 1;
                    image.save(function (err) {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json({ likes: image.likes });
                        }
                    });
                }
            });
    },
    comment: (req, res) => {
        Models.Image.findOne({
            filename: { $regex: req.params.image_id }
        },
            function (err, image) {
                if (!err && image) {
                    console.log(req.body)
                    var newComment = new Models.Comment(req.body);
                    newComment.gravatar = md5(newComment.email);
                    newComment.image_id = image._id;
                    newComment.save(function (err, comment) {
                        if (err) { throw err; }
                        res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                    });
                } else {
                    res.redirect('/');
                }
            });
    },
    remove: function (req, res) {
        Models.Image.findOne({
            filename: { $regex: req.params.image_id }
        },
            function (err, image) {
                if (err) { throw err; }
                fs.unlink(path.resolve(__dirname +'./../public/upload/' + image.filename),
                    function (err) {
                        if (err) { throw err; }
                        Models.Comment.remove({ image_id: image._id },
                            function (err) {
                                image.remove(function (err) {
                                    if (!err) {
                                        res.json(true);
                                    } else {
                                        res.json(false);
                                    }
                                });
                            });
                    });
            });
    }
}