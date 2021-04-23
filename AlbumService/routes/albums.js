var cors=require('cors');
var express=require('express');
var router=express.Router();
var fs=require('fs');
var path=require('path');

var corsOptions = {
	origin:'http://localhost:3000',
	credentials:true
}

router.get('/init',cors(corsOptions),function(req,res) {
	var data = {};
	if(req.cookies.userid) {
		var db = req.db;
		var collection = db.get('userList');
		collection.find({'_id' : req.cookies.userid}, function(err,docs) {
			if(err===null) {
				data['username'] = docs[0].username;
				data['userid'] = req.cookies.userid;
				collection.find({'username' : {$in: docs[0].friends}},{username:1,password:0,friends:0}, function(err1, docs1) {
					if(err1 === null) {
						data['friends']=docs1;
						res.json(data);
					}
					else
						res.json({msg:err});
				});
			}
			else
				res.json({msg:err});
		});
	}
	else {
		res.json({'msg':''});
	}
});

router.post('/login', cors(corsOptions), function(req,res) {
	var db = req.db;
	var collection = db.get('userList');
	var data = {};
  var filter = {'username' : req.body.username,'password' : req.body.password};
	collection.find(filter, function(err, docs) {
		if(docs.length > 0 ) {
			data['username'] = req.body.username;
			data['userid'] = docs[0]._id;
			collection.find({'username' : {$in: docs[0].friends}},{username:1,password:0,friends:0}, function(err1, docs1) {
				if(err1 === null) {
					data['friends']=docs1;
					res.cookie('userid', data['userid'], {maxAge:60*60*1000} );
					res.json(data);
				}
				else
					res.json({'msg':err});
			});
		}
		else
			res.json({'msg':'Login failure'});
	});
});

router.get('/logout', cors(corsOptions), function(req,res) {
	res.clearCookie('userid');
	res.json({'msg':''});
});

router.get('/getalbum/:userid',cors(corsOptions),function(req,res) {
	var db = req.db;
	var collection = db.get('photoList');
	if (req.params.userid === "0"){
		collection.find({'userid' : req.cookies.userid}, function(err,docs) {
			res.json(err===null ? docs : {msg:err});
		});
	}else{
	collection.find({'userid' : req.params.userid}, function(err,docs) {
		res.json(err===null ? docs : {msg:err});
	});
	}
});

router.post('/uploadphoto',cors(corsOptions),function(req,res) {
	var db = req.db;
	var user = req.cookies.userid;
	var collection = db.get('photoList');
	var name = Math.round(Math.random() * 10000) + ".jpg";
	req.pipe(fs.createWriteStream('./public/uploads/' + name));
	collection.insert({'url':'http://localhost:3002/uploads/' + name, 'userid':user, 'likedby':[]},function(err) {
		if(!err) {
			collection.find({'url':'http://localhost:3002/uploads/'+name},function(err1,docs1) {
				res.send(JSON.stringify(err1===null ? docs1:{msg:err1}));
			});
		}
		else {
			res.send(JSON.stringify({msg:err}));
		}
		});
});

router.delete('/deletephoto/:photoid',cors(corsOptions),function(req,res) {
	var db = req.db;
	var collection = db.get('photoList');
	var path = "";
	collection.find({'_id': req.params.photoid}, function(err,docs) {
	if (!err){
	collection.remove({'_id':req.params.photoid}, function(err1) {
		if(!err1) {
			path = docs[0].url;
			var n = path.lastIndexOf("/");
			path = path.substring(n, path.length);
			fs.unlink('./public/uploads'+path, function(err1) {
				if(!err1) res.json({});
			});
		}
		else {
			res.json({msg:err1});
		}
	});
	}
});
});

router.put('/updatelike/:photoid',cors(corsOptions),function(req,res) {
	var db = req.db;
	var collection = db.get('userList');
	var index = -1;
	var user;
	collection.find({'_id' : req.cookies.userid}, function(err,docs) {
		user = docs[0].username;
		collection = db.get('photoList');
		collection.find({'_id' : req.params.photoid}, function(err1,docs1) {
			index = docs1[0].likedby.indexOf(user);
			if(index >= 0) {
				docs1[0].likedby.splice(index,1);
			}
			else {
				docs1[0].likedby.push(user);
			}
			collection.update({'_id':req.params.photoid},{$set:{'likedby':docs1[0].likedby}},function(err2) {
				if (!err2)
				res.json(docs1[0]['likedby']);
				else
				res.json({msg:err});
			});
		});
	});
});

router.options('/*',cors(corsOptions));

module.exports = router;
