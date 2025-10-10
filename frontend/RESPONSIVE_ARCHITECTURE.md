# 📱 Architecture Responsive - XamXamBoutik

## 🎯 Vue d'ensemble

Cette application utilise maintenant une architecture responsive **simple, performante et centralisée**.

## 🏗️ Structure

### 1️⃣ Hook Principal : `useResponsive()`

**Fichier**: `src/hooks/useResponsive.js`

Hook unique et simple qui fournit toutes les informations nécessaires sur la taille d'écran.

```javascript
import { useAppContext } from 'providers/AppProvider';

function MyComponent() {
  const { responsive } = useAppContext();

  // Utilisation simple
  if (responsive.isMobile) {
    return <MobileView />;
  }

  return <DesktopView />;
}
```

#### Breakpoints (Bootstrap standard)

- **xs**: < 576px
- **sm**: 576-767px
- **md**: 768-991px
- **tablet**: 768-991px
- **lg**: 992-1199px
- **xl**: 1200-1539px
- **xxl**: >= 1540px

#### Catégories principales

- **isMobile**: < 768px
- **isTablet**: 768-991px
- **isDesktop**: >= 992px

#### Propriétés disponibles

```javascript
const {
  // Dimensions
  width, // Largeur en pixels
  height, // Hauteur en pixels
  screenSize, // { width, height }

  // Breakpoints individuels
  isXs,
  isSm,
  isMd,
  isLg,
  isXl,
  isXxl,

  // Catégories
  isMobile, // < 768px
  isTablet, // 768-991px
  isDesktop, // >= 992px

  // Helpers
  isSmallScreen, // < 576px
  isMediumScreen, // 576-767px
  isLargeScreen, // 768-991px
  isExtraLargeScreen, // >= 992px

  // Orientation
  isLandscape,
  isPortrait,

  // Utilitaires
  getCurrentBreakpoint, // Retourne 'xs', 'sm', 'md', etc.
  getResponsiveValue // Fonction helper
} = responsive;
```

### 2️⃣ Provider Central : `AppProvider`

**Fichier**: `src/providers/AppProvider.js`

Le `AppProvider` contient maintenant le hook `useResponsive` et l'expose via le contexte.

**✅ Avantages:**

- Un seul hook responsive pour toute l'app
- Pas de re-render inutiles
- Performance optimisée avec debounce (150ms)
- Accessible partout via `useAppContext()`

### 3️⃣ Hook Auto-Close Sidebar : `useAutoCloseSidebar()`

**Fichier**: `src/hooks/useAutoCloseSidebar.js`

Hook dédié à la gestion automatique de la sidebar sur les pages de vente.

**Comportement:**

- **Mobile** (< 768px): Ferme le menu burger
- **Desktop** (>= 992px): Réduit la sidebar verticale
- **Restauration automatique**: Rouvre la sidebar quand on quitte les pages de vente (desktop uniquement)

**Pages concernées:**

- `/vente/*`
- `/gestion-vente/*`
- `/allSales`
- `/customer-details`
- `/Products`
- `/product-list`
- `/product-grid`
- `/dashboard/e-commerce`
- `/gestion-stock/allSales`

## 📋 Comment utiliser

### Exemple 1: Affichage conditionnel

```javascript
import { useAppContext } from 'providers/AppProvider';

function ProductCard() {
  const { responsive } = useAppContext();

  return (
    <Card className={responsive.isMobile ? 'p-2' : 'p-4'}>
      {responsive.isMobile ? <CompactProductView /> : <DetailedProductView />}
    </Card>
  );
}
```

### Exemple 2: Valeurs responsives

```javascript
function ProductGrid() {
  const { responsive } = useAppContext();

  // Définir des valeurs différentes par breakpoint
  const columns = responsive.getResponsiveValue({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  });

  return (
    <Row>
      {products.map(product => (
        <Col xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
}
```

### Exemple 3: Classes CSS conditionnelles

```javascript
function MyComponent() {
  const { responsive } = useAppContext();

  const className = `
    component
    ${responsive.isMobile ? 'mobile-view' : 'desktop-view'}
    ${responsive.isLandscape ? 'landscape' : 'portrait'}
  `;

  return <div className={className}>...</div>;
}
```

## 🚀 Performance

### Optimisations implémentées

1. **Debounce sur resize**: 150ms pour éviter trop de re-renders
2. **useMemo**: Le contexte utilise `useMemo` pour éviter les re-renders inutiles
3. **Un seul hook**: Plus de multiples event listeners
4. **Breakpoints standards**: Utilisation des breakpoints Bootstrap (cohérence)

### Comparaison

**❌ Avant** (problèmes):

- 6 hooks différents
- 3 fichiers dupliqués
- Multiples event listeners
- Boucles infinies
- Incohérence des breakpoints

**✅ Maintenant**:

- 1 hook simple et clair
- 1 provider centralisé
- 1 seul event listener
- Aucune boucle infinie
- Breakpoints Bootstrap standards

## 🎨 Configuration des breakpoints

Les breakpoints sont définis dans `src/helpers/utils.js`:

```javascript
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1540
};
```

**⚠️ Ne pas modifier** ces valeurs sauf si absolument nécessaire. Elles correspondent aux breakpoints Bootstrap standard.

## 🔧 Maintenance

### Ajouter un nouveau breakpoint

Si vous devez vraiment ajouter un breakpoint personnalisé:

1. Modifiez `src/helpers/utils.js`:

```javascript
export const breakpoints = {
  // ... existants
  xxxl: 2000 // Nouveau
};
```

2. Ajoutez la logique dans `src/hooks/useResponsive.js`:

```javascript
const isXxxl = width >= breakpoints.xxxl;
```

3. Retournez la nouvelle propriété

### Déboguer

Pour vérifier l'état responsive actuel:

```javascript
function DebugResponsive() {
  const { responsive } = useAppContext();

  console.log('Current breakpoint:', responsive.getCurrentBreakpoint());
  console.log('Screen size:', responsive.screenSize);
  console.log('Is mobile?', responsive.isMobile);

  return null;
}
```

## 📚 Références

- [Bootstrap Breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
- [React Context](https://react.dev/reference/react/useContext)
- [Performance Optimization](https://react.dev/reference/react/useMemo)

---

**Dernière mise à jour**: 10 octobre 2025
**Version**: 2.0 (Architecture simplifiée)
