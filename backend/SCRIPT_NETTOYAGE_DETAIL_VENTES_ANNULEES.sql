-- ============================================================================
-- SCRIPT DE NETTOYAGE : Suppression des DetailVente des ventes annulées
-- ============================================================================
-- 
-- OBJECTIF : Supprimer complètement (hard delete) les DetailVente dont
--            la vente parente a le statut "ANNULE"
--
-- PRÉCAUTIONS :
-- 1. Ce script fait un HARD DELETE (suppression définitive)
-- 2. Toujours faire une sauvegarde avant d'exécuter
-- 3. Vérifier le nombre de lignes à supprimer avant l'exécution
--
-- ============================================================================

-- ÉTAPE 1 : Vérification des données à supprimer
-- ============================================================================
-- Compter combien de DetailVente seront supprimés
SELECT 
    COUNT(*) as total_detail_ventes_a_supprimer,
    COUNT(DISTINCT v.id) as nombre_ventes_annulees
FROM detail_ventes dv
INNER JOIN ventes v ON dv.vente_id = v.id
WHERE v.status = 'ANNULE'
  AND dv.deleted = false;

-- Afficher les détails des DetailVente à supprimer
SELECT 
    dv.id as detail_vente_id,
    dv.vente_id,
    v.numero_facture,
    v.status as statut_vente,
    dv.produit_id,
    p.libelle as produit_libelle,
    dv.quantite_vendu,
    dv.prix_vente,
    dv.montant_total,
    dv.created_at as date_creation
FROM detail_ventes dv
INNER JOIN ventes v ON dv.vente_id = v.id
INNER JOIN produits p ON dv.produit_id = p.id
WHERE v.status = 'ANNULE'
  AND dv.deleted = false
ORDER BY dv.created_at DESC
LIMIT 100;

-- ============================================================================
-- ÉTAPE 2 : SAUVEGARDE (à faire avant la suppression)
-- ============================================================================
-- Créer une table de sauvegarde
CREATE TABLE IF NOT EXISTS detail_ventes_annulees_backup AS
SELECT * FROM detail_ventes
WHERE vente_id IN (
    SELECT id FROM ventes WHERE status = 'ANNULE'
);

-- Vérifier la sauvegarde
SELECT COUNT(*) as lignes_sauvegardees 
FROM detail_ventes_annulees_backup;

-- ============================================================================
-- ÉTAPE 3 : SUPPRESSION (HARD DELETE)
-- ============================================================================
-- ATTENTION : Cette commande supprime définitivement les données !

-- Supprimer les DetailVente des ventes annulées
DELETE FROM detail_ventes
WHERE vente_id IN (
    SELECT id FROM ventes WHERE status = 'ANNULE'
)
AND deleted = false;

-- Vérifier le résultat
SELECT 
    COUNT(*) as detail_ventes_restants,
    COUNT(DISTINCT vente_id) as ventes_avec_details
FROM detail_ventes
WHERE deleted = false;

-- ============================================================================
-- ÉTAPE 4 : VÉRIFICATION POST-SUPPRESSION
-- ============================================================================
-- Vérifier qu'il ne reste plus de DetailVente pour les ventes annulées
SELECT 
    COUNT(*) as detail_ventes_restants_pour_ventes_annulees
FROM detail_ventes dv
INNER JOIN ventes v ON dv.vente_id = v.id
WHERE v.status = 'ANNULE'
  AND dv.deleted = false;

-- Afficher les ventes annulées sans DetailVente
SELECT 
    v.id,
    v.numero_facture,
    v.status,
    v.montant_total,
    v.created_at,
    COUNT(dv.id) as nombre_detail_ventes
FROM ventes v
LEFT JOIN detail_ventes dv ON v.id = dv.vente_id AND dv.deleted = false
WHERE v.status = 'ANNULE'
GROUP BY v.id, v.numero_facture, v.status, v.montant_total, v.created_at
HAVING COUNT(dv.id) = 0;

-- ============================================================================
-- ÉTAPE 5 : NETTOYAGE OPTIONNEL
-- ============================================================================
-- Si tout est OK, supprimer la table de sauvegarde
-- ATTENTION : Ne le faire qu'après avoir vérifié que tout fonctionne !

-- DROP TABLE IF EXISTS detail_ventes_annulees_backup;

-- ============================================================================
-- STATISTIQUES FINALES
-- ============================================================================
-- Statistiques générales après nettoyage
SELECT 
    'Total DetailVente actifs' as description,
    COUNT(*) as nombre
FROM detail_ventes
WHERE deleted = false

UNION ALL

SELECT 
    'Total ventes' as description,
    COUNT(*) as nombre
FROM ventes
WHERE deleted = false

UNION ALL

SELECT 
    'Ventes annulées' as description,
    COUNT(*) as nombre
FROM ventes
WHERE status = 'ANNULE' AND deleted = false

UNION ALL

SELECT 
    'DetailVente pour ventes annulées' as description,
    COUNT(*) as nombre
FROM detail_ventes dv
INNER JOIN ventes v ON dv.vente_id = v.id
WHERE v.status = 'ANNULE' AND dv.deleted = false;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
