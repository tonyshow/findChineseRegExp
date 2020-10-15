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
        this.reg = /[\u4e00-\u9fa5]+/g
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
        let currIdx = 1;
        objReadline.on('line', (line) =>
        {
            let findResultList = line.match(this.reg)
            if (null != findResultList)
            {
                this.totalRepeatCnt += findResultList.length;
                this.list = _.union(this.list, findResultList);
            }
            currIdx++;
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