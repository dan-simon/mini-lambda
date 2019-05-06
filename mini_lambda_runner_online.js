var log = function (x) {
	document.getElementById('c').innerHTML += x + '<br/>';
}

var main = function () {
	let input = document.getElementById('a').value;
	try {
		document.getElementById('c').innerHTML = '';
		for (let i of input.split('\n')) {
			let e = execute(i);
			if (e !== null) {
				if (e[0] !== null) {
					log(e[0]);
				}
				log(e[1]);
				log(e[2]);
			}
		}
	} catch (e) {
		document.getElementById('c').innerHTML = 'Error!<br/>' + e;
	}
}

window.onload = function () {
	document.getElementById('b').onclick = main;
}
