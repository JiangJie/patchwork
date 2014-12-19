var crypto = require('crypto');
var fs = require('fs');

module.exports=function(path,opt,cb)
{
    if (arguments.length==2)
    {
        cb=opt;
        opt=null;
    }
    opt||(opt={});
    opt.hash||(opt.hash='sha1');
    opt.digest||(opt.digest='hex');

    var readStream = fs.createReadStream(path);
    var hash = crypto.createHash(opt.hash);
    readStream.on('data', function (chunk)
    {
        hash.update(chunk);
    }).on('error',function(err)
    {
      readStream.removeAllListeners();
      cb(err);
    })
    .on('end', function ()
    {
        cb(null,hash.digest(opt.digest));
    });
};

