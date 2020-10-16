 var fs = require("fs");
 var path = require("path");
 var join = path.join;
 var _ = require('underscore');
 var path = require("path");
 var xlsx = require('node-xlsx');
 var async = require('async');
 var parsinFile = require("./parsinFile")
 const axios = require('axios');
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
                 });
             });
         })
         async.waterfall(this.asyncList, (err, result) =>
         {
             console.log("the union list finsh success")
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
         for (let txt of _saveList)
         {
             if (-1 != txt.indexOf("needFind="))
             {
                 txt = txt.replace("needFind=", "");
                 execlList.push([txt, "需要检查是否为拼接"])
             }
             else
             {
                 execlList.push([txt])
             }

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
         //  var indxMax = 0;
         //  let size = _.size(_saveList)
         //  let needTranslateList = "";
         //  //自动翻译
         //  for (let txt of _saveList)
         //  {
         //      console.log(txt)
         //      axios.get('https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=' + encodeURI(txt))
         //          .then(response =>
         //          {
         //              ++indxMax;
         //              console.log(indxMax)
         //              if (!!response.data && !!response.data.translateResult)
         //              {
         //                  let translateResult = response.data.translateResult[0][0];
         //                  let tgt = translateResult.tgt
         //                  execlList.push([translateResult.src, tgt])

         //              }
         //              if (size == indxMax)
         //              {
         //                  var buffer = xlsx.build([
         //                  {
         //                      name: 'sheet1',
         //                      data: execlList
         //                  }]);
         //                  fs.writeFileSync("out/" + 'all.xlsx', buffer,
         //                  {
         //                      'flag': 'w'
         //                  });
         //              }
         //          })
         //          .catch(error =>
         //          {
         //              console.log(error);
         //          });
         //  }
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