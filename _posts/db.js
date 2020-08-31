var db = database();
function database() {
	this.selects = [];
	this.froms = 'table';
	this.where1 = {};
	this.where2 = {};
	this.select = function (name) {
		this.selects.push(name);
		return this;
	}
	this.from = function (name) {
		this.froms = name;
		return this;
	}
	this.tags = function () {
		for (i = 0; i < arguments.length; i++) {
			if (i == 0) {
				this.where1.tag1 = Math.ceil(Math.random() * 1000000);
			} else if (i == 1) {
				this.where1.tag2 = Math.ceil(Math.random() * 1000000);
			} else {
				this.where1.tag3 = Math.ceil(Math.random() * 1000000);
			}
		}
		return this;
	}
	this.noTags = function (url) {
		for (i = 0; i < arguments.length; i++) {
			if (i == 0) {
				this.where2.tag1 = Math.ceil(Math.random() * 1000000);
			} else if (i == 1) {
				this.where2.tag2 = Math.ceil(Math.random() * 1000000);
			} else {
				this.where2.tag3 = Math.ceil(Math.random() * 1000000);
			}
		}
		return this;
	}
	this.take = function (top) {
		if (top === undefined) {
			console.log("select")
		} else {
			console.log("select top ", top)
		}
		for (var i = 0; i < this.selects.length; i++) {
			console.log("    ", this.selects[i], ',');
		}
		console.log('    ...');
		console.log("from", this.froms);
		var tag1 = 1;
		for (const key in this.where1) {
			tag1 += this.where1[key];
		}
		console.log("where  tag1 & "+ tag1 +" = " + tag1);
		var tag2 = 1;
		for (const key in this.where2) {
			tag2 += this.where2[key];
		}
		console.log("    and tag2 | "+tag2+" > 0 ");
		return [{ name: "朱明武", title: "架构师" }, { name: "Adam Zhu", title: "Architect" }];
	}
	return this;
}

var result = db.from('v_member_tag').select('info').tags('白' ,'富','美').take();

var result = db.select('field1').select('field2').from('v_member_tag').noTags('胖','矮','丑').take();

var result =db.select('field1').from('v_member_tag').tags('白' ) .tags('富'). tags('美').noTags('胖') .noTags('矮') .noTags('丑').take(10);

