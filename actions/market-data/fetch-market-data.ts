/**
 * @description
 * Esta acción del servidor se encarga de obtener datos de velas (candlestick) del API de BingX.
 * Utiliza las variables de entorno (BINGX_API_URL, BINGX_API_KEY, BINGX_API_SECRET) para construir
 * una petición autenticada y firmada según la documentación de BingX.
 *
 * Funcionalidades clave:
 * - Construye los parámetros requeridos: symbol, interval, limit y timestamp.
 * - Calcula la firma HMAC-SHA256 de la cadena de parámetros usando BINGX_API_SECRET.
 * - Realiza una petición GET al endpoint '/openApi/swap/v3/quote/klines'.
 * - Valida la respuesta para asegurarse de que los datos se ajusten a la estructura esperada.
 *
 * @dependencies
 * - Node.js crypto module para generar la firma.
 * - ActionState de '@/types' para retornar el resultado de la acción.
 *
 * @notes
 * - Asegúrese de definir correctamente las variables de entorno BINGX_API_URL, BINGX_API_KEY y BINGX_API_SECRET en .env.local.
 * - La acción está diseñada para ser ejecutada periódicamente (por ejemplo, cada 5 minutos).
 */

"use server";

import { ActionState } from "@/types";
import { createHmac } from "crypto";

// Define la interfaz para los datos de candlestick según la documentación de BingX.
export interface Candlestick {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  time: number; // Timestamp en milisegundos
}

/**
 * validateCandlestickData valida que la respuesta contenga un arreglo de objetos de candlestick
 * con la estructura correcta (todos los campos numéricos y la propiedad "time").
 *
 * @param data - Los datos a validar.
 * @returns true si los datos son válidos; false en caso contrario.
 */
function validateCandlestickData(data: any): data is Candlestick[] {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const item of data) {
    if (
      typeof item.open !== "number" ||
      typeof item.close !== "number" ||
      typeof item.high !== "number" ||
      typeof item.low !== "number" ||
      typeof item.volume !== "number" ||
      typeof item.time !== "number"
    ) {
      return false;
    }
  }
  return true;
}

/**
 * fetchMarketDataAction se conecta al API de BingX para obtener datos de velas (candlestick)
 * utilizando los parámetros requeridos y una firma HMAC-SHA256 para autenticación.
 *
 * @returns {Promise<ActionState<Candlestick[]>>} - Estado de la acción con los datos obtenidos o un mensaje de error.
 */
export async function fetchMarketDataAction(): Promise<ActionState<Candlestick[]>> {
  try {
    // Extraer las credenciales y URL base del API desde las variables de entorno
    const baseUrl = process.env.BINGX_API_URL;
    const apiKey = process.env.BINGX_API_KEY;
    const apiSecret = process.env.BINGX_API_SECRET;

    if (!baseUrl || !apiKey || !apiSecret) {
      throw new Error("Las credenciales del API de BingX no están configuradas en las variables de entorno.");
    }

    // Definir los parámetros para la petición
    const params = {
      symbol: "BTC-USDT",      // Símbolo de trading (debe incluir un guión, ej: BTC-USDT)
      interval: "1m",          // Intervalo de tiempo (ej: "1m" para 1 minuto)
      limit: "1440",           // Número de registros (1440 para cubrir un día de datos en 1m)
      timestamp: new Date().getTime().toString()  // Tiempo actual en milisegundos
    };

    // Función para construir la cadena de parámetros ordenada y URL-encoded
    const buildQueryString = (paramsObj: Record<string, string>): string => {
      return Object.keys(paramsObj)
        .sort()
        .map(key => `${key}=${encodeURIComponent(paramsObj[key])}`)
        .join("&");
    };

    const queryString = buildQueryString(params);

    // Generar la firma HMAC-SHA256 utilizando el query string y el secreto de la API
    const signature = createHmac("sha256", apiSecret)
      .update(queryString)
      .digest("hex");

    // Construir la URL completa del endpoint
    const endpoint = `${baseUrl}/openApi/swap/v3/quote/klines?${queryString}&signature=${signature}`;

    // Realizar la petición GET al API
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-BX-APIKEY": apiKey
      }
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`El API de BingX respondió con el estado ${response.status}: ${errorText}`);
    }

    // Parsear la respuesta en JSON
    const data = await response.json();

    // Validar que los datos recibidos tengan la estructura correcta de candlestick
    if (!validateCandlestickData(data)) {
      throw new Error("El formato de datos de candlestick recibido es inválido.");
    }

    // Retornar el estado de éxito con los datos validados
    return {
      isSuccess: true,
      message: "Datos de mercado obtenidos y validados exitosamente.",
      data: data
    };

  } catch (error: any) {
    console.error("Error al obtener datos de mercado:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Error desconocido al obtener datos de mercado."
    };
  }
}