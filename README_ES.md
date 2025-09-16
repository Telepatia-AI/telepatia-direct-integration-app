# Aplicación de Integración Directa con Telepatia

Este repositorio implementa una aplicación de integración directa entre un sistema de salud y el servicio de transcripción médica de Telepatia. Proporciona una interfaz de pantalla dividida que demuestra el flujo de trabajo para grabar consultas médicas e importar las sesiones transcritas.

## Documentación de la API
La documentación completa de la API y el explorador interactivo de la API se pueden acceder en: https://integrations.test.telepatia.ai/api/docs

## Descripción General

La aplicación consta de dos interfaces sincronizadas:
- **Pantalla Izquierda (Interfaz de Telepatia)**: Simula el sistema de grabación de Telepatia
- **Pantalla Derecha (Interfaz del Sistema Externo)**: Representa tu sistema de salud/clínico

## Instalación y Configuración

### Prerrequisitos
- Node.js 18.x o superior
- Gestor de paquetes npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd telepatia-direct-integration-app
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Ejecutar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

4. Abrir tu navegador y navegar a:
```
http://localhost:3000
```

### Variables de Entorno (Opcional)
Puedes configurar la URL base de la API creando un archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://uzui-alb-1991166989.us-east-2.elb.amazonaws.com
```

## Pasos del Flujo de Trabajo de Integración Directa

### Paso 1: Autenticación (🔐)
- Ingresa tu token Bearer en la interfaz del Sistema Externo
- El token se valida contra el endpoint de autenticación de Telepatia
- Una vez autenticado, el sistema está listo para procesar datos del paciente

### Paso 2: Inicializar Consulta (📋)
- El Sistema Externo envía información del paciente a Telepatia
- Los detalles del paciente incluyen:
  - Nombre
  - País (ej., COLOMBIA)
  - Tipo de ID (ej., CC, CE, TI)
  - Valor del ID (número de documento)
- Esto actualiza el contexto del paciente actual vía `/api/account/external-system/current-patient`

### Paso 3: Iniciar Grabación (🎙️)
- La interfaz de Telepatia comienza a grabar la consulta médica
- La captura de audio simula el proceso de transcripción en tiempo real
- La interfaz de grabación muestra el tiempo transcurrido y la visualización del audio

### Paso 4: Finalizar Grabación (⏹️)
- Detener la grabación cuando la consulta esté completa
- El sistema procesa el audio grabado
- Se crea una nueva sesión con el contenido transcrito

### Paso 5: Confirmar Paciente (✅)
- Revisar y confirmar la información del paciente
- Asegurar que los detalles del paciente coincidan entre ambos sistemas
- Opción de reasignar a un paciente diferente si es necesario

### Paso 6: Importar Sesión del Escriba (📥)
- El Sistema Externo obtiene la sesión transcrita de Telepatia
- Usa el endpoint `/api/scribe-sessions/find-by-patient`
- Recupera la sesión más reciente del paciente incluyendo:
  - Metadatos de la sesión (ID, fecha de creación, estado)
  - Datos de la historia clínica
  - Notas de examen (exámenes orales, odontograma)
- Las notas médicas transcritas se muestran en el Sistema Externo

### Paso 7: Completado (✓)
- El ciclo de integración está completo
- Las notas médicas están disponibles en el Sistema Externo
- Opción de reiniciar y comenzar una nueva consulta

## Características Principales

- **Soporte Multi-idioma**: Interfaz disponible en inglés, español y portugués
- **Sincronización en Tiempo Real**: Ambas interfaces se actualizan sincrónicamente mientras avanzas en el flujo de trabajo
- **Gestión de Sesiones**: Ver y seleccionar entre múltiples sesiones de grabación
- **Manejo de Errores**: Mensajes de error completos y opciones de recuperación
- **Seguridad de Datos del Paciente**: Autenticación segura basada en tokens para todas las llamadas a la API

## Implementación Técnica

La aplicación utiliza:
- **Next.js 14** para el frontend basado en React
- **TypeScript** para seguridad de tipos
- **Tailwind CSS** para estilos
- **API REST** integración con los servicios backend de Telepatia
- **React Context** para gestión de estado
- **i18next** para internacionalización

## Endpoints de la API Utilizados

1. **Autenticación**: `/api/auth/validate`
2. **Gestión de Pacientes**: `/api/account/external-system/current-patient`
3. **Importación de Sesiones**: `/api/scribe-sessions/find-by-patient`

## Estructura del Proyecto

```
app/
├── components/
│   ├── external-system/     # Componentes de la interfaz del sistema externo
│   ├── telepatia/           # Componentes de la interfaz de Telepatia
│   └── shared/              # Componentes compartidos (Header, WorkflowChecklist, etc.)
├── services/
│   └── api.ts              # Capa de servicio de API
├── types/
│   ├── index.ts            # Definiciones de tipos principales
│   └── patient-sessions-dto.ts  # DTOs de la API
├── i18n/                   # Configuración de internacionalización
│   └── locales/           # Archivos de traducción (en, es, pt)
└── enums/                 # Enumeraciones para países y tipos de ID
```

## Desarrollo

### Construcción para Producción
```bash
npm run build
# o
yarn build
```

### Ejecutar la Construcción de Producción
```bash
npm start
# o
yarn start
```

### Linting
```bash
npm run lint
# o
yarn lint
```

## Notas

- La aplicación está diseñada como una demostración del flujo de trabajo de integración directa
- En producción, reemplaza la validación del token Bearer simulado con autenticación real
- Asegura una configuración CORS adecuada al desplegar en entornos de producción

Esta integración directa asegura un flujo de datos sin interrupciones entre tu sistema clínico y el servicio de transcripción de Telepatia, manteniendo la consistencia de los datos y proporcionando un flujo de trabajo eficiente para los profesionales de la salud.