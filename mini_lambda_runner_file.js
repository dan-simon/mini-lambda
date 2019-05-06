var execute = require('./mini_lambda_interpreter');

var process = require('process');

var fs = require('fs');

var main = function () {
	fs.readFile(process.argv[2], 'utf8', function (err, data) {
		if (err) {
			throw 'File error: ' + err + '!';
		}
		try {
			for (let i of data.split('\n')) {
				var res = execute(i);
				if (res !== null) {
					var [name, type, value_string, real_value] = res;
					if (name !== null) {
						console.log(name);
					}
					console.log(type);
					console.log(value_string);
				}
			}
		} catch (e) {
    	console.log('There was an exception:');
    	console.log(e);
    }
	});
}

main();
