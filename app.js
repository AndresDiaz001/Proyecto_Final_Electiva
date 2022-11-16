const express = require('express');
const dotenv = require('dotenv');
var path = require('path');
var cookieParser = require('cookie-parser');

//var logger = require('morgan');
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

const app = express();

//seteamos el motor de plantillas
app.set('view engine', 'ejs')

//seteamos la carpeta public para archivos estáticos
app.use(express.static('public'))

//para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//seteamos las variables de entorno
dotenv.config({path: './env/.env'})

//para poder trabajar con las cookies
app.use(cookieParser())

//llamar al router
app.use('/', require('./routes/router'))

//Para no recargar el cache
app.use(function(req, res, next) {
    if (!req.correo)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


app.listen(3000, ()=>{
    console.log('SERVER UP runnung in http://localhost:3000')
})
//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', indexRouter);
//app.use('/users', usersRouter);

//module.exports = app;
