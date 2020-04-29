var config = require('../config.js');

var dias = config.dias;
var OPEN_HOUR = config.OPEN_HOUR;
var OPEN_MINUTE = config.OPEN_MINUTE;
var CLOSE_HOUR = config.CLOSE_HOUR;
var CLOSE_MINUTE = config.CLOSE_MINUTE;

function isValidHour(hour, minute) // Verifica si la hora es valida, entre numeros positivos y menores a 24
{
	return (hour > -1 && hour < 24 && minute > -1 && minute < 60) && (OPEN_HOUR <= CLOSE_HOUR);
}

function validar_rango_hora(hour)
{
	return hour >= OPEN_HOUR && hour <= CLOSE_HOUR;
}

function validar_rango_minuto(minute)
{
	return minute >= OPEN_MINUTE && minute < CLOSE_MINUTE;
}

function validar_dia(day)
{
	return dias[day][1]
}

validarHorario = function(OPEN_HOUR, OPEN_MINUTE, CLOSE_HOUR, CLOSE_MINUTE)
{
	const now = new Date();

	var hora = now.getHours();
	var minuto =now.getMinutes();

	var dia = now.getDay();

	if(isValidHour(OPEN_HOUR, OPEN_MINUTE) && isValidHour(CLOSE_HOUR, CLOSE_MINUTE))
	{
		if(validar_dia(dia))
		{          
			if(validar_rango_hora(hora))
			{
				if(hora == CLOSE_HOUR)
				{
					if(validar_rango_minuto(minuto))
					{
						return true;
					}
					else
					{
						return false;
					}
				}
				else
				{
					return true;
				}
			}
			else
			{
				return false;
			}
		}
		else
		{
			return false;
		}
	}
	else
	{
		console.log('No cumple con los requisitos: Se ingresaron numeros negativos o fuera del rango establecido.');
		return false;
	}
}

exports.validarHorario = validarHorario;