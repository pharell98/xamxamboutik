package sn.boutique.xamxamboutik.Enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TypeFacture {
    COMPLETE("complete"),
    MINI_RECU("mini_recu");

    private final String key;

    TypeFacture(String key) {
        this.key = key;
    }

    @JsonValue
    public String getKey() {
        return key;
    }

    @JsonCreator
    public static TypeFacture fromValue(String value) {
        for (TypeFacture type : TypeFacture.values()) {
            if (type.key.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid type: " + value);
    }
}
