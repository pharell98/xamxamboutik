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
}