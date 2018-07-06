// Build script for website.

var Metalsmith = require('metalsmith'),
    assets = require('metalsmith-assets'),
    collections = require('metalsmith-collections'),
    drafts = require('metalsmith-drafts'),
    markdown = require('metalsmith-markdown'),
    metadata = require('metalsmith-metadata'),
    nib = require('nib'),
    permalinks = require('metalsmith-permalinks'),
    serve = require('metalsmith-serve'),
    stylus = require('metalsmith-stylus'),
    templates = require('metalsmith-layouts'),
    updated = require('metalsmith-updated'),
    watch = require('metalsmith-watch');

// Adds files in dir to the pipeline as if they were in the source folder
// Dir is a path relative to the Metalsmith root.
var join = function(dir) {
    return function(files, metalsmith, done) {
        var path = metalsmith.path() + '/' + dir;
        metalsmith.read(path, function(err, new_files) {
            if (err) {
                done(err);
            }
            for (fname in new_files) {
                if (files.hasOwnProperty(fname)) {
                    done(new Error('Duplicate file: ' + fname));
                }
                files[fname] = new_files[fname];
            }
            done();
        });
    };
};

var defaultLayout = function(config) {
    return function(files, metalsmith, done) {
        for (var fname in files) {
            var file = files[fname];
            if (file.layout) continue;
            if (!file.collection) continue;
            for (var c in config) {
                if (file.collection.indexOf(config[c].collection) > -1) {
                    file.layout = config[c].layout;
                    break;
                }
            }
        }
        done();
    };
};

var print = function(files, metalsmith, done) {
    for (x in files) {
        if (x.indexOf('home') > -1) {
            console.log(x);
        }
    }
    done();
};

Metalsmith(__dirname)
    .destination('./build')
    .use(metadata({
        config: '_metadata.yaml'
    }))
    .use(join('templates/source'))
    .use(assets({
        source: './vendor',
        destination: './vendor'
    }))
    .use(collections({
        posts: {
            pattern: "posts/*/*.md",
            sortBy: 'date',
            reverse: true,
            refer: false
        },
        pages: {
            pattern: "*.md"
        }
    }))
    .use(defaultLayout([{
        collection: "posts",
        layout: "post.jade"
    }, {
        collection: "pages",
        layout: "page.jade"
    }]))
    .use(markdown())
    .use(permalinks({
        relative: false,
        linksets: [{
            match: {
                collection: 'posts'
            },
            pattern: 'posts/:title'
        }]
    }))
    .use(updated())
    .use(templates({
        engine: "jade",
        directory: "templates/layout",
        partials: "templates/layout"
    }))
    .use(stylus({
        compress: true,
        use: [nib()]
    }))
    .use(serve({
        port: 8080
    }))
    .build(function(err) {
        if (err) console.log(err);
    });
