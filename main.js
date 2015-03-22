$(document).ready(function() {
	init();
	$('#score-table').hide();
	$('#loading').show();
});

var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/16iTA7Pz1gAiqAsmrxt6W9Xr_2fUmfwWxhhaniznv4_g/pubhtml';//'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=0AmYzu_s7QHsmdDNZUzRlYldnWTZCLXdrMXlYQzVxSFE&output=html';

function init() {
	Tabletop.init( { key: public_spreadsheet_url,
	                 callback: showInfo,
	                 simpleSheet: false } );
}

function showInfo(data, tabletop) {
	var colNames = data["По неделям"].column_names;
	var colLength = colNames.length;
	var rawElements = data["По неделям"].elements;
	var dataModel = new Object();
	var unsortedScore = new Array();

	// create first entry (collapsed with col names)... crap
	var score = new Array();
	dataModel[colNames[0]] = score;
	for (var i = 1; i < colLength; i += 2) {
		var weekScore = {
			"name" : colNames[0],
			"total" : parseFloat(colNames[i].replace(',', '.')),
			"progress" : parseFloat(colNames[i + 1].replace(',', '.'))
		};

		score.push(weekScore);

		week = new Array();
		unsortedScore.push(week);
		week.push(weekScore);
	}

	// procced the rest
	rawElements.forEach(function(entry) {
		var subjectName = entry[colNames[0]];
		var score = new Array();
		dataModel[subjectName] = score;
		for (var i = 1; i < colLength; i += 2) {
			var weekScore = {
				name : subjectName,
				total : parseFloat(entry[colNames[i]].replace(',', '.')),
				progress : parseFloat(entry[colNames[i + 1]].replace(',', '.'))
			};
			score.push(weekScore);
			unsortedScore[(i - 1) / 2].push(weekScore);
		}
	});

	var weeks = (colLength - 1) / 2;

	var sortedScore = new Array();
	for (var i = 0, l = unsortedScore.length; i < l; i++) {
		sortedScore.push(unsortedScore[i].sort(function(a, b) {
			return b.total - a.total; // reverse order
		}));
	}

	var table = buildTable(dataModel, weeks, sortedScore);
	styleTable(table);
}

function translite(str){
	var arr = {'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ж':'g', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'ы':'i', 'э':'e', 'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ж':'G', 'З':'Z', 'И':'I', 'Й':'Y', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O', 'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Ы':'I', 'Э':'E', 'ё':'yo', 'х':'h', 'ц':'ts', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'', 'ь':'', 'ю':'yu', 'я':'ya', 'Ё':'YO', 'Х':'H', 'Ц':'TS', 'Ч':'CH', 'Ш':'SH', 'Щ':'SHCH', 'Ъ':'', 'Ь':'', 'Ю':'YU', 'Я':'YA'};
	var replacer = function(a) { return arr[a]||a };
	return str.replace(/[А-яёЁ]/g, replacer)
}

function buildTable(dataModel, weeks, sortedScore) {
	var scoreTable = $('#score-table');

	// table header
	var row = $('<tr></tr>');
	row.append('<th>Name</th>');		
	for (var week = 1; week <= weeks; week++) {
		row.append('<th colspan=2>week #' + week + '</th>');
	}
	scoreTable.append(row);

	// render entries
	var rowCounter = 0;
	for (var subjectName in dataModel) {
		var row =  $('<tr></tr>');
		row.append('<td class="subject_name ' + translite(subjectName.replace(/\s+/g, '_')) + '">' + subjectName + '</td>');

		//var score = dataModel[subjectName];
		//for (var week in score) {
		//	var weekScore = score[week];
		for (var i = 0; i < weeks; i++) {
			var weekScore = sortedScore[i][rowCounter];
			
			var weekSubjectName = translite(weekScore.name.replace(/\s+/g, '_'));
			row .append('<td class=' + weekSubjectName + '>' + weekScore.total + '</td>')
				.append('<td class=' + weekSubjectName + '>' + weekScore.progress + '</td>');
		}
		scoreTable.append(row);
		rowCounter ++;
	}
	return scoreTable;
}

function styleTable(table) {
	table.find(".subject_name").hover(function(e) {
		$(this).addClass('highlight');  
		$(this).attr('class').split(/\s+/g).forEach(function(entry) {
			if ("subject_name" != entry) {
				table.find("." + entry).addClass('highlight');
				return;
			}
		});
    }, function(e) {  
    	$(this).removeClass('highlight');  
    	$(this).attr('class').split(/\s+/g).forEach(function(entry) {
			if ("subject_name" != entry) {
				table.find("." + entry).removeClass('highlight');
				return;
			}
		});
	});

	$('#loading').hide();
	table.show();
}