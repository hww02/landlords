//用1——54的数组代表54张牌
function myCreateArray(n) {
	let arr = [];
	for(let i = 0; i < n; i++){
		arr[i] = i;
	}
	return arr;
}

//洗牌即是打乱数组顺序
function myShuffle(arr) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
        let index = parseInt(Math.random() * (len - i));
        let temp = arr[index];
        arr[index] = arr[len - i - 1];
        arr[len - i - 1] = temp;
    }
}

function compare(x, y) { //比较函数
  if (x > y) {
    return -1;
  } else if (x < y) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = {
	myCreateArray,
	myShuffle,
	compare
}
