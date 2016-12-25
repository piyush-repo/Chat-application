var express=require('express');
var app= express();
var server=require('http').createServer(app);
var io=require('./App/Socket').socket.listen(server);
var mongo=require('mongodb').MongoClient;
    
//var db=require('./App/db');
var port=process.env.PORT||5000;
mongo.connect('mongodb://localhost:27017/chat',function(err,db){
    if(err)
    	throw err;
    io.on('connection',function(socket){
    	socket.on('usercheck',function(data){
	    	var collection=db.collection('users');
	    	
            //checks for the username 
	    	collection.find({username:data}).toArray(function(err,result){
	    		  if(result.length>0){
	    		  	//checking for the username existance and sending out message.
	    			socket.emit('userexist',data+' user already exist !! please try another one');
	    			//recieving message from client post usercheck
	    			socket.on('message',function(message){
                        io.sockets.emit('sentmsg',{'username':data,'msg':message});
	    			});
	    		}
	    		//if user is not present then inserts the new username
	    		else{
	    			db.collection('users').insert({username:data},function(err,data){
	    				if(err){
	    					socket.emit('errmsg','please try again');
	    				}
	    				else{
	    					socket.emit('errmsg','user registered successfully');
	    					//recieving message from client 
	    					socket.on('message',function(message){
                            io.sockets.emit('sentmsg',{'username':data,'msg':message});
	    			});
	    				}
	    	     });
	    		}
	    		});
	    		
	    		
	    });

  });
});

app.get('/',function(req,res){
	res.sendFile(__dirname+'/Views/chatpage.html');
	
});


server.listen(port,function(){
	console.log('Application started at port ',port);
});