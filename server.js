var http = require('http');
var mysql = require('mysql');
var qs = require('querystring');
var conn = require('../db/connection.json');

var readPostData;

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

http.createServer(function(req,res){
  switch(req.url){
    case '/':
      res.writeHead(200,'OK',{'Content-Type':'text/html'});
      res.end();
    break;
    case 'login_test':
      console.log("[200] " + req.method + " to " + req.url);
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.write('<html><head><title>LOGIN_TEST</title></head><body>');
      res.write('<h1>POST LOGIN TEST</h1>');
      res.write('<form enctype="application/x-www-form-urlencoded" action="/login" method="post">');
      res.write('Name: <input type="text" name="name" value="" /><br />');
      res.write('Age: <input type="password" name="pass" value="" /><br />');
      res.write('<input type="submit" />');
      res.write('</form></body></html');
      res.end();
    case '/login':
      if(req.method=='POST'){
        req.on('data',function(chunk){
          readPostData = qs.parse(String(chunk));
          console.log('Recieved login.');
          console.log(readPostData);
        });
        req.on('end',function(){
          handleDB('SELECT pass from ux_users where name="'+readPostData.name+'";',function(query_res){
            if(query_res.length>0){
              if(String(query_res.pass) == readPostData.pass){
                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                res.write('Bienvenido '+readPostData.name);
                res.end();
              }
              else{
                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                res.write('Contrasena incorrecta');
                res.end();
              }
            }else{
              res.writeHead(200, "OK", {'Content-Type': 'text/html'});
              res.write('No existe el usuario '+readPostData.name);
              res.end();
            }
          });
        });
      }
    break;
    case '/get_lights':
        
    break;
    case '/post_lights':

    break;

    default:
      console.log('[404] '+req.method+' to '+req.url);
      res.writeHead('404','Not found',{'Content-Type':'text/html'});
      res.end('<html><head><title>ERROR</title></head><body><h1>NOT SUPPORTED</h1></body></html>');
  }
}).listen(8080,function(err){
  if(!err)
    console.log('[INFO] Listening on 8080');
  else
    console.log('[INFO] '+err.message);
  });