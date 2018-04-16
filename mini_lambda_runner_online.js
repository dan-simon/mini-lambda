var main = function () {
	var input = document.getElementById('a').value;
	try {
		var e = execute(input);
		document.getElementById('c').innerHTML = e[0] + '<br/>' + e[1];
	} catch (e) {
		document.getElementById('c').innerHTML = 'Error!<br/>' + e;
	}
}

window.onload = function () {
	document.getElementById('b').onclick = main;
}
