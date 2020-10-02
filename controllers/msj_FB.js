var colas = {
  "asesor" : {
    "timeout" : 300000,
    "acd" : "HN_FB_MSS_SAC",
    "fh" : "HN_FB_MSS_SAC_FueraH"
  },
  "cotizar" : {
    "timeout" : 300000,
    "acd" : "HN_FB_MSS_Ventas",
    "fh" : "HN_FB_MSS_Ventas_FueraH"
  },
  "asistencia_1" : {
    "timeout" : 300000,
    "acd" : "HN_FB_MSS_Ventas",
    "fh" : "HN_FB_MSS_Ventas_FueraH"      
  },
  "asistencia_2" : {
    "timeout" : 300000,
    "acd" : "HN_FB_MSS_SAC",
    "fh" : "HN_FB_MSS_SAC_FueraH"
  },
};

var mensaje_df = "¡Hola! $cr Soy tu asistente virtual 🤖 de Claro $cr Te puedo ayudar con las siguientes opciones: $cr $cr ";
    mensaje_df +="➡️ Envía *cotizar* para conocer nuestros planes móviles y residenciales si deseas renovar o contratar nuevos servicios. 😎 $cr $cr ";
    mensaje_df +="➡️ Envía *recarga* para hacer una recarga. $cr $cr ";
    mensaje_df +="➡️ Envía *paquete* para comprar un paquete. $cr $cr ";
    mensaje_df +="➡️ Envía *pagar* para ver el saldo, fecha de vencimiento y pagar tu factura móvil y residencial. 💳 $cr $cr ";
    mensaje_df +="➡️ Envía *club* para conocer los establecimientos con promociones especiales solo por ser cliente Claro. 😎 💰 $cr $cr ";
    mensaje_df +="➡️ Envía *asistencia* para conocer los establecimientos con promociones especiales solo por ser cliente Claro. 😎 💰 $cr $cr ";
    mensaje_df +="➡️ Envía *asesor* si aún deseas ser atendido por uno de nuestros agentes de servicio al cliente. 👩💻👨💻 $cr $cr ";

var mjs_horario = "Estimado cliente, te informamos que nuestro horario de atención es de Lunes a Domingo de 7:00 - 22:00, Agradeceremos tu preferencia";

var msj_pagar = "Para conocer el saldo, fecha de vencimiento y también poder pagar tu factura móvil y residencial, ";
    msj_pagar += "puedes ingresar al siguiente portal: https://hn.mipagoclaro.com/ 💳🧾";

var msj_asesor = "¡Bienvenido a CLARO Honduras! Estamos para servirle! $cr ";
    msj_asesor += "En un momento le estará atendiendo uno de nuestros ejecutivos. $cr $cr ";
    msj_asesor += "Podrías compartirnos la siguiente información para apoyarte lo más pronto posible. $cr $cr ";
    msj_asesor += "Nombre: $cr ";
    msj_asesor += "ID: $cr ";
    msj_asesor += "Numero Móvil o Contrato: $cr $cr ";
    msj_asesor += "¿Cómo te podemos colaborar?";

var msj_club = "Si eres Claro 😉 eres parte del club con beneficios y descuentos. $cr "; 
    msj_club += "¡Descarga la App! 👇 $cr ";
    msj_club += "Android: http://bit.ly/ClaroClub-Android $cr ";
    msj_club += "iOS: http://bit.ly/ClaroClubiOS ";

var msj_asistencia = "👋Gracias por comunicarte a Claro, por favor ingresa el número de la opción con la que necesitas apoyo 😊: $cr $cr ";
    msj_asistencia += "1. Adquirir servicio nuevo, información de promoción o renovar mi servicio. $cr $cr ";
    msj_asistencia += "2. Servicio al cliente. $cr";
    
var msj_default = 
{
  "action" : {
    "type" : "continue",
    "queue" : ""
  },
  "messages" : [
    {
      "type" : "text",
      "text" :  mensaje_df,
      "mediaURL" : ""
    }
  ]
};

var palabras = {
  "cotizar": {
    "action" : {
      "type" : "transfer",
      "queue" : colas["cotizar"].acd,
      "timeoutInactivity" : colas["cotizar"].timeout
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  "*¡Hola!🤗 Bienvenido a nuestro servicio de ventas Claro.*  En un momento uno de nuestros representantes te atenderá ",
        "mediaURL" : ""
      }
    ]
  },
  "recarga": {
    "action" : {
      "type" : "continue",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  "Recarga fácil y rápido visitando nuestro portal: https://paquetes.miclaro.com.hn/ 😎",
        "mediaURL" : ""
      }
    ]
  },
  "paquete": {
    "action" : {
      "type" : "continue",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  "Compra el paquete que prefieras ingresando a https://paquetes.miclaro.com.hn/",
        "mediaURL" : ""
      }
    ]
  },
  "pagar": {
    "action" : {
      "type" : "continue",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_pagar,
        "mediaURL" : ""
      }
    ]
  },  
  "club": {
    "action" : {
      "type" : "continue",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_club,
        "mediaURL" : ""
      }
    ]
  },
  "asistencia": {
    "action" : {
      "type" : "continue",
      "queue" : ""
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_asistencia,
        "mediaURL" : ""
      }
    ]
  },
  "asesor": {
    "action" : {
      "type" : "transfer",
      "queue" : colas["asesor"].acd,
      "timeoutInactivity" : colas["asesor"].timeout

    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_asesor,
        "mediaURL" : ""
      }
    ]
  }
};

var menu_opciones_asistencia = 
{
  "1" : {
    "action" : {
      "type" : "transfer",
     "queue" : colas["asistencia_1"].acd,
      "timeoutInactivity" : colas["asistencia_1"].timeout
    },
    "messages" : []
  },
  "2" : {
    "action" : {
      "type" : "transfer",
      "queue" : colas["asistencia_2"].acd,
      "timeoutInactivity" : colas["asistencia_2"].timeout
    },
    "messages" : [
      {
        "type" : "text",
        "text" :  msj_asesor,
        "mediaURL" : ""
      }
    ]
  }
}

var contenedor = {
  "action" : {
    "type" : "",
    "queue" : ""
  },
  "messages" : [
    {
      "type" : "",
      "text" :  "",
      "mediaURL" : ""
    }
  ]
};

var msj_fuera_horario = {
  "action" : {
    "type" : "continue", // transfer
    "queue" : ""
  },
  "messages" : [
    {
      "type" : "text",
      "text" :  mjs_horario,
      "mediaURL" : ""
    }
  ]
}

exports.msj_default = msj_default;

exports.palabras = palabras;

exports.contenedor = contenedor;

exports.colas = colas;

exports.menu_opciones_asistencia = menu_opciones_asistencia;

exports.mjs_horario = mjs_horario;