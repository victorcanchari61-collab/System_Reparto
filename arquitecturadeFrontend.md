# 🏛️ Blueprint de Arquitectura: Next.js + TypeScript Enterprise Template

Este documento sirve como **guía de referencia y plantilla de arquitectura** para crear nuevos proyectos web escalables utilizando **Next.js (App Router)**, **TypeScript**, y un sistema de estado ligero con **Zustand**.

---

## 🗺️ Estructura del Árbol de Directorios (Skeleton)

Puedes replicar esta estructura exacta de carpetas para iniciar cualquier proyecto empresarial modular:

```text
nombre-del-proyecto/
├── app/                         # Enrutamiento, Layouts y Vistas (App Router)
│   ├── _actions/                # Server Actions globales (mutaciones seguras en servidor)
│   ├── _components/             # Componentes compartidos que solo se usan dentro de 'app'
│   ├── _lib/                    # Inicializaciones y clientes exclusivos de la App
│   ├── _stores/                 # Gestión de estados (Zustand) locales de la App
│   ├── _types/                  # Interfaces y tipos de datos exclusivos de enrutamiento
│   ├── _utils/                  # Funciones de ayuda exclusivas de la App
│   ├── api/                     # Endpoints locales de Next.js (API Routes)
│   │   └── [nombre-servicio]/   # Carpeta de API dedicada
│   └── ui/                      # Módulos y Dashboards principales del Sistema
│       ├── _components/         # Navbars, Sidebars y Footers comunes del dashboard
│       └── [nombre-modulo]/     # Un directorio por módulo funcional de negocio (Ej: dashboard, ventas)
│           ├── _components/     # Componentes interactivos exclusivos de este módulo
│           │   ├── modals/      # Diálogos y modales exclusivos
│           │   └── tables/      # Tablas y listas exclusivas
│           ├── _hooks/          # React Hooks específicos para este módulo
│           ├── layout.tsx       # Sub-layout del módulo
│           └── page.tsx         # Página de entrada del módulo
│
├── components/                  # Componentes de UI 100% Reutilizables y Atómicos
│   ├── ui/                      # Componentes base y primitivas de diseño (Ej: Button, Input, Dialog)
│   ├── tables/                  # Tablas globales genéricas y de alto rendimiento (Ej: AG-Grid wraps)
│   ├── modals/                  # Modales reutilizables por varios módulos
│   ├── form/                    # Controladores de formularios, selects y checkbox personalizados
│   └── feedback/                # Alertas, spinners y loaders globales
│
├── hooks/                       # React Hooks Personalizados Globales (Infraestructura)
│   ├── use-permission.ts        # Control de visualización y accesos por rol
│   ├── use-realtime.ts          # Suscripciones y canales de WebSockets
│   ├── use-server-query.ts      # Envoltorio optimizado para peticiones GET (fetch/axios)
│   └── use-server-mutation.ts   # Envoltorio optimizado para peticiones POST/PUT/DELETE
│
├── lib/                         # Clientes de APIs, Integraciones y Configuraciones Globales
│   ├── api-client.ts            # Instancia HTTP (Axios/Fetch) con interceptores y tokens
│   ├── permissions-matrix.ts    # Declaración maestra de permisos y roles del sistema
│   └── auth-provider.tsx        # React Context que envuelve la sesión y sesión activa
│
├── store/                       # Estados Centralizados Globales (Zustand Stores)
│   ├── use-ui-store.ts          # Estado del sidebar, colapso de menús, tema oscuro
│   └── use-auth-store.ts        # Estado del usuario autenticado y token en memoria
│
├── types/                       # Definiciones de Tipos de TypeScript Globales
│   ├── models.ts                # Interfaces de entidades de base de datos
│   ├── enums.ts                 # Constantes de negocio tipadas (Ej: Estados de órdenes)
│   └── index.ts                 # Exportación unificada de tipos
│
└── utils/                       # Utilidades de Formato, Validaciones y Herramientas Genéricas
    ├── formatters.ts            # Formateadores de fechas, monedas, números y texto
    ├── validators.ts            # Reglas de validaciones comunes
    └── excel-exporter.ts        # Utilidades para exportar JSON directamente a archivos Excel (.xlsx)
```

---

## 📐 Reglas de la Arquitectura (Responsabilidad Única)

Para mantener el proyecto limpio, escalable y evitar el código espagueti, aplica siempre las siguientes reglas:

### 1. ¿Dónde coloco un nuevo Componente?
* **En `components/ui/`**: Si es una pieza fundamental de diseño (un botón, un input, un card, un switch) sin lógica de negocio.
* **En `components/` (raíz)**: Si es un componente compuesto reutilizable en más de un módulo (ejemplo: una tabla avanzada de clientes, un modal de búsqueda global).
* **En `app/ui/[modulo]/_components/`**: Si es un componente interactivo que **solo existe y tiene sentido** en ese módulo (ejemplo: el formulario para crear una orden específica de ese módulo).

### 2. ¿Dónde coloco un nuevo Hook?
* **En `hooks/` (raíz)**: Si maneja lógica genérica reutilizable (ejemplo: leer cookies, sincronizar local-storage, detectar tamaños de pantalla).
* **En `app/ui/[modulo]/_hooks/`**: Si encapsula la lógica, peticiones API, o el estado de un formulario específico de ese módulo (mantiene la página `page.tsx` limpia de lógica).

### 3. ¿Dónde coloco un Estado?
* **Local con `useState`**: Si el estado pertenece a un solo componente o formulario y no se comparte.
* **Contexto de React (`React.createContext`)**: Si necesitas proveer estado a un árbol pequeño de componentes que no cambia muy seguido.
* **Store con Zustand (`store/`)**: Si es un estado global que necesita ser accedido por componentes en diferentes páginas y módulos (ejemplo: datos del usuario logueado, configuraciones de visualización).

### 4. ¿Dónde coloco las llamadas a APIs?
* **En `lib/api-client.ts`**: Define la clase o cliente base.
* **En archivos de API locales de módulo o Server Actions**: Si realizas mutaciones directamente en el servidor.
* **Dentro del Hook de componente de módulo**: Para que maneje automáticamente los estados de carga (`isLoading`), éxito (`isSuccess`) y error (`error`).
