var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const moduloOperacion = require("./moduloOperacion");

var id = 1;
var operacion;
var numero;

var contOperaciones = 0;
var contadorOperaciones = '';
var histOperaciones;
var historicoOperaciones;

function calculoOperaciones(total, operacion, numero) {
    let cuentafinal;
    switch (operacion) {
        case '+':
            cuentafinal = total + numero;
            break;
        case '-':
            cuentafinal = total - numero;
            break;
        case '*':
            cuentafinal = total * numero;
            break;
        case '/':
            cuentafinal = total / numero;
            break;
        case 'Reset':
            cuentafinal = 0;
            break;
        default:
            console.log('Lo lamentamos, por el momento no disponemos de ' + operacion + '.');
    }
    return cuentafinal;
}
async function cargarDatos(req, res) {
    console.log(req.body)
    id = (req.body?.id)
    operacion = (req.body?.operacion)
    numeroRecibido = (req.body?.numero)

    if ((numeroRecibido == 0 && operacion == '/')||id.trim()==''||numeroRecibido.trim()=='') {
        
        res.render('pages/lastOperation', {
            muestraID: "ERROR, RECUERDA QUE TODOS LOS CAMPOS DEBEN DE ESTAR RELLENOS Y NO SE PUEDE DIVIDIR ENTRE 0",
            contOperaciones: '',
            historicoOperaciones: ''
        });
    } else {
        numero = parseInt(numeroRecibido)
        datos = (req.body)
        let representacionhis;
        const operacionCuenta = await moduloOperacion.findById(id);
        if (operacionCuenta) {
            contadorOperaciones = calculoOperaciones(operacionCuenta.total, operacion, numero)
            histOperaciones = operacionCuenta.historico + operacion + numeroRecibido.toString(),
                await moduloOperacion.findByIdAndUpdate(id, { total: contadorOperaciones, historico: histOperaciones, ultimaMod: Date.now() }, { new: true })
            if (operacion == 'Reset') {
                await moduloOperacion.findByIdAndUpdate(id, { total: 0, historico: '0', ultimaMod: Date.now() }, { new: true })
                representacionhis = 'VALOR RESETEADO';
                histOperaciones = '0'
            } else {
                representacionhis = 'HISTÓRICO OPERACIONES: ' + histOperaciones + '=' + contadorOperaciones.toString();
            }
            res.render('pages/lastOperation', {
                muestraID: "OPERACION DEL ID: " + id,
                contOperaciones: "RESULTADO: " + contadorOperaciones,
                historicoOperaciones: representacionhis
            });
        } else {
            contadorOperaciones = calculoOperaciones(0, operacion, numero)
            const nuevaOperacion = new moduloOperacion({ _id: id, total: contadorOperaciones, historico: '0' + operacion + (Math.abs(contadorOperaciones)).toString(), ultimaMod: Date.now() });
            await nuevaOperacion.save();
            representacionhis = 'HISTÓRICO OPERACIONES: 0' + operacion + numeroRecibido.toString() + '=' + contadorOperaciones.toString();
            res.render('pages/lastOperation', {
                muestraID: "OPERACION DEL ID: " + id,
                contOperaciones: "RESULTADO: " + contadorOperaciones,
                historicoOperaciones: representacionhis
            });
        }
    }
}


// index page 
async function paginaPrincipal(req, res) {
    res.render('pages/index', {
        idPagina: id
    });
}


// lastOperacion page
async function paginaResultados(req, res) {
    datosOperaciones = await moduloOperacion.find()
    if (datosOperaciones.length != 0) {
        const operacionCuenta = await moduloOperacion.findById(id);
        muestraID = "OPERACION DEL ID: " + operacionCuenta._id,
            contOperaciones = 'RESULTADO: ' + operacionCuenta.total,
            historicoOperaciones = 'HISTORICO OPERACIONES: ' + operacionCuenta.historico + '=' + operacionCuenta.total
    } else{
        muestraID = 'NO SE HA INTRODUCIDO DATO',
            contOperaciones = 'NO SE HA INICIADO LA CUENTA',
            historicoOperaciones = 'NO HAY HISTORICO DISPONIBLE'
    }
    res.render('pages/lastOperation', {
        muestraID: muestraID,
        contOperaciones: contOperaciones,
        historicoOperaciones: historicoOperaciones
    });
};
let datosOperaciones

async function myFunc() {
    datosOperaciones = await moduloOperacion.find()
    if (datosOperaciones.length != 0) {
        for (let i = 0; i < datosOperaciones.length; i++) {
            datosOperacionId = datosOperaciones[i];
            const operacionCuenta = await moduloOperacion.findById(datosOperacionId._id);
            if (Date.now() - operacionCuenta.ultimaMod >= 60000) {
                await moduloOperacion.deleteOne({ "_id": datosOperacionId._id })
            }
        }
    } else {
        histOperaciones = 'Numero en base de datos'
    }
}

setInterval(myFunc, 1000);

exports.controller = (app) => {
    app.post("/resultado", urlencodedParser, cargarDatos)
    app.get('/', paginaPrincipal)
    app.get('/lastOperation', paginaResultados)
}
