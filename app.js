 var fs = require("fs");
 var path = require("path");
 var join = path.join;
 var _ = require('underscore');
 var path = require("path");
 var xlsx = require('node-xlsx');
 var async = require('async');
 var parsinFile = require("./parsinFile")
 var folderPath = process.argv[2];
 class app
 {
     //_dirPath:要检查的文件夹的路径
     constructor(_dirPath)
     {
         this._dirPath = _dirPath;
         this._fullPath = path.resolve(__dirname, _dirPath);
         this.list = [];
         this.asyncList = [];
         this._needTypes = this.needFileTypeList().toString()
         this.run();
     };
     //需要忽略的文件
     needFileTypeList()
     {
         return ["vue", 'js', 'ts'];
     };
     mkdirsSync(dirname)
     {
         if (fs.existsSync(dirname))
         {
             return true;
         }
         else
         {
             if (this.mkdirsSync(path.dirname(dirname)))
             {
                 fs.mkdirSync(dirname);
                 return true;
             }
         }
     };
     findFile(path, cb)
     {
         let files = fs.readdirSync(path);
         files.forEach((item, index) =>
         {
             let fPath = join(path, item);
             let stat = fs.statSync(fPath);
             if (stat.isDirectory() === true)
             {
                 this.findFile(fPath, cb);
             }
             if (stat.isFile() === true)
             {
                 var indexStart2 = item.lastIndexOf('.');
                 var indexStart1 = item.indexOf('.');
                 let type = item.substr(indexStart2 + 1, indexStart2.length);
                 if (this._needTypes.indexOf(type) > -1 && indexStart1 === indexStart2)
                 {
                     cb(fPath, item);
                 }
             }
         });
     };
     run()
     {
         this.mkdirsSync("./out")
         this.findFile(this._fullPath, (_fullPath, _fileName) =>
         {
             this.asyncList.push((callback) =>
             {
                 new parsinFile(_fullPath, (list) =>
                 {
                     this.list = _.union(this.list, list);
                     callback();
                     //  
                 });
             });
         })
         async.waterfall(this.asyncList, (err, result) =>
         {
             console.log("union list finsh success")
             this.saveExeclFile(this.list);
         })
     };
     // 保存execl文件
     saveExeclFile(_saveList)
     {
         if (_saveList.length <= 0)
         {
             return console.log("未找到 \nall finsh success!!!")
         }
         var execlList = [];
         for (var idx in _saveList)
         {
             execlList.push([_saveList[idx]])
         }
         var buffer = xlsx.build([
         {
             name: 'sheet1',
             data: execlList
         }]);
         fs.writeFileSync("out/" + 'all.xlsx', buffer,
         {
             'flag': 'w'
         });
     }
 }
 if (!!folderPath)
 {
     new app(folderPath);
 }
 else
 {
     console.log("请输入相对路径")
 }