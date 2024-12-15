# Archivo Histórico SDE - Backend

Este proyecto es el backend para el sistema de gestión del Archivo Histórico de Santiago del Estero. Proporciona una API RESTful para administrar y acceder a documentos históricos digitalizados.

## Requisitos Previos

- Node.js (versión LTS recomendada)
- MySQL
- npm
- Git

## Configuración Inicial

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Facu137/Archivo-H-Backend.git
   cd Archivo-H-Backend
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto
   - Copiar el contenido de `.env.example` (si existe) y configurar las variables necesarias

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   El servidor estará disponible en `http://localhost:3000` por defecto.

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas (si están configuradas)

## Extensiones Recomendadas para VS Code

Para una mejor experiencia de desarrollo, se recomienda instalar las siguientes extensiones:

1. **Error Lens**
   - ID: usernamehw.errorlens
   - Descripción: Mejora la visualización de errores y advertencias en el código

2. **ESLint**
   - ID: dbaeumer.vscode-eslint
   - Descripción: Integración de ESLint para mantener la calidad del código

3. **GitHub Pull Requests**
   - ID: GitHub.vscode-pull-request-github
   - Descripción: Integración con GitHub para gestionar pull requests

4. **Prettier**
   - ID: esbenp.prettier-vscode
   - Descripción: Formateador de código automático

## Estructura del Proyecto

```
Archivo-H-Backend/
├── src/
│   ├── config/      # Configuraciones
│   ├── controllers/ # Controladores
│   ├── models/      # Modelos de datos
│   ├── routes/      # Rutas de la API
│   └── app.js       # Punto de entrada
├── .env             # Variables de entorno
└── package.json     # Dependencias y scripts
```

## Contribución

1. Crear una rama desde `desarrollo`
2. Realizar los cambios en tu rama
3. Crear un Pull Request hacia la rama `desarrollo`

## Licencia

Este proyecto está bajo la Licencia MIT.
