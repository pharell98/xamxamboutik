# 🎯 Guide d'Utilisation - Responsivité XamXamBoutik

## 📚 Introduction

Votre application utilise maintenant un système de responsivité **simplifié, performant et sans boucles infinies**.

## ✅ Problèmes Résolus

### Avant (❌ Ce qui ne fonctionnait pas)

- ❌ 6 hooks différents avec logique dupliquée
- ❌ 3 fichiers identiques (`Fixed`, `Old`, etc.)
- ❌ Breakpoints incohérents (768, 1024 vs 576, 768, 992)
- ❌ Boucles infinies avec `setTimeout` partout
- ❌ Provider inutilisé (`ResponsiveProvider`)
- ❌ Double écoute du `resize` event
- ❌ Maximum update depth exceeded

### Maintenant (✅ Solution)

- ✅ **1 seul hook** : `useResponsive()`
- ✅ **1 seul provider** : `AppProvider` (enrichi)
- ✅ **Breakpoints Bootstrap standard** (cohérents partout)
- ✅ **Aucune boucle infinie** grâce à `useCallback`
- ✅ **Performance optimisée** avec debounce 150ms
- ✅ **Architecture claire** et maintenable

---

## 🚀 Utilisation de Base

### 1️⃣ Dans n'importe quel composant

```javascript
import { useAppContext } from 'providers/AppProvider';

function MonComposant() {
  const { responsive } = useAppContext();

  return (
    <div>
      {responsive.isMobile && <p>Vue Mobile</p>}
      {responsive.isTablet && <p>Vue Tablette</p>}
      {responsive.isDesktop && <p>Vue Desktop</p>}
    </div>
  );
}
```

### 2️⃣ Toutes les propriétés disponibles

```javascript
const { responsive } = useAppContext();

// 📏 Dimensions
responsive.width; // 1920 (en pixels)
responsive.height; // 1080 (en pixels)
responsive.screenSize; // { width: 1920, height: 1080 }

// 📱 Breakpoints individuels
responsive.isXs; // < 576px
responsive.isSm; // 576-767px
responsive.isMd; // 768-991px
responsive.isLg; // 992-1199px
responsive.isXl; // 1200-1539px
responsive.isXxl; // >= 1540px

// 🎯 Catégories principales (RECOMMANDÉES)
responsive.isMobile; // < 768px
responsive.isTablet; // 768-991px
responsive.isDesktop; // >= 992px

// 🔄 Orientation
responsive.isLandscape; // true/false
responsive.isPortrait; // true/false

// 🛠️ Utilitaires
responsive.getCurrentBreakpoint(); // 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'
responsive.getResponsiveValue({}); // Helper pour valeurs conditionnelles
```

---

## 💡 Exemples Pratiques

### Exemple 1: Classes CSS conditionnelles

```javascript
function ProductCard({ product }) {
  const { responsive } = useAppContext();

  const cardClassName = `
    product-card
    ${responsive.isMobile ? 'p-2 mb-2' : 'p-4 mb-4'}
    ${responsive.isLandscape ? 'landscape-mode' : ''}
  `.trim();

  return (
    <Card className={cardClassName}>
      <Card.Body>
        <h5>{product.name}</h5>
        <p>{product.price} CFA</p>
      </Card.Body>
    </Card>
  );
}
```

### Exemple 2: Grille responsive Bootstrap

```javascript
function ProductGrid({ products }) {
  const { responsive } = useAppContext();

  return (
    <Row>
      {products.map(product => (
        <Col
          key={product.id}
          xs={12} // Mobile: 1 colonne
          sm={6} // Petit écran: 2 colonnes
          md={4} // Tablette: 3 colonnes
          lg={3} // Desktop: 4 colonnes
          xl={2} // Large desktop: 6 colonnes
        >
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
}
```

### Exemple 3: Composant différent selon l'écran

```javascript
function Checkout() {
  const { responsive } = useAppContext();

  // Mobile: version compacte
  if (responsive.isMobile) {
    return <CheckoutMobile />;
  }

  // Tablette: version intermédiaire
  if (responsive.isTablet) {
    return <CheckoutTablet />;
  }

  // Desktop: version complète
  return <CheckoutDesktop />;
}
```

### Exemple 4: Taille de boutons responsive

```javascript
function ActionButtons() {
  const { responsive } = useAppContext();

  const buttonSize = responsive.isMobile ? 'sm' : '';

  return (
    <div>
      <Button size={buttonSize} variant="primary">
        Ajouter au panier
      </Button>
      <Button size={buttonSize} variant="secondary">
        Annuler
      </Button>
    </div>
  );
}
```

### Exemple 5: Valeurs multiples avec getResponsiveValue

```javascript
function ProductImage({ product }) {
  const { responsive } = useAppContext();

  const imageSize = responsive.getResponsiveValue({
    xs: 150, // < 576px
    sm: 200, // 576-767px
    md: 250, // 768-991px
    lg: 300, // 992-1199px
    xl: 400, // 1200-1539px
    xxl: 500 // >= 1540px
  });

  return (
    <img
      src={product.image}
      width={imageSize}
      height={imageSize}
      alt={product.name}
    />
  );
}
```

### Exemple 6: Table responsive

```javascript
function ProductTable({ products }) {
  const { responsive } = useAppContext();

  return (
    <Table
      responsive
      striped
      hover={!responsive.isMobile}
      size={responsive.isMobile ? 'sm' : ''}
    >
      <thead>
        <tr>
          <th>Produit</th>
          {!responsive.isMobile && <th>Catégorie</th>}
          {responsive.isDesktop && <th>Description</th>}
          <th>Prix</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            {!responsive.isMobile && <td>{product.category}</td>}
            {responsive.isDesktop && <td>{product.description}</td>}
            <td>{product.price} CFA</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

### Exemple 7: Modal responsive

```javascript
function ProductModal({ show, onHide, product }) {
  const { responsive } = useAppContext();

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={responsive.isMobile ? '' : 'lg'}
      fullscreen={responsive.isMobile ? true : false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{/* Contenu */}</Modal.Body>
    </Modal>
  );
}
```

---

## 🔧 Configuration

### Breakpoints (définis dans `src/helpers/utils.js`)

```javascript
export const breakpoints = {
  xs: 0, // Extra small (mobile portrait)
  sm: 576, // Small (mobile landscape)
  md: 768, // Medium (tablette portrait) ← MOBILE/DESKTOP
  lg: 992, // Large (tablette landscape)
  xl: 1200, // Extra large (desktop)
  xxl: 1540 // Extra extra large (large desktop)
};
```

**⚠️ Point de rupture principal :**

- **< 768px** = Mobile (`isMobile`)
- **>= 768px** = Tablette/Desktop (`isTablet` ou `isDesktop`)

### Auto-fermeture de la sidebar

Le hook `useAutoCloseSidebar()` gère automatiquement :

**Pages concernées :**

- `/vente/*`
- `/gestion-vente/*`
- `/allSales`
- `/customer-details`
- `/Products`
- `/product-list`
- `/product-grid`
- `/dashboard/e-commerce`
- `/gestion-stock/allSales`

**Comportement :**

- **Mobile** : Ferme le menu burger
- **Desktop** : Réduit la sidebar verticale
- **Quitter ces pages** : Restaure la sidebar (desktop uniquement)

---

## 🎨 Bonnes Pratiques

### ✅ À FAIRE

```javascript
// ✅ Utiliser les catégories principales
if (responsive.isMobile) { ... }
if (responsive.isDesktop) { ... }

// ✅ Combiner plusieurs conditions
const className = `
  card
  ${responsive.isMobile ? 'mobile-card' : 'desktop-card'}
  ${responsive.isLandscape ? 'landscape' : 'portrait'}
`;

// ✅ Utiliser getResponsiveValue pour plusieurs valeurs
const columns = responsive.getResponsiveValue({
  mobile: 1,
  tablet: 2,
  desktop: 4
});
```

### ❌ À ÉVITER

```javascript
// ❌ Ne pas vérifier window.innerWidth directement
if (window.innerWidth < 768) { ... }  // NON !

// ❌ Ne pas créer de nouveaux hooks responsive
const [isMobile, setIsMobile] = useState(false);  // NON !

// ❌ Ne pas ajouter d'event listeners resize
window.addEventListener('resize', ...)  // NON !

// ❌ Ne pas hardcoder les breakpoints
if (width < 768) { ... }  // NON !
// Utiliser plutôt: if (responsive.isMobile) { ... }
```

---

## 🐛 Dépannage

### Problème : "responsive is undefined"

**Solution :** Vérifiez que vous êtes bien dans un composant enfant de `AppProvider`

```javascript
// ❌ Mauvais
function MyComponent() {
  const { responsive } = useAppContext();
  // ...
}

// ✅ Bon - Le composant doit être dans l'arbre de AppProvider
// index.js déjà configuré correctement :
<AppProvider>
  <RouterProvider router={router} />
</AppProvider>;
```

### Problème : Boucle infinie

**Cause :** Appeler `setConfig` dans un `useEffect` sans bonnes dépendances

**Solution :** Ne jamais appeler `setConfig` dans un `useEffect` qui dépend de `config`

```javascript
// ❌ Mauvais - Boucle infinie
useEffect(() => {
  setConfig('someKey', someValue);
}, [config, setConfig]); // config dans les dépendances !

// ✅ Bon
useEffect(() => {
  setConfig('someKey', someValue);
}, [someValue, setConfig]); // Pas config
```

### Problème : Trop de re-renders

**Cause :** Utiliser `responsive` dans trop de `useEffect`

**Solution :** Limiter les `useEffect` qui dépendent de `responsive`

```javascript
// ❌ Mauvais
useEffect(() => {
  // Beaucoup de logique
}, [responsive]); // Se déclenche à chaque resize

// ✅ Bon - Seulement ce qui est nécessaire
useEffect(() => {
  // Logique
}, [responsive.isMobile]); // Seulement quand ça change vraiment
```

---

## 📊 Performance

### Optimisations en place

1. **Debounce 150ms** : Le resize ne se déclenche qu'après 150ms sans changement
2. **useCallback** : Toutes les fonctions (`setConfig`, `changeTheme`) sont mémorisées
3. **useMemo** : Le contexte est mémorisé pour éviter les re-renders
4. **Un seul listener** : Un seul event listener pour toute l'app

### Résultat

- ⚡ **Rapide** : Aucun lag lors du resize
- 🔋 **Économe** : Pas de calculs inutiles
- 🚫 **Sans bug** : Aucune boucle infinie

---

## 📝 Checklist Migration

Si vous migrez du ancien code :

- [ ] Remplacer `useIsMobile()` par `useAppContext()` + `responsive.isMobile`
- [ ] Supprimer les imports de hooks supprimés
- [ ] Remplacer les checks de `window.innerWidth` par `responsive`
- [ ] Vérifier qu'aucun composant n'a son propre listener resize
- [ ] Tester sur mobile, tablette et desktop
- [ ] Vérifier qu'il n'y a pas de boucles infinies dans la console

---

**Dernière mise à jour :** 10 octobre 2025  
**Version :** 2.0 (Simplifiée et optimisée)
