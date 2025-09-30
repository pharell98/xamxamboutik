package sn.boutique.xamxamboutik.Util;

import java.time.LocalDateTime;

/**
 * Utilitaire pour la génération des numéros de facture
 * Format: FAC-JJ-MM-AA-0001
 * Exemple: FAC-15-12-24-0001 (15 décembre 2024, facture #0001)
 */
public class NumeroFactureGenerator {

    /**
     * Génère un numéro de facture au format standard
     *
     * @param date     La date de la facture
     * @param sequence Le numéro de séquence (commence à 1)
     * @return Le numéro de facture formaté
     */
    public static String generateNumeroFacture(LocalDateTime date, int sequence) {
        String jour = String.format("%02d", date.getDayOfMonth());
        String mois = String.format("%02d", date.getMonthValue());
        String annee = String.format("%02d", date.getYear() % 100); // 2 derniers chiffres

        return String.format("FAC-%s-%s-%s-%04d", jour, mois, annee, sequence);
    }

    /**
     * Génère un numéro de facture pour la date actuelle
     *
     * @param sequence Le numéro de séquence
     * @return Le numéro de facture formaté
     */
    public static String generateNumeroFacture(int sequence) {
        return generateNumeroFacture(LocalDateTime.now(), sequence);
    }

    /**
     * Extrait la date d'un numéro de facture existant
     *
     * @param numeroFacture Le numéro de facture (ex: FAC-15-12-24-0001)
     * @return La date extraite ou null si format invalide
     */
    public static LocalDateTime extractDateFromNumero(String numeroFacture) {
        try {
            if (numeroFacture == null || !numeroFacture.startsWith("FAC-")) {
                return null;
            }

            String[] parts = numeroFacture.split("-");
            if (parts.length != 5) {
                return null;
            }

            int jour = Integer.parseInt(parts[1]);
            int mois = Integer.parseInt(parts[2]);
            int annee = 2000 + Integer.parseInt(parts[3]); // Ajoute 2000 pour avoir l'année complète

            return LocalDateTime.of(annee, mois, jour, 0, 0);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Extrait le numéro de séquence d'un numéro de facture
     *
     * @param numeroFacture Le numéro de facture
     * @return Le numéro de séquence ou -1 si invalide
     */
    public static int extractSequenceFromNumero(String numeroFacture) {
        try {
            if (numeroFacture == null || !numeroFacture.startsWith("FAC-")) {
                return -1;
            }

            String[] parts = numeroFacture.split("-");
            if (parts.length != 5) {
                return -1;
            }

            return Integer.parseInt(parts[4]);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /**
     * Vérifie si un numéro de facture a un format valide
     *
     * @param numeroFacture Le numéro à vérifier
     * @return true si le format est valide
     */
    public static boolean isValidFormat(String numeroFacture) {
        if (numeroFacture == null || !numeroFacture.startsWith("FAC-")) {
            return false;
        }

        String[] parts = numeroFacture.split("-");
        if (parts.length != 5) {
            return false;
        }

        try {
            int jour = Integer.parseInt(parts[1]);
            int mois = Integer.parseInt(parts[2]);
            int annee = Integer.parseInt(parts[3]);
            int sequence = Integer.parseInt(parts[4]);

            return jour >= 1 && jour <= 31 &&
                    mois >= 1 && mois <= 12 &&
                    annee >= 0 && annee <= 99 &&
                    sequence >= 1 && sequence <= 9999;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
