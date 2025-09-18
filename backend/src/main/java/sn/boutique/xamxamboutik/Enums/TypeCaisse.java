package sn.boutique.xamxamboutik.Enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TypeCaisse {
    GLOBALE("globale"),
    UTILISATEUR("utilisateur");

    private final String key;

    TypeCaisse(String key) {
        this.key = key;
    }

    @JsonValue
    public String getKey() {
        return key;
    }

    public String getLibelle() {
        return switch (this) {
            case GLOBALE -> "Caisse Globale";
            case UTILISATEUR -> "Caisse Utilisateur";
        };
    }

    @JsonCreator
    public static TypeCaisse fromValue(String value) {
        for (TypeCaisse type : TypeCaisse.values()) {
            if (type.key.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid TypeCaisse: " + value);
    }
}
