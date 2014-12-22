//sample data
//use names according to Mozilla Parser API
var blacklist = ["WhileStatement"];
var whitelist = ["VariableDeclaration", "ForStatement", "IfStatement"];
var structure = [{
	type: "ForStatement",
	children: [
		{
			type:"IfStatement",
			children: [
				{
					type: "VariableDeclaration",
					children: []
				},
				{
					type: "VariableDeclaration",
					children: []
				}
			]
		},
		{
			type: "VariableDeclaration",
			children: []
		}
		
	]
}];

//setsup codemirror
var mirror = CodeMirror.fromTextArea(code, {
  mode:  "javascript",
  lineNumbers: true
});

//listener for changes to codemirror. On change verify new entry
mirror.on("change", function(obj, change){
	//smart indent on paste
	if (change.origin == "paste");
		mirror.operation(function() {
			for (var line = change.from.line, end = CodeMirror.changeEnd(change).line; line < end; ++line)
			mirror.indentLine(line, "smart");
		});

	verify();
})

//uses API to verify user's entries
var verify = function(){
	var codeText = mirror.getValue();
	var ast = acorn.parse_dammit(codeText, {});

	toDelete = checkBlackList(ast, blacklist);
	toAdd = checkWhitelist(ast, whitelist);
	var output = "<strong>Issues:</strong><br>";

	

	//outputs violations of whitelist
	if(toAdd.length > 0){
		output += "The correct answer <strong>must</strong> use the following: ";
		for(var i = 0; i < toAdd.length; i++){
			output += addSpace(toAdd[i]);
			if(i != toAdd.length -1)
				output += ", ";
			else
				output +=".<br>";
		}
	}

	//outputs violations of blacklist
	if(toDelete.length > 0){
		output += "The correct answer <strong>must not</strong> use the following: ";
		for(var i = 0; i < toDelete.length; i++){
			output += addSpace(toDelete[i]);
			if(i != toDelete.length -1)
				output += ", ";
			else
				output +=".<br>";
		}
	}

	//outputs violations of structure
	if(checkStructure(ast, structure) == false){
		output += "<br>";
		output += showStructure();
	}
	document.getElementById("errors").innerHTML = output;
}

//returns HTML showing the desired structure
var showStructure = function(){
	//keeps track of how many tabs over the line should be ie how far nested
	//use &emsp; for tabs
	var tab = -1;
	var recurse = function(struc){
		tab++;
		for(var i = 0; i < struc.length; i++){
			for(var j = 0; j < tab; j++){
				output += "&emsp;"
			}
			output += addSpace(struc[i].type);
			if(struc[i].children.length != 0){
				output += " {<br>";
				recurse(struc[i].children);
				for(var j = 0; j < tab; j++){
					output += "&emsp;"
				}
				output += "}<br>";
			}
			else
				output += "<br>";
			
		}
		tab--;
	}
	var output = "The correct answer contains the following structure:<br>";
	recurse(structure);
	return output;
}

//adds space before the words Statement or Declaration for user readability
var addSpace = function(word){
	var index = word.indexOf("Statement");
	if(word.indexOf("Declaration") > 0)
		index = word.indexOf("Declaration");

	 return word.substring(0, index) + " " + word.substring(index, word.length);
}