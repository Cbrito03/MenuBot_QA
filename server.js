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

app.post('/wa/message', async (req, res) => {
  console.log("[Brito] :: [Peticion POST /message]");

  var horarios = horario.validarHorario_WA();

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

  var msj_fuera_horario =
  {
    "action" : {
      "type" : "transfer",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_wa.mjs_horario,
        "mediaURL" : ""
      }
    ]
  };

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
                msj_buscar = cadena;
                cadena = cadena.replace(/,/g,"").replace(/;/g,"").replace(/:/g,"").replace(/\./g,""); // borramos ,;.:
                cadena = cadena.split(" "); // lo convertimo en array mediante los espacios
                
                console.log("Entro a "+ channel.toLowerCase() +" - whatsapp");               
                
                for(var i = 0; i < cadena.length; i++)
                {
                  for(var atr in msj_wa.palabras)
                  {

                    if(atr.toLowerCase() === cadena[i])
                    {
                      opcion = cadena[i];

                      if(msj_wa.palabras[atr].action.queue === "" && msj_wa.palabras[atr].action.type !== "transfer")
                      {
                        result_action = msj_wa.palabras[atr].action;
                        result_messages = msj_wa.palabras[atr].messages;
                      }
                      else if(msj_wa.palabras[atr].action.queue !== "" && msj_wa.palabras[atr].action.type === "transfer")
                      {
                        if(horarios)
                        {
                          result_action = msj_wa.palabras[atr].action;
                          result_messages = msj_wa.palabras[atr].messages;                        
                          bandera_tranferido = true;                    
                        }
                        else
                        { 
                          console.log("[Brito] :: [No cumple horario] :: [horarios] :: "+horarios);                       
                          
                          msj_fuera_horario["action"].queue = msj_wa.colas[atr].fh;
                          msj_fuera_horario["messages"].text = msj_wa.mjs_horario;

                          result_messages = msj_fuera_horario.messages;
                          result_action = msj_fuera_horario.action;
                          bandera_fueraHorario = true;                                                                
                        }
                      }
                      
                      bandera = true;
                      bandera_opt = true;
                      break;
                    }
                    else
                    {
                      result_messages = msj_wa.msj_default.messages;
                      result_action = msj_wa.msj_default.action;
                    }
                  }

                  if(bandera){ break; }
                }

                if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                {               
                  if(msj_buscar == "asistencia")
                  {
                    localStorage.setItem("msj_"+conversationID, msj_buscar);
                    console.log('[Brito] :: [message] :: [Se crea LocalStrogae para asistencia] :: ', localStorage.getItem("msj_"+conversationID));
                  }
                  else if(!bandera)
                  {
                    result_messages = msj_wa.msj_default.messages;
                    result_action = msj_wa.msj_default.action;
                  }  
                }
                else // esite localStorage
                {                  
                  console.log('[Brito] :: [message] :: [Borra Storage] :: ' + localStorage.getItem("msj_"+conversationID));
                  
                  var y = parseInt(msj_buscar_opcion);
                  var msj_storage = localStorage.getItem("msj_"+conversationID);

                  console.log('[Brito] :: [message] :: [msj_storage] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);
                 
                  if((msj_buscar_opcion == "1" || msj_buscar_opcion == "2") && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    console.log("[Brito] :: [message] :: [Entro a asistencia] :: " + msj_buscar_opcion + " :: " + localStorage.getItem("msj_"+conversationID));
                    
                    localStorage.removeItem("msj_"+conversationID);

                    opcion = "asistencia - " + msj_buscar_opcion;

                    if(horarios)
                    {
                      result_messages = msj_wa.menu_opciones_asistencia[msj_buscar_opcion].messages;
                      result_action = msj_wa.menu_opciones_asistencia[msj_buscar_opcion].action;
                      bandera_tranferido = true;
                    }
                    else
                    { 
                      console.log("[Brito] :: [No cumple horario habil] :: [horarios] :: "+horarios);
                      
                      msj_fuera_horario["action"].queue = msj_wa.colas['asistencia_'+msj_buscar_opcion].fh;
                      msj_fuera_horario["messages"].text = msj_wa.mjs_horario;

                      result_messages = msj_fuera_horario.messages;
                      result_action = msj_fuera_horario.action;                                   
                      bandera_fueraHorario = true;                            
                    }

                    bandera = true;
                    bandera_opt = true;                               
                  }
                  else if (!isNaN(y) && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    if(localStorage.getItem("msj_"+conversationID) == "asistencia")
                    {
                      console.log("[Brito] :: [No es el número correcto para el menu de asistencia] :: [Número de opción] :: " + y);
                      opcion = "asistencia";
                      result_action = msj_wa.palabras[opcion].action;
                      result_messages = msj_wa.palabras[opcion].messages;
                    }

                    bandera = true;
                    bandera_opt = false;
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
                  result_messages = msj_wa.msj_default.messages;
                  result_action = msj_wa.msj_default.action;
                }

                console.log("[Brito] :: [channel] :: ", channel, " :: [opcion] :: ", opcion);
                                
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
              else if(context.lastInteractionFinishType == "CLIENT_TIMEOUT")
              {
                console.log("Entro a CLIENT_TIMEOUT WA");

                var timeout_acd = "";

                for (var key in msj_wa.colas)
                {
                  if(msj_wa.colas[key].acd == context.lastInteractionQueue)
                  {
                    console.log(msj_wa.colas[key].acd);
                    console.log(msj_wa.colas[key].timeout);
                    timeout_acd = msj_wa.colas[key].timeout;
                    break;
                  }
  
                }

                resultado = {
                  "context": context,
                  "action": {
                    "type" : "transfer",
                    "queue" : context.lastInteractionQueue,
                    "timeoutInactivity" : timeout_acd
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

app.post('/fb/message', async (req, res) => {
  console.log("[Brito] :: [Peticion POST /message]");

  var horarios = horario.validarHorario_FB();

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

  var msj_fuera_horario =
  {
    "action" : {
      "type" : "transfer",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_fb.mjs_horario,
        "mediaURL" : ""
      }
    ]
  };

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
                msj_buscar = cadena;
                cadena = cadena.replace(/,/g,"").replace(/;/g,"").replace(/:/g,"").replace(/\./g,""); // borramos ,;.:
                cadena = cadena.split(" "); // lo convertimo en array mediante los espacios                
                
                console.log("Entro a "+ channel.toLowerCase() +" - messenger");                

                for(var i = 0; i < cadena.length; i++)
                {
                  for(var atr in msj_fb.palabras)
                  {

                    if(atr.toLowerCase() === cadena[i])
                    {
                      opcion = cadena[i];

                      if(msj_fb.palabras[atr].action.queue === "" && msj_fb.palabras[atr].action.type !== "transfer")
                      {
                        result_action = msj_fb.palabras[atr].action;
                        result_messages = msj_fb.palabras[atr].messages;
                      }
                      else if(msj_fb.palabras[atr].action.queue !== "" && msj_fb.palabras[atr].action.type === "transfer")
                      {
                        if(horarios)
                        {
                          result_action = msj_fb.palabras[atr].action;
                          result_messages = msj_fb.palabras[atr].messages;                        
                          bandera_tranferido = true;                    
                        }
                        else
                        { 
                          console.log("[Brito] :: [No cumple horario] :: [horarios] :: " + horarios);

                          console.log("[Brito] :: [msj_fuera_horario] :: ", msj_fuera_horario.messages[0].text);                      
                          
                          msj_fuera_horario["action"].queue = msj_fb.colas[atr].fh;
                          //msj_fuera_horario.messages[0].text = msj_fb.mjs_horario;

                          result_messages = msj_fuera_horario.messages;
                          result_action = msj_fuera_horario.action;
                          bandera_fueraHorario = true;                                                                
                        }
                      }
                      
                      bandera = true;
                      bandera_opt = true;
                      break;
                    }
                    else
                    {
                      result_messages = msj_fb.msj_default.messages;
                      result_action = msj_fb.msj_default.action;
                    }
                  }

                  if(bandera){ break; }
                }

                if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                {               
                  if(msj_buscar == "asistencia")
                  {
                    localStorage.setItem("msj_"+conversationID, msj_buscar);
                    console.log('[Brito] :: [message] :: [Se crea LocalStrogae para asistencia] :: ', localStorage.getItem("msj_"+conversationID));
                  }
                  else if(!bandera)
                  {
                    result_messages = msj_fb.msj_default.messages;
                    result_action = msj_fb.msj_default.action;
                  }  
                }
                else // esite localStorage
                {                  
                  console.log('[Brito] :: [message] :: [Borra Storage] :: ' + localStorage.getItem("msj_"+conversationID));
                  
                  var y = parseInt(msj_buscar_opcion);
                  var msj_storage = localStorage.getItem("msj_"+conversationID);

                  console.log('[Brito] :: [message] :: [msj_storage] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);
                 
                  if((msj_buscar_opcion == "1" || msj_buscar_opcion == "2") && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    console.log("[Brito] :: [message] :: [Entro a asistencia] :: " + msj_buscar_opcion + " :: " + localStorage.getItem("msj_"+conversationID));
                    
                    localStorage.removeItem("msj_"+conversationID);

                    opcion = "asistencia - " + msj_buscar_opcion;

                    if(horarios)
                    {
                      result_messages = msj_fb.menu_opciones_asistencia[msj_buscar_opcion].messages;
                      result_action = msj_fb.menu_opciones_asistencia[msj_buscar_opcion].action;
                      bandera_tranferido = true;
                    }
                    else
                    { 
                      console.log("[Brito] :: [No cumple horario habil] :: [horarios] :: "+horarios);
                      
                      msj_fuera_horario["action"].queue = msj_fb.colas['asistencia_'+msj_buscar_opcion].fh;
                      msj_fuera_horario["messages"].text = msj_fb.mjs_horario;

                      result_messages = msj_fuera_horario.messages;
                      result_action = msj_fuera_horario.action;                                   
                      bandera_fueraHorario = true;                            
                    }

                    bandera = true;
                    bandera_opt = true;                               
                  }
                  else if (!isNaN(y) && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    if(localStorage.getItem("msj_"+conversationID) == "asistencia")
                    {
                      console.log("[Brito] :: [No es el número correcto para el menu de asistencia] :: [Número de opción] :: " + y);
                      opcion = "asistencia";
                      result_action = msj_fb.palabras[opcion].action;
                      result_messages = msj_fb.palabras[opcion].messages;
                    }

                    bandera = true;
                    bandera_opt = false;
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
                  result_messages = msj_fb.msj_default.messages;
                  result_action = msj_fb.msj_default.action;
                }

                console.log("[Brito] :: [channel] :: ", channel, " :: [opcion] :: ", opcion);
                                
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
              else if(context.lastInteractionFinishType == "CLIENT_TIMEOUT")
              {

                console.log("Entro a CLIENT_TIMEOUT FB");

                var timeout_acd = "";

                for (var key in msj_fb.colas)
                {
                  if(msj_fb.colas[key].acd == context.lastInteractionQueue)
                  {
                    console.log(msj_fb.colas[key].acd);
                    console.log(msj_fb.colas[key].timeout);
                    timeout_acd = msj_fb.colas[key].timeout;
                    break;
                  }
  
                }

                resultado = {
                  "context": context,
                  "action": {
                    "type" : "transfer",
                    "queue" : context.lastInteractionQueue,
                    "timeoutInactivity" : timeout_acd
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

app.post('/tw/message', async (req, res) => {
  console.log("[Brito] :: [Peticion POST /message]");

  var horarios = horario.validarHorario_FB();

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

  var msj_fuera_horario =
  {
    "action" : {
      "type" : "transfer",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_tw.mjs_horario,
        "mediaURL" : ""
      }
    ]
  };

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
                msj_buscar = cadena;
                cadena = cadena.replace(/,/g,"").replace(/;/g,"").replace(/:/g,"").replace(/\./g,""); // borramos ,;.:
                cadena = cadena.split(" "); // lo convertimo en array mediante los espacios
               
                console.log("Entro a "+ channel.toLowerCase() +" - twitterDM");                  

                for(var i = 0; i < cadena.length; i++)
                {
                  for(var atr in msj_tw.palabras)
                  {

                    if(atr.toLowerCase() === cadena[i])
                    {
                      opcion = cadena[i];

                      if(msj_tw.palabras[atr].action.queue === "" && msj_tw.palabras[atr].action.type !== "transfer")
                      {
                        result_action = msj_tw.palabras[atr].action;
                        result_messages = msj_tw.palabras[atr].messages;
                      }
                      else if(msj_tw.palabras[atr].action.queue !== "" && msj_tw.palabras[atr].action.type === "transfer")
                      {
                        if(horarios)
                        {
                          result_action = msj_tw.palabras[atr].action;
                          result_messages = msj_tw.palabras[atr].messages;                        
                          bandera_tranferido = true;                    
                        }
                        else
                        { 
                          console.log("[Brito] :: [No cumple horario] :: [horarios] :: "+horarios);                       
                          
                          msj_fuera_horario["action"].queue = msj_tw.colas[atr].fh;
                          msj_fuera_horario["messages"].text = msj_tw.mjs_horario;

                          result_messages = msj_fuera_horario.messages;
                          result_action = msj_fuera_horario.action;
                          bandera_fueraHorario = true;                                                                
                        }
                      }
                      
                      bandera = true;
                      bandera_opt = true;
                      break;
                    }
                    else
                    {
                      result_messages = msj_tw.msj_default.messages;
                      result_action = msj_tw.msj_default.action;
                    }
                  }

                  if(bandera){ break; }
                }

                if(localStorage.getItem("msj_"+conversationID) == null) // No existe localStorage
                {               
                  if(msj_buscar == "asistencia")
                  {
                    localStorage.setItem("msj_"+conversationID, msj_buscar);
                    console.log('[Brito] :: [message] :: [Se crea LocalStrogae para asistencia TW] :: ', localStorage.getItem("msj_"+conversationID));
                  }
                  else if(!bandera)
                  {
                    result_messages = msj_tw.msj_default.messages;
                    result_action = msj_tw.msj_default.action;
                  }  
                }
                else // esite localStorage
                {                  
                  console.log('[Brito] :: [message] :: [Borra Storage TW] :: ' + localStorage.getItem("msj_"+conversationID));
                  
                  var y = parseInt(msj_buscar_opcion);
                  var msj_storage = localStorage.getItem("msj_"+conversationID);

                  console.log('[Brito] :: [message] :: [msj_storage TW] :: ' + msj_storage + ' :: [msj_buscar_opcion] :: ' + msj_buscar_opcion);
                 
                  if((msj_buscar_opcion == "1" || msj_buscar_opcion == "2") && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    console.log("[Brito] :: [message] :: [Entro a asistencia TW] :: " + msj_buscar_opcion + " :: " + localStorage.getItem("msj_"+conversationID));
                    
                    localStorage.removeItem("msj_"+conversationID);

                    opcion = "asistencia - " + msj_buscar_opcion;

                    if(horarios)
                    {
                      result_messages = msj_tw.menu_opciones_asistencia[msj_buscar_opcion].messages;
                      result_action = msj_tw.menu_opciones_asistencia[msj_buscar_opcion].action;
                      bandera_tranferido = true;
                    }
                    else
                    { 
                      console.log("[Brito] :: [No cumple horario habil TW] :: [horarios] :: "+horarios);
                      
                      msj_fuera_horario["action"].queue = msj_tw.colas['asistencia_'+msj_buscar_opcion].fh;
                      msj_fuera_horario["messages"].text = msj_tw.mjs_horario;

                      result_messages = msj_fuera_horario.messages;
                      result_action = msj_fuera_horario.action;                                   
                      bandera_fueraHorario = true;                            
                    }

                    bandera = true;
                    bandera_opt = true;                               
                  }
                  else if (!isNaN(y) && localStorage.getItem("msj_"+conversationID) == "asistencia")
                  {
                    if(localStorage.getItem("msj_"+conversationID) == "asistencia")
                    {
                      console.log("[Brito] :: [No es el número correcto para el menu de asistencia] :: [Número de opción] :: " + y);
                      opcion = "asistencia";
                      result_action = msj_tw.palabras[opcion].action;
                      result_messages = msj_tw.palabras[opcion].messages;
                    }

                    bandera = true;
                    bandera_opt = false;
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
                  result_messages = msj_tw.msj_default.messages;
                  result_action = msj_tw.msj_default.action;
                }

                console.log("[Brito] :: [channel] :: ", channel, " :: [opcion] :: ", opcion);
                                
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
              else if(context.lastInteractionFinishType == "CLIENT_TIMEOUT")
              {
                console.log("Entro a CLIENT_TIMEOUT TW");

                var timeout_acd = "";

                for (var key in msj_tw.colas)
                {
                  if(msj_tw.colas[key].acd == context.lastInteractionQueue)
                  {
                    console.log(msj_tw.colas[key].acd);
                    console.log(msj_tw.colas[key].timeout);
                    timeout_acd = msj_tw.colas[key].timeout;
                    break;
                  }
  
                }

                resultado = {
                  "context": context,
                  "action": {
                    "type" : "transfer",
                    "queue" : context.lastInteractionQueue,
                    "timeoutInactivity" : timeout_acd
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
  var fecha_actual = now.tz("America/Tegucigalpa").format("YYYY-MM-DD HH:mm:ss");
  var anio = now.tz("America/Tegucigalpa").format("YYYY");

  var respuesta = "Bienvenido al menú Bot de <strong>Honduras</strong>, las opciones disponibles son: <br>";
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
      respuesta += "Hora actual de <strong>Honduras</strong>:  " + fecha_actual +" <br>";
      respuesta += "<strong> Sixbell "+anio+" - Versión: "+config.info.version+" </strong><br>";

  res.status(200).send(respuesta);
});

http.createServer(app).listen(config.puerto, () => {
  console.log('Server started at http://localhost:' + config.puerto);
});