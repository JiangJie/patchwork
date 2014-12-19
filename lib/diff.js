var isWin=require('./isWin');
var path=require('path');
var childProcess= require('child_process');
var exec=childProcess.exec;

var diff = isWin?path.resolve('../bin/win/bsdiff.exe'):path.resolve('../bin/nix/bsdiff');

module.exports=function(Old,New,PatchDest,cb)
{
    exec(diff+" "+Old+" "+New+" "+PatchDest,function(error,stdout,stderr)
    {
        cb(error);
    });
};