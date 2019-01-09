/**
 * Created by apple on 2018/10/9.
 */
var checkCard = {};

/*
* arr  传入为数组
* @return {
*    types:string 类型 不符合的返回NULL
*    arr:array  返回排序好的数组，直接渲染即可
*    maxNum:number 返回牌面最大的数字 用于比较大小
* }
* */
checkCard.getType = function(arr){
    //从大到小排序
    arr.sort((a,b)=>b-a);
    var arrLen = arr.length;
    var check = checkCard.val;
    //王炸
    if(arrLen == 2 && check(arr[0]) == 17 && check(arr[1]) == 16){
        return {
            types:'WangZha',
            arr:arr,
            maxNum:check(arr[0])
        };
    }
    //炸弹
    if(arrLen == 4 && check(arr[0]) == check(arr[3]) && check(arr[0]) == check(arr[1]) && check(arr[0]) == check(arr[2])){
        return {
            types:'ZhaDan',
            arr:arr,
            maxNum:check(arr[0])
        };
    }
    //单牌
    if(arrLen == 1 && check(arr[0])){
        return {
            types:'DanZhi',
            arr:arr,
            maxNum:check(arr[0])
        };
    }
    //对子
    if(arrLen == 2 && check(arr[0]) == check(arr[1])){
        return {
            types:'DuiZi',
            arr:arr,
            maxNum:check(arr[0])
        };
    }
    //单顺
    if(arrLen >=5 && arrLen<=12){
        var checkBool = true;
        for(var i = 0;i<arrLen-1;i++){
            nowCard = check(arr[i]);
            nextCard = check(arr[i+1]);
            if(nowCard == 17 || nowCard == 16 || nowCard == 15 || nextCard ==17 || nextCard ==16 || nextCard ==15){
                //顺子的牌不能有大王，小王，2
                checkBool = false;
                break;
            }else{
                if(nowCard - nextCard != 1){
                    checkBool = false;
                    break;
                }
            }
        }
        if(checkBool){
            return {
                types:'DanShun',
                maxNum:check(arr[0]),
                arr:arr.sort((a,b)=>a-b)
            };
        }
    }
    //对顺
    if(arrLen >= 6 && arrLen % 2 == 0){
        var checkBool = true;
        for(var i = 0;i<arrLen;i=i+2){
            if(check(arr[i]) != check(arr[i+1])){
                checkBool = false;
                break;
            }
            if(i < arrLen - 2){
                //判断相隔两场牌的值是不是1
                if(check(arr[i]) - check(arr[i+2]) != 1){
                    checkBool = false;
                    break;
                }
            }
        }
        if(checkBool){
            return {
                types:'DuiShun',
                arr:arr,
                maxNum:check(arr[0])
            }
        }
    }
    //三不带
    if(arrLen == 3 && check(arr[0]) == check(arr[1]) && check(arr[0]) == check(arr[2])){
        return {
            types:'SanBuDai',
            arr:arr,
            maxNum:check(arr[0])
        };
    }
    //三带1
    if(arrLen == 4){
        //单在开头
        if(check(arr[3]) == check(arr[2]) && check(arr[3]) == check(arr[1])){
            return {
                types:'SanDaiYi',
                arr:[arr[1],arr[2],arr[3],arr[0]],
                maxNum:check(arr[1])
            };
        }
        //单在末尾
        if(check(arr[0]) == check(arr[1]) && check(arr[0]) == check(arr[2])){
            return {
                types:'SanDaiYi',
                arr:arr,
                maxNum:check(arr[0])
            };
        }
    }
    //三带二
    if(arrLen == 5){
        //对子在开头
        if(check(arr[0]) == check(arr[1]) && check(arr[2]) == check(arr[3]) && check(arr[2]) == check(arr[4])){
            return {
                types:'SanDaiEr',
                arr:[arr[2],arr[3],arr[4],arr[0],arr[1]],
                maxNum:check(arr[2])
            }
        }
        //对子在末尾
        if(check(arr[0]) == check(arr[1]) && check(arr[0]) == check(arr[2]) && check(arr[3]) == check(arr[4])){
            return {
                types:'SanDaiEr',
                arr:arr,
                maxNum:check(arr[0])
            }
        }
    }
    //四带二
    if(arrLen == 6){
        for(var i = 0;i<arrLen-3;i++){
            if(check(arr[i]) == check(arr[i+1]) && check(arr[i]) == check(arr[i+2]) && check(arr[i]) == check(arr[i+3])){
                var tempArr = [],num = 0;
                if(i == 0){
                    //炸弹在开头
                    tempArr = arr;
                    num = check(arr[0]);
                }
                if(i == 2){
                    //炸弹在末尾
                    tempArr = [arr[2],arr[3],arr[4],arr[5],arr[0],arr[1]];
                    num = check(arr[2]);
                }
                if(i == 1){
                    //炸弹在中间
                    tempArr = [arr[1],arr[2],arr[3],arr[4],arr[0],arr[5]];
                    num = check(arr[1]);
                }
                return {
                    types:'SiDaiEr',
                    arr:tempArr,
                    maxNum:num
                };
            }
        }
    }
    //四带二对
    if(arrLen == 8){
        if(checkCard.getPlaneType(arr,'SiDaiDui').types == 'SiDaiDui'){
            return checkCard.getPlaneType(arr,'SiDaiDui');
        }
    }
    //飞机不带
    if(arrLen >= 6 && arrLen % 3 == 0 ){
        if(checkCard.getPlaneType(arr,'FeiJi').types == 'FeiJi'){
            return checkCard.getPlaneType(arr,'FeiJi');
        }
    }
    //飞机带单只
    if(arrLen >= 8 && arrLen % 4 == 0){
        if(checkCard.getPlaneType(arr,'FeiJiDaiYi').types == 'FeiJiDaiYi'){
            return checkCard.getPlaneType(arr,'FeiJiDaiYi');
        }
    }
    //飞机带对子
    if(arrLen >= 10 && arrLen % 5 ==0){
        if(checkCard.getPlaneType(arr,'FeiJiDaiDui').types == 'FeiJiDaiDui'){
            return checkCard.getPlaneType(arr,'FeiJiDaiDui');
        }
    }

    return {
        types:null
    };
}

/*
* 判断飞机类型以及特殊的飞机牌型 如3333444555666777
* */
checkCard.getPlaneType = function(arr,type){
    arr.sort((a,b)=>b-a);
    var arrLen = arr.length;
    var check = checkCard.val;
    switch (type){
        case 'FeiJi':
            //飞机不带
            if(arrLen >= 6 && arrLen % 3 == 0 ){
                var checkBool = true;
                var tempArr = [];
                for(var i = 0;i < arrLen;i=i+3){
                    if(check(arr[i]) == check(arr[i+1]) && check(arr[i]) == check(arr[i+2])){
                        if(check(arr[i]) == 15){
                            checkBool = false;
                            break;
                        }
                        tempArr.push(check(arr[i]));
                    }else{
                        checkBool = false;
                        break;
                    }
                }
                if(tempArr.length >= 2){
                    for(var i = 0;i < tempArr.length - 1;i++){
                        if(tempArr[i] - tempArr[i+1] != 1){
                            checkBool = false;
                            break;
                        }
                    }
                }else{
                    checkBool = false;
                }
                if(checkBool){
                    return {
                        types:'FeiJi',
                        arr:arr,
                        maxNum:tempArr[0]
                    };
                }
            }
        case 'FeiJiDaiYi':
            //飞机带单只
            if(arrLen >= 8 && arrLen % 4 == 0){
                var checkBool = true;
                var tempArr = [];
                var remainArr = [];
                var copyArr = [].concat(arr);
                for(var i = 0;i < copyArr.length;i++){
                    if(check(copyArr[i]) != 15 && check(copyArr[i]) == check(copyArr[i+1]) && check(copyArr[i]) == check(copyArr[i+2])){
                        if(check(copyArr[i]) == check(copyArr[i+3])){
                            //是4张一样的牌 则抽取最后一张存入单只数组
                            remainArr.push(copyArr[i+3]);
                            copyArr.splice(i+3,1);
                        }
                        i=i+2;
                        tempArr.push(check(copyArr[i]));
                    }else{
                        remainArr.push(copyArr[i]);
                        copyArr.splice(i--,1);
                    }
                }
                remainArr.sort((a,b)=>b-a);
                if(tempArr.length - (arrLen/4) == 1){
                    var tempLen = tempArr.splice(s.length-1,1);
                    copyArr.splice(copyArr.length-3,3);
                    for(var i = 0;i<arr.length;i++){
                        if(check(arr[i]) == tempLen){
                            remainArr.push(arr[i]);
                        }
                    }
                    remainArr.sort((a,b)=>b-a);
                }
                if(tempArr.length >= 2 && (tempArr.length*3+tempArr.length == arrLen)){
                    for(var i = 0;i < tempArr.length - 1;i++){
                        if(tempArr[i] - tempArr[i+1] != 1 || tempArr[i] == 15){
                            checkBool = false;
                            break;
                        }
                    }
                }else{
                    checkBool = false;
                }
                if(checkBool){
                    return {
                        types:'FeiJiDaiYi',
                        arr:copyArr.concat(remainArr),
                        maxNum:tempArr[0]
                    };
                }
            }
        case 'FeiJiDaiDui':
            //飞机带对子
            if(arrLen >= 10 && arrLen % 5 ==0){
                var checkBool = true;
                var tempArr = [];
                var remainArr = [];
                var copyArr = [].concat(arr);
                for(var i = 0;i < copyArr.length;i++){
                    if(check(copyArr[i]) != 15 &&check(copyArr[i]) == check(copyArr[i+1]) && check(copyArr[i]) == check(copyArr[i+2])){
                        if(check(copyArr[i]) == check(copyArr[i+3])){
                            //是4张一样的牌 则不算飞机,只算对子
                            remainArr.push(copyArr[i],copyArr[i+1],copyArr[i+2],copyArr[i+3]);
                            copyArr.splice(i,4);
                            if(i<4){
                                i=-1;
                            }else{
                                i-=4;
                            }
                        }else{
                            tempArr.push(check(copyArr[i]));
                            i=i+2;
                        }
                    }else{
                        remainArr.push(copyArr[i]);
                        copyArr.splice(i--,1);
                    }
                }
                if(tempArr.length >= 2 && (tempArr.length*3+tempArr.length*2 == arrLen)){
                    for(var i = 0;i < tempArr.length - 1;i++){
                        if(tempArr[i] - tempArr[i+1] != 1 || tempArr[i] == 15){
                            checkBool = false;
                            break;
                        }
                    }
                    remainArr.sort((a,b)=>b-a);
                    //判断 翅膀是不是都是对子
                    for(var i = 0;i < remainArr.length;i=i+2){
                        if(check(remainArr[i]) != check(remainArr[i+1])){
                            checkBool = false;
                            break;
                        }
                    }
                }else{
                    checkBool = false;
                }
                if(checkBool){
                    return {
                        types:'FeiJiDaiDui',
                        arr:copyArr.concat(remainArr),
                        maxNum:tempArr[0]
                    };
                }
            }
        case 'SiDaiDui':
            //四带二对
            if(arrLen == 8){
                //如果是两个炸弹组合
                if(check(arr[0]) == check(arr[1]) && check(arr[0]) == check(arr[2]) && check(arr[0]) == check(arr[3]) &&
                    check(arr[4]) == check(arr[5]) && check(arr[4]) == check(arr[6]) && check(arr[4]) == check(arr[7])){
                    return {
                        types:'SiDaiDui',
                        arr:arr,
                        maxNum:check(arr[0])
                    }
                }

                for(var i = 0;i<arrLen-3;i++){
                    if(check(arr[i]) == check(arr[i+1]) && check(arr[i]) == check(arr[i+2]) && check(arr[i]) == check(arr[i+3])){
                        var tempArr = [],num = 0;
                        if(i == 0){
                            //两个对子在结尾
                            if(check(arr[4]) == check(arr[5]) && check(arr[6]) == check(arr[7])){
                                tempArr = arr;
                                num = check(arr[0]);
                            }
                        }
                        if(i == 4){
                            //两个对子在开头
                            if(check(arr[0]) == check(arr[1]) && check(arr[2]) == check(arr[3])){
                                tempArr = [arr[4],arr[5],arr[6],arr[7],arr[0],arr[1],arr[2],arr[3]];
                                num = check(arr[4]);
                            }
                        }
                        if(i == 2){
                            //两个对子分别在开头和结尾
                            if(check(arr[0]) == check(arr[1]) && check(arr[6]) == check(arr[7])){
                                tempArr = [arr[2],arr[3],arr[4],arr[5],arr[0],arr[1],arr[6],arr[7]];
                                num = check(arr[2]);
                            }
                        }
                        if(tempArr.length>0){
                            return {
                                types:'SiDaiDui',
                                arr:tempArr,
                                maxNum:num
                            };
                        }
                        break;
                    }
                }
            }
        default :
            return {
                types:null
            }
    }
}

//获取牌的值
checkCard.val = function(n){
    if(n >= 0 && n <= 3){
        return 3;
    }
    if(n >= 4 && n <= 7){
        return 4;
    }
    if(n >= 8 && n <= 11){
        return 5;
    }
    if(n >= 12 && n <= 15){
        return 6;
    }
    if(n >= 16 && n <= 19){
        return 7;
    }
    if(n >= 20 && n <= 23){
        return 8;
    }
    if(n >= 24 && n <= 27){
        return 9;
    }
    if(n >= 28 && n <= 31){
        return 10;
    }
    // J
    if(n >= 32 && n <= 35){
        return 11;
    }
    //Q
    if(n >= 36 && n <= 39){
        return 12;
    }
    //K
    if(n >= 40 && n <= 43){
        return 13;
    }
    //A
    if(n >= 44 && n <= 47){
        return 14;
    }
    //2
    if(n >= 48 && n <= 51){
        return 15;
    }
    //小王
    if(n == 52){
        return 16;
    }
    //大王
    if(n == 53){
        return 17;
    }

    return false;
}

/*比较两个玩家的牌大小
* @params object {
*   types,
*   maxNum,
*   arr
* }
* @return bool
* */
checkCard.compareCard = function(myCard,prevCard){
    //先判断王炸
    if(myCard.types == 'WangZha'){
        return true;
    }
    if(prevCard.types == 'WangZha'){
        return false;
    }
    //在判断炸弹
    if(myCard.types == 'ZhaDan' && prevCard.types != 'ZhaDan'){
        return true;
    }
    if(myCard.types == 'ZhaDan' && prevCard.types == 'ZhaDan'){
        return myCard.maxNum > prevCard.maxNum?true:false;
    }
    //如果有一家为飞机类型
    if((prevCard.types.indexOf('FeiJi')>-1 || prevCard.types.indexOf('SiDaiDui')>-1)  && myCard.arr.length == prevCard.arr.length){
        if(checkCard.getPlaneType(myCard.arr,prevCard.types) == prevCard.types && checkCard.getPlaneType(myCard.arr,prevCard.types).maxNum > prevCard.maxNum){
            return true;
        }
    }
    //其他类型 必须一致在比较大小
    if(myCard.types == prevCard.types && myCard.arr.length == prevCard.arr.length){
        return myCard.maxNum > prevCard.maxNum?true:false;
    }
    return false;
}

module.exports = checkCard;
