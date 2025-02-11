var express                 = require('express');
var router                  = express.Router();
let tblModel                = require('../models/coll_especialistas');
let tblEspecialistasHorario = require('../models/coll_especialistas_horario');
let tblSpecialties          = require('../models/coll_specialties');
let searchHorarios          = require('../controls/horarios');
let authenticate    = require('../Middleware/authenticate');
const moment = require('moment-timezone');
let fn              = require('../controls/horarios');

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  });
/* GET users listing. */
router.get('/', function(req, res, next) 
{
    tblModel.findAll({include:[tblSpecialties]})
    .then(function(response)
    {
        res.send({validate:true,data:response});
    })
    .catch(function(response){
        res.send({validate:false,data:response});
    })
});
router.post('/update',authenticate.auth, function(req, res, next)
{
    let rq = req.body;
    let form={
        nombre_primero       : rq.nombre_primero,
        nombre_segundo       : rq.nombre_segundo,
        apellido_primero     : rq.apellido_primero,
        apellido_segundo     : rq.apellido_segundo,
        documento_numero     : rq.documento_numero,
        id_documento_tipo    : rq.documento_typo_id,
        id_especialidad_tipo : rq.especialidad_id
    };
    tblModel
    .update(form,{where:{id:rq.id}})
    .then(function(response)
    {
        res.send({validate:true,data:response});
    })
    .catch(function(datares)
    {
        console.log(datares);
    });
});
router.post('/find',authenticate.auth,function(req,res,next)
{
    tblModel
    .findByPk(req.body.id)
    .then(function(response)
    {
        res.send({validate:(typeof response !== "undefined"),data:response});
    })
    .catch(function(response){
        res.send({validate:false,data:response});
    });
})
router.post('/delete',authenticate.auth, async function(req, res, next)
{
    let rq = req.body;
    let data = await tblModel.findByPk(rq._id);
    data.destroy();
    res.send({validate:true});
});
router.post('/save',authenticate.auth, function(req, res, next)
{
    let rq = req.body;
    let form={
        nombre_primero       : rq.nombre_primero,
        nombre_segundo       : rq.nombre_segundo,
        apellido_primero     : rq.apellido_primero,
        apellido_segundo     : rq.apellido_segundo,
        documento_numero     : rq.documento_numero,
        id_documento_tipo    : rq.documento_typo_id,
        id_especialidad_tipo : rq.especialidad_id
    };
    tblModel
    .create(form)
    .then(function(response)
    {
        res.send({validate:true,data:response});
    })
    .catch(function(datares)
    {
        console.log(datares);
    });
});

router.post('/horario/save', async function(req, res) {
    const rq = req.body;
    const tiempo = rq.tiempo;
    const fecha = rq.dia;

    const hora_fin = moment(`${rq.hora_fin.hh}:${rq.hora_fin.mm} ${rq.hora_fin.A}`, ["h:mm A"])
                      .tz('America/Bogota')
                      .format("HH:mm:ss");

    const hora_inicio = moment(`${rq.hora_inicio.hh}:${rq.hora_inicio.mm} ${rq.hora_inicio.A}`, ["h:mm A"])
                         .tz('America/Bogota')
                         .format("HH:mm:ss");

    const hora_start = moment(hora_inicio, "HH:mm:ss").tz('America/Bogota');
    const hora_finish = moment(hora_fin, "HH:mm:ss").tz('America/Bogota');

    if (hora_start.isAfter(hora_finish)) {
        return res.status(400).send({
            validate: false,
            message: "La hora de inicio debe ser menor que la hora de fin."
        });
    }

    if (hora_start.isSame(hora_finish)) {
        return res.status(400).send({
            validate: false,
            message: "La hora de inicio y la hora de fin no pueden ser iguales."
        });
    }

    const diferencia_en_minutos = hora_finish.diff(hora_start, 'minutes');
    if (diferencia_en_minutos < tiempo) {
        return res.status(400).send({
            validate: false,
            message: `El rango entre la hora de inicio y la hora de fin debe ser mayor o igual a ${tiempo} minutos.`
        });
    }

    let hora_fin_adjusted = moment(hora_fin, "HH:mm:ss").add(1, 'second');

    let rangos = [];
    let i = 0;
    let isFinish = true;

    let hora_actual_inicio = moment(hora_start).tz('America/Bogota');
    let hora_actual_fin = moment(hora_actual_inicio).add(tiempo, 'minutes').tz('America/Bogota');

    while (isFinish) {
        let hora_start_format = hora_actual_inicio.format('HH:mm');
        let hora_finish_format = hora_actual_fin.format('HH:mm');

        rangos.push({
            fecha: fecha,
            hora_inicio: hora_start_format,
            hora_fin: hora_finish_format
        });

        try {
            await tblEspecialistasHorario.create({
                id_especialista: parseInt(rq._id),
                fecha: fecha,
                hora_inicio: hora_start_format,
                hora_fin: hora_finish_format
            });
        } catch (error) {
            return res.status(402).send({ validate: false, data: error });
        }

        hora_actual_inicio = moment(hora_actual_inicio).add(tiempo, 'minutes').tz('America/Bogota');
        hora_actual_fin = moment(hora_actual_inicio).add(tiempo, 'minutes').tz('America/Bogota');

        isFinish = hora_actual_fin.isBefore(hora_fin_adjusted);
    }

    res.send({ validate: true, data: rangos });
});

router.post('/horario',authenticate.auth, async function(req,res,next)
{
    try {
        tblEspecialistasHorario
        .findAll({
            where:
            {
                id_especialista:req.body._id,
                fecha:req.body.fecha
            },
            order: [['fecha','ASC'],['hora_inicio','ASC']]
        })
        .then(function(response){
            res.send({validate:true,data:response});
        })
        .catch(function(response){
            console.log({response:response});
            res.status(402).send({validate:false,data:response});
        })
    }
    catch (error)
    {
        res.send({validate:true,data:[]});
    }
});
router.get('/horario',async function(req,res,next)
{
    try {
        let result = await searchHorarios.calcularMinutos();
        
        res.send(result);
    }
    catch (error)
    {
        res.status(402).send({validate:false,data:[]});
    }
});

router.post('/horario/delete',authenticate.auth, async function(req, res, next)
{
    let rq = req.body;
    tblEspecialistasHorario.destroy({where: {id:rq._id}})
    res.send({validate:true});
});



module.exports = router;