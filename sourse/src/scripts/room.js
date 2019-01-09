
class RoomScene extends Laya.Script {
    constructor(){
        super();
        this.userData = {};//用户信息
        this.roomData = {};//房间信息

        this.cards = [];//用户的牌
        this.isSelArr = [];//用户是否选中
    } 

    	
    load(){
        Laya.loader.load("landlord/card/role.atlas");
    }


    onStart(){
        
        socket.emit('getUserInfo');//获取用户信息       
        socket.on('getUserInfo',(data)=>{
            this.userData = data;            
        }) 

        socket.emit('getRoomInfo');//获取房间信息
        socket.on('getRoomInfo',(roomData)=>{
            this.roomData = roomData;
            let data = this.userData;
            this.getUserPosi(data.posType,roomData);   
        })           
        //发牌成功
        socket.on('fapai',()=>{
            socket.emit('getUserCards');//请求自己的牌
            //socket.emit('jiaodizhu');//首次谁叫地主
        })
        //展示自己的牌
        socket.on('showCards',(cards)=>{
            //this.isSelArr=[];//重置是否选中
            let selArr = [];
            this.cards = cards;
            let myCardsBox = this.owner.myCardsBox;
            myCardsBox.destroyChildren();
            for(let i= 0;i<cards.length;i++){
                selArr.push(false);
                let card = new Laya.Sprite();
                card.texture = 'cards/card_'+cards[i]+'.png';
                card.width=100;
                card.height=148;
                card.x = (i + 1) * 40;
                card.on(Events.CLICK,this,()=>{
                    
                    if(this.isSelArr[i]){
                        card.y = card.y+20;
                    }else{
                        card.y = card.y-20;
                    }
                    this.isSelArr[i] = !this.isSelArr[i];      
                })
                // Laya.Tween.to(card,{
                //     x:(i + 1) * 40
                // },800,Laya.Ease.linearIn,null);
                myCardsBox.addChild(card);
            }
            this.isSelArr = selArr;
        })

        //游戏结束
        socket.on('gameOver',(res)=>{
            let dialog = this.owner.dialogGame;
            let userList = dialog.getChildByName('userList');//用户列表
            userList.array = res.list;
            let list =  res.list;
            let curUserData = res.curUser;
            let winDz = dialog.getChildByName('winDz');//地主赢
            if(curUserData.role == 'nongmin'){//农民
                if(curUserData.result == 'win'){//赢    
                    Laya.SoundManager.playSound('landlord/sounds/win.wav',1,null);                
                    dialog.getChildByName('winNm').visible = true;
                }else{//输
                    Laya.SoundManager.playSound('landlord/sounds/faill.wav',1,null);    
                    dialog.getChildByName('faliNm').visible = true;
                }
            }else{//地主
                if(curUserData.result == 'win'){//赢
                    Laya.SoundManager.playSound('landlord/sounds/win.wav',1,null);    
                    dialog.getChildByName('winDz').visible = true;
                }else{//输
                    dialog.getChildByName('faliDz').visible = true;
                    Laya.SoundManager.playSound('landlord/sounds/faill.wav',1,null);    
                }
            }
            
            dialog.visible = true;
            userList.renderHandler = new Laya.Handler(this,(cell,index)=>{
                let userData = list[index];
                let role = cell.getChildByName('role');//角色
                role.text = userData.role=='nongmin'?'农民':'地主';
                let nickName = cell.getChildByName('nickName');//昵称
                nickName.text = userData.userName;
                let difen = cell.getChildByName('difen');//底分
                difen.text = userData.difen;
                let conin = cell.getChildByName('conin');//金币
                conin.text = userData.winCoin;
            });
        })

        socket.on('playMusic',(type)=>{
            let url = '';
            if(type == 'bujiaodizhu'){
                url = 'landlord/sounds/bujiao.wav'
            }
            if(type == 'jiaodizhu'){
                url = 'landlord/sounds/jiaodizhu.wav'
            }
            if(type == 'win'){//胜利
                url = 'landlord/sounds/win.wav'
            }
            if(type == 'win'){//输牌
                url = 'landlord/sounds/faill.wav'
            }
            if(type == 'fapai'){//发牌
                url = 'landlord/sounds/fapai.wav'
            }
            if(type == 'ZhaDan'){
                let zhadanAni = this.owner.zhadanAni;
                zhadanAni.visible = true;
                zhadanAni.play(0,false,'zhadan');
                url = 'landlord/sounds/zhadan.wav'
            }
            if(type == 'WangZha'){
                let wangzhaAni = this.owner.wangzhaAni;
                wangzhaAni.visible = true;
                wangzhaAni.play();
                Laya.Tween.to(wangzhaAni,{
                    y:-274
                },2000,Laya.Ease.quintOut,null);
                url = 'landlord/sounds/wangzha.wav'
            }

            if(type == 'SanDaiYi'){
                url = 'landlord/sounds/sandaiyi.wav'
            }

            if(type == 'DanShun'){
                url = 'landlord/sounds/shunzi.wav'
            }

            if(type == 'DuiShun'){
                url = 'landlord/sounds/liandui.wav'
            }

            if(type == 'SiDaiEr'){
                url = 'landlord/sounds/sidaier.wav'
            }

            if(type == 'FeiJi'||type == 'FeiJiDaiYi'||type == 'FeiJiDaiDui'){
                let feijiAni = this.owner.feijiAni;
                feijiAni.visible = true;
                feijiAni.play(0,false,'feiji');

                
                url = 'landlord/sounds/feiji.wav'
            }
            
            Laya.SoundManager.playSound(url,1,null);
        })

        

        //返回大厅
        this.owner.btnBack.on(Events.CLICK,this,()=>{
            socket.emit('goBackHall');
        });

        //游戏结束返回大厅        
        this.owner.btnQuite.on(Events.CLICK,this,()=>{
            this.owner.dialogGame.visible = false;
            socket.emit('goBackHall');
        });

        //继续游戏
        this.owner.btnBegainGame.on(Events.CLICK,this,()=>{
            this.owner.dialogGame.visible = false;
            socket.emit('continueGame');
        });

        socket.on('goBackHall',(result)=>{
            if(result){
                Laya.Scene.open('./landlord/hall.scene');
            }
        })  
    }

    getUserPosi(posType,roomData){
          
        if(roomData.bottomCards){
            if(roomData.bottomCards.length>0){
                this.owner.cardsDp.visible = false;//显示地主背面牌
                let cardDpZheng = this.owner.cardDpZheng;
                let cards = roomData.bottomCards;
                cardDpZheng.destroyChildren();
                for(let i= 0;i<cards.length;i++){
                    let card = new Laya.Sprite();
                    card.texture = 'cards/card_'+cards[i]+'.png';
                    card.width = 60;
                    card.height = 82;
                    card.x=i * 26;
                    cardDpZheng.addChild(card);
                    cardDpZheng.visible = true;
                }
            }else{
                this.owner.cardsDp.visible = true;//显示地主背面牌
                this.owner.cardDpZheng.visible = false;
            }            
        }        

        if(posType == 'userLeft'){//左边
            let bottomBox = this.owner.bottomBox;//下变左
            this.showRoomUser(bottomBox,roomData.userLeft,'userBottom');     

            let leftBox = this.owner.leftBox;//左变右
            this.showRoomUser(leftBox,roomData.userRight,'');    

            let rightBox = this.owner.rightBox;//右变下
            this.showRoomUser(rightBox,roomData.userBottom,'');            
        }
        if(posType == 'userRight'){//右边
            let bottomBox = this.owner.bottomBox;//下变右
            this.showRoomUser(bottomBox,roomData.userRight,'userBottom');     

            let leftBox = this.owner.leftBox;//左变下
            this.showRoomUser(leftBox,roomData.userBottom,'');    

            let rightBox = this.owner.rightBox;//右变左
            this.showRoomUser(rightBox,roomData.userLeft,'');                
        }
        if(posType == 'userBottom'){//下边
            let bottomBox = this.owner.bottomBox;//下
            this.showRoomUser(bottomBox,roomData.userBottom,'userBottom');     

            let leftBox = this.owner.leftBox;//左
            this.showRoomUser(leftBox,roomData.userLeft,'');    

            let rightBox = this.owner.rightBox;//右
            this.showRoomUser(rightBox,roomData.userRight,'');                 
        }

        
    }

    showRoomUser(dom,data,posType){
        let userPhoto = dom.getChildByName('userPhoto');//头像
        let nickName = dom.getChildByName('nickName');//昵称
        let coinNum = dom.getChildByName('coinNum');//金币
        let coinIcon = dom.getChildByName('coinIcon');//金币icon
        let imgReady = dom.getChildByName('imgReady');//准备
        userPhoto.skin = data.photo?data.photo:'';
        nickName.text = data.userName?data.userName:'';
        coinNum.text = data.coin?data.coin:'';
        coinIcon.visible = data.coin?true:false;
        imgReady.visible = data.state == 'ready'?true:false;

        let timeBox = dom.getChildByName('timeBox');//timeBox
        let time = timeBox.getChildByName('time');
        timeBox.visible = (data.time&&data.time>=0)?true:false;
        time.text = data.time?data.time:'';

        //角色
        let roleDz = dom.getChildByName('roleDz');//地主icon
        let roleNm = dom.getChildByName('roleNm');//农民icon
        roleDz.visible = data.role == 'dizhu'?true:false;
        roleNm.visible = data.role == 'nongmin'?true:false;

        let iconJdz = dom.getChildByName('iconJdz');//叫地主
        let iconBj = dom.getChildByName('iconBj');//不叫叫地主
        iconJdz.visible = data.state == 'jsJdz'?true:false;
        iconBj.visible = data.state == 'bujiaodizhu'?true:false;
        

        if(posType == 'userBottom'){
            //显示底部已经出的牌
            let boxShowChupai = dom.getChildByName('boxShowChupai');//地主icon
            if(data.myPlayCards&&data.myPlayCards.length>0){
                let cards = data.myPlayCards;                
                boxShowChupai.destroyChildren();            
                for(let i= 0;i<cards.length;i++){
                    let card = new Laya.Sprite();
                    card.texture = 'cards/card_'+cards[i]+'.png';
                    card.width = 60;
                    card.height = 82;
                    card.x=i * 26;
                    boxShowChupai.addChild(card);
                } 
                //boxShowChupai.y = boxShowChupai.y-200;
                boxShowChupai.visible = true;
            }else{
                boxShowChupai.visible = false;
            }


            let btnReady = dom.getChildByName('btnReady');//准备按钮
            btnReady.visible = data.state == ''?true:false;
            //准备
            btnReady.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                socket.emit('ready',data);
                // let wangzhaAni = this.owner.wangzhaAni;
                // wangzhaAni.visible = true;
                // wangzhaAni.play();
                // Laya.Tween.to(wangzhaAni,{
                //     y:-274
                // },2000,Laya.Ease.quintOut,null);
            });            

            //叫地主
            let boxJdz = dom.getChildByName('boxJdz');//叫地主box
            let btnJdz = boxJdz.getChildByName('btnJdz');//叫地主
            let btnBjdz = boxJdz.getChildByName('btnBjdz');//不叫地主

            boxJdz.visible = data.state=='jiaodizhu'?true:false;            

            //叫地主
            btnJdz.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                boxJdz.visible = false;
                socket.emit('qiangdizhu')
            });
            //不叫
            btnBjdz.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                boxJdz.visible = false;
                socket.emit('buqiangdizhu')
            });

            //抢地主
            let boxQdz = dom.getChildByName('boxQdz');//抢地主box
            let btnQdz = boxQdz.getChildByName('btnQdz');//抢地主
            let btnBqdz = boxQdz.getChildByName('btnBqdz');//不抢地主
            boxQdz.visible = data.state=='qiangdizhu'?true:false;
            //抢地主
            btnQdz.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                boxQdz.visible = false;
                socket.emit('qiangdizhu');
            });
            //不抢
            btnBqdz.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                boxQdz.visible = false;
                socket.emit('buqiangdizhu')
            });

            //出牌
            let boxChupai = dom.getChildByName('boxChupai');//出牌box
            let btnChupai = boxChupai.getChildByName('btnChupai');//出牌
            let btnBuchu = boxChupai.getChildByName('btnBuchu');//不出牌
            boxChupai.visible = data.state == 'chupai'?true:false;
            btnBuchu.visible = data.order === '1' ?false:true;
            let iconBuchu = dom.getChildByName('iconBuchu');//不出图标
            iconBuchu.visible = data.state=='buchu'?true:false;
            //出牌
            btnChupai.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                //boxChupai.visible = false;
                let cards = this.cards;//我所有的牌
                let isSelArr = this.isSelArr;//用户是否选中
                let newIsSel = [];//重置剩余的牌为不选中
                let myPlayCards = [];//我要出的牌
                for(let i = 0 ; i<isSelArr.length ; i++){
                    if(isSelArr[i]){
                        myPlayCards.push(cards[i]);
                    }else{
                        newIsSel.push(false);
                    }
                }
                this.isSelArr = newIsSel;
                socket.emit('chupai',myPlayCards);                
            });
            //不出牌
            btnBuchu.offAll(Events.CLICK).on(Events.CLICK,this,()=>{
                boxChupai.visible = false;
                socket.emit('buchupai')
            });

        }else{            
            let cardNumBox = dom.getChildByName('cardNumBox');//牌的个数
            let cardNum = cardNumBox.getChildByName('num');
            cardNum.text = data.cardsNum == undefined ||data.cardsNum == 0?'':data.cardsNum;
            cardNumBox.visible = data.cardsNum == undefined ||data.cardsNum == 0?false:true;

            let myPlayCardsBox = dom.getChildByName('myPlayCardsBox');//我出的牌
            
            if(data.myPlayCards&&data.myPlayCards.length>0){
               
                let cards = data.myPlayCards;                
                myPlayCardsBox.destroyChildren();            
                for(let i= 0;i<cards.length;i++){
                    let card = new Laya.Sprite();
                    card.texture = 'cards/card_'+cards[i]+'.png';
                    card.width = 60;
                    card.height = 82;
                    card.x=i * 26;
                    myPlayCardsBox.addChild(card);
                } 
                myPlayCardsBox.y = myPlayCardsBox.y;
                myPlayCardsBox.visible = true;
            }else{
                myPlayCardsBox.visible = false;
            }

            let iconBuchu = dom.getChildByName('iconBuchu');//不出
            iconBuchu.visible = data.state=='buchu'?true:false;
        }
        
    }

    


    
}

export default RoomScene;