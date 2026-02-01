# 💰 Finance Flow Pro

## 🏦 Sistema de Gestión Financiera Personal Premium

Aplicación web de finanzas personales con diseño ultra-premium, análisis avanzado y visualización de datos en tiempo real.

---

## 🎯 Características Principales

### 📊 Dashboard Ejecutivo
- **Vista general** de todas las cuentas y balances
- **Gráficos interactivos** de ingresos vs gastos
- **Widgets personalizables** con métricas clave
- **Alertas inteligentes** de gastos inusuales

### 💳 Gestión de Tarjetas
- **Registro de tarjetas** de crédito y débito
- **Tracking de límites** y fechas de corte
- **Visualización de utilización** por tarjeta

### 📈 Préstamos y Créditos
- **Calculadora de amortización**
- **Tracking de pagos** pendientes
- **Proyecciones de pago** anticipado

### 🏢 Finanzas Empresariales
- **Separación** de gastos personales y de negocio
- **Reportes fiscales** básicos
- **Tracking de facturas** por cobrar/pagar

### 📉 Análisis Avanzado
- **Tendencias de gasto** por categoría
- **Comparativas mensuales**
- **Proyecciones futuras**

---

## 🏗️ Stack Técnico

```
finance-flow-pro/
├── src/
│   ├── components/       # UI Components
│   │   ├── Layout.jsx    # Layout con sidebar
│   │   ├── Sidebar.jsx   # Navegación lateral
│   │   └── Charts/       # Componentes de gráficos
│   ├── context/          # React Context
│   │   └── AuthContext.jsx
│   ├── pages/            # Páginas principales
│   │   ├── Auth.jsx      # Login/Register
│   │   ├── Dashboard.jsx # Dashboard principal
│   │   ├── Cards.jsx     # Gestión de tarjetas
│   │   ├── Loans.jsx     # Préstamos
│   │   ├── Business.jsx  # Finanzas empresariales
│   │   └── Analysis.jsx  # Análisis avanzado
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades
│   ├── App.jsx           # Router principal
│   └── main.jsx          # Entry point
├── schema.sql            # Esquema Supabase
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18, Vite |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Charts** | Recharts |
| **Notifications** | Sonner |
| **Auth & DB** | Supabase |
| **Icons** | Lucide React |

---

## ⚙️ Configuración

### Variables de Entorno (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Instalación
```bash
npm install
npm run dev
```

### Base de Datos
Ejecutar `schema.sql` en Supabase SQL Editor.

---

## 🚀 Despliegue

### Netlify
El proyecto está configurado para despliegue en Netlify:
- Build command: `npm run build`
- Publish directory: `dist`

---

## 🎨 Diseño

- **Modo oscuro** por defecto
- **Glassmorphism** en cards y modales
- **Gradientes** sutiles y profesionales
- **Tipografía** Inter (Google Fonts)
- **Responsive** completo

---

## 👨‍💻 Desarrollado por

**Kelvin Velásquez**  
🇸🇻 El Salvador  
🔗 [GitHub](https://github.com/kelvinvelasquez-SDE)

---

## 📄 Licencia

MIT License © 2026 Kelvin Velásquez
