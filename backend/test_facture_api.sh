#!/bin/bash

# 🧾 Script de Test de l'API de Facturation
# Teste tous les endpoints de l'API

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/factures"

echo "🧾 Test de l'API de Facturation"
echo "================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}🔍 Test: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
    fi
    
    # Séparer la réponse et le code HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Succès (HTTP $http_code)${NC}"
        echo "Réponse: $response_body" | jq '.' 2>/dev/null || echo "Réponse: $response_body"
    else
        echo -e "${RED}❌ Échec (HTTP $http_code)${NC}"
        echo "Réponse: $response_body"
    fi
    
    echo ""
}

# Test 1: Vérifier si l'API est accessible
echo "🌐 Test de connectivité..."
if curl -s "$BASE_URL/actuator/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur accessible${NC}"
else
    echo -e "${RED}❌ Serveur inaccessible${NC}"
    echo "Assurez-vous que l'application est démarrée sur $BASE_URL"
    exit 1
fi

echo ""

# Test 2: Vérifier l'existence d'un numéro de facture (doit échouer car pas de facture)
test_endpoint "GET" "$API_BASE/exists/FAC-01-01-25-0001" \
    "Vérification de l'existence d'un numéro de facture (doit échouer)"

# Test 3: Recherche de factures (doit retourner une liste vide)
test_endpoint "POST" "$API_BASE/search" \
    "Recherche de factures avec filtres" \
    '{"page": 0, "size": 10}'

# Test 4: Génération de facture avec ID invalide (doit échouer)
test_endpoint "POST" "$API_BASE/generate/999999" \
    "Génération de facture avec ID de vente invalide (doit échouer)"

# Test 5: Génération de mini reçu avec ID invalide (doit échouer)
test_endpoint "POST" "$API_BASE/generate-mini-recu/999999" \
    "Génération de mini reçu avec ID de vente invalide (doit échouer)"

# Test 6: Récupération de facture par numéro invalide (doit échouer)
test_endpoint "GET" "$API_BASE/INVALID-NUMBER" \
    "Récupération de facture avec numéro invalide (doit échouer)"

echo "🎯 Tests terminés !"
echo ""
echo "📝 Notes:"
echo "- Les tests avec des IDs invalides doivent échouer (c'est normal)"
echo "- Pour tester avec des données valides, créez d'abord une vente"
echo "- Utilisez l'ID de la vente créée pour tester la génération de factures"
echo ""
echo "🚀 Pour tester avec des données valides:"
echo "1. Créez une vente via l'API de vente"
echo "2. Notez l'ID de la vente créée"
echo "3. Remplacez '999999' par cet ID dans les tests"
echo "4. Relancez ce script"
