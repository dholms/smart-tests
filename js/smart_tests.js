//takes in an abstract syntax tree and a list of blacklisted statements
//outputs an array of statements that violate the blacklist
var checkBlackList = function(ast, list){
	toDelete = [];
	acorn.walk.simple(ast, { 
		//checks if each statement is on the blacklist
		//if yes, it adds to toDelete, the array the method returns
		Statement: function(node){
			if(list.indexOf(node.type) > -1){
				if(toDelete.indexOf(node.type) < 0)
					toDelete.push(node.type);
			}
		}
	});

	return toDelete;
}

//takes in an abstract syntax tree and a list of whitelisted statements
//outputs an array of statements that violate the whitelist
var checkWhitelist = function(ast, list){
	//found is an array the same size as the whitelist
	//everytime a statement is found, its entry is changed to true
	toAdd = [];
	found = [];
	for(var i = 0; i < list.length; i++){found.push(false);}
	acorn.walk.simple(ast, { 
		//checks if each statement is on the whitelist
		//if yes, its entry in found is changed to true
		Statement: function(node){
			var x = list.indexOf(node.type);
			if(x > -1)
				found[x] = true;
		}
	})
	
	//returns an array of all those statements not found
	for(var i = 0; i < found.length; i++){
		if(found[i] == false)
			toAdd.push(whitelist[i]);
	}

	return toAdd;
}

//takes in an abstract syntax tree and the desired structure of the program
//outputs the boolean result of if the two match
var checkStructure = function(node, struc){
	//children of a node according to the desired structure
	var strucChildren = [];
	//children of a node according to the user's entry
	var nodeChildren = [];
	if(node.type == "Program")
		strucChildren = struc;
	else
		strucChildren = struc.children;

	nodeChildren = children(node) || [];
	var visited = [];
	for(var i = 0; i < nodeChildren.length; i++){visited.push(false)};

	//loops through the structure children (ie the required children)
	//if the child is not found in the user's entry, then there is a violation of the structure
	//and false is returned. Otherwise check child's children
	for(var i = 0; i < strucChildren.length; i++){
		var child = strucChildren[i];
		var match = false;
		for(var j = 0; j < nodeChildren.length; j++){
			//checks to make sure not visited if the structure has two similar statements on the same level
			if(child.type == nodeChildren[j].type && !visited[j]){
				visited[j] = true;
				match = checkStructure(nodeChildren[j], child);
				break;
			}
		}
		if(match == false)
			return false;
		else
			match = false;
	}
	return true;
}

//returns an array of the children of a node
var children = function(node){
	var children;
	if(node.type == "IfStatement")
		children = node.consequent.body;
	else
		children = node.body;
	if(children && children.type == "BlockStatement")
		children = children.body;

	return children;
}