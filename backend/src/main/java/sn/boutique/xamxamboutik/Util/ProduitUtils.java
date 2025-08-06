package sn.boutique.xamxamboutik.Util;

public class ProduitUtils {

    /**
     * Calcule le coût moyen d'acquisition pour un produit en combinant le stock existant et le nouveau stock.
     *
     * @param oldStock      Stock actuel du produit
     * @param oldCMA        Coût moyen d'acquisition actuel
     * @param newStock      Nouveau stock ajouté
     * @param newPrixAchat  Prix d'achat du nouveau stock (incluant frais par unité si applicable)
     * @return Coût moyen d'acquisition arrondi à 2 décimales
     */
    public static double calculerCoupMoyenAcquisition(int oldStock, double oldCMA, int newStock, double newPrixAchat) {
        double totalCost = (oldStock * oldCMA) + (newStock * newPrixAchat);
        int totalStock = oldStock + newStock;
        double nouveauCMA = totalStock > 0 ? totalCost / totalStock : 0.0;
        return Math.round(nouveauCMA * 100.0) / 100.0; // Arrondi à 2 décimales
    }
    
    /**
     * Calcule le prix de vente basé sur le coût moyen d'acquisition et une marge
     * 
     * @param coupMoyenAcquisition Le coût moyen d'acquisition
     * @param margePourcentage Le pourcentage de marge (ex: 30.0 pour 30%)
     * @return Le prix de vente calculé
     */
    public static double calculerPrixVente(double coupMoyenAcquisition, double margePourcentage) {
        if (coupMoyenAcquisition <= 0) {
            return 0.0;
        }
        double prixVente = coupMoyenAcquisition * (1 + margePourcentage / 100.0);
        return Math.round(prixVente * 100.0) / 100.0; // Arrondi à 2 décimales
    }
    
    /**
     * Vérifie si deux prix sont significativement différents
     * 
     * @param prix1 Premier prix
     * @param prix2 Deuxième prix
     * @param tolerance Tolérance en pourcentage (ex: 0.01 pour 1 centime)
     * @return true si les prix sont significativement différents
     */
    public static boolean prixSignificativementDifferent(double prix1, double prix2, double tolerance) {
        return Math.abs(prix1 - prix2) > tolerance;
    }
}