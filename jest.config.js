/** 
 * @description
 * Configuración de Jest para el proyecto.
 * Se utiliza ts-jest para transformar archivos TypeScript y se mapea el alias '@' a la raíz del proyecto.
 */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1"
    },
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    // Opcional: si necesitas configurar rutas o ignorar ciertos archivos de pruebas
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    // Opcional: habilitar cobertura de código
    collectCoverage: true,
    coverageDirectory: "coverage",
  }
  