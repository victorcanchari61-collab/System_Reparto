#!/usr/bin/env bash
# ============================================================
# seed-client.sh
# Crea UNA empresa cliente de ejemplo en el SaaS.
# Flujo:
#   1) Login como Victor (owner) → obtiene access token
#   2) Usa ese token para llamar POST /api/auth/register-company
# ============================================================

set -euo pipefail

BACKEND_URL="http://localhost:5248"

# ── Credenciales del owner (Victor) ─────────────────────────
OWNER_EMAIL="victor@nexusadmin.com"
OWNER_PASS="Admin123!"

# ── Datos de la empresa cliente a crear ─────────────────────
CLIENT_RUC="20100000001"
CLIENT_BUSINESS="Distribuidora Lima S.A.C."
CLIENT_TRADE="DistriLima"
CLIENT_ADDRESS="Jr. Comercio 456, Lima"
CLIENT_PHONE="014441122"
CLIENT_EMAIL="contacto@distribuidoralima.com"

ADMIN_NAME="Carlos Ramirez"
ADMIN_EMAIL="carlos@distribuidoralima.com"
ADMIN_PHONE="987654321"
ADMIN_PASS="Cliente2025!"

echo ""
echo "============================================================"
echo "  Nexus SaaS — Seed de empresa cliente"
echo "============================================================"
echo ""

# ── Paso 1: Login como owner para obtener token ──────────────
echo "🔐 Paso 1: Autenticando como owner ($OWNER_EMAIL)..."

LOGIN_BODY="{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASS\"}"

LOGIN_RESP=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" \
  --request POST "$BACKEND_URL/api/auth/login" \
  --header "Content-Type: application/json" \
  --data "$LOGIN_BODY")

LOGIN_BODY_ONLY=$(echo "$LOGIN_RESP" | sed -e 's/HTTPSTATUS\:.*//g')
LOGIN_CODE=$(echo "$LOGIN_RESP"   | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$LOGIN_CODE" -ne 200 ]; then
  echo "❌ Login fallido (HTTP $LOGIN_CODE). ¿Está corriendo el backend?"
  echo "   Respuesta: $LOGIN_BODY_ONLY"
  exit 1
fi

# Extraer accessToken (soporta tanto 'accessToken' como 'AccessToken')
ACCESS_TOKEN=$(echo "$LOGIN_BODY_ONLY" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken') or d.get('AccessToken',''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ No se pudo extraer el accessToken de la respuesta."
  echo "   Respuesta: $LOGIN_BODY_ONLY"
  exit 1
fi

echo "   ✅ Token obtenido correctamente."
echo ""

# ── Paso 2: Registrar empresa cliente ───────────────────────
echo "🏢 Paso 2: Registrando empresa cliente..."
echo "   Empresa : $CLIENT_BUSINESS"
echo "   Admin   : $ADMIN_EMAIL"
echo ""

REG_PAYLOAD=$(cat <<EOF
{
  "ruc":           "$CLIENT_RUC",
  "businessName":  "$CLIENT_BUSINESS",
  "tradeName":     "$CLIENT_TRADE",
  "address":       "$CLIENT_ADDRESS",
  "phone":         "$CLIENT_PHONE",
  "companyEmail":  "$CLIENT_EMAIL",
  "adminFullName": "$ADMIN_NAME",
  "adminEmail":    "$ADMIN_EMAIL",
  "adminPhone":    "$ADMIN_PHONE",
  "adminPassword": "$ADMIN_PASS"
}
EOF
)

REG_RESP=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" \
  --request POST "$BACKEND_URL/api/auth/register-company" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --data "$REG_PAYLOAD")

REG_BODY=$(echo "$REG_RESP" | sed -e 's/HTTPSTATUS\:.*//g')
REG_CODE=$(echo "$REG_RESP" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

echo "--- Respuesta del servidor (HTTP $REG_CODE) ---"
echo "$REG_BODY" | python3 -m json.tool 2>/dev/null || echo "$REG_BODY"
echo ""

if [ "$REG_CODE" -eq 201 ]; then
  echo "✅ ¡Empresa cliente registrada con éxito!"
  echo ""
  echo "   ┌─────────────────────────────────────────┐"
  echo "   │  CREDENCIALES DEL CLIENTE               │"
  echo "   ├─────────────────────────────────────────┤"
  echo "   │  Login URL  : http://localhost:5173/acceso"
  echo "   │  Email      : $ADMIN_EMAIL"
  echo "   │  Contraseña : $ADMIN_PASS"
  echo "   └─────────────────────────────────────────┘"
  echo ""
elif [ "$REG_CODE" -eq 400 ]; then
  echo "⚠️  Registro rechazado (el RUC o email ya existen)."
  echo ""
  echo "   De todas formas puedes probar con las credenciales:"
  echo "   Email      : $ADMIN_EMAIL"
  echo "   Contraseña : $ADMIN_PASS"
else
  echo "❌ Error inesperado HTTP $REG_CODE."
  echo "   Verifica que el backend esté corriendo en $BACKEND_URL"
fi
