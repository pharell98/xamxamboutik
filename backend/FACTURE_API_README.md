# 🧾 Système de Facturation XamXamBoutik - Documentation Complète

## 📋 Vue d'ensemble

Le système de facturation de XamXamBoutik est une solution complète qui permet de :
- **Générer automatiquement** des numéros de facture uniques au format FAC-JJ-MM-AA-0001
- **Créer des factures complètes** pour la comptabilité et les clients
- **Générer des mini reçus** pour imprimante thermique
- **Gérer les ventes à crédit** avec suivi des montants versés/restants
- **Rechercher et filtrer** les factures avec des critères avancés

---

## 🔢 Système de Numérotation des Factures

### **Format du Numéro de Facture**

```
FAC-JJ-MM-AA-0001
│   │  │  │  │
│   │  │  │  └── Numéro de séquence (0001 à 9999)
│   │  │  └───── Année (2 derniers chiffres)
│   │  └──────── Mois (01 à 12)
│   └─────────── Jour (01 à 31)
└─────────────── Préfixe fixe "FAC"
```

**Exemples :**
- `FAC-11-08-25-0001` : 11 août 2025, facture #0001
- `FAC-11-08-25-0002` : 11 août 2025, facture #0002
- `FAC-12-08-25-0001` : 12 août 2025, facture #0001 (nouveau jour)

### **Logique de Génération Automatique**

- **Chaque nouvelle vente** génère automatiquement un numéro de facture
- **Séquence quotidienne** : recommence à 0001 chaque jour
- **Maximum** : 9999 factures par jour
- **Gestion des changements** : jour, mois, année

### **Implémentation Technique**

```java
// Dans VenteService.java
private String generateNumeroFacture() {
    LocalDateTime now = LocalDateTime.now();
    String jour = String.format("%02d", now.getDayOfMonth());
    String mois = String.format("%02d", now.getMonthValue());
    String annee = String.format("%02d", now.getYear() % 100);
    
    String prefix = "FAC-" + jour + "-" + mois + "-" + annee + "-";
    
    // Récupérer le dernier numéro de facture du jour
    Optional<String> lastNumero = venteRepository.findLastNumeroFactureByPrefix(prefix);
    
    int sequence = 1;
    if (lastNumero.isPresent()) {
        String lastNum = lastNumero.get();
        String sequenceStr = lastNum.substring(lastNum.lastIndexOf("-") + 1);
        sequence = Integer.parseInt(sequenceStr) + 1;
    }
    
    return prefix + String.format("%04d", sequence);
}
```

---

## 🏗️ Architecture Technique

### **Structure des Packages**

```
📁 sn.boutique.xamxamboutik
├── 📁 Entity/vente/
│   ├── Vente.java (avec numeroFacture)
│   ├── DetailVente.java
│   ├── Paiement.java
│   └── RetourProduit.java
├── 📁 Repository/
│   ├── 📁 vente/
│   │   ├── FactureRepository.java
│   │   └── VenteRepository.java
│   └── 📁 Projection/
│       ├── FactureProjection.java
│       └── DetailFactureProjection.java
├── 📁 Service/vente/
│   ├── IFactureService.java
│   ├── FactureService.java
│   └── VenteService.java
├── 📁 Web/DTO/
│   ├── 📁 Request/
│   │   ├── FactureGenerateRequestDTO.java
│   │   └── FactureSearchRequestDTO.java
│   ├── 📁 Response/web/
│   │   ├── FactureResponseDTO.java
│   │   ├── MiniRecuResponseDTO.java
│   │   ├── FactureListResponseDTO.java
│   │   ├── ClientFactureDTO.java
│   │   ├── PaiementFactureDTO.java
│   │   ├── DetailFactureDTO.java
│   │   ├── DetailMiniRecuDTO.java
│   │   └── FactureSummaryDTO.java
│   └── 📁 Mapper/
│       ├── FactureMapper.java
│       └── FactureMapperImpl.java
└── 📁 Web/Controller/vente/
    └── FactureController.java
```

---

## 🚀 API Endpoints Disponibles

### **1. Génération de Factures**

#### **POST** `/api/factures/generate`
Génère une facture complète avec paramètres personnalisés.

**Body :**
```json
{
  "venteId": 123,
  "typeFacture": "complete",
  "inclureClient": true,
  "inclureDetails": true,
  "inclurePaiement": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Facture générée avec succès",
  "data": {
    "numeroFacture": "FAC-11-08-25-0001",
    "dateVenteFormatted": "11-08-2025",
    "client": {
      "nom": "bobo sow",
      "telephone": "777930609"
    },
    "paiement": {
      "modePaiement": "espece",
      "montantVerser": 20.0,
      "datePaiement": "2025-08-11T13:13:22.723605"
    },
    "detailFacture": [
      {
        "libelle": "style sport",
        "quantite": 1,
        "prix": 10.0,
        "montantTotal": 10.0
      }
    ],
    "montantTotal": 20.0,
    "montantPayer": 20.0,
    "montantRestant": 0.0,
    "estCredit": false,
    "dateGeneration": "11-08-2025 15:29:15"
  }
}
```

#### **POST** `/api/factures/generate-vente/{venteId}`
Génère une facture complète de manière simplifiée (endpoint raccourci).

**Paramètres :**
- `venteId` : ID de la vente

#### **POST** `/api/factures/generate-mini-recu`
Génère un mini reçu pour imprimante thermique.

**Body :** Même format que la génération de facture

**Réponse :**
```json
{
  "success": true,
  "message": "Mini reçu généré avec succès",
  "data": {
    "numeroFacture": "FAC-11-08-25-0001",
    "dateVente": "11-08-2025",
    "nomClient": "bobo sow",
    "telephoneClient": "777930609",
    "modePaiement": "espece",
    "detailFacture": [
      {
        "libelle": "style sport",
        "quantite": 1,
        "prix": 10.0,
        "montantTotal": 10.0
      }
    ],
    "montantTotal": 20.0,
    "montantPayer": 20.0,
    "montantRestant": 0.0,
    "messageFooter": "Merci de votre confiance !",
    "dateGeneration": "11-08-2025 15:29:15"
  }
}
```

#### **POST** `/api/factures/generate-mini-recu-vente/{venteId}`
Génère un mini reçu de manière simplifiée.

### **2. Récupération de Factures**

#### **GET** `/api/factures/all`
Récupère toutes les ventes avec pagination.

**Paramètres de requête :**
- `page` : Numéro de page (défaut: 0)
- `size` : Taille de la page (défaut: 20)

**Exemple :**
```
GET /api/factures/all?page=0&size=10
```

**Réponse :**
```json
{
  "success": true,
  "message": "Ventes récupérées avec succès",
  "data": {
    "factures": [
      {
        "numeroFacture": "FAC-11-08-25-0001",
        "dateVente": "2025-08-11T13:13:22.70279",
        "nomClient": "bobo sow",
        "telephoneClient": "777930609",
        "modePaiement": "espece",
        "montantTotal": 20.0,
        "montantPayer": 20.0,
        "montantRestant": 0.0,
        "estCredit": false
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

#### **GET** `/api/factures/{numeroFacture}`
Récupère une facture complète par son numéro.

**Paramètres :**
- `numeroFacture` : Numéro de la facture (ex: FAC-11-08-25-0001)

#### **GET** `/api/factures/vente/{venteId}`
Récupère une facture par ID de vente.

**Paramètres :**
- `venteId` : ID de la vente

#### **GET** `/api/factures/{numeroFacture}/mini-recu`
Récupère un mini reçu par numéro de facture.

### **3. Recherche et Filtrage**

#### **POST** `/api/factures/search`
Recherche de factures avec filtres avancés et pagination.

**Body :**
```json
{
  "numeroFacture": "FAC-11-08-25",
  "dateDebut": "2025-08-01",
  "dateFin": "2025-08-31",
  "nomClient": "bobo",
  "telephoneClient": "777",
  "modePaiement": "espece",
  "estCredit": false,
  "montantMin": 10.0,
  "montantMax": 100.0,
  "page": 0,
  "size": 20
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Recherche effectuée avec succès",
  "data": {
    "factures": [
      {
        "numeroFacture": "FAC-11-08-25-0001",
        "dateVente": "2025-08-11T13:13:22.70279",
        "nomClient": "bobo sow",
        "telephoneClient": "777930609",
        "modePaiement": "espece",
        "montantTotal": 20.0,
        "montantPayer": 20.0,
        "montantRestant": 0.0,
        "estCredit": false
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

### **4. Utilitaires**

#### **GET** `/api/factures/exists/{numeroFacture}`
Vérifie si un numéro de facture existe.

**Réponse :**
```json
{
  "success": true,
  "message": "Numéro de facture existe",
  "data": true
}
```

---

## 🔍 Modèles de Données (DTOs)

### **DTOs de Requête**

#### **FactureGenerateRequestDTO**
```java
@Data
public class FactureGenerateRequestDTO {
    private Long venteId;                    // ID de la vente
    private TypeFacture typeFacture;         // COMPLETE ou MINI_RECU
    private Boolean inclureClient;           // Inclure les infos client
    private Boolean inclureDetails;          // Inclure les détails produits
    private Boolean inclurePaiement;         // Inclure les infos paiement
}
```

#### **FactureSearchRequestDTO**
```java
@Data
public class FactureSearchRequestDTO {
    private String numeroFacture;            // Numéro de facture
    private LocalDate dateDebut;            // Date de début
    private LocalDate dateFin;              // Date de fin
    private String nomClient;               // Nom du client
    private String telephoneClient;         // Téléphone du client
    private ModePaiement modePaiement;      // Mode de paiement
    private Boolean estCredit;              // Vente à crédit
    private Double montantMin;              // Montant minimum
    private Double montantMax;              // Montant maximum
    private Integer page;                   // Page (défaut: 0)
    private Integer size;                   // Taille (défaut: 20)
}
```

### **DTOs de Réponse**

#### **FactureResponseDTO (Facture Complète)**
```java
@Data
public class FactureResponseDTO {
    private String numeroFacture;            // Numéro unique de la facture
    private String dateVenteFormatted;      // Date formatée "dd-MM-yyyy"
    private ClientFactureDTO client;        // Informations client
    private PaiementFactureDTO paiement;    // Informations paiement
    private List<DetailFactureDTO> detailFacture; // Détails des produits
    private Double montantTotal;            // Montant total de la vente
    private Double montantPayer;            // Montant déjà payé
    private Double montantRestant;          // Montant restant à payer
    private Boolean estCredit;              // Si la vente est à crédit
    private String dateGeneration;          // Date de génération formatée
}
```

#### **MiniRecuResponseDTO (Mini Reçu)**
```java
@Data
public class MiniRecuResponseDTO {
    private String numeroFacture;            // Numéro de la facture
    private String dateVente;               // Date formatée "dd-MM-yyyy"
    private String nomClient;               // Nom du client
    private String telephoneClient;         // Téléphone du client
    private ModePaiement modePaiement;      // Mode de paiement
    private List<DetailMiniRecuDTO> detailFacture; // Détails produits
    private Double montantTotal;            // Montant total
    private Double montantPayer;            // Montant payé
    private Double montantRestant;          // Montant restant
    private String messageFooter;           // Message de fin
    private String dateGeneration;          // Date de génération formatée
}
```

---

## 🔍 Projections JPA

### **FactureProjection**
```java
public interface FactureProjection {
    // Informations de base de la vente
    Long getVenteId();
    String getNumeroFacture();
    LocalDateTime getDateVente();
    Double getMontantTotal();
    Double getMontantRestant();
    Boolean getEstCredit();
    
    // Informations du client
    Long getClientId();
    String getNomClient();
    String getTelephoneClient();
    
    // Informations du paiement
    Long getPaiementId();
    ModePaiement getModePaiement();
    Double getMontantVerser();
    LocalDateTime getDatePaiement();
}
```

### **DetailFactureProjection**
```java
public interface DetailFactureProjection {
    Long getDetailVenteId();
    String getLibelleProduit();
    Integer getQuantiteVendu();
    Double getPrixVente();
    Double getMontantTotal();
    StatusDetailVente getStatus();
    Long getProduitId();
    Long getVenteId();
}
```

---

## 🗄️ Repository et Requêtes

### **FactureRepository**
```java
@Repository
public interface FactureRepository extends SoftDeleteRepository<Vente, Long> {
    
    // Récupération par numéro de facture
    Optional<FactureProjection> findFactureByNumero(String numeroFacture);
    
    // Récupération par ID de vente
    Optional<FactureProjection> findFactureByVenteId(Long venteId);
    
    // Récupération des détails des produits
    List<DetailFactureProjection> findDetailVentesByVenteId(Long venteId);
    
    // Recherche avec filtres avancés
    Page<FactureProjection> searchFactures(
        String numeroFacture, LocalDateTime dateDebut, LocalDateTime dateFin,
        String nomClient, String telephoneClient, String modePaiement,
        Boolean estCredit, Double montantMin, Double montantMax, Pageable pageable
    );
    
    // Vérification d'existence
    boolean existsByNumeroFacture(String numeroFacture);
}
```

### **Requêtes Optimisées**

#### **Recherche de Facture par Numéro**
```sql
SELECT 
    v.id AS venteId,
    v.numeroFacture AS numeroFacture,
    v.date AS dateVente,
    v.montantTotal AS montantTotal,
    v.montantRestant AS montantRestant,
    v.estCredit AS estCredit,
    c.id AS clientId,
    c.nomComplet AS nomClient,
    c.telephone AS telephoneClient,
    p.id AS paiementId,
    p.modePaiement AS modePaiement,
    p.montantVerser AS montantVerser,
    p.datePaiement AS datePaiement
FROM Vente v
LEFT JOIN v.client c
LEFT JOIN v.paiement p
WHERE v.numeroFacture = :numeroFacture
AND v.deleted = false
```

#### **Récupération des Détails Produits**
```sql
SELECT 
    dv.id AS detailVenteId,
    p.libelle AS libelleProduit,
    dv.quantiteVendu AS quantiteVendu,
    dv.prixVente AS prixVente,
    dv.montantTotal AS montantTotal,
    dv.status AS status,
    p.id AS produitId,
    v.id AS venteId
FROM DetailVente dv
JOIN dv.vente v
JOIN dv.produit p
WHERE v.id = :venteId
AND v.deleted = false
```

---

## ⚙️ Services et Logique Métier

### **IFactureService (Interface)**
```java
public interface IFactureService {
    
    // Génération de factures
    FactureResponseDTO generateFacture(FactureGenerateRequestDTO request);
    MiniRecuResponseDTO generateMiniRecu(FactureGenerateRequestDTO request);
    
    // Récupération de factures
    FactureResponseDTO getFactureByNumero(String numeroFacture);
    FactureResponseDTO getFactureByVenteId(Long venteId);
    
    // Recherche et filtrage
    FactureListResponseDTO searchFactures(FactureSearchRequestDTO request);
    
    // Utilitaires
    boolean existsByNumeroFacture(String numeroFacture);
    MiniRecuResponseDTO getMiniRecuByNumero(String numeroFacture);
}
```

### **FactureService (Implémentation)**
```java
@Service
@Transactional
public class FactureService implements IFactureService {
    
    @Override
    public FactureResponseDTO generateFacture(FactureGenerateRequestDTO request) {
        // 1. Récupérer la vente
        Vente vente = venteRepository.findById(request.getVenteId())
            .orElseThrow(() -> new EntityNotFoundException("Vente introuvable"));
        
        // 2. Vérifier le numéro de facture
        if (vente.getNumeroFacture() == null) {
            throw new IllegalStateException("La vente n'a pas de numéro de facture");
        }
        
        // 3. Récupérer les données de la facture
        FactureProjection factureData = factureRepository.findFactureByVenteId(request.getVenteId())
            .orElseThrow(() -> new EntityNotFoundException("Données de facture introuvables"));
        
        // 4. Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(request.getVenteId());
        
        // 5. Générer la facture complète
        return factureMapper.toFactureResponseDTO(factureData, details, "complete");
    }
}
```

---

## 🔄 Mapping et Conversion

### **FactureMapper (Interface)**
```java
public interface FactureMapper {
    
    // Conversion vers DTO de facture complète
    FactureResponseDTO toFactureResponseDTO(
        FactureProjection projection, 
        List<DetailFactureProjection> details, 
        String typeFacture
    );
    
    // Conversion vers DTO de mini reçu
    MiniRecuResponseDTO toMiniRecuResponseDTO(
        FactureProjection projection, 
        List<DetailFactureProjection> details
    );
    
    // Conversion vers DTO de liste de factures
    FactureListResponseDTO toFactureListResponseDTO(Page<FactureProjection> projectionsPage);
}
```

### **FactureMapperImpl (Implémentation)**
```java
@Component
public class FactureMapperImpl implements FactureMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
    
    @Override
    public FactureResponseDTO toFactureResponseDTO(FactureProjection projection, List<DetailFactureProjection> details, String typeFacture) {
        FactureResponseDTO dto = new FactureResponseDTO();
        
        // Mapping des données de base
        dto.setNumeroFacture(projection.getNumeroFacture());
        dto.setDateVenteFormatted(projection.getDateVente().format(DATE_FORMATTER));
        dto.setMontantTotal(projection.getMontantTotal());
        dto.setMontantRestant(projection.getMontantRestant());
        dto.setEstCredit(projection.getEstCredit());
        dto.setDateGeneration(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        
        // Mapping du client
        if (projection.getNomClient() != null || projection.getTelephoneClient() != null) {
            ClientFactureDTO clientDto = new ClientFactureDTO();
            clientDto.setNom(projection.getNomClient());
            clientDto.setTelephone(projection.getTelephoneClient());
            dto.setClient(clientDto);
        }
        
        // Mapping du paiement
        if (projection.getModePaiement() != null) {
            PaiementFactureDTO paiementDto = new PaiementFactureDTO();
            paiementDto.setModePaiement(projection.getModePaiement());
            paiementDto.setMontantVerser(projection.getMontantVerser());
            paiementDto.setDatePaiement(projection.getDatePaiement());
            dto.setPaiement(paiementDto);
            dto.setMontantPayer(projection.getMontantVerser());
        }
        
        // Mapping des détails des produits
        if (details != null && !details.isEmpty()) {
            List<DetailFactureDTO> detailDtos = details.stream()
                .map(this::toDetailFactureDTO)
                .collect(Collectors.toList());
            dto.setDetailFacture(detailDtos);
        }
        
        return dto;
    }
}
```

---

## 🌐 Contrôleur REST

### **FactureController**
```java
@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "*")
public class FactureController {
    
    private final IFactureService factureService;
    
    // Génération de factures
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> generateFacture(@Valid @RequestBody FactureGenerateRequestDTO request);
    
    @PostMapping("/generate-vente/{venteId}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> generateFactureSimple(@PathVariable Long venteId);
    
    // Génération de mini reçus
    @PostMapping("/generate-mini-recu")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> generateMiniRecu(@Valid @RequestBody FactureGenerateRequestDTO request);
    
    @PostMapping("/generate-mini-recu-vente/{venteId}")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> generateMiniRecuSimple(@PathVariable Long venteId);
    
    // Récupération de factures
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<FactureResponseDTO>>> getAllVentes(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size);
    
    @GetMapping("/{numeroFacture}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByNumero(@PathVariable String numeroFacture);
    
    @GetMapping("/vente/{venteId}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByVenteId(@PathVariable Long venteId);
    
    // Mini reçus
    @GetMapping("/{numeroFacture}/mini-recu")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> getMiniRecuByNumero(@PathVariable String numeroFacture);
    
    // Recherche et filtrage
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> searchFactures(@Valid @RequestBody FactureSearchRequestDTO request);
    
    // Utilitaires
    @GetMapping("/exists/{numeroFacture}")
    public ResponseEntity<ApiResponse<Boolean>> existsByNumeroFacture(@PathVariable String numeroFacture);
}
```

---

## 🔧 Utilisation Pratique

### **Génération d'une Facture Complète**

```bash
curl -X POST "http://localhost:8080/api/factures/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "venteId": 123,
    "typeFacture": "complete"
  }'
```

### **Génération d'une Facture par ID de Vente (Simplifié)**

```bash
curl -X POST "http://localhost:8080/api/factures/generate-vente/123" \
  -H "Content-Type: application/json"
```

### **Génération d'un Mini Reçu**

```bash
curl -X POST "http://localhost:8080/api/factures/generate-mini-recu" \
  -H "Content-Type: application/json" \
  -d '{
    "venteId": 123,
    "typeFacture": "mini_recu"
  }'
```

### **Génération d'un Mini Reçu par ID de Vente (Simplifié)**

```bash
curl -X POST "http://localhost:8080/api/factures/generate-mini-recu-vente/123" \
  -H "Content-Type: application/json"
```

### **Récupération de Toutes les Ventes**

```bash
curl -X GET "http://localhost:8080/api/factures/all?page=0&size=10" \
  -H "Content-Type: application/json"
```

### **Recherche de Factures**

```bash
curl -X POST "http://localhost:8080/api/factures/search" \
  -H "Content-Type: application/json" \
  -d '{
    "dateDebut": "2025-08-01",
    "dateFin": "2025-08-31",
    "page": 0,
    "size": 10
  }'
```

---

## 📱 Cas d'Usage

### **1. Impression de Facture Complète**
- Utiliser `/api/factures/generate/{venteId}`
- Format détaillé avec toutes les informations
- Idéal pour la comptabilité et les clients

### **2. Impression de Mini Reçu**
- Utiliser `/api/factures/generate-mini-recu/{venteId}`
- Format compact pour imprimante thermique
- Parfait pour les reçus de caisse

### **3. Recherche et Filtrage**
- Utiliser `/api/factures/search`
- Filtres par date, client, montant, etc.
- Pagination pour de grandes quantités

### **4. Vérification d'Existence**
- Utiliser `/api/factures/exists/{numeroFacture}`
- Validation avant génération
- Éviter les doublons

---

## ⚠️ Gestion des Erreurs

### **Codes d'Erreur Courants**

- **400** : Données de requête invalides
- **404** : Facture ou vente introuvable
- **500** : Erreur interne du serveur

### **Messages d'Erreur**

```json
{
  "success": false,
  "message": "Vente introuvable (ID: 999)",
  "data": null,
  "timestamp": "2025-08-11T15:29:15.939657"
}
```

### **Exceptions Gérées**

- `EntityNotFoundException` : Vente ou facture introuvable
- `IllegalStateException` : Vente sans numéro de facture
- `BaseCustomException` : Erreurs métier personnalisées

---

## 🚀 Bonnes Pratiques

1. **Validation** : Toujours valider les données d'entrée
2. **Gestion d'erreurs** : Capturer et traiter les exceptions
3. **Logging** : Logger les opérations importantes
4. **Performance** : Utiliser la pagination pour les grandes listes
5. **Sécurité** : Valider les permissions d'accès

---

## 🧪 Tests

Des tests unitaires sont disponibles dans `NumeroFactureGeneratorTest.java` pour valider :
- La génération correcte des numéros
- L'extraction des informations
- La validation des formats
- Les cas limites (changement de date, séquences multiples)

---

## 📈 Avantages du Système

1. **✅ Automatisation** : Génération automatique des numéros de facture
2. **✅ Flexibilité** : Support de factures complètes et mini reçus
3. **✅ Performance** : Projections JPA optimisées
4. **✅ Robustesse** : Gestion d'erreurs complète
5. **✅ Évolutivité** : Architecture modulaire et extensible
6. **✅ Documentation** : Guide complet d'utilisation
7. **✅ Standards** : Respect des bonnes pratiques Spring Boot
8. **✅ Unicité** : Chaque facture a un numéro unique
9. **✅ Traçabilité** : Le numéro contient la date de création
10. **✅ Séquentialité** : Ordre chronologique des factures

---

## ⚠️ Limitations

1. **Maximum 9999 factures par jour** (suffisant pour la plupart des cas d'usage)
2. **Format fixe** : Le format ne peut pas être modifié sans changer le code
3. **Dépendance à la date système** : La date de création détermine le numéro

---

## 🔧 Maintenance

### **Ajout de Nouveaux Formats**
Pour ajouter un nouveau format de numérotation, modifier :
1. La méthode `generateNumeroFacture()` dans `VenteService`
2. La méthode `findLastNumeroFactureByPrefix()` dans `VenteRepository`
3. L'utilitaire `NumeroFactureGenerator` si nécessaire

### **Migration des Données Existantes**
Si des ventes existent sans numéro de facture, exécuter une requête SQL pour les mettre à jour :
```sql
UPDATE ventes 
SET numero_facture = CONCAT('FAC-', 
                           LPAD(DAY(date), 2, '0'), '-',
                           LPAD(MONTH(date), 2, '0'), '-',
                           LPAD(YEAR(date) % 100, 2, '0'), '-',
                           LPAD(id, 4, '0'))
WHERE numero_facture IS NULL;
```

---

## 🔮 Évolutions Futures

### **Fonctionnalités Possibles**
- Génération de PDF pour les factures
- Envoi par email automatique
- Intégration avec des systèmes comptables
- Historique des modifications de factures

### **Améliorations Techniques**
- Cache Redis pour les factures fréquemment consultées
- Génération asynchrone des factures
- Webhooks pour notifier les systèmes externes
- API GraphQL pour des requêtes plus flexibles

---

## 🔄 Workflow Typique

1. **Créer une vente** via l'API de vente
2. **Générer automatiquement** le numéro de facture au format FAC-JJ-MM-AA-0001
3. **Générer la facture** via `/api/factures/generate-vente/{venteId}`
4. **Générer le mini reçu** via `/api/factures/generate-mini-recu-vente/{venteId}`
5. **Consulter toutes les ventes** via `/api/factures/all?page=0&size=20`
6. **Imprimer** selon le format souhaité
7. **Archiver** ou stocker selon les besoins

---

**🎯 Le système de facturation de XamXamBoutik est une solution complète, robuste et évolutive qui répond à tous les besoins de gestion des factures et reçus !**

Cette documentation unifiée couvre tous les aspects techniques et fonctionnels du système de facturation, de la génération automatique des numéros à l'utilisation complète de l'API.