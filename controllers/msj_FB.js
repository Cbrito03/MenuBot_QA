var colas = {
  "asesor" : {
    "timeout" : 300000,
    "acd" : "HN_FB_MSS_SAC",
    "fh" : "HN_FB_MSS_SAC_FueraH"
  }
};

var mensaje_df = "¡Hola! $cr Soy tu asistente virtual 🤖 de Claro $cr Te puedo ayudar con las siguientes opciones: $cr $cr ";
    mensaje_df +="➡️ Envía *recarga* para hacer una recarga. $cr $cr ";
    mensaje_df +="➡️ Envía *paquete* para comprar un paquete. $cr $cr ";
    mensaje_df +="➡️ Envía *pagar* para ver el saldo, fecha de vencimiento y pagar tu factura móvil y residencial. 💳 $cr $cr ";
    mensaje_df +="➡️ Envía *club* para conocer los establecimientos con promociones especiales solo por ser cliente Claro. 😎 💰 $cr $cr ";
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
  "asesor": {
    "action" : {
      "type" : "transfer",
      "queue" : colas["asesor"].acd
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