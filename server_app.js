var express = require("express");
var app     = express();
var path    = require("path");
var mysql = require('mysql');
var qs = require('querystring');
var conn = require('../db/connection.json');

var pool = mysql.createPool({
  connectionLimit :   100,
  host :              conn.host,
  user :              conn.user,
  password :          conn.pass,
  database :          conn.database,
  debug :             false
});

function handleDB(q,callback){
  pool.getConnection(function(err,connection){
    if(err){
      connection.release();
      console.log(err.message);
      return;
    }
    connection.query(q,function(err,rows,fields){
      connection.release();
      if(!err){
        if(rows.length > 0){
          var RowsFields = [];
          for (var i in rows){
            RowsFields[i] = rows[i];
          }
          //console.log('Data query and printed successfully!');
          callback(RowsFields);
        }
        else{
          //console.log('Data query and inserted successfully!');
          return;
        }
      }
      else{
        console.log(err.message);
        return;
      }
    });
    connection.on('error', function(err) {      
      connection.release();
      console.log(err.message);
      return;
    });
  });
}


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
});
app.get('/login_test',function(req,res){
  res.writeHead(200, "OK", {'Content-Type': 'text/html'});
  res.write('<html><head><title>LOGIN_TEST</title></head><body>');
  res.write('<h1>POST LOGIN TEST</h1>');
  res.write('<form enctype="application/x-www-form-urlencoded" action="/login" method="post">');
  res.write('Name: <input type="text" name="name" value="" /><br />');
  res.write('Password: <input type="password" name="pass" value="" /><br />');
  res.write('<input type="submit" />');
  res.write('</form></body></html');
  res.end();
});
app.get('/login',function(req,res){
  if(req.method=='POST'){
        req.on('data',function(chunk){
        readPostData = qs.parse(String(chunk));
        console.log('Recieved login.');
        console.log(readPostData);
        });
        req.on('end',function(){
          handleDB('SELECT name,pass from ux_users;',function(query_res){
            var name_exist = 0;
            for(var n in query_res){
              if(query_res[n].name==readPostData.name){
                name_exist = 1;
                if(query_res[n].pass==readPostData.pass){
                  res.writeHead(200,'OK',{'Content-Type':'text/html'});
                  res.write('Bienvenido '+readPostData.name);
                  res.end();
                  break;
                }
                else{
                  res.writeHead(200,'OK',{'Content-Type':'text/html'});
                  res.write('Contrasena incorrecta');
                  res.end();
                  break;
                }
              }
            }
            if(!name_exist){
              res.writeHead(200,'OK',{'Content-Type':'text/html'});
              res.write('El usuario '+readPostData.name+' no existe');
              res.end();
            }
          });
        });
      }
});
app.get('/get_lights',function(){
	if(req.method=='GET'){
        handleDB('SELECT id,A FROM cu_devices WHERE type="W";',function(query_res){
          res.writeHead(200,'OK',{'Content-Type':'text/html'});
          for(var n in query_res){
            res.write('Dispositivo: '+query_res[n].id+'\tEstado: '+query_res[n].A+'\n\r');
            res.write('<br/>');
          }
          res.end();
        });
      }
});
app.get('/get_lights',function(){
	if(req.method=='GET'){
        handleDB('SELECT id,A FROM cu_devices WHERE type="W";',function(query_res){
          res.writeHead(200,'OK',{'Content-Type':'text/html'});
          for(var n in query_res){
            res.write('Dispositivo: '+query_res[n].id+'\tEstado: '+query_res[n].A+'\n\r');
            res.write('<br/>');
          }
          res.end();
        });
      }
});
app.get('/set_light_test',function(){
	res.writeHead(200, "OK", {'Content-Type': 'text/html'});
    res.write('<html><head><title>LIGHT_TEST</title></head><body>');
    res.write('<h1>POST LIGHT TEST</h1>');
    res.write('<form enctype="application/x-www-form-urlencoded" action="/set_light" method="post">') 
    res.write('Device: <input type="text" name="dev_id" value="" /><br />');
    res.write('<input type="submit" />');
    res.write('</form></body></html');
    res.end();
});


app.listen(3000);

console.log("Running at Port 3000");