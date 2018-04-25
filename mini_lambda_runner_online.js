var main = function () {
	let input = document.getElementById('a').value;
	try {
		document.getElementById('c').innerHTML = '';
		for (let i of input.split('\n')) {
			let e = execute(i);
			if (e !== null) {
				document.getElementById('c').innerHTML += e[0] + '<br/>' + e[1] + '<br/>';
			}
		}
	} catch (e) {
		document.getElementById('c').innerHTML = 'Error!<br/>' + e;
	}
}

window.onload = function () {
	document.getElementById('b').onclick = main;
}
