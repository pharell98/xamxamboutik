package sn.boutique.xamxamboutik.Enums;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
public enum ModePaiement {
    ESPECE("espece"),
    ORANGE_MONEY("orange_money"),
    WAVE("wave"),
    CART_BANCAIRE("cart_bancaire");
    private final String key;
    ModePaiement(String key) {
        this.key = key;
    }
    @JsonValue
    public String getKey() {
        return key;
    }
    @JsonCreator
    public static ModePaiement fromValue(String value) {
        for (ModePaiement mode : ModePaiement.values()) {
            if (mode.key.equalsIgnoreCase(value)) {
                return mode;
            }
        }
        throw new IllegalArgumentException("Invalid mode: " + value);
    }
}
