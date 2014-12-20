#Patchwork
==================
###To install :
```bash
npm install --save eitrium-patchwork
```
Patchwork is a system for diffing and patching individual files and projects.

###To use
```js
var patchwork=require('eitrium-patchwork');

var oldp='old/proj/root';
var newp='new/proj/root';
var patchp='patch/output/folder';

patchwork.projdiff(oldp,newp,patchp,function(err)
{
    if (!err)
     patchwork.projpatch(oldp,patchp,function(err)
     {
         if (!err)
            console.log("Patch done")
     });
});
```
##Notes

Patchwork currently uses bsdiff as its internal diffing mechanism which produces minimal size patches.Bsdiff has a memory complexity of  max(17*n,9*n+m)+O(1) bytes of memory, where n is the size of the old file and m is the size of the new file. bspatch requires n+m+O(1) bytes. 

Patchwork contains prebuild binaries for bsdiff and bspatch for windows, and uses a compilation step in the npm preinstall to call ```make``` using the ```gcc``` compiler to build the bsdiff and bspatch binaries from source.

Full disclosure, this is untested on linux for the time being, though the windows version appears stable.

Future versions will contain modifications to the underlying diff and patch systems to allow you to choose the diff/patch system to optimize more cpu/memory usage.

##API

###hash(path,[options],callback)
Performs a hash on an object. Used to determine if a patch is required between 2 files.

*path*: String . Path to the file to hash.

*options*:Object

--hash:String. The hashing algorithm to use . Default : 'sha1'

--digest:String. The output type of the hash. Default : 'hex'

*callback*:function(err,hash) where hash is the output of the hash function

###diff(oldobjpath,newobjpath,patchoutputpath,callback)
Performs a hash on an object. Used to determine if a patch is required between 2 files.

*oldobjpath*: String . Path to the old file.

*newobjpath*: String . Path to the new file.

*patchoutputpath*: String . Path to output the patch file 

*callback*:function(err) 

###patch(oldobjpath,newobjpath,patchinputpath,callback)
Performs a hash on an object. Used to determine if a patch is required between 2 files.

*oldobjpath*: String . Path to the old file.

*newobjpath*: String . Path to output the patched file.

*patchinputpath*: String . Path to input the patch file 

*callback*:function(err) 

###projdiff(oldProjRoot,newProjRoot,OutputFolder,callback)
Performs a project patch level patch, outputting a series of patch objects in the output folder.The patches are named .ep files and are controlled by a json manifest file called patch.json.You can then zip the the folder and distribute it to a client, then unzip and use the projpatch to patch the project

*oldProjRoot*: String . Path to the root of the old project

*newProjRoot*: String . Path to the root of the old project

*OutputFolder*: String . Path to output the patches 

*callback*:function(err) 

###projpatch(OldProjRoot,InputFolder,callback)
Performs a patch of the project.

*oldProjRoot*: String . Path to the root of the old project

*InputFolder*: String . Path to the patch folder

*callback*:function(err)

