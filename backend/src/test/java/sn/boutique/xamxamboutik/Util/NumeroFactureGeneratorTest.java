package sn.boutique.xamxamboutik.Util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

@DisplayName("Tests pour NumeroFactureGenerator")
public class NumeroFactureGeneratorTest {

    @Test
    @DisplayName("Génération d'un numéro de facture avec date spécifique")
    public void testGenerateNumeroFactureWithDate() {
        LocalDateTime date = LocalDateTime.of(2024, 12, 15, 10, 30);
        String numero = NumeroFactureGenerator.generateNumeroFacture(date, 1);
        assertEquals("FAC-15-12-24-0001", numero);
    }

    @Test
    @DisplayName("Génération d'un numéro de facture avec séquence à 2 chiffres")
    public void testGenerateNumeroFactureWithTwoDigitSequence() {
        LocalDateTime date = LocalDateTime.of(2024, 12, 15, 10, 30);
        String numero = NumeroFactureGenerator.generateNumeroFacture(date, 42);
        assertEquals("FAC-15-12-24-0042", numero);
    }

    @Test
    @DisplayName("Génération d'un numéro de facture avec séquence à 4 chiffres")
    public void testGenerateNumeroFactureWithFourDigitSequence() {
        LocalDateTime date = LocalDateTime.of(2024, 12, 15, 10, 30);
        String numero = NumeroFactureGenerator.generateNumeroFacture(date, 9999);
        assertEquals("FAC-15-12-24-9999", numero);
    }

    @Test
    @DisplayName("Extraction de date depuis un numéro de facture valide")
    public void testExtractDateFromNumero() {
        String numero = "FAC-15-12-24-0001";
        LocalDateTime date = NumeroFactureGenerator.extractDateFromNumero(numero);
        assertNotNull(date);
        assertEquals(15, date.getDayOfMonth());
        assertEquals(12, date.getMonthValue());
        assertEquals(2024, date.getYear());
    }

    @Test
    @DisplayName("Extraction de séquence depuis un numéro de facture valide")
    public void testExtractSequenceFromNumero() {
        String numero = "FAC-15-12-24-0042";
        int sequence = NumeroFactureGenerator.extractSequenceFromNumero(numero);
        assertEquals(42, sequence);
    }

    @Test
    @DisplayName("Validation du format d'un numéro de facture valide")
    public void testIsValidFormatWithValidNumero() {
        String numero = "FAC-15-12-24-0001";
        assertTrue(NumeroFactureGenerator.isValidFormat(numero));
    }

    @Test
    @DisplayName("Validation du format d'un numéro de facture invalide")
    public void testIsValidFormatWithInvalidNumero() {
        String numero = "INVALID-15-12-24-0001";
        assertFalse(NumeroFactureGenerator.isValidFormat(numero));
    }

    @Test
    @DisplayName("Génération de plusieurs numéros pour la même date")
    public void testGenerateMultipleNumerosForSameDate() {
        LocalDateTime date = LocalDateTime.of(2024, 12, 15, 10, 30);
        
        String numero1 = NumeroFactureGenerator.generateNumeroFacture(date, 1);
        String numero2 = NumeroFactureGenerator.generateNumeroFacture(date, 2);
        String numero3 = NumeroFactureGenerator.generateNumeroFacture(date, 3);
        
        assertEquals("FAC-15-12-24-0001", numero1);
        assertEquals("FAC-15-12-24-0002", numero2);
        assertEquals("FAC-15-12-24-0003", numero3);
    }

    @Test
    @DisplayName("Génération avec date de fin d'année")
    public void testGenerateNumeroAtYearEnd() {
        LocalDateTime date = LocalDateTime.of(2024, 12, 31, 23, 59);
        String numero = NumeroFactureGenerator.generateNumeroFacture(date, 1);
        assertEquals("FAC-31-12-24-0001", numero);
    }

    @Test
    @DisplayName("Génération avec date de début d'année")
    public void testGenerateNumeroAtYearStart() {
        LocalDateTime date = LocalDateTime.of(2025, 1, 1, 0, 0);
        String numero = NumeroFactureGenerator.generateNumeroFacture(date, 1);
        assertEquals("FAC-01-01-25-0001", numero);
    }
}
