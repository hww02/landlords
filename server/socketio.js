var socketio = {};
var socket_io = require('socket.io');
var poker = require('./js/poker');
var cardType = require('./js/cardType');
var compare = require('./js/cardCompare'); //比较两家牌的大小

var countCards = require('./js/countCards');
//获取io
socketio.getSocketio = function(server) {

    var io = socket_io.listen(server);

    var users = [];
    var roomArr = []; //所有房间
    // var room = {
    // 		roomId:'',
    // 		userLeft:{},
    // 		userRight:{},
    // 		userBottom:{}
    // };

    var pokerArr = []; //牌集合

    var CurDZ = null; //当前地主
    var sum = 0; //抢了多少次
    var qingguo_sum = 0; //有几个人抢过


    var timer = null;
    var chupaiTimer = null;

    var myPlayCards = []; //我想要出的牌
    var prevPlayCards = []; //上家出的牌
    var startPlayer = ''; //开始出牌的人

    var gameResult = []; //游戏结果


    io.on('connection', function(socket) {
        var curUserData = {}; //用户信息

        //断开连接
        socket.on('disconnect', function() {
            console.log('用户断开连接');

            // let userIndex = users.findIndex(arr => arr.userName === curUserData.userName);
            // users.splice(userIndex,1);
            //
            // //判断有没有房间
            // if(roomArr.length>0 && curUserData.roomId){
            // 	let posType = curUserData.posType;
            // 	let roomIndex = roomArr.findIndex(roomArr => roomArr.roomId === curUserData.roomId);
            // 	let roomTemp = getRoomData();
            // 	roomTemp[posType] = {};
            // 	if(!roomTemp['userLeft'].userName && !roomTemp['userRight'].userName && !roomTemp['userBottom'].userName){
            // 		roomArr.splice(roomIndex,1);
            // 	}
            //
            //
            // 	socket.leave(curUserData.roomId);
            // 	socket.broadcast.emit('roomList', roomArr);
            // 	socket.broadcast.to(curUserData.roomId).emit('getRoomInfo',roomTemp);
            // }

        });
        //正在连接
        socket.on('connecting', function() {
            console.log('用户正在连接');
        });
        //成功重连
        socket.on('reconnect', function() {
            console.log('成功重连');
        });

        //成功重连
        socket.on('reconnecting', function() {
            console.log('正在重连');
        });

        //登录
        socket.on('userLogin', function(userInfo) {
            let id = users.length + 1;
            userInfo['id'] = 'user' + id;
            users.push(userInfo); //所有用户信息
            curUserData = userInfo; //当前用户信息
            socket.emit('userLogin', true);
        })

        //退出登录
        socket.on('signOut', () => {
            let userIndex = users.findIndex(users => users.userName === curUserData.userName);
            users.splice(userIndex, 1);
            socket.emit('signOut', true);
        });

        //返回大厅
        socket.on('goBackHall', () => {
            //判断有没有房间
            if (roomArr.length > 0 && curUserData.roomId) {
                let posType = curUserData.posType;
                let roomIndex = roomArr.findIndex(roomArr => roomArr.roomId === curUserData.roomId);
                if(roomArr[roomIndex]['userLeft']['time'] != ''||roomArr[roomIndex]['userBottom']['time'] != ''||roomArr[roomIndex]['userRight']['time'] != ''){
                    console.log('游戏已经开始,您不能退出');
                    //return false;
                }
                roomArr[roomIndex][posType] = {};
                if (!roomArr[roomIndex]['userLeft'].userName && !roomArr[roomIndex]['userRight'].userName && !roomArr[roomIndex]['userBottom'].userName) {
                    roomArr.splice(roomIndex, 1);
                }

                let roomTemp = roomArr[roomIndex]; //情况房间的信息
                socket.leave(curUserData.roomId);
                socket.broadcast.emit('roomList', roomArr);
                socket.broadcast.to(curUserData.roomId).emit('getRoomInfo', roomTemp);
            }
            socket.emit('goBackHall', true)
        });

        //获取用户信息
        socket.on('getUserInfo', function() {
            socket.emit('getUserInfo', curUserData);
        })

        //获取房间信息
        socket.on('getRoomInfo', function() {
            socket.join(curUserData.roomId);
            let roomIndex = roomArr.findIndex(arr => arr.roomId === curUserData.roomId);
            let roomTemp = roomArr[roomIndex];
            socket.emit('getRoomInfo', roomTemp);
        })

        //房间列表
        socket.on('roomList', function() {
            socket.emit('roomList', roomArr);
        });

        //创建房间
        socket.on('createRoom', function() {
            let room = {
                roomId: '',
                userLeft: {},
                userBottom: {},
                userRight: {}
            };

            let id = roomArr.length + 1; //房间号
            let roomId = 'room' + id;
            socket.join(roomId);

            curUserData['roomId'] = roomId; //房间id
            curUserData['posType'] = 'userLeft'; //用户位置
            curUserData['state'] = ''; //是否已经准备
            curUserData['time'] = ''; //倒计时
            curUserData['role'] = ''; //角色  地主  农民
            curUserData['myCards'] = []; //我的牌
            curUserData['cardsNum'] = 0; //我的牌
            curUserData['myPlayCards'] = ''; //我出的牌
            curUserData['order'] = ''; //是否显示不出按钮

            room['roomId'] = roomId; //房间id
            room['userLeft'] = curUserData;
            let roomTemp = Object.assign({}, room);
            roomArr.push(roomTemp);
            socket.emit('joinRoom', true);
            socket.broadcast.to(roomId).emit('getRoomInfo', room);
            socket.broadcast.emit('roomList', roomArr);
        })

        /**
         *加入房间
         *roomId 房间号
         *posType 位置 如 userLeft userRight userBottom
         */
        socket.on('joinRoom', function(roomId, posType) {
            socket.join(roomId);
            curUserData['roomId'] = roomId;
            curUserData['posType'] = posType;
            curUserData['state'] = ''; //是否已经准备
            curUserData['time'] = ''; //倒计时
            curUserData['role'] = ''; //角色  地主  农民
            curUserData['myCards'] = []; //我的牌
            curUserData['cardsNum'] = 0; //我的牌
            curUserData['myPlayCards'] = ''; //我出的牌
            curUserData['order'] = ''; //是否显示不出按钮

            let roomIndex = roomArr.findIndex(arr => arr.roomId === roomId);
            roomArr[roomIndex][posType] = curUserData;

            let roomTemp = roomArr[roomIndex];

            socket.emit('joinRoom', true);
            socket.broadcast.to(roomId).emit('getRoomInfo', roomTemp);
            socket.broadcast.emit('roomList', roomArr);

        })

        //继续游戏
        socket.on('continueGame', () => {
            let posType = curUserData.posType;
            let roomIndex = roomArr.findIndex(arr => arr.roomId === curUserData.roomId);
            let roomTemp = roomArr[roomIndex]; //房间信息
            roomTemp['bottomCards'] = [];
            roomTemp[posType]['state'] = 'ready';
            roomTemp[posType]['time'] = '';
            roomTemp[posType]['role'] = '';
            roomTemp[posType]['myCards'] = [];
            roomTemp[posType]['cardsNum'] = 0;
            roomTemp[posType]['myPlayCards'] = [];
            roomTemp[posType]['order'] = '';
            socket.broadcast.emit('roomList', roomArr);
            io.sockets.in(curUserData.roomId).emit('getRoomInfo', roomTemp);
            if (roomTemp.userLeft.state == 'ready' && roomTemp.userRight.state == 'ready' && roomTemp.userBottom.state == 'ready') {
                fapaiFun();
                watchQiangdizhu();
            }
        });

        //准备
        socket.on('ready', function(userData) {
            curUserData['state'] = 'ready'; //是否已经准备

            let roomIndex = roomArr.findIndex(arr => arr.roomId === userData.roomId);
            let roomTemp = roomArr[roomIndex]; //房间信息
            roomTemp[userData.posType] = curUserData;

            roomArr[roomIndex] = roomTemp;
            socket.broadcast.emit('roomList', roomArr);
            io.sockets.in(userData.roomId).emit('getRoomInfo', roomTemp);
            if (roomTemp.userLeft.state == 'ready' && roomTemp.userRight.state == 'ready' && roomTemp.userBottom.state == 'ready') {
                fapaiFun();
                //getUserCards();
                watchQiangdizhu();
            }
        })

        //发牌
        function fapaiFun() {
            console.log('重新发牌了');
            qingguo_sum = 0;
            sum = 0;
            CurDZ = null;
            prevPlayCards = [];

		    myPlayCards = []; //我想要出的牌
		    prevPlayCards = []; //上家出的牌
		    startPlayer = ''; //开始出牌的人
		    gameResult = []; //游戏结果

            let roomId = curUserData.roomId;
            let roomIndex = roomArr.findIndex(arr => arr.roomId === roomId);
            roomArr[roomIndex]['userLeft']['state'] = 'fapai';
            roomArr[roomIndex]['userBottom']['state'] = 'fapai';
            roomArr[roomIndex]['userRight']['state'] = 'fapai';

            roomArr[roomIndex]['bottomCards'] = []; //底牌为空
            let roomTemp = roomArr[roomIndex];

            let cards = poker.myCreateArray(54);
            poker.myShuffle(cards); //洗牌即是打乱数组顺序
            //玩家A-left,B-bottom,C-right各拿17张牌
            let playerA = cards.slice(0, 17);
            //console.log('playerA Has Cards: ', playerA);

            let playerB = cards.slice(17, 34);
            //console.log('playerB Has Cards: ' + playerB);

            let playerC = cards.slice(34, 51);
            //console.log('playerC Has Cards: ' + playerC);

            //留下3张底牌
            let bottomCards = cards.slice(51, 54);
            //console.log('Bottom Cards: ' + bottomCards);

            let cardsObj = {
                roomId: roomId,
                userLeft: playerA,
                userBottom: playerB,
                userRight: playerC,
                bottomCards: bottomCards
            }; //房间中3家的牌
            //console.log('牌列表前',pokerArr);
            let pokerIndex = pokerArr.findIndex(arr => arr.roomId === roomId);
            if (pokerIndex > -1) { //判断pokerArr有没有房间里面的牌,有就删除
                console.log('删除牌');
                pokerArr.splice(pokerIndex, 1);
            }
            pokerArr.push(cardsObj);

            //console.log('牌列表后',pokerArr);
            io.sockets.in(roomId).emit('fapai');
			//发牌音效
			io.sockets.in(roomTemp.roomId).emit('playMusic', 'fapai')
            io.sockets.in(roomId).emit('getRoomInfo', roomTemp); //广播包括自己
        }

        //开始游戏获取自己的牌
        socket.on('getUserCards', () => {
            let posType = curUserData.posType;
            if (!curUserData.roomId) {
                return;
            }
            let index = pokerArr.findIndex(arr => arr.roomId === curUserData.roomId);
            if (index > -1) {
                let userCards = pokerArr[index][posType]; //获取牌
                userCards.sort(poker.compare);
                let roomIndex = roomArr.findIndex(arr => arr.roomId === curUserData.roomId);
                let roomTemp = roomArr[roomIndex];
                roomTemp['userLeft']['cardsNum'] = pokerArr[index]['userLeft'].length;
                roomTemp['userBottom']['cardsNum'] = pokerArr[index]['userBottom'].length;
                roomTemp['userRight']['cardsNum'] = pokerArr[index]['userRight'].length;

                socket.emit('showCards', userCards);
                io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp);

            }
        })

        //叫地主
        function watchQiangdizhu() {
            let roomIndex = roomArr.findIndex(arr => arr.roomId === curUserData.roomId);
            let roomTemp = roomArr[roomIndex];
            let arr = ['userLeft', 'userBottom', 'userRight'];
            let index = Math.floor(Math.random() * (arr.length - 1));
            CurDZ = null;
            let posType = arr[index];
            roomTemp[posType]['state'] = 'jiaodizhu';
            roomTemp[posType]['time'] = 15; //倒计时

            let nextPos = findPos(posType).nextPos; //下一家
            let prevPos = findPos(posType).prevPos; //上一家
            roomTemp[nextPos]['state'] = 'noState';
            roomTemp[nextPos]['time'] = ''; //倒计时
            roomTemp[prevPos]['state'] = 'noState';
            roomTemp[prevPos]['time'] = ''; //倒计时

            //倒计时
            setTimeFun(roomTemp);
        }

        //倒计时
        function setTimeFun(roomData) {
            timer = setTimeout(() => {
                let roomTemp = roomData;
                let posType = '';
                let time = 0;
                if (CurDZ == null) { //叫地主
                    if (roomTemp['userLeft']['state'] == 'jiaodizhu') {
                        posType = 'userLeft';
                        time = roomTemp['userLeft']['time'];
                    } else if (roomTemp['userBottom']['state'] == 'jiaodizhu') {
                        posType = 'userBottom';
                        time = roomTemp['userBottom']['time'];
                    } else if (roomTemp['userRight']['state'] == 'jiaodizhu') {
                        posType = 'userRight';
                        time = roomTemp['userRight']['time'];
                    }
                } else { //抢地主
                    if (roomTemp['userLeft']['state'] == 'qiangdizhu') {
                        posType = 'userLeft';
                        time = roomTemp['userLeft']['time'];
                    } else if (roomTemp['userBottom']['state'] == 'qiangdizhu') {
                        posType = 'userBottom';
                        time = roomTemp['userBottom']['time'];
                    } else if (roomTemp['userRight']['state'] == 'qiangdizhu') {
                        posType = 'userRight';
                        time = roomTemp['userRight']['time'];
                    }
                }

                let nextPos = findPos(posType).nextPos; //下一家
                let prevPos = findPos(posType).prevPos; //上一家
                if (time == 0) {
                    clearTimeout(timer);
                    let flag = qdzFun(posType, false);
                    if (flag) { //继续抢地主
                        //继续抢地主
                        roomTemp[posType]['state'] = 'bujiaodizhu';
                        roomTemp[posType]['time'] = ''; //倒计时
                        if (CurDZ == null) {
                            roomTemp[nextPos]['state'] = 'jiaodizhu';
                        } else {
                            roomTemp[nextPos]['state'] = 'qiangdizhu';
                        }
                        roomTemp[nextPos]['time'] = 15; //倒计时
                        roomTemp[prevPos]['state'] = 'noState';
                        roomTemp[prevPos]['time'] = ''; //倒计时
                        //播放叫地主音乐
                        io.sockets.in(roomTemp.roomId).emit('playMusic', 'bujiaodizhu')
                        io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                        setTimeFun(roomTemp)
                    } else {
                        if (sum == 3 && qingguo_sum == 0) {
                            fapaiFun();
                            watchQiangdizhu();
                        } else {
                            beginGame(roomTemp, CurDZ);
                        }

                        return false;
                    }

                } else {
                    time--;
                    roomTemp[posType]['time'] = time;
                    io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                    setTimeFun(roomTemp)
                }
            }, 1000);
        }

        //抢地主
        socket.on('qiangdizhu', (state) => {
            clearTimeout(timer);
            let posType = curUserData.posType;
            let nextPos = findPos(posType).nextPos; //下一家
            let prevPos = findPos(posType).prevPos; //上一家
            let roomTemp = getRoomData();
            let flag = qdzFun(posType, true);

            if (flag) { //继续抢地主
                //继续抢地主
                roomTemp[posType]['state'] = 'jsJdz';
                roomTemp[posType]['time'] = ''; //倒计时
                if (CurDZ == null) {
                    roomTemp[nextPos]['state'] = 'jiaodizhu';
                    roomTemp[nextPos]['time'] = 15; //倒计时
                    //roomTemp[prevPos]['state']='noState';
                    roomTemp[prevPos]['time'] = ''; //倒计时
                } else {
                    if (roomTemp[nextPos]['state'] == 'bujiaodizhu') {
                        roomTemp[nextPos]['time'] = ''; //倒计时
                        roomTemp[prevPos]['state'] = 'qiangdizhu';
                        roomTemp[prevPos]['time'] = 15; //倒计时
                    } else {
                        roomTemp[nextPos]['state'] = 'qiangdizhu';
                        roomTemp[nextPos]['time'] = 15; //倒计时
                    }
                }

            } else {
                //播放叫地主音乐
                io.sockets.in(roomTemp.roomId).emit('playMusic', 'jiaodizhu')
                beginGame(roomTemp, CurDZ);
                return false;
            }
            //播放叫地主音乐
            io.sockets.in(roomTemp.roomId).emit('playMusic', 'jiaodizhu')
            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
            setTimeFun(roomTemp);

        })
        //不抢地主
        socket.on('buqiangdizhu', (state) => {
            clearTimeout(timer);
            let posType = curUserData.posType;
            let roomTemp = getRoomData();
            let flag = qdzFun(posType, false);

            if (flag) { //继续抢地主
                let nextPos = findPos(posType).nextPos; //下一家
                let prevPos = findPos(posType).prevPos; //上一家
                //继续抢地主
                roomTemp[posType]['state'] = 'bujiaodizhu';
                roomTemp[posType]['time'] = ''; //倒计时
                if (CurDZ == null) {
                    roomTemp[nextPos]['state'] = 'jiaodizhu';
                } else {
                    roomTemp[nextPos]['state'] = 'qiangdizhu';
                }
                roomTemp[nextPos]['time'] = 15; //倒计时
                //roomTemp[prevPos]['state']='noState';
                roomTemp[prevPos]['time'] = ''; //倒计时
            } else {
                if (sum == 3 && qingguo_sum == 0) {
                    //播放叫地主音乐
                    io.sockets.in(roomTemp.roomId).emit('playMusic', 'bujiaodizhu')
                    fapaiFun();
                    watchQiangdizhu();
                    return false;
                }

                //播放叫地主音乐
                io.sockets.in(roomTemp.roomId).emit('playMusic', 'bujiaodizhu')
                beginGame(roomTemp, CurDZ);
                return false;
            }

            //播放叫地主音乐
            io.sockets.in(roomTemp.roomId).emit('playMusic', 'bujiaodizhu')
            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
            setTimeFun(roomTemp);
        })
        //抢地主方法
        function qdzFun(curpeople, QIANG) {
            if (QIANG) {
                //抢
                CurDZ = curpeople;
                qingguo_sum++;
            }
            sum++;
            if (sum == 3 && QIANG && qingguo_sum == 0) {
                qingguo_sum = 0;
                sum = 0;
                //轮到第3个人时，前面两个人没抢，并且自己抢了，地主就是你
                return false;
            } else if (sum == 3 && !QIANG && qingguo_sum == 0) { //轮到第3个人时，前面两个人没抢，并且自己也没抢
                //没人抢的话，重新洗牌操作
                return false;
            } else if (sum == 3 && !QIANG && qingguo_sum == 1) {
                qingguo_sum = 0;
                sum = 0;
                //轮到第3个人时，前面两个人没抢，并且自己抢了，地主就是你
                return false;
            } else if (sum == 3 && QIANG && qingguo_sum == 1) {
                qingguo_sum = 0;
                sum = 0;
                //轮到第3个人时，前面两个人没抢，并且自己抢了，地主就是你
                return false;
            } else if (sum == 4 && qingguo_sum != 0) {
                qingguo_sum = 0;
                sum = 0;
                return false;
            } else {
                return true;
            }
        }

        //开始游戏 显示身份  重置倒计时
        function beginGame(roomData, CurDZ) {
            prevPlayCards = [];
            let roomTemp = roomData;
            let newNextPos = findPos(CurDZ).nextPos; //下一家
            let newPrevPos = findPos(CurDZ).prevPos; //上一家
            startPlayer = CurDZ;
            roomTemp[CurDZ]['role'] = 'dizhu';
            roomTemp[CurDZ]['state'] = 'chupai'; //状态更改为出牌
            roomTemp[CurDZ]['time'] = 30;
            roomTemp[CurDZ]['order'] = '1';
            roomTemp[newNextPos]['role'] = 'nongmin';
            roomTemp[newNextPos]['time'] = '';
            roomTemp[newNextPos]['state'] = 'noState';
            roomTemp[newPrevPos]['role'] = 'nongmin';
            roomTemp[newPrevPos]['time'] = '';
            roomTemp[newPrevPos]['state'] = 'noState';

            let index = pokerArr.findIndex(arr => arr.roomId === roomTemp.roomId);
            if(index<0){
                return false;
            }
            let userCards = pokerArr[index][CurDZ]; //获取牌
            let bottomCards = pokerArr[index]['bottomCards']; //地主三张牌

            let dizhuCards = userCards.concat(bottomCards); //地主牌

            pokerArr[index][CurDZ] = dizhuCards;
            dizhuCards.sort(poker.compare);
            roomTemp['bottomCards'] = bottomCards;

            roomTemp[CurDZ]['cardsNum'] = dizhuCards.length;

            io.sockets.in(roomTemp.roomId).emit('fapai');

            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己

            chuPaiTimer(roomTemp);

        }

        function chuPaiTimer(roomData) {

            chupaiTimer = setTimeout(() => {
                let roomTemp = roomData;
                let posType = '';
                let time = 0;
                if (roomTemp['userLeft']['state'] == 'chupai') {
                    posType = 'userLeft';
                    time = roomTemp['userLeft']['time'];
                } else if (roomTemp['userBottom']['state'] == 'chupai') {
                    posType = 'userBottom';
                    time = roomTemp['userBottom']['time'];
                } else if (roomTemp['userRight']['state'] == 'chupai') {
                    posType = 'userRight';
                    time = roomTemp['userRight']['time'];
                }
                let prevPos = findPos(posType).prevPos; //上一家
                let nextPos = findPos(posType).nextPos; //下一家
                if (time == 0) {
                    clearTimeout(chupaiTimer);
                    if (startPlayer == posType) { //必须出牌
                        //必须出一张最小的牌
                        let index = pokerArr.findIndex(arr => arr.roomId === curUserData.roomId);
                        let myCards = pokerArr[index][posType]; //我所有的牌
                        let myPlayCards = [];
                        myPlayCards.push(myCards[myCards.length - 1]); //最小的一张牌
                        myCards.splice(myCards.length - 1, 1); //删除已经出的牌

                        prevPlayCards = []; //清空上家的牌

                        if (myCards.length == 0) { //胜利
                            roomTemp[posType]['state'] = 'noState';
                            roomTemp[posType]['time'] = '';
                            roomTemp[posType]['cardNum'] = 0;
                            //获取上家剩余的牌
                            roomTemp[prevPos]['myPlayCards'] = pokerArr[index][prevPos]; //显示上家的底牌
                            roomTemp[prevPos]['state'] = 'noState';
                            roomTemp[nextPos]['myPlayCards'] = pokerArr[index][nextPos]; //显示下家的底牌
                            roomTemp[nextPos]['state'] = 'noState';
                            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                            io.sockets.in(roomTemp.roomId).emit('showCards', []);

                            //游戏结果
                            io.sockets.in(roomTemp.roomId).emit('gameOver', getGameResult());
                            return false;
                        }

                        roomTemp[posType]['cardsNum'] = myCards.length;
                        roomTemp[posType]['state'] = 'noState';
                        roomTemp[posType]['time'] = '';
                        roomTemp[posType]['order'] = '';
                        roomTemp[posType]['myPlayCards'] = myPlayCards; //将已出的牌显示出来

                        roomTemp[nextPos]['state'] = 'chupai';
                        roomTemp[nextPos]['time'] = 30;
                        roomTemp[nextPos]['myPlayCards'] = [];
                        socket.emit('showCards', myCards);
                        io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                        chuPaiTimer(roomTemp);

                    } else {
                        roomTemp[posType]['time'] = '';
                        roomTemp[posType]['state'] = 'buchu';
                        if (startPlayer == nextPos) { //如果出了1圈没人出  就不显示不出按钮
                            roomTemp[nextPos]['order'] = '1';
                            prevPlayCards = [];
                        }
                        roomTemp[prevPos]['time'] = '';
                        roomTemp[nextPos]['time'] = 30;
                        roomTemp[nextPos]['state'] = 'chupai';
                        roomTemp[nextPos]['myPlayCards'] = [];
                        io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                        chuPaiTimer(roomTemp);
                    }
                    return false;
                } else {
                    time--;
                    roomTemp[posType]['time'] = time;
                    io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                    chuPaiTimer(roomTemp)
                }
            }, 1000);
        }

        //出牌请求
        socket.on('chupai', (cards) => {
            let posType = curUserData.posType;
            let myCardType = countCards.getType(cards).types; //我的牌的类型

            let index = pokerArr.findIndex(arr => arr.roomId === curUserData.roomId);
            if(index<0){
                return false;
            }
            let myCards = pokerArr[index][posType]; //我所有的牌
            let roomTemp = getRoomData(); //获取房间信息
            if (myCardType == null) { //报错了
                socket.emit('showCards', myCards);
                return false;
            }

            myPlayCards = countCards.getType(cards).arr; //我想要出的牌
            if (prevPlayCards.length > 0) { //判断上家的牌
                let isChu = countCards.compareCard(countCards.getType(cards), countCards.getType(prevPlayCards));
                if (!isChu) {
                    socket.emit('showCards', myCards);
                    return false;
                }
            }
            clearTimeout(chupaiTimer);
            startPlayer = posType;
            prevPlayCards = myPlayCards;

            //重新整理我的牌
            for (let i = 0; i < myPlayCards.length; i++) { //出选中的牌
                myCards.splice(myCards.findIndex(val => val == myPlayCards[i]), 1);
            }

            let nextPos = findPos(posType).nextPos; //下一家
            let prevPos = findPos(posType).prevPos; //上一家

			io.sockets.in(roomTemp.roomId).emit('playMusic', myCardType);

            if (myCards.length == 0) { //胜利
                roomTemp[posType]['state'] = 'noState';
                roomTemp[posType]['time'] = '';
                roomTemp[posType]['cardsNum'] = 0;
                //获取上家剩余的牌
                roomTemp[prevPos]['myPlayCards'] = pokerArr[index][prevPos]; //显示上家的底牌
                roomTemp[prevPos]['state'] = 'noState';
                roomTemp[nextPos]['myPlayCards'] = pokerArr[index][nextPos]; //显示下家的底牌
                roomTemp[nextPos]['state'] = 'noState';
                io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
                io.sockets.in(roomTemp.roomId).emit('showCards', []);
                io.sockets.in(roomTemp.roomId).emit('gameOver', getGameResult());

                return false;
            }

            roomTemp[posType]['cardsNum'] = myCards.length;
            roomTemp[posType]['state'] = 'noState';
            roomTemp[posType]['time'] = '';
            roomTemp[posType]['order'] = '';
            roomTemp[posType]['myPlayCards'] = myPlayCards; //将已出的牌显示出来

            roomTemp[prevPos]['time'] = '';
            roomTemp[nextPos]['state'] = 'chupai';
            roomTemp[nextPos]['time'] = 30;
            roomTemp[nextPos]['myPlayCards'] = [];

            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
            socket.emit('showCards', myCards);

            chuPaiTimer(roomTemp);

        })
        //不出牌
        socket.on('buchupai', () => {
            clearTimeout(chupaiTimer);
            let roomTemp = getRoomData(); //获取房间信息
            let posType = curUserData.posType;
            roomTemp[posType]['state'] = 'buchu';
            roomTemp[posType]['time'] = '';
            roomTemp[posType]['order'] = '';
            roomTemp[posType]['myPlayCards'] = []; //将已出的牌显示出来
            let nextPos = findPos(posType).nextPos; //通知下一家出牌
            let prevPos = findPos(posType).prevPos; //上一家
            if (startPlayer == nextPos) { //如果出了1圈没人出  就不显示不出按钮
                roomTemp[nextPos]['order'] = '1';
                prevPlayCards = [];
            }
            roomTemp[prevPos]['time'] = '';
            roomTemp[nextPos]['state'] = 'chupai';
            roomTemp[nextPos]['time'] = 30;
            roomTemp[nextPos]['myPlayCards'] = [];
            io.sockets.in(roomTemp.roomId).emit('getRoomInfo', roomTemp); //广播包括自己
            chuPaiTimer(roomTemp);
        })

        //获取游戏结束结果
        function getGameResult() {
            let obj = {};
            let resultArr = [];
            let posType = curUserData.posType;
            let nextPos = findPos(posType).nextPos; //通知下一家出牌
            let prevPos = findPos(posType).prevPos; //上一家
            let roomTemp = getRoomData();
            let role = roomTemp[posType]['role'];
            let prevRole = roomTemp[prevPos]['role'];
            let isWin = false;
            if (role == 'nongmin') { //农民胜
                roomTemp[posType]['result'] = 'win';
                roomTemp[posType]['difen'] = 5;
                roomTemp[posType]['coin'] = roomTemp[posType]['coin'] + 5;
                roomTemp[posType]['winCoin'] = 5;
                if (prevRole == 'nongmin') //上家角色
                {
                    roomTemp[prevPos]['result'] = 'win';
                    roomTemp[prevPos]['difen'] = 5;
                    roomTemp[prevPos]['coin'] = roomTemp[prevPos]['coin'] + 5;
                    roomTemp[prevPos]['winCoin'] = 5;
                    roomTemp[nextPos]['result'] = 'fail';
                    roomTemp[nextPos]['difen'] = 5;
                    roomTemp[nextPos]['winCoin'] = -10;
                    roomTemp[nextPos]['coin'] = roomTemp[nextPos]['coin'] - 10;
                }
                if (prevRole == 'dizhu') //上家角色
                {
                    roomTemp[prevPos]['result'] = 'fail';
                    roomTemp[prevPos]['difen'] = 5;
                    roomTemp[prevPos]['winCoin'] = -10;
                    roomTemp[prevPos]['coin'] = roomTemp[prevPos]['coin'] - 10;
                    roomTemp[nextPos]['result'] = 'win';
                    roomTemp[nextPos]['difen'] = 5;
                    roomTemp[nextPos]['winCoin'] = 5;
                    roomTemp[nextPos]['coin'] = roomTemp[nextPos]['coin'] + 5;
                }
            } else if (role == 'dizhu') {
                roomTemp[posType]['result'] = 'win';
                roomTemp[posType]['difen'] = 5;
                roomTemp[posType]['winCoin'] = 10;
                roomTemp[posType]['coin'] = roomTemp[posType]['coin'] + 10;
                roomTemp[prevPos]['result'] = 'fail';
                roomTemp[prevPos]['difen'] = 5;
                roomTemp[prevPos]['winCoin'] = -5;
                roomTemp[prevPos]['coin'] = roomTemp[prevPos]['coin'] - 5;
                roomTemp[nextPos]['result'] = 'fail';
                roomTemp[nextPos]['difen'] = 5;
                roomTemp[nextPos]['winCoin'] = -5;
                roomTemp[nextPos]['coin'] = roomTemp[nextPos]['coin'] - 5;
            }

            resultArr.push(roomTemp[posType]);
            resultArr.push(roomTemp[nextPos]);
            resultArr.push(roomTemp[prevPos]);

            obj['list'] = resultArr;
            obj['curUser'] = roomTemp[posType];
            return obj;

        }

        //获取房间信息
        function getRoomData() {
            let roomIndex = roomArr.findIndex(arr => arr.roomId === curUserData.roomId);
            return roomArr[roomIndex];
        }

        function findPos(posType) {
            let nextPos = ''; //下一家
            let prevPos = ''; //上一家
            let obj = {};
            if (posType == 'userLeft') {
                nextPos = 'userBottom';
                prevPos = 'userRight';
            }
            if (posType == 'userBottom') {
                nextPos = 'userRight';
                prevPos = 'userLeft';
            }
            if (posType == 'userRight') {
                nextPos = 'userLeft';
                prevPos = 'userBottom';
            }
            obj['nextPos'] = nextPos;
            obj['prevPos'] = prevPos;
            return obj;
        }


    })


};

module.exports = socketio;
