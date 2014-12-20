var patch=require('./patch');
var diff=require('./diff');
var hash=require('./getHash');
var getDirs=require('getdirs');
var path =require('path');
var fse=require('fs-extra');

var patchSuffix=".ep";
var manifestFileName='patch.json';

module.exports=
{
    diff:function(oldProjRoot,newProjRoot,OutputFolder,cb)
    {
        var getDirBarrier=0;
        var oldProj,newProj;
        var patchIndex=0;
        var hadErr=false;
        var callbacksAwaited=1;
        var callbacksReceived=0;
        var finished=false;
        var manifest=
        {
            del:[],
            ins:[],
            patches:[]
        };
        fse.ensureDir(OutputFolder,function(err)
        {
            if (err)
                return onErr(err);
            getDirs.nested(oldProjRoot,{includeFiles:true,includeFileStats:true},function(err,out)
            {
                if (err)
                    return onErr(err);
                oldProj=out;
                getDirReturned();
            });
            getDirs.nested(newProjRoot,{includeFiles:true,includeFileStats:true},function(err,out)
            {
                if (err)
                    return onErr(err);
                newProj=out;
                getDirReturned();
            });
        });

        function onErr(err)
        {
            if (hadErr)
                return;
            hadErr=true;
            cb(err);
        }
        function asyncCallBack(err)
        {
            if (err)
                onErr(err);
            callbacksReceived++;
            if (finished&&callbacksAwaited==callbacksReceived)
            {
                //Write the manifest
                fse.outputJson(path.join(OutputFolder,manifestFileName), manifest, function(err)
                {
                    if (err)
                        return onErr(err);
                    cb(null,manifest);
                })
            }
        }
        function createDelPatch(relpath)
        {
            manifest.del.push(relpath);
        }
        function createDiffPath(relpath,size)
        {
            var patchFile=(++patchIndex)+patchSuffix;
            manifest.patches.push
            ({
                p:relpath,//Path
                s:patchFile,//Src
                sz:size
            });
            diff(path.join(oldProjRoot,relpath),path.join(newProjRoot,relpath),path.join(OutputFolder,patchFile),asyncCallBack);
            callbacksAwaited++;
        }
        function createInsPatch(relpath)
        {
            var filename=(++patchIndex)+patchSuffix;
            manifest.ins.push
            ({
                 p:relpath, //Path
                 s:filename //Src
            });
            fse.copy(path.join(newProjRoot,relpath),path.join(OutputFolder,filename),asyncCallBack);
            callbacksAwaited++;
        }
        function getDirReturned()
        {
            if (++getDirBarrier!=2)
                return;

            //Otherwise we have both project listings and can begin the project level diffing
            recursiveCompare(oldProj,newProj,'');
            finished=true;
            asyncCallBack(null);
        }
        function recursiveCreatePatch(New,relPath)
        {
            //Create Patches For the files
            for (var i= 0,c=New.filenames.length;i<c;i++)
            {
                var filename=New.filenames[i];
                createInsPatch(path.join(relPath,filename));
            }


            for (i=0,c=New.dirnames.length;i<c;i++)
            {
                var foldername=New.dirnames[i];
                var newRelPath=path.join(relPath,foldername);
                var newFolder=New.dir[foldername];
                recursiveCreatePatch(newFolder,newRelPath);
            }
        }
        function recursiveCompare(Old,New,relPath)
        {
            if (hadErr)
                return;
            //=====================File Comparison==================================//
            for (var i= 0,c=New.filenames.length;i<c;i++)
            {
                var filename=New.filenames[i];
                var oldFile=Old.fileStats[filename];
                var newFile=New.fileStats[filename];

                //NewFile should not be null
                if (!oldFile) //Then we have to have a create patch
                    createInsPatch(path.join(relPath,filename));
                else
                {
                    //Low level cheap compare
                    if (oldFile.size!=newFile.size)  //Get the file diff and add
                        createDiffPath(path.join(relPath,filename),oldFile.size);
                    else
                    {
                        hash(path.join(oldProjRoot,relPath,filename),function(err,oldHash)
                        {
                            if (hadErr)
                                return;
                            if (err)
                            {
                                hadErr=true;
                                return cb(err);
                            }
                            //Get the New files hash
                            hash(path.join(newProjRoot,relPath,filename),function(err,newHash)
                            {
                                if (hadErr)
                                    return;
                                if (err)
                                {
                                    hadErr=true;
                                    return cb(err);
                                }
                               //Compare Hashes
                                if (oldHash!==newHash)
                                    createDiffPath(path.join(relPath,filename),oldFile.size);
                            })
                        })
                    }
                }
                //So now we have to remove the entry in the old File listing so we can check for deletion operations on files
                Old.fileStats[filename]=null;
            }
            //Looking for deletion operations
            var possibleDels=Object.keys(Old.fileStats);
            for (i= 0,c=possibleDels.length;i<c;i++)
            {
                var oldfilename=possibleDels[i];
                if (!Old.fileStats[oldfilename])//Null value that was deleted because newfile contains it
                    continue;
                //Otherwise the new directory does not contain this file
                createDelPatch(path.join(relPath,oldfilename));
            }
            //=====================Folder Comparison=============================//

            for (i=0,c=New.dirnames.length;i<c;i++)
            {

                var foldername=New.dirnames[i];
                var newRelPath=path.join(relPath,foldername);

                var oldFolder=Old.dir[foldername];
                var newFolder=New.dir[foldername];

                //newFolder should not be null
                if (!oldFolder)
                    recursiveCreatePatch(newFolder,newRelPath);
                else
                    recursiveCompare(oldFolder,newFolder,newRelPath)
            }
            //Looking for deletion operations
            possibleDels=Object.keys(Old.dir);
            for (i= 0,c=possibleDels.length;i<c;i++)
            {
                var oldFolderName=possibleDels[i];
                if (!Old.dir[oldFolderName])//Null value that was deleted because newfile contains it
                    continue;
                //Otherwise the new directory does not contain this file
                createDelPatch(path.join(relPath,oldFolderName));
            }
        }
    },
    patch:function(OldProjRoot,InputFolder,cb)
    {

        var hadErr=false;
        var manifest=null;
        var finished=false;
        var callbacksAwaited=1;
        var callbacksReceived=0;

        fse.exists(path.join(InputFolder,manifestFileName),function(exists)
        {
            if (!exists)
                return onErr(new Error("Cannot find "+manifestFileName+" in "+InputFolder));
            fse.readJson(path.join(InputFolder,manifestFileName), onManifestLoaded)
        });

        function asyncCallBack(err)
        {
            if (err)
                return onErr(err);
            callbacksReceived++;
            if (finished&&callbacksAwaited==callbacksReceived)
                cb()
        }
        function onErr(err)
        {
            if (hadErr)
                return;
            hadErr=true;
                cb(err);
        }
        function onManifestLoaded(err,json)
        {
          if (err)
            return onErr(err);
            manifest=json;

            performInsertions();
            performPatches();
            performDeletions();
            finished=true;
            asyncCallBack();
        }
        function performInsertions()
        {
            for (var i= 0,c=manifest.ins.length;i<c;i++)
            {
                var rel=manifest.ins[i];
                var relpath=rel.p;
                var src=rel.s; //.ep to read from

                callbacksAwaited++;
                (function(src,relpath) {
                    fse.ensureDir(path.dirname(relpath), function (err) {
                        if (err)
                            return onErr(err);
                        fse.copy(path.join(InputFolder, src), path.join(OldProjRoot, relpath), asyncCallBack);
                    });
                })(src,relpath);
            }
        }
        function performPatches()
        {
            for (var i= 0,c=manifest.patches.length;i<c;i++)
            {
                var rel=manifest.patches[i];
                var relpath=rel.p;
                var src=rel.s; //.ep patch file to read from
                var size=rel.sz;

                callbacksAwaited++;
                (function (relpath,src,size)
                {
                    var absOldPath = path.join(OldProjRoot, relpath);
                    fse.exists(absOldPath, function (exists) {

                        if (!exists)
                            return onErr(new Error("Cannot find old src file to patch " + relpath));

                        fse.stat(absOldPath, function (err, stats) {
                            if (err)
                                return onErr(err);

                            if (stats.size != size)
                                return onErr(new Error("Old src file " + absOldPath + " is not the expected size"));

                            callbacksAwaited++;
                            patch(absOldPath, absOldPath, path.join(InputFolder, src), asyncCallBack);
                        });
                    });
                })(relpath,src,size);
            }
        }
        function performDeletions()
        {
            for (var i= 0,c=manifest.del.length;i<c;i++)
            {
                callbacksAwaited++;
                fse.remove(path.join(OldProjRoot,manifest.del[i]),asyncCallBack);
            }
        }
    }
};