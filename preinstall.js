var childProcess= require('child_process');
var exec=childProcess.exec;
var path=require('path');
var isWin=require('./lib/isWin');
var fsextra=require('fs-extra');

function informInstaller(err)
{
    console.log("PATCHWORK WAS NOT INSTALLED CORRECTLY!!!");
    console.log();
    console.log("Please report this bug to titon1235@gmail.com with your error and system details");
    throw err;
}


var binPath=path.resolve('./bin/nix');
var makeFilePath=path.resolve('./src');
var bspatch="bspatch";
var bsdiff="bsdiff";


//Start with the Patch executable
console.log("===Compiling PATCHWORK for your system===");
if (isWin)
    return console.log("Compilation successful");


console.log("Compiling bsPatch...");
exec('make '+bspatch,
{
    cwd:makeFilePath
},function(error,stdout,stderr)
{
    if (error)
    {
        console.log('Catastrophic installation error making bspatch');
        informInstaller(error);
    }
    //Make the diff executable
    console.log("Compiling bsdiff...");
    exec('make '+bsdiff,
        {
            cwd:makeFilePath
        },function(error,stdout,stderr)
        {
            if (error)
            {
                console.log('Catastrophic installation error making bsdiff');
                informInstaller(error);
            }
            //Clean the directory
            console.log("Cleaning source directory...");
            exec('make clean',
                {
                    cwd:makeFilePath
                },function(error,stdout,stderr)
                {
                    if (error)
                    {
                        console.log('Catastrophic installation error cleaning src directory');
                        informInstaller(error);
                    }
                    //Copy executables to bin
                    console.log("Copying binaries to bin...");
                    try
                    {
                        fsextra.copySync(path.join(makeFilePath, bsdiff), path.join(binPath, bsdiff));
                        fsextra.copySync(path.join(makeFilePath, bsdiff), path.join(binPath, bsdiff));
                    }
                    catch (errors)
                    {
                        console.log('Catastrophic installation error cleaning src directory');
                        informInstaller(error);
                    }
                    console.log("Compilation successful");
                });
        });
});