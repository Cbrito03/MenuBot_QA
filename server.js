const horario = require('./controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const config = require('./controllers/config.js');
const msj_fb = require('./controllers/msj_FB.js');
const msj_tw = require('./controllers/msj_TW.js');
const msj_wa = require('./controllers/msj_WA.js');
const localStorage = require('localStorage');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const axios = require('axios');
const async = require('async');
const http = require('http');
const util = require('util');
const fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.post('/message', async (req, res) => {
  console.log("[Brito] :: [Peticion POST /message]");

  var resultado, result_messages, result_action;
  var bandera = false , estatus = 200;
  var opcion = "", msj_buscar = "", msj_buscar_opcion = "";

  var bandera_tranferido = false, bandera_fueraHorario = false, bandera_opt = true;

  var apiVersion = req.body.apiVersion;
  var conversationID = req.body.conversationId;
  var authToken = req.body.authToken;
  var channel = req.body.channel;
  var user = req.body.user;
  var context = req.body.context;
  var cadena = req.body.message;

  if(apiVersion !== '' && typeof apiVersion !== "undefined") 
  {
    if(authToken !== '' && typeof authToken !== "undefined") 
    {
      if(channel !== '' && typeof channel !== "undefined") 
      {
        if(user !== '' && typeof user !== "undefined") 
        {
          if(context !== '' && typeof context !== "undefined") 
          {
            if(cadena !== '' && typeof cadena !== "undefined") 
            {
              if(context.lastInteractionFinishType !== "CLIENT_TIMEOUT")
              {             
                cadena = cadena.text.toLowerCase(); // minusculas
                cadena = cadena.trim();
                msj_buscar_opcion = cadena;
                cadena = cadena.replace(/,/g,"").replace(/;/g,"").replace(/:/g,"").replace(/\./g,""); // borramos ,;.:
                cadena = cadena.split(" "); // lo convertimo en array mediante los espacios

                console.log("Contexto.Channel :: " + context.channel.toLowerCase());

                if(context.channel.toLowerCase() === "whatsapp") // WHATSAPP
                {
                  console.log("Entro a "+ context.channel.toLowerCase() +" - whatsapp");

                   var horarios = horario.validarHorario_WA();
                  
                  for(var i = 0; i < cadena.length; i++)
                  {
                    for(var atr in msj_wa.palabras)
                    {                 
                      if(cadena[i] === "pagar" || cadena[i] === "factura" ){ localStorage.removeItem("msj_"+conversationID); }

                      if(atr.toLowerCase() === cadena[i])
                      {
                        opcion = cadena[i];
                        msj_buscar = cadena[i];
                        result_action = msj_wa.palabras[atr].action;
                        result_messages = msj_wa.palabras[atr].messages;                    
                        bandera = true;
                        bandera_opt = true;
                        break;
                      }
                    }

                    if(bandera){ break; }
                  }

                  console.log("[Brito] :: [message] :: [msj_buscar_opcion] :: " + msj_buscar_opcion);

                  if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                  {
                    if(msj_buscar == "factura" || msj_buscar == "pagar" )
                    {
                      localStorage.setItem("msj_"+conversationID, msj_buscar);
                      console.log('[Brito] :: [message] :: [Se crea LocalStrogae para '+msj_buscar+'] :: ', localStorage.getItem("msj_"+conversationID));
                    }
                    else if(!bandera)
                    {
                      result_messages = msj_wa.msj_default.messages;
                      result_action = msj_wa.msj_default.action;
                    }  
                  }
                  else // esite localStorage
                  {                    
                    console.log('[Brito] :: [message] :: [Existe Storage] :: ' + localStorage.getItem("msj_"+conversationID));
                    
                    
                    var msj_storage = localStorage.getItem("msj_"+conversationID);

                    console.log('[Brito] :: [message] :: [msj_storage] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);

                    if((msj_storage == "factura" || msj_storage == "pagar") && msj_buscar_opcion == "asesor")
                    {
                      opcion = msj_storage + " - asesor";

                      localStorage.removeItem("msj_"+conversationID);

                      if(config.horario_24_7 == true || horarios)
                      {
                        if(msj_storage == "factura")
                        {
                          result_messages = msj_wa.msj_factura_asesor.messages;
                          result_action = msj_wa.msj_factura_asesor.action;
                        } 
                        else if(msj_storage == "pagar")
                        {
                          result_messages = msj_wa.msj_pagar_asesor.messages;
                          result_action = msj_wa.msj_pagar_asesor.action;
                        }

                        bandera_tranferido = true;  
                      }
                      else
                      {
                        console.log("[Brito] :: [No cumple horario habil para Configuración en Asesor] :: [horarios] :: "+horarios);
                        localStorage.removeItem("msj_"+conversationID+"_horario");
                        localStorage.setItem("msj_"+conversationID+"_horario", "fueraHorario");
                        result_messages = msj_wa.msj_fuera_horario.messages;
                        result_action = msj_wa.msj_fuera_horario.action;                                      
                        bandera_fueraHorario = true;                                
                      }

                      bandera_opt = true;
                      bandera = true;               
                    }
                    else
                    {
                      localStorage.removeItem("msj_"+conversationID);

                      if(!bandera)
                      {
                        result_messages = msj_wa.msj_default.messages;
                        result_action = msj_wa.msj_default.action;
                      }
                    }
                  }

                  var options = {
                    method : 'post',
                    url : config.url_estd,
                    headers : { 'Content-Type': 'application/json'},
                    data: JSON.stringify({
                      "conversacion_id" : conversationID,
                      "pais" : config.info.pais,
                      "app" : config.info.nomApp,
                      "opcion" : opcion,
                      "rrss" : "WA",
                      "transferencia" : bandera_tranferido,
                      "fueraHorario" : bandera_fueraHorario,
                      "grupoACD" : result_action.queue        
                    })
                  };          

                  if(bandera == true)
                  {
                    if(bandera_opt)
                    {
                      console.log(options);
                      /*var resultado_axios = await axios(options);
                      console.log("[Resultado AXIOS] :: ");
                      console.log(resultado_axios);*/
                    }                 
                  }
                  else
                  {
                    localStorage.removeItem("msj_"+conversationID);
                    result_messages = msj_wa.msj_default.messages;
                    result_action = msj_wa.msj_default.action;
                  }

                  //console.log("[Brito] :: [channel] :: ", context.channel, " :: [opcion] :: ", opcion);
                  console.log("[Brito] :: [context.channel] :: " + context.channel + " :: [opcion] :: " + opcion);
                                  
                  resultado = {
                    "context": context,
                    "action": result_action,
                    "messages": result_messages,
                    "additionalInfo": {
                      "key":"RUT",
                      "RUT":"1-9"
                    }
                  }
                }
                else if(context.channel.toLowerCase() === "messenger") // FACEBOOK
                {
                  console.log("Entro a "+ context.channel.toLowerCase() +" - messenger");

                  var horarios = horario.validarHorario_FB();
                  
                  for(var i = 0; i < cadena.length; i++)
                  {
                    for(var atr in msj_fb.palabras)
                    {                 
                      if(cadena[i] === "pagar" || cadena[i] === "factura" ){ localStorage.removeItem("msj_"+conversationID); }

                      if(atr.toLowerCase() === cadena[i])
                      {
                        opcion = cadena[i];
                        msj_buscar = cadena[i];
                        result_action = msj_fb.palabras[atr].action;
                        result_messages = msj_fb.palabras[atr].messages;                    
                        bandera = true;
                        bandera_opt = true;
                        break;
                      }
                    }

                    if(bandera){ break; }
                  }

                  console.log("[Brito] :: [message] :: [msj_buscar_opcion] :: " + msj_buscar_opcion);

                  if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                  {
                    if(msj_buscar == "factura" || msj_buscar == "pagar" )
                    {
                      localStorage.setItem("msj_"+conversationID, msj_buscar);
                      console.log('[Brito] :: [message] :: [Se crea LocalStrogae para '+msj_buscar+'] :: ', localStorage.getItem("msj_"+conversationID));
                    }
                    else if(!bandera)
                    {
                      result_messages = msj_fb.msj_default.messages;
                      result_action = msj_fb.msj_default.action;
                    }  
                  }
                  else // esite localStorage
                  {                    
                    console.log('[Brito] :: [message] :: [Existe Storage] :: ' + localStorage.getItem("msj_"+conversationID));
                    
                    
                    var msj_storage = localStorage.getItem("msj_"+conversationID);

                    console.log('[Brito] :: [message] :: [msj_storage] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);

                    if((msj_storage == "factura" || msj_storage == "pagar") && msj_buscar_opcion == "asesor")
                    {
                      opcion = msj_storage + " - asesor";

                      localStorage.removeItem("msj_"+conversationID);

                      if(config.horario_24_7 == true || horarios)
                      {
                        if(msj_storage == "factura")
                        {
                          result_messages = msj_fb.msj_factura_asesor.messages;
                          result_action = msj_fb.msj_factura_asesor.action;
                        } 
                        else if(msj_storage == "pagar")
                        {
                          result_messages = msj_fb.msj_pagar_asesor.messages;
                          result_action = msj_fb.msj_pagar_asesor.action;
                        }

                        bandera_tranferido = true;  
                      }
                      else
                      {
                        console.log("[Brito] :: [No cumple horario habil para Configuración en Asesor] :: [horarios] :: "+horarios);
                        localStorage.removeItem("msj_"+conversationID+"_horario");
                        localStorage.setItem("msj_"+conversationID+"_horario", "fueraHorario");
                        result_messages = msj_fb.msj_fuera_horario.messages;
                        result_action = msj_fb.msj_fuera_horario.action;                                      
                        bandera_fueraHorario = true;                                
                      }

                      bandera_opt = true;
                      bandera = true;               
                    }
                    else
                    {
                      localStorage.removeItem("msj_"+conversationID);

                      if(!bandera)
                      {
                        result_messages = msj_fb.msj_default.messages;
                        result_action = msj_fb.msj_default.action;
                      }
                    }
                  }

                  var options = {
                    method : 'post',
                    url : config.url_estd,
                    headers : { 'Content-Type': 'application/json'},
                    data: JSON.stringify({
                      "conversacion_id" : conversationID,
                      "pais" : config.info.pais,
                      "app" : config.info.nomApp,
                      "opcion" : opcion,
                      "rrss" : "FB",
                      "transferencia" : bandera_tranferido,
                      "fueraHorario" : bandera_fueraHorario,
                      "grupoACD" : result_action.queue        
                    })
                  };          

                  if(bandera == true)
                  {
                    if(bandera_opt)
                    {
                      console.log(options);
                      /*var resultado_axios = await axios(options);
                      console.log("[Resultado AXIOS] :: ");
                      console.log(resultado_axios);*/
                    }                 
                  }
                  else
                  {
                    localStorage.removeItem("msj_"+conversationID);
                    result_messages = msj_fb.msj_default.messages;
                    result_action = msj_fb.msj_default.action;
                  }

                  console.log("[Brito] :: [context.channel] :: " + context.channel + " :: [opcion] :: " + opcion);
                                  
                  resultado = {
                    "context": context,
                    "action": result_action,
                    "messages": result_messages,
                    "additionalInfo": {
                      "key":"RUT",
                      "RUT":"1-9"
                    }
                  }
                }
                else if(context.channel.toLowerCase() === "twitterdm" || context.channel.toLowerCase() === "twitter") // TWITTER
                {
                  console.log("Entro a "+ context.channel.toLowerCase() +" - twitterDM");

                  var horarios = horario.validarHorario_FB();
                  
                  for(var i = 0; i < cadena.length; i++)
                  {
                    for(var atr in msj_tw.palabras)
                    {                 
                      if(cadena[i] === "pagar" || cadena[i] === "factura" ){ localStorage.removeItem("msj_"+conversationID); }

                      if(atr.toLowerCase() === cadena[i])
                      {
                        opcion = cadena[i];
                        msj_buscar = cadena[i];
                        result_action = msj_tw.palabras[atr].action;
                        result_messages = msj_tw.palabras[atr].messages;                    
                        bandera = true;
                        bandera_opt = true;
                        break;
                      }
                    }

                    if(bandera){ break; }
                  }

                  console.log("[Brito] :: [message] :: [msj_buscar_opcion] :: " + msj_buscar_opcion);

                  if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                  {
                    if(msj_buscar == "factura" || msj_buscar == "pagar" )
                    {
                      localStorage.setItem("msj_"+conversationID, msj_buscar);
                      console.log('[Brito] :: [message] :: [Se crea LocalStrogae para '+msj_buscar+'] :: ', localStorage.getItem("msj_"+conversationID));
                    }
                    else if(!bandera)
                    {
                      result_messages = msj_tw.msj_default.messages;
                      result_action = msj_tw.msj_default.action;
                    }  
                  }
                  else // esite localStorage
                  {                    
                    console.log('[Brito] :: [message] :: [Existe Storage] :: ' + localStorage.getItem("msj_"+conversationID));                    
                    
                    var msj_storage = localStorage.getItem("msj_"+conversationID);

                    console.log('[Brito] :: [message] :: [msj_storage] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);

                    if((msj_storage == "factura" || msj_storage == "pagar") && msj_buscar_opcion == "asesor")
                    {
                      opcion = msj_storage + " - asesor";

                      localStorage.removeItem("msj_"+conversationID);

                      if(config.horario_24_7 == true || horarios)
                      {
                        if(msj_storage == "factura")
                        {
                          result_messages = msj_tw.msj_factura_asesor.messages;
                          result_action = msj_tw.msj_factura_asesor.action;
                        } 
                        else if(msj_storage == "pagar")
                        {
                          result_messages = msj_tw.msj_pagar_asesor.messages;
                          result_action = msj_tw.msj_pagar_asesor.action;
                        }

                        bandera_tranferido = true;  
                      }
                      else
                      {
                        console.log("[Brito] :: [No cumple horario habil para Configuración en Asesor] :: [horarios] :: "+horarios);
                        localStorage.removeItem("msj_"+conversationID+"_horario");
                        localStorage.setItem("msj_"+conversationID+"_horario", "fueraHorario");
                        result_messages = msj_tw.msj_fuera_horario.messages;
                        result_action = msj_tw.msj_fuera_horario.action;                                      
                        bandera_fueraHorario = true;                                
                      }

                      bandera_opt = true;
                      bandera = true;               
                    }
                    else
                    {
                      localStorage.removeItem("msj_"+conversationID);

                      if(!bandera)
                      {
                        result_messages = msj_tw.msj_default.messages;
                        result_action = msj_tw.msj_default.action;
                      }
                    }
                  }

                  var options = {
                    method : 'post',
                    url : config.url_estd,
                    headers : { 'Content-Type': 'application/json'},
                    data: JSON.stringify({
                      "conversacion_id" : conversationID,
                      "pais" : config.info.pais,
                      "app" : config.info.nomApp,
                      "opcion" : opcion,
                      "rrss" : "TW",
                      "transferencia" : bandera_tranferido,
                      "fueraHorario" : bandera_fueraHorario,
                      "grupoACD" : result_action.queue        
                    })
                  };          

                  if(bandera == true)
                  {
                    if(bandera_opt)
                    {
                      console.log(options);
                      /*var resultado_axios = await axios(options);
                      console.log("[Resultado AXIOS] :: ");
                      console.log(resultado_axios);*/
                    }                 
                  }
                  else
                  {
                    localStorage.removeItem("msj_"+conversationID);
                    result_messages = msj_tw.msj_default.messages;
                    result_action = msj_tw.msj_default.action;
                  }

                  console.log("[Brito] :: [context.channel] :: " + context.channel + " :: [opcion] :: " + opcion);
                                  
                  resultado = {
                    "context": context,
                    "action": result_action,
                    "messages": result_messages,
                    "additionalInfo": {
                      "key":"RUT",
                      "RUT":"1-9"
                    }
                  }
                }             
              }
              else if(context.lastInteractionFinishType == "CLIENT_TIMEOUT")
              {
                resultado = {
                  "context": context,
                  "action": {
                    "type" : "transfer",
                      "queue" : context.lastInteractionQueue,
                  },
                  "messages": [],
                  "additionalInfo": {
                    "key":"RUT",
                    "RUT":"1-9"
                  }
                }
              }

              console.log("[Brito] :: [RESULTADO] :: [resultado] :: ");
              console.log(resultado);
              console.log("[Brito] :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: [Brito]");
            }
            else
            {
              estatus = 400;
              resultado = {
                "estado": "El valor de mensaje es requerido"
              }
            } 
          }
          else
          {
            estatus = 400;
            resultado = {
              "estado": "El valor de contexto es requerido"
            }
          } 
        }
        else
        {
          estatus = 400;
          resultado = {
            "estado": "El valor de user es requerido"
          }
        }        
      }
      else
      {
        estatus = 400;
        resultado = {
          "estado": "El valor de channel es requerido"
        }
      } 
    }
    else
    {
      estatus = 400;
      resultado = {
        "estado": "El valor de authToken es requerido"
      }
    }
  }
  else
  {
    estatus = 400;
    resultado = {
      "estado": "El valor de apiVersion es requerido"
    }
  }

  res.status(estatus).json(resultado);
});

app.post('/terminate', (req, res) => {
  var result, resultado;
  var bandera = false , estatus = 200;

  var conversationID = req.body.conversationId;
  var RRSS = req.body.RRSS;
  var canal = req.body.channel;
  var contexto = req.body.context;

  if(RRSS !== '' && typeof RRSS !== "undefined") 
  {
      if(canal !== '' && typeof canal !== "undefined") 
      {
        if(contexto !== '' && typeof contexto !== "undefined") 
        {
          estatus = 200;
          resultado = {
            "estado": "OK"
          }
        }
        else
        {
          estatus = 400;
          resultado = {
            "estado": "El valor de contexto es requerido"
          }
        }
      }
      else
      {
        estatus = 400;
        resultado = {
          "estado": "El valor de canal es requerido"
        }
      } 
  }
  else
  {
    estatus = 400;
      resultado = {
        "estado": "El valor de RRSS es requerido"
      }
  } 

  res.status(estatus).json(resultado);
})

app.get('/', (req, res) => {

  var horario_WA = horario.validarHorario_WA();
  var horario_FB = horario.validarHorario_FB();
  var horario_TW = horario.validarHorario_TW();

  var now = moment();
  var fecha_actual = now.tz("America/Costa_Rica").format("YYYY-MM-DD HH:mm:ss");
  var anio = now.tz("America/Costa_Rica").format("YYYY");

  var respuesta = "Bienvenido al menú Bot de <strong>Costa Rica</strong>, las opciones disponibles son: <br>";
      respuesta += '<ul> <li> <strong> WhastApp, Facebook y Twitter : "/message" <br> </strong> </li>';
      respuesta += "Horario de atención para <strong>WhastApp</strong> es: <br> ";
      respuesta += "Hora inicio: " + config.horario_WA.OPEN_HOUR + " - Hora Fin: " + config.horario_WA.CLOSE_HOUR + " <br> ";
      respuesta += "Respuesta del Horario: " + horario_WA + " <br> <br> ";
      respuesta += "Horario de atención para <strong>Facebook Messenger</strong> es: <br> ";    
      respuesta += "Hora inicio: " + config.horario_FB.OPEN_HOUR + " - Hora Fin: " + config.horario_FB.CLOSE_HOUR + " <br> ";
      respuesta += "Respuesta del Horario: " + horario_FB + " <br> <br> ";
      respuesta += "Horario de atención para <strong>Twitter DM</strong> es: <br> ";    
      respuesta += "Hora inicio: " + config.horario_TW.OPEN_HOUR + " - Hora Fin: " + config.horario_TW.CLOSE_HOUR + " <br> ";
      respuesta += "Respuesta del Horario: " + horario_TW + " <br> <br> ";
      respuesta += "Hora actual de <strong>Costa Rica</strong>:  " + fecha_actual +" <br>";
      respuesta += "<strong> Sixbell "+anio+" - Versión: "+config.info.version+" </strong><br>";

  res.status(200).send(respuesta);
});

http.createServer(app).listen(config.puerto, () => {
  console.log('Server started at http://localhost:' + config.puerto);
});