/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import hall from "./scripts/hall"
import home from "./scripts/home"
import room from "./scripts/room"

export default class GameConfig {
    static init() {
        //注册Script或者Runtime引用
        let reg = Laya.ClassUtils.regClass;
		reg("scripts/hall.js",hall);
		reg("scripts/home.js",home);
		reg("scripts/room.js",room);
    }
}
GameConfig.width = 1136;
GameConfig.height = 640;
GameConfig.scaleMode ="fixedwidth";
GameConfig.screenMode = "horizontal";
GameConfig.alignV = "top";
GameConfig.alignH = "left";
GameConfig.startScene = "landlord/home.scene";
GameConfig.sceneRoot = "";
GameConfig.debug = false;
GameConfig.stat = false;
GameConfig.physicsDebug = false;
GameConfig.exportSceneToJson = true;

GameConfig.init();
