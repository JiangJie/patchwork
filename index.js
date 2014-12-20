var proj=require('./lib/projectPatch');


module.exports=
{
    hash:require('./lib/getHash'),
    diff:require('./lib/diff'),
    patch:require('./lib/patch'),
    projdiff:proj.diff,
    projpatch:proj.patch
};