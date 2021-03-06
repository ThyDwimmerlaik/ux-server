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
    case '/login_test':
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.write('<html><head><title>LOGIN_TEST</title></head><body>');
      res.write('<h1>POST LOGIN TEST</h1>');
      res.write('<form enctype="application/x-www-form-urlencoded" action="/login" method="post">');
      res.write('Name: <input type="text" name="name" value="" /><br />');
      res.write('Password: <input type="password" name="pass" value="" /><br />');
      res.write('<input type="submit" />');
      res.write('</form></body></html');
      res.end();
    break;
    case '/login':
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
    break;
    case '/get_lights':
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
    break;
    case '/set_light_test':
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.write('<html><head><title>LIGHT_TEST</title></head><body>');
      res.write('<h1>POST LIGHT TEST</h1>');
      res.write('<form enctype="application/x-www-form-urlencoded" action="/set_light" method="post">');
      res.write('Device: <input type="text" name="dev_id" value="" /><br />');
      res.write('<input type="submit" />');
      res.write('</form></body></html');
      res.end();
    break;
    case '/set_light':
      if(req.method=='POST'){
        readPost = '';
        req.on('data',function(chunk){
          readPost += chunk.toString();
        });
        req.on('end',function(){
          readPostData = qs.parse(readPost);
          console.log('Recieved toggle order.');
          console.log(readPostData);
          handleDB('SELECT A FROM cu_devices where id="'+String(readPostData.dev_id)+'";',function(query_res){
            console.log(String(query_res[0]));
            if(String(query_res[0].A)=="OFF"){
              console.log('TOGGLE ENCENDIDO');
              handleDB('UPDATE cu_devices SET A="ON" WHERE id="'+String(readPostData.dev_id)+'";');
            }
            else if (String(query_res[0].A)=="ON"){
              console.log('TOGGLE APAGADO');
              handleDB('UPDATE cu_devices SET A="OFF" WHERE id="'+String(readPostData.dev_id)+'";');
            }
            res.writeHead(200, "OK", {'Content-Type': 'text/html'});
            res.end();
          });
        });
      }
    break;
    case '/get_stats':
      if(req.method=='GET'){
        handleDB('SELECT id_dev,A,datetime FROM cu_lecturas;',function(query_res){
          res.writeHead(200,'OK',{'Content-Type':'text/html'});
          for(var n in query_res){
            res.write('Dispositivo: '+query_res[n].id_dev+'\tLectura: '+query_res[n].A+'\tFecha: '+query_res[n].datetime+'\n');
            res.write('<br/>');
          }
          res.end();
        });
      }
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