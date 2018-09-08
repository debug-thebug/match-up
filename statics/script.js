// ctx: drawing board.
// skill: list of skills of players.
// type: home/away
// name: group #
// text_pos: -1/+1 - text is above/below.
// x_start: x starting position of the drawing.
// y_start: y starting position of the drawing.
function drawPlayers(ctx, x_start, y_start, skills, type, name, score, text_pos) {
	var x_off = 10;
	var y_off = 20;

	ctx.font = '20px Arial';

	for (var i=0; i<skills.length; ++i) {
		ctx.beginPath();
		ctx.arc(x_start + 5 + x_off, y_start-7, 5, 0*Math.PI, 2*Math.PI);
		ctx.stroke();
		ctx.fillText(skills[i], x_start + x_off, y_start + text_pos*y_off);
	
		x_off += 40;
	}

	ctx.fillText(type + '(' + name + '): ' + score, x_start + x_off, y_start);
	ctx.stroke();
}

var y_pos = 40;

function process(data) {
	var result = JSON.parse(data)

	var refresh = Number(result.refresh);
	var grp_a = result.grp_a;
	var grp_b = result.grp_b;

	// Skill set of 5 players.
	var grp_a_round = result.grp_a_round.split(',');
	var grp_b_round = result.grp_b_round.split(',');

	var grp_a_round = result.grp_a_round.split(',');
	var grp_b_round = result.grp_b_round.split(',');

	// Skill set of all players
	var grp_a_skills = result.grp_a_skills.split(',');
	var grp_b_skills = result.grp_b_skills.split(',');

	// Skill distribution per round.
	var grp_a_dist = result.grp_a_dist.split(';');
	var grp_b_dist = result.grp_b_dist.split(';');

	// Scores.
	var grp_a_score = Number(result.grp_a_score);
	var grp_b_score = Number(result.grp_b_score);

	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	drawPlayers(ctx, 20, y_pos, grp_a_round, 'Home', grp_a, grp_a_score, -1);
	drawPlayers(ctx, 20, y_pos+60, grp_b_round, 'Away', grp_b, grp_a_score, 1);

	if (document.getElementById('grp-a-skills').innerHTML == "") {
		// Populate the info tables.
		document.getElementsByName('grp-a-name').forEach(function(elem) {
			elem.innerHTML = grp_a;
		});
		document.getElementsByName('grp-b-name').forEach(function(elem) {
			elem.innerHTML = grp_b;
		});

		document.getElementById('grp-a-skills').innerHTML = grp_a_skills;
		document.getElementById('grp-b-skills').innerHTML = grp_b_skills;

		var tab = document.getElementById('distrib');

		for (var i=0; i<3; ++i) {
			var tr = document.createElement('tr');
			
			var td = document.createElement('td');
			td.innerHTML = grp_a_dist[i];
			tr.appendChild(td);

			var td = document.createElement('td');
			td.innerHTML = grp_b_dist[i];
			tr.appendChild(td);

			tab.appendChild(tr);
		}
	}

	y_pos += 120;

	return refresh;
}

var latest_version = -1;

function ajax(version, retries, timeout) {
	console.log("Version " + version);
	var xhttp = new XMLHttpRequest();
	xhttp.onload = (function() {
			var refresh = -1;
			try {
				if (xhttp.readyState != 4)
					throw "Incomplete HTTP request: " + xhttp.readyState;
				if (xhttp.status != 200)
					throw "Invalid HTTP status: " + xhttp.status;
				//console.log(xhttp.responseText);
				refresh = process(xhttp.responseText);
				if (latest_version < version)
					latest_version = version;
				else refresh = -1;
			} catch (message) {
				alert(message);
			}
			if (refresh >= 0)
				setTimeout(function() { ajax(version + 1, 10, 100); }, refresh);
		});
	xhttp.onabort = (function() { location.reload(true); });
	xhttp.onerror = (function() { location.reload(true); });
	xhttp.ontimeout = (function() {
			if (version <= latest_version)
				console.log("AJAX timeout (version " + version + " <= " + latest_version + ")");
			else if (retries == 0)
				location.reload(true);
			else {
				console.log("AJAX timeout (version " + version + ", retries: " + retries + ")");
				ajax(version, retries - 1, timeout * 2);
			}
		});
	xhttp.open("GET", "data.txt", true);
	xhttp.responseType = "text";
	xhttp.timeout = timeout;
	xhttp.send();
}

//ajax(1, 10, 100);

process('{"refresh":0, "grp_a":"g1", "grp_b":"g2", "grp_a_round":"1,2,3,4,5", "grp_b_round":"4,5,6,7,8",' + 
	'"grp_a_skills":"4,3,2,5,6,7,3", "grp_b_skills":"2,3,5,7,5,4,3", "grp_a_dist":"1,2;4,3;6,7", "grp_b_dist":"3,4;5,1;8,7", ' + 
	'"grp_a_score":"3", "grp_b_score":"0", "past_games":"1,2,3,4,5;1,2,3,4,5;1,2,3,4,5:5,6,7,8,9;4,5,6,7,8;3,4,5,6,7"}');
