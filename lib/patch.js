var isWin=require('./isWin');
var path=require('path');
var childProcess= require('child_process');
var exec=childProcess.exec;

var patch = isWin?path.resolve(__dirname, '../bin/win/bspatch.exe'):path.resolve(__dirname, '../bin/nix/bspatch');

module.exports=function(Old,NewDest,Patch,cb)
{
    exec(patch+" "+Old+" "+NewDest+" "+Patch,function(error,stdout,stderr)
    {
        cb(error);
    });
};