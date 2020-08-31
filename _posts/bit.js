//会员标签
members = [
	{
		name: "白富美",
		tag: parseInt("00000111", 2)
	},
	{
		name: "矮穷矬",
		tag: parseInt("00111000", 2)
	},
	{
		name: "一穷二白",
		tag: parseInt("00010100", 2)
	},
]

//and 查询
//查询白富美
tagValue = parseInt("00000111", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "是否白富美:", (member.tag & tagValue) == tagValue)
}
//查询一穷二白的人
tagValue = parseInt("00010100", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "是否一穷二白:", (member.tag & tagValue) == tagValue)
}
//查询穷人
tagValue = parseInt("00010000", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "是否穷:", (member.tag & tagValue) == tagValue)
}

//or 查询
//查询 或白或富或美之人
tagValue = parseInt("00000111", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "是或白或富或美之人:", (member.tag & tagValue) > 0)
}

//查询或穷或美之人
tagValue = parseInt("00010001", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "或穷或美之人:", (member.tag & tagValue) > 0)
}


//not 查询
//查询不是或白或富或美之人
tagValue = parseInt("00000111", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "不是或白或富或美之人:", (member.tag & tagValue) == 0)
}

//查询不是穷人
tagValue = parseInt("00010000", 2);
for (var i = 0; i < members.length; i++) {
	var member = members[i];
	console.log(member.name, "不是穷人:", (member.tag & tagValue) != tagValue)
}