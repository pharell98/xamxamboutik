package sn.boutique.xamxamboutik.Enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TypeMouvement {
    VENTE("vente"),
    RETOUR("retour"),
    DEPENSE("depense"),
    OUVERTURE_JOURNEE("ouverture_journee"),
    FERMETURE_JOURNEE("fermeture_journee"),
    CORRECTION("correction");

    private final String key;

    TypeMouvement(String key) {
        this.key = key;
    }

    @JsonValue
    public String getKey() {
        return key;
    }

    public String getLibelle() {
        return switch (this) {
            case VENTE -> "Encaissement vente";
            case RETOUR -> "Remboursement retour";
            case DEPENSE -> "Sortie dépense";
            case OUVERTURE_JOURNEE -> "Ouverture journée";
            case FERMETURE_JOURNEE -> "Fermeture journée";
            case CORRECTION -> "Correction manuelle";
        };
    }

    @JsonCreator
    public static TypeMouvement fromValue(String value) {
        for (TypeMouvement type : TypeMouvement.values()) {
            if (type.key.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid TypeMouvement: " + value);
    }
}
