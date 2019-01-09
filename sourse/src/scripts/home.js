
class HomeScene extends Laya.Script {
    constructor(){
        super();
        this.loginDialog = null;//登录弹框
        this.btnLogin = null;//登录按钮
        this.btnClose = null;//关闭
        this.inpName = null;//姓名
        this.inpNickName = null;//昵称
        this.btnBeginGame = null;//开始游戏
        this.headImg = [
            'https://cdn02.xianglin.cn/a314870cce2dab0418ddfbe9408c592b-17350.png',
            'https://cdn02.xianglin.cn/68586e70ad159f947b1f05efcad581c5-23712.png',
            'https://cdn02.xianglin.cn/b41a247c5b29cd4de8cef93cf7ae3ffd-20090.png',
            'https://cdn02.xianglin.cn/4f1627f8b61e1b4a6926ab42c87d333e-18618.png',
            'https://cdn02.xianglin.cn/b4d968c252a9cea0e668cb23db198ed0-22429.png',
            'https://cdn02.xianglin.cn/c12aa0f0c200e5970e20c03946cf079a-20810.png',
            'https://cdn02.xianglin.cn/f0749047a5cf4f02516a3c65602060eb-22454.png',
            'https://cdn02.xianglin.cn/70a155e96b6c97defe63d876e8e99fbd-24592.png',
            'https://cdn02.xianglin.cn/d783ce195a1fdbe809def6178d07c0c3-22394.png',
            'https://cdn02.xianglin.cn/ffcb3f6b12566d1a7bdda114927409e8-28721.png',
            'https://cdn02.xianglin.cn/ccffdec37e2820ba1729eebc74d28223-22776.png'
        ];//用户头像
    }

    //渲染之后执行	
    onPostRender(){
        
    }

    onStart(){
        console.log(this);
        this.loginDialog = this.owner.loginDialog;
        this.btnLogin = this.owner.btnLogin;
        this.btnClose = this.owner.btnClose;
        this.inpName = this.owner.inpName;
        this.inpPsd = this.owner.inpPsd;
        this.btnBeginGame = this.owner.btnBeginGame;
        
        //显示登录
        this.btnLogin.on(Events.CLICK,this,()=>{
            this.loginDialog.visible = true;
        });
        //关闭登录
        this.btnClose.on(Events.CLICK,this,()=>{
            this.loginDialog.visible = false;
        })

        //开始游戏
        this.btnBeginGame.on(Events.CLICK,this,()=>{
            let name = this.inpName.text;
            let inpPsd = this.inpPsd.text;
            if(name.trim() == ''){
                alert('请输入姓名');
                return false;
            }

            if(inpPsd.trim() == ''){
                alert('请输入密码');
                return false;
            }
            
            let index = Math.floor(Math.random() * (this.headImg.length-1));//头像随机索引
            let headImg = this.headImg[index]; //用户头像

            let data = {
                userName:name,
                coin:2000,
                photo:headImg
            };

            socket.emit('userLogin',data);
            socket.on('userLogin',(isLgin)=>{
                if(isLgin){
                    //跳转到大厅
                    Laya.Scene.open('./landlord/hall.scene');
                }
            })
            
            
        })
        
    }
}

export default HomeScene;