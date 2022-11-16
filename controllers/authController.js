const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')

//CONSULTA REGISTRO
exports.register = async (req, res)=>{    
    try {
        const correo = req.body.correo;
        const contrasenia = req.body.contrasenia;
        const nombre_usuario = req.body.nombre_usuario;
        let passHash = await bcryptjs.hash(contrasenia, 8)    
        //console.log(passHash)   
        conexion.query('INSERT INTO registros SET ?', {correo:correo, contrasenia:passHash, nombre_usuario:nombre_usuario}, async(error, results)=>{
            if(error){console.log(error)}
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }       
}

//CONSULTA LOGIN
exports.login = async (req, res)=>{
    try {
        const correo = req.body.correo;
        const contrasenia = req.body.contrasenia; 

        if(!correo || !contrasenia ){
            res.render('login',{
                alert:true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y password",
                alertIcon:'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            conexion.query('SELECT * FROM registros WHERE correo = ?',[correo], async (error, results)=>{
                if( results.length == 0 || ! (await bcryptjs.compare(contrasenia, results[0].contrasenia)) ){
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Password incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    })
                }else{
                    //inicio de sesión OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                   console.log("TOKEN: "+token+" para el USUARIO : "+correo)

                   const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                   }
                   res.cookie('jwt', token, cookiesOptions)
                   res.render('login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon:'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                   })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

// METODO AUTENTIFICACION 
exports.isAuthenticated = async (req, res, next)=>{
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM registros WHERE correo = ?', [decodificada.correo], (error, results)=>{
                if(!results){return next()}
                req.correo = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')        
    }
}

//METODO SALIR
exports.logout = (req, res)=>{
    res.clearCookie('jwt')   
    return res.redirect('/')
}