
export const REPORT_STRUCTURE_TEMPLATE = `ESTRUCTURA OBLIGATORIA DEL JSON:
{
  "tituloComercial": "Título persuasivo (5-8 palabras)",
  "estado": "🟢 ABIERTA o 🟡 PREVISIÓN",
  "overallScore": 85,
  "marcoFinanciero": {
    "programa": "Nombre del programa oficial",
    "tipoAccion": "Tipo (ej. RIA, IA, Subvención)",
    "presupuestoProyecto": "Cuantía por proyecto (€)",
    "presupuestoTotal": "Total de la convocatoria (€)",
    "ratioFinanciacion": "Porcentaje de ayuda"
  },
  "aiCore": {
    "compatibilidad": "85%",
    "analisisValor": "Por qué es una oportunidad para este cliente",
    "sinergias": "Puntos de unión técnicos",
    "puntosFlojos": "Qué falta para ganar"
  },
  "fichaTecnica": [
    "Objetivo: descripción corta",
    "Beneficiarios: entidades elegibles",
    "Gastos Elegibles: lista de gastos",
    "Fechas Clave: apertura y cierre"
  ],
  "consejosTacticos": [
    "Consejo táctico 1",
    "Consejo táctico 2"
  ],
  "roadmap": [
    "Qx 202x: Fase 1",
    "Qx 202x: Fase 2",
    "Qx 202x: Fase 3"
  ],
  "markdownReport": "Genera el informe completo en Markdown usando '/' como viñetas para la visualización web"
}`;
