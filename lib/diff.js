var isWin=require('./isWin');
var path=require('path');
var childProcess= require('child_process');
var exec=childProcess.exec;

var diff = isWin?path.resolve(__dirname, '../bin/win/bsdiff.exe'):path.resolve(__dirname, '../bin/nix/bsdiff');

module.exports=function(Old,New,PatchDest,cb)
{
    var cmd='\"'+diff+"\" \""+Old+"\" \""+New+"\" \""+PatchDest+'\"';
    exec(cmd,function(error,stdout,stderr)
    {
        cb(error);
    });
};