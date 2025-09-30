# 🚀 Guide du Système Responsive XamXamBoutik

## 📋 Vue d'ensemble

Le système responsive de XamXamBoutik est un système complet et intelligent qui s'adapte automatiquement à tous les types d'appareils et de contextes d'utilisation. Il est basé sur les meilleures pratiques modernes et optimisé pour les performances.

## 🏗️ Architecture du Système

### 1. **Hooks Responsifs**
- `useResponsiveAdvanced` : Hook de base avec détection avancée
- `useResponsiveLayout` : Gestion intelligente du layout
- `useResponsive` : Hook principal via le contexte

### 2. **Composants Responsifs**
- `ResponsiveContainer` : Container intelligent
- `ResponsiveTable` : Tables adaptatives
- `ResponsiveWrapper` : Wrapper conditionnel
- `ResponsiveBreakpoint` : Affichage conditionnel

### 3. **Provider Global**
- `ResponsiveProvider` : Gestion globale de la responsivité

## 🎯 Utilisation

### **1. Hook Principal**

```jsx
import { useResponsive } from 'providers/ResponsiveProvider';

const MyComponent = () => {
  const {
    // État de base
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    deviceType,
    orientation,
    
    // Breakpoints
    isXs, isSm, isMd, isLg, isXl, isXxl,
    
    // Capacités
    capabilities: { hasTouch, hasHover, isRetina },
    
    // Utilitaires
    getResponsiveValue,
    getComponentConfig,
    getConditionalClasses
  } = useResponsive();

  return (
    <div className={getConditionalClasses({
      mobile: 'mobile-layout',
      tablet: 'tablet-layout',
      desktop: 'desktop-layout'
    })}>
      {/* Votre contenu */}
    </div>
  );
};
```

### **2. Composants Responsifs**

#### **ResponsiveContainer**
```jsx
import { ResponsiveContainer, ResponsiveRow, ResponsiveCol } from 'components/common/ResponsiveContainer';

const MyPage = () => (
  <ResponsiveContainer fluid spacing="normal">
    <ResponsiveRow spacing="normal">
      <ResponsiveCol size={12} md={6} lg={4}>
        <h1>Contenu adaptatif</h1>
      </ResponsiveCol>
    </ResponsiveRow>
  </ResponsiveContainer>
);
```

#### **ResponsiveTable**
```jsx
import { ResponsiveTable, ResponsiveTableCard } from 'components/common/ResponsiveTable';

const ProductTable = () => (
  <ResponsiveTableCard title="Produits" variant="primary">
    <ResponsiveTable striped hover scrollable>
      {/* Votre tableau */}
    </ResponsiveTable>
  </ResponsiveTableCard>
);
```

#### **ResponsiveWrapper**
```jsx
import { ResponsiveWrapper } from 'components/common/ResponsiveContainer';

const AdaptiveComponent = () => (
  <ResponsiveWrapper
    component="div"
    mobile={{ className: 'mobile-style' }}
    tablet={{ className: 'tablet-style' }}
    desktop={{ className: 'desktop-style' }}
  >
    <p>Contenu qui s'adapte</p>
  </ResponsiveWrapper>
);
```

#### **ResponsiveBreakpoint**
```jsx
import { ResponsiveBreakpoint } from 'components/common/ResponsiveContainer';

const ConditionalContent = () => (
  <>
    <ResponsiveBreakpoint show={['mobile']}>
      <p>Visible uniquement sur mobile</p>
    </ResponsiveBreakpoint>
    
    <ResponsiveBreakpoint show={['tablet', 'desktop']}>
      <p>Visible sur tablette et desktop</p>
    </ResponsiveBreakpoint>
  </>
);
```

### **3. Configuration des Composants**

```jsx
const MyComponent = () => {
  const { getComponentConfig } = useResponsive();
  
  const tableConfig = getComponentConfig('table', {
    customProp: 'value'
  });
  
  return <Table {...tableConfig} />;
};
```

### **4. Classes CSS Conditionnelles**

```jsx
const MyComponent = () => {
  const { getConditionalClasses } = useResponsive();
  
  return (
    <div className={getConditionalClasses({
      mobile: 'col-12',
      tablet: 'col-md-6',
      desktop: 'col-lg-4',
      touch: 'touch-friendly',
      hover: 'hover-effects'
    })}>
      Contenu adaptatif
    </div>
  );
};
```

### **5. Valeurs Responsives**

```jsx
const MyComponent = () => {
  const { getResponsiveValue } = useResponsive();
  
  const fontSize = getResponsiveValue({
    mobile: '14px',
    tablet: '16px',
    desktop: '18px'
  });
  
  const columns = getResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3
  });
  
  return (
    <div style={{ fontSize }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i}>Colonne {i + 1}</div>
      ))}
    </div>
  );
};
```

## 🎨 Styles SCSS

### **Classes Utilitaires**

```scss
// Espacement responsive
.p-mobile-2 { padding: 0.5rem !important; }
.p-tablet-3 { padding: 1rem !important; }
.p-desktop-4 { padding: 1.5rem !important; }

// Tailles de police responsive
.fs-mobile-1 { font-size: 0.75rem !important; }
.fs-tablet-2 { font-size: 0.875rem !important; }
.fs-desktop-3 { font-size: 1rem !important; }
```

### **Classes de Layout**

```scss
.responsive-layout {
  &.layout-mobile { /* Styles mobile */ }
  &.layout-tablet { /* Styles tablette */ }
  &.layout-desktop { /* Styles desktop */ }
  
  &.layout-fullscreen { /* Mode plein écran */ }
  &.layout-compact { /* Mode compact */ }
}
```

## 📱 Breakpoints

| Breakpoint | Taille | Usage |
|------------|--------|-------|
| `xs` | < 576px | Mobile très petit |
| `sm` | 576px - 767px | Mobile |
| `md` | 768px - 991px | Tablette |
| `lg` | 992px - 1199px | Desktop |
| `xl` | 1200px - 1539px | Desktop large |
| `xxl` | ≥ 1540px | Desktop ultra |

## 🔧 Configuration Avancée

### **1. Configuration Personnalisée**

```jsx
const MyComponent = () => {
  const { getBreakpointConfig } = useResponsive();
  
  const config = getBreakpointConfig({
    xs: { items: 1, spacing: 'small' },
    sm: { items: 2, spacing: 'normal' },
    md: { items: 3, spacing: 'normal' },
    lg: { items: 4, spacing: 'large' },
    default: { items: 1, spacing: 'normal' }
  });
  
  return <div>{/* Utiliser config */}</div>;
};
```

### **2. Détection des Capacités**

```jsx
const MyComponent = () => {
  const { capabilities } = useResponsive();
  
  return (
    <div>
      {capabilities.hasTouch && <p>Appareil tactile</p>}
      {capabilities.hasHover && <p>Support du hover</p>}
      {capabilities.isRetina && <p>Écran Retina</p>}
      {capabilities.isLowEnd && <p>Appareil bas de gamme</p>}
    </div>
  );
};
```

## 🚀 Exemples Pratiques

### **1. Page de Produits Responsive**

```jsx
import { ResponsiveContainer, ResponsiveRow, ResponsiveCol, ResponsiveTable } from 'components/common';

const ProductsPage = () => {
  const { isMobile, getComponentConfig } = useResponsive();
  
  return (
    <ResponsiveContainer fluid>
      <ResponsiveRow>
        <ResponsiveCol size={12}>
          <ResponsiveTable
            striped
            hover
            scrollable={isMobile}
            {...getComponentConfig('table')}
          >
            {/* Contenu du tableau */}
          </ResponsiveTable>
        </ResponsiveCol>
      </ResponsiveRow>
    </ResponsiveContainer>
  );
};
```

### **2. Navigation Adaptative**

```jsx
const Navigation = () => {
  const { isMobile, isTablet, layoutUtils } = useResponsive();
  
  return (
    <nav className={layoutUtils.getOptimalConfig('nav').className}>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </nav>
  );
};
```

### **3. Grille de Produits**

```jsx
const ProductGrid = ({ products }) => {
  const { getResponsiveValue } = useResponsive();
  
  const columns = getResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3
  });
  
  return (
    <div className={`row row-cols-${columns}`}>
      {products.map(product => (
        <div key={product.id} className="col">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};
```

## ⚡ Optimisations de Performance

### **1. Lazy Loading Conditionnel**

```jsx
const LazyComponent = () => {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return <MobileOptimizedComponent />;
  }
  
  return <DesktopComponent />;
};
```

### **2. Réduction des Animations**

```jsx
const AnimatedComponent = () => {
  const { shouldReduceMotion } = useResponsive();
  
  return (
    <div className={shouldReduceMotion ? 'no-animation' : 'animated'}>
      Contenu
    </div>
  );
};
```

## 🐛 Dépannage

### **Problèmes Courants**

1. **Boucles infinies** : Vérifiez les dépendances des `useEffect`
2. **Re-renders excessifs** : Utilisez `useMemo` et `useCallback`
3. **Styles non appliqués** : Vérifiez l'import du SCSS

### **Debug**

```jsx
const DebugComponent = () => {
  const responsive = useResponsive();
  
  console.log('État responsive:', responsive);
  
  return <div>Debug info dans la console</div>;
};
```

## 📚 Ressources

- [Bootstrap 5 Responsive](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

---

**Note** : Ce système est optimisé pour XamXamBoutik et s'adapte automatiquement aux besoins spécifiques de l'application de gestion de boutique.
