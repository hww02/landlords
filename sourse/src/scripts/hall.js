
class HallScene extends Laya.Script {
    constructor(){
        super();
        this.userData = {};//用户信息
    } 

    load(){
        //Laya.loader.load("landlord/sounds/bg_room.mp3");
    }


    onStart(){
        //背景音乐
        Laya.SoundManager.playMusic('landlord/sounds/bg_room.mp3',0,null);

        socket.emit('getUserInfo');
        socket.on('getUserInfo',(data)=>{
            this.owner.userPhoto.skin = data.photo;//设置用户头像
            this.owner.labelCoin.text = data.coin;//设置金币
            this.owner.nickName.text = data.userName;//用户名称
            this.userData = data;
        })

        //请求房间列表数据
        socket.emit('roomList');
        socket.on('roomList',(list)=>{
            //渲染房间列表
            this.owner.roomList.array = list;
            this.owner.roomList.renderHandler = new Laya.Handler(this,(cell,index)=>{
                let roomData = list[index];
                let leftPhoto = cell.getChildByName('leftPhoto');//左边用户Img
                leftPhoto.skin = roomData.userLeft.photo ? roomData.userLeft.photo : '';//头像
                let btnLeft = cell.getChildByName('btnLeft');//左边座位
                btnLeft.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                    if( leftPhoto.skin != ''){
                        alert('该座位已经有人了');
                        return false;
                    }
                    //加入房间
                    socket.emit('joinRoom',roomData.roomId,'userLeft');
                });
    
                let rightPhoto = cell.getChildByName('rightPhoto');//右边用户Img
                rightPhoto.skin = roomData.userRight.photo ? roomData.userRight.photo : '';//头像
                let btnRight = cell.getChildByName('btnRight');//右边座位
                btnRight.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                    if(rightPhoto.skin != ''){
                        alert('该座位已经有人了');
                        return false;
                    }
                    //加入房间
                    socket.emit('joinRoom',roomData.roomId,'userRight');
                    console.log('点击右侧座位',roomData.roomId)                    
                });
                let bottomPhoto = cell.getChildByName('bottomPhoto');//左边用户
                bottomPhoto.skin = roomData.userBottom.photo ? roomData.userBottom.photo : '';//头像
                let btnBottom = cell.getChildByName('btnBottom');//右边座位
                btnBottom.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                    if(bottomPhoto.skin  != ''){
                        alert('该座位已经有人了');
                        return false;
                    }
                    //加入房间
                    socket.emit('joinRoom',roomData.roomId,'userBottom');
                });
            });
        })

        //加入房间
        socket.on('joinRoom',(result)=>{
            if(result){//创建成功
                Laya.Scene.open('./landlord/room.scene');
            }
        })

        //创建房间
        this.owner.btnCcreateRoom.on(Events.CLICK,this,()=>{
            socket.emit('createRoom');            
        });

        //退出登录
        this.owner.signOut.on(Events.CLICK,this,()=>{
            console.log('退出按钮点击了');
            Laya.SoundManager.stopMusic();
            socket.emit('signOut');            
        })
        socket.on('signOut',(result)=>{
            if(result){
                Laya.Scene.open('./landlord/home.scene');
            }
        })
    }
}

export default HallScene;