/**
 * Created by wanwan on 2018/9/27.
 *
 * 如何判断一手牌的类型(单,对子,三不带,三带一,四代二等)
 */

 const PokerType = {
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

//获取出牌的类型
function getPokerType(pokers) {

	let len = pokers.length;
	let i = 0;
	let countPoker = 0;
	let duizi = false;
	let sanzhang = false;
	let zhadan = false;
	let tempArray = [];
	if (len == 1) {
		console.log('单张');
		return PokerType.danzhang
	}

	if (len == 2) {
		if (pokers[0] == 53 && pokers[1] == 52) {
			console.log('王炸');
			return PokerType.wangzha
		}

		if (getPokerValue(pokers[0]) == getPokerValue(pokers[1])) {
			console.log('对子');
			return PokerType.duizi
		}
	}

	if (len == 3 && getPokerValue(pokers[0]) == getPokerValue(pokers[1]) && getPokerValue(pokers[1]) == getPokerValue(pokers[2])) {
		console.log('三张');
		return PokerType.sanzhang;
	}

	if (len == 4) {
		var countFirstPoker = getPokerCount(pokers, pokers[0])
		if (countFirstPoker == 4) {
			console.log('炸弹');
			return PokerType.zhadan
		}
		if (countFirstPoker == 3 || getPokerCount(pokers, pokers[1]) == 3) {
			console.log('三带一');
			return PokerType.sandaiyi
		}
	}

	if (len == 5) {
		sanzhang = false;
		duizi = false;
		for (i = 0; i < len; i++) {
			countPoker = getPokerCount(pokers, pokers[i])
			if (countPoker == 3) {
				sanzhang = true
			}
			if (countPoker == 2) {
				duizi = true
			}
		}
		if (sanzhang && duizi) {
			console.log('三带一对')
			return PokerType.sandaiyidui
		}
	}

	if (len >= 5 && shunzi(pokers)) {
		console.log('顺子')
		return PokerType.shunzi;
	}

	if (len == 6) {
		if (pokers[0] == 53 && pokers[1] == 52) {
			return PokerType.error
		}
		zhadan = false;
		for (i = 0; i < len; i++) {
			if (getPokerCount(pokers, pokers[i]) == 4) {
				zhadan = true
			}
		}
		if (zhadan) {
			console.log('三带二')
			return PokerType.sidaier
		}
	}

	if (len >= 6 && len % 2 == 0) {
		duizi = true;
		for (i = 0; i < len; i++) {
			if (getPokerCount(pokers, pokers[i]) != 2) {
				duizi = false;
				break
			}
		}
		tempArray = [];
		if (duizi) {
			for (i = 0; i < len / 2; i++) {
				tempArray[i] = pokers[i * 2]
			}
			if (shunzi(tempArray)) {
				console.log('连对')
				return PokerType.liandui
			}
		}
	}

	if (len >= 6 && len % 3 == 0) { // 飞机不带
		sanzhang = true;
		for (i = 0; i < len; i++) {
			if (getPokerCount(pokers, pokers[i]) != 3) {
				sanzhang = false;
				break
			}
		}

		tempArray = [];
		if (sanzhang) {
			for (i = 0; i < len / 3; i++) {
				tempArray[i] = pokers[i * 3]
			}
			if (shunzi(tempArray)) {
				console.log('飞机')
				return PokerType.feiji
			}
		}
	}

	if (len == 8) {
		duizi = false;
		zhadan = false;
		for (i = 0; i < len; i++) {
			countPoker = getPokerCount(pokers, pokers[i]);
			if (countPoker == 2) {
				duizi = true;
			} else if (countPoker == 4) {
				zhadan = true;
			} else {
				duizi = false;
				break
			}
		}

		if (duizi && zhadan) {
			console.log('四带两对')
			return PokerType.sidailiangdui
		}
	}

	if (len >= 8 && len % 4 == 0) {
		if (pokers[0] == 53 && pokers[1] == 52) {
			return PokerType.error
		}

		tempArray = [];
		for (i = 0; i < len; i++) {
			countPoker = getPokerCount(pokers, pokers[i]);
			if (countPoker == 3) {
				tempArray.push(pokers[i])
			}
		}

		if (tempArray.length == len / 4 * 3 && getPokerType(tempArray) == PokerType.feiji) {
			console.log('飞机')
			return PokerType.feiji
		}
	}

	if (len >= 10 && len % 5 == 0) {
		duizi = false;
		tempArray = [];
		for (i = 0; i < len; i++) {
			countPoker = getPokerCount(pokers, pokers[i]);
			if (countPoker == 2) {
				duizi = true;
			} else if (countPoker == 3) {
				tempArray.push(pokers[i])
			} else {
				duizi = false;
				break
			}
		}

		if (duizi && tempArray.length == len / 5 * 3 && getPokerType(tempArray) == PokerType.feiji) {
			console.log('飞机')
			return PokerType.feiji
		}
	}

	return PokerType.error;
}

//获取扑克牌的值
function getPokerValue(poker) {
	if (poker == 52) { //小王
		return 16
	}
	if (poker == 53) { //大王
		return 17
	}
	return Math.floor(poker / 4) + 3;
}

//判断牌数相等的次数
function getPokerCount(pokers, poker) {
	let count = 0;
	for (let i = 0; i < pokers.length; i++) {
		if (getPokerValue(pokers[i]) == getPokerValue(poker)) {
			count++
		}
	}
	return count
}

//顺子
function shunzi(pokers) {
	let pokeValue = getPokerValue(pokers[0]);
	if (pokeValue >= 15) { // 2，大、小王
		return false
	}
	for (let i = 1; i < pokers.length; i++) {
		let pokeValue2 = getPokerValue(pokers[i]);
		if (pokeValue - pokeValue2 != 1) {
			return false
		}
		pokeValue = pokeValue2
	}
	return true
}


// function compare(x, y) { //比较函数
//   if (x > y) {
//     return -1;
//   } else if (x < y) {
//     return 1;
//   } else {
//     return 0;
//   }
// }

module.exports = {
	getPokerType
}
