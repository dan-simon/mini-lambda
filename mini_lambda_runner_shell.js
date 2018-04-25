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
			var res = execute(d);
			if (res !== null) {
				var [type, value_string, real_value] = res;
				console.log(type);
				console.log(value_string);
			}
    } catch (e) {
    	console.log('There was an exception:');
    	console.log(e);
    }
    show_prompt();
	});
}

main();
