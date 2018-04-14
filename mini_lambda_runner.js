var execute = require('./mini_lambda_interpreter');

var show_prompt = function () {
	process.stdout.write('>>> ');
}

var main = function () {
	var stdin = process.openStdin();
  show_prompt();
  stdin.addListener('data', function (d) {
    d = d.toString().slice(0, -1);
    try {
			var [type, value] = execute(d);
    	console.log(type);
			console.log(value);
    } catch (e) {
    	console.log('There was an exception:');
    	console.log(e);
    }
    show_prompt();
	});
}

main();
