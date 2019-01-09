/**
 * Created by wanwan on 2018/9/27.
 *
 * 如何比较两手牌的大小
 */

/**
 *比较我的牌和上家的牌的大小，决定是否可以出牌
 * myCards 我想出的牌
 * myCardType 我的牌的类型
 * prevCards 上家的牌
 * prevCardType 上家的牌型
 * return 可以出牌，返回true；否则，返回false。
 *
 */
 //var cardType = require('./cardType');

function isOvercomePrev(myCards, myCardType, prevCards, prevCardType) {
  let PokerType = {
    danzhang: 1,
    duizi: 2,
    sanzhang: 3,
    sandaiyi: 4,
    sandaiyidui: 5,
    shunzi: 6,
    liandui: 7,
    feiji: 8,
    sidaier: 9,
    sidailiangdui: 10,
    zhadan: 11,
    wangzha: 12,
    error: 13
  };

	// 我的牌和上家的牌都不能为null
	if (myCards.length == 0 || prevCards.length == 0) {
		return false;
	}

	if (myCardType == '' || prevCardType == '') {
		console.log("上家出的牌不合法，所以不能出。");
		return false;
	}
	// 上一手牌的个数
	let prevSize = prevCards.length;
	let mySize = myCards.length;
	//我先出牌，上家没有牌
	if (prevSize == 0 && mySize != 0) {
		return true;
	}

	// 集中判断是否王炸，免得多次判断王炸
	if (prevCardType == PokerType.wangzha) {
		console.log("上家王炸，肯定不能出。");
		return false;
	} else if (myCardType == PokerType.wangzha) {
		console.log("我王炸，肯定能出。");
		return true;
	}

	// 集中判断对方不是炸弹，我出炸弹的情况
	if (prevCardType != PokerType.zhadan && myCardType == PokerType.zhadan) {
		return true;
	}

	// 默认情况：上家和自己想出的牌都符合规则
	//CardUtil.sortCards(myCards);  对牌排序
	//CardUtil.sortCards(prevCards);  对牌排序

	//排序后的第一张牌
	let myGrade = cardNum(myCards[0]);
	let prevGrade = cardNum(prevCards[0]);
	console.log('我的第一张牌',myGrade)
	console.log('上家的第一张牌',prevGrade)

	// 比较2家的牌，主要有2种情况，1.我出和上家一种类型的牌，即对子管对子；
	// 2.我出炸弹，此时，和上家的牌的类型可能不同
	// 王炸的情况已经排除

	if (prevCardType == PokerType.danzhang && myCardType == PokerType.danzhang) { // 单
		// 一张牌可以大过上家的牌
		return compareGrade(myGrade, prevGrade);
	}

  if (prevCardType == PokerType.duizi && myCardType == PokerType.duizi) { // 对子
		// 2张牌可以大过上家的牌
		return compareGrade(myGrade, prevGrade);
	}

  if (prevCardType == PokerType.sanzhang && myCardType == PokerType.sanzhang) { // 3不带
		// 3张牌可以大过上家的牌
		return compareGrade(myGrade, prevGrade);
	}

  if (prevCardType == PokerType.zhadan && myCardType == PokerType.zhadan) { // 炸弹
		// 4张牌可以大过上家的牌
		return compareGrade(myGrade, prevGrade);
	}

  if (prevCardType == PokerType.sandaiyi && myCardType == PokerType.sandaiyi) { // 3带1
		// 3带1只需比较第2张牌的大小
		myGrade = myCards[1];
		prevGrade = prevCards[1];
		return compareGrade(myGrade, prevGrade);
	}

  if (prevCardType == PokerType.sandaiyidui && myCardType == PokerType.sandaiyidui) { // 4带2
		// 4带2只需比较第3张牌的大小
		myGrade = myCards[2];
		prevGrade = prevCards[2];
	}

  if (prevCardType == PokerType.shunzi && myCardType == PokerType.shunzi) { // 顺子
		if (mySize != prevSize) {
			return false;
		} else {
			// 顺子只需比较最大的1张牌的大小
			myGrade = myCards[mySize - 1];
			prevGrade = prevCards[prevSize - 1];
			return compareGrade(myGrade, prevGrade);
		}
	}

  if (prevCardType == PokerType.liandui && myCardType == PokerType.liandui) { // 连对
		if (mySize != prevSize) {
			return false;
		} else {
			// 顺子只需比较最大的1张牌的大小
			myGrade = myCards[mySize - 1];
			prevGrade = prevCards[prevSize - 1];
			return compareGrade(myGrade, prevGrade);
		}
	}

  if (prevCardType == PokerType.feiji && myCardType == PokerType.feiji) { // 飞机
		if (mySize != prevSize) {
			return false;
		} else {
			// 顺子只需比较第5张牌的大小(特殊情况333444555666没有考虑，即12张的飞机，可以有2种出法)
			myGrade = myCards[4];
			prevGrade = prevCards[4];
			return compareGrade(myGrade, prevGrade);
		}
	}
  //默认不能出牌
	return false;
}

function cardNum(card) {
  if(card==53||card==54){
    return card;
  }else{
    return parseInt(card/4)+3;
  }

}

/**
*比较两张牌的大小
* @param grade1 我的第一张牌
* @param grade2 上家的第一张牌
* @return
*/
function compareGrade(grade1, grade2) {
	return grade1 > grade2;
}

//判断牌数相等的次数
// function getPokerCount(pokers, poker) {
//   let countArr = [];
// 	let count = 0;
// 	for (let i = 0; i < pokers.length; i++) {
// 		if (getPokerValue(pokers[i]) == getPokerValue(poker)) {
//       countArr.push(getPokerValue(pokers[i]));
// 			count++
// 		}
// 	}
// 	return count
// }

//判断牌数相等的且按大小排列 如: 44489 4449 887766
/**
* 对 连对 3张 3带1 3带2  4带2
*
*/
// function cardNumFun(pokers) {
// 	let newPokers = [];
// 	for (let i = 0; i < pokers.length; i++) {
// 		let cardNum = parseInt(pokers[i]/4)+3; //0/4+3 牌的面值==3
// 		newPokers.push(cardNum);
// 	}
//
// 	return newPokers
// }

//判断牌数相等的次数
// function getSameCardFun(pokers, poker) {
// 	let sameArr = [];
// 	for (let i = 0; i < pokers.length; i++) {
// 		if (cardType.getPokerValue(pokers[i]) == cardType.getPokerValue(poker)) {
// 			sameArr.push(cardType.getPokerValue(pokers[i]));
// 		}
// 	}
//   console.log(sameArr);
// 	return sameArr
// }
module.exports = {
	isOvercomePrev
}
