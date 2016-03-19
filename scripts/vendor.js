var yaml = require('yaml-front-matter');
var fs = require('hexo-fs');
// Script to copy third party scripts into the public folder
hexo.extend.filter.register('after_post_render', function(data){
    var base = hexo.base_dir + 'vendor';
    var public = hexo.public_dir + 'vendor';
    scripts = yaml.loadFront(data.raw).vendor;
    if (scripts) {
        fs.mkdirs(public);
        for (file in scripts) {
            var vendor_file = base+ '/' + scripts[file];
            var pub_file = public + '/' + scripts[file];
            fs.copyFile(vendor_file, pub_file);
        }
    }
    return data;
});

hexo.extend.tag.register('vendor', function(args, content){
    var path = '/vendor/'+args[0];
    return '<script type="text/javascript" src='+path+'"></script>';
});
