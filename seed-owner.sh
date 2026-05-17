#!/usr/bin/env bash
# ============================================================
# seed-owner.sh
# Registra al dueño del SaaS (Victor) en el backend de .NET
# Llama directamente al endpoint POST /api/auth/register-company
# ============================================================

set -euo pipefail

BACKEND_URL="http://localhost:5248"
ENDPOINT="$BACKEND_URL/api/auth/register-company"

echo ""
echo "======================================================"
echo "  Nexus SaaS - Registro del Dueño / Owner del Sistema"
echo "======================================================"
echo ""

# ---- Datos de tu empresa y usuario administrador ----
PAYLOAD='{
  "ruc":           "20000000001",
  "businessName":  "Nexus Servicios SaaS S.A.C.",
  "tradeName":     "NexusAdmin",
  "address":       "Av. Principal 123, Lima",
  "phone":         "999999999",
  "companyEmail":  "contacto@nexusadmin.com",
  "adminFullName": "Victor Canchari",
  "adminEmail":    "victor@nexusadmin.com",
  "adminPhone":    "999999999",
  "adminPassword": "Admin123!"
}'

echo "📡 Enviando solicitud de registro al backend..."
echo "   Endpoint  : $ENDPOINT"
echo "   Email     : victor@nexusadmin.com"
echo "   Contraseña: Admin123!"
echo ""

HTTP_RESPONSE=$(curl --silent \
  --write-out "HTTPSTATUS:%{http_code}" \
  --request POST "$ENDPOINT" \
  --header "Content-Type: application/json" \
  --data "$PAYLOAD")

HTTP_BODY=$(echo "$HTTP_RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
HTTP_CODE=$(echo "$HTTP_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

echo "--- Respuesta del servidor (HTTP $HTTP_CODE) ---"
echo "$HTTP_BODY" | python3 -m json.tool 2>/dev/null || echo "$HTTP_BODY"
echo ""

if [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ ¡Empresa y usuario registrados con éxito!"
  echo ""
  echo "   Ahora puedes iniciar sesión en:"
  echo "   🌐  http://localhost:5173"
  echo ""
  echo "   Email     : victor@nexusadmin.com"
  echo "   Contraseña: Admin123!"
  echo ""
elif [ "$HTTP_CODE" -eq 400 ]; then
  echo "⚠️  El registro fue rechazado por el backend."
  echo "   Probablemente el RUC o el email ya están registrados."
  echo ""
  echo "   Si ya existe el usuario puedes iniciar sesión directamente:"
  echo "   Email     : victor@nexusadmin.com"
  echo "   Contraseña: Admin123!"
else
  echo "❌ Error inesperado con código HTTP $HTTP_CODE"
  echo "   Verifica que el backend esté corriendo en $BACKEND_URL"
fi
