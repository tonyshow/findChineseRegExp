var readline = require('readline')
var fs = require("fs");
var path = require("path");
var _ = require('underscore');
var xlsx = require('node-xlsx');
class parsinFile
{
    constructor(_fullPath, _endCallBack)
    {
        this._fullPath = _fullPath;
        var indexStart = _fullPath.lastIndexOf('/');
        var indexStart2 = _fullPath.lastIndexOf('.');
        var strLen = (indexStart2 - indexStart) - 1;
        this.execlFileName = _fullPath.substr(indexStart + 1, indexStart + strLen);
        this.fileInfo = "";
        this.reg = /(\/\/- [\u4e00-\u9fa5]+)|(\/\/- @[\u4e00-\u9fa5]+)|(\/\/[\u4e00-\u9fa5]+)|([\u4e00-\u9fa5]+)/g
        this.totalRepeatCnt = 0; //未去重
        this.list = [];
        this.endCallBack = _endCallBack; //检查出来的结果
        this.run();
    };
    run()
    {
        var fRead = fs.createReadStream(this._fullPath);
        var objReadline = readline.createInterface(
        {
            input: fRead,
        });
        objReadline.on('line', (line) =>
        {
            if (-1 != line.indexOf("//"))
            {
                // 去掉被注释掉的部分文字
                let pos = line.indexOf("//");
                line = line.substr(0, pos);
            }
            // vue全行注释
            if (-1 != line.indexOf("//-"))
            {
                return;
            }
            let findResultList = line.match(this.reg)
            if (null != findResultList)
            {
                findResultList = _.reject(findResultList, (info) =>
                {
                    return info.indexOf("//") != -1;
                })
                if (findResultList.length == 1)
                {
                    this.totalRepeatCnt += findResultList.length;
                    this.list = _.union(this.list, findResultList);
                }
                else if (findResultList.length > 1)
                {
                    if (findResultList.toString().indexOf("//") == -1)
                    {
                        this.totalRepeatCnt += 1;
                        this.list = _.union(this.list, ["needFind=" + findResultList.toString()]);
                    }
                }
            }
        });
        objReadline.on('close', () =>
        {
            console.log('readline close...');
            this.endCallBack(this.list);
        });
    };
    // 保存execl文件
    saveExeclFile(_saveList)
    {
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
        fs.writeFileSync("out/" + this.execlFileName + '.xlsx', buffer,
        {
            'flag': 'w'
        });
    }
}
module.exports = parsinFile;