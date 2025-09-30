// Script de test pour déboguer le problème d'import Excel
// Ce script simule l'import d'un produit existant

import java.util.Optional;

public class TestImportDebug {
    
    public static void main(String[] args) {
        // Simulation des données du fichier Excel
        String libelleExcel = "dove concombre";
        String libelleNormalise = libelleExcel.trim().toLowerCase();
        
        System.out.println("Libellé Excel: '" + libelleExcel + "'");
        System.out.println("Libellé normalisé: '" + libelleNormalise + "'");
        
        // Simulation de la recherche en base
        String libelleEnBase = "dove concombre"; // tel qu'il est stocké en base
        String libelleEnBaseNormalise = libelleEnBase.toLowerCase();
        
        System.out.println("Libellé en base: '" + libelleEnBase + "'");
        System.out.println("Libellé en base normalisé: '" + libelleEnBaseNormalise + "'");
        
        // Test de comparaison
        boolean match = libelleNormalise.equals(libelleEnBaseNormalise);
        System.out.println("Match trouvé: " + match);
        
        // Test avec des espaces
        String libelleAvecEspaces = "  dove concombre  ";
        String libelleAvecEspacesNormalise = libelleAvecEspaces.trim().toLowerCase();
        System.out.println("Libellé avec espaces normalisé: '" + libelleAvecEspacesNormalise + "'");
        
        boolean matchAvecEspaces = libelleAvecEspacesNormalise.equals(libelleEnBaseNormalise);
        System.out.println("Match avec espaces: " + matchAvecEspaces);
    }
}
