# 📊 Hiérarchie Z-Index - XamXamBoutik

## 🎯 Ordre des Couches (de bas en haut)

Voici la hiérarchie complète des z-index utilisés dans l'application :

```
┌─────────────────────────────────────────────┐
│  z-index: 1050 - Modals Bootstrap          │  ← Le plus haut
├─────────────────────────────────────────────┤
│  z-index: 1025 - Dropdowns                 │
├─────────────────────────────────────────────┤
│  z-index: 1022 - Logo & Toggle Sidebar     │
├─────────────────────────────────────────────┤
│  z-index: 1021 - Sidebar Mobile (ouverte)  │
├─────────────────────────────────────────────┤
│  z-index: 1020 - (réservé)                 │
├─────────────────────────────────────────────┤
│  z-index: 1019 - Backdrop Sidebar          │
├─────────────────────────────────────────────┤
│  z-index: 1016 - Navbar Nav Items          │
├─────────────────────────────────────────────┤
│  z-index: 1015 - Navbar Top                │
├─────────────────────────────────────────────┤
│  z-index: 1010 - (réservé)                 │
├─────────────────────────────────────────────┤
│  z-index: 1000 - Toasts/Notifications      │
├─────────────────────────────────────────────┤
│  z-index: 1    - Content (pages)           │
├─────────────────────────────────────────────┤
│  z-index: auto - Éléments normaux          │  ← Le plus bas
└─────────────────────────────────────────────┘
```

---

## 📱 MOBILE (< 768px)

### Sidebar Fermée

```
Navbar Top (1015)
  └─ Dropdowns (1025)
Content (1)
```

### Sidebar Ouverte

```
Dropdowns Navbar (1025)
  └─ Au-dessus de tout
Logo & Toggle (1022)
  └─ Cliquable pour fermer
Sidebar Content (1021)
  └─ Menu de navigation
Backdrop (1019)
  └─ Fond noir cliquable
Navbar Top (1015)
  └─ En dessous de tout
Content (1)
  └─ Bloqué, non scrollable
```

---

## 🖥️ DESKTOP (>= 992px)

```
Dropdowns (1025)
  └─ Toujours au-dessus
Navbar Top (1015)
  └─ Sticky en haut
Sidebar (auto)
  └─ Fixe à gauche
Content (1)
  └─ Zone principale
```

---

## 🎨 Composants Spécifiques

### Navbar Top

```scss
.navbar-top {
  z-index: 1015;

  .navbar-nav {
    z-index: 1016;
  }

  .dropdown-menu {
    z-index: 1025;
  }

  .nav-item.show {
    z-index: 1025;
  }
}
```

### Sidebar Mobile

```scss
.navbar-vertical {
  // Normal: z-index auto

  .navbar-collapse.show {
    z-index: 1021; // Quand ouverte
  }

  .toggle-icon-wrapper {
    z-index: 1022; // Toujours cliquable
  }
}
```

### Backdrop

```scss
.navbar-vertical-backdrop {
  z-index: 1019; // Entre content et sidebar
}
```

### Dropdowns (Global)

```scss
.dropdown-menu {
  z-index: 1025; // Au-dessus de sidebar et navbar
}

.nav-item.show,
.dropdown.show {
  z-index: 1025;
}
```

### Content

```scss
.content {
  z-index: 1; // Sous tout le reste

  .card,
  .table,
  section {
    z-index: auto; // N'interfère pas
  }
}
```

---

## 🔧 RÈGLES À SUIVRE

### ✅ À FAIRE

1. **Dropdowns toujours au-dessus**

   ```scss
   .dropdown-menu {
     z-index: 1025 !important;
   }
   ```

2. **Sidebar mobile au-dessus du contenu**

   ```scss
   .navbar-collapse.show {
     z-index: 1021 !important;
   }
   ```

3. **Content en bas**
   ```scss
   .content {
     z-index: 1 !important;
   }
   ```

### ❌ À ÉVITER

1. **Ne jamais mettre content au-dessus de navbar**

   ```scss
   // ❌ MAUVAIS
   .content {
     z-index: 1020; // Trop haut !
   }
   ```

2. **Ne jamais bloquer les dropdowns**

   ```scss
   // ❌ MAUVAIS
   .card {
     z-index: 1030; // Au-dessus des dropdowns !
   }
   ```

3. **Ne jamais oublier position: relative**

   ```scss
   // ❌ MAUVAIS
   .element {
     z-index: 100; // Sans position, ne marche pas !
   }

   // ✅ BON
   .element {
     position: relative;
     z-index: 100;
   }
   ```

---

## 🐛 PROBLÈMES COURANTS

### Dropdown invisible

**Symptôme :** Dropdown s'affiche derrière la page

**Cause :** z-index trop bas ou élément parent avec z-index élevé

**Solution :**

```scss
.dropdown-menu {
  z-index: 1025 !important;
}

.nav-item.show {
  z-index: 1025 !important;
}
```

### Sidebar invisible sur mobile

**Symptôme :** Sidebar derrière le contenu

**Cause :** z-index pas appliqué quand sidebar ouverte

**Solution :**

```scss
.navbar-collapse.show {
  position: fixed !important;
  z-index: 1021 !important;
}
```

### Backdrop ne fonctionne pas

**Symptôme :** Clic sur backdrop ne ferme pas la sidebar

**Cause :** z-index trop bas ou pointer-events désactivé

**Solution :**

```scss
.navbar-vertical-backdrop {
  z-index: 1019 !important;
  pointer-events: all !important;
}
```

### Toggle sidebar ne fonctionne plus

**Symptôme :** Impossible de cliquer sur burger menu

**Cause :** Élément au-dessus du toggle

**Solution :**

```scss
.toggle-icon-wrapper {
  position: relative;
  z-index: 1022 !important;
}
```

---

## 📊 TESTING CHECKLIST

### Mobile

- [ ] Navbar Top visible et sticky
- [ ] Dropdowns navbar au-dessus de tout
- [ ] Clic burger menu ouvre sidebar
- [ ] Sidebar au-dessus du content
- [ ] Backdrop cliquable
- [ ] Toggle toujours cliquable
- [ ] Scroll ferme sidebar

### Desktop

- [ ] Navbar Top sticky
- [ ] Dropdowns visibles
- [ ] Sidebar fixe à gauche
- [ ] Content scrollable
- [ ] Aucun overlap

---

## 🎯 ORDRE D'APPLICATION CSS

**Important :** Les styles doivent être appliqués dans cet ordre :

1. **Bootstrap de base** (z-index par défaut)
2. **Theme SCSS** (z-index custom theme)
3. **`_complete-responsive-fix.scss`** ⭐ (notre fix, en dernier)

Cet ordre garantit que nos fix `!important` override tout le reste.

---

## 📝 NOTES

### Bootstrap Default Z-Index

```scss
$zindex-dropdown: 1000;
$zindex-sticky: 1020;
$zindex-fixed: 1030;
$zindex-modal-backdrop: 1040;
$zindex-modal: 1050;
$zindex-popover: 1060;
$zindex-tooltip: 1070;
```

### Notre Override

On utilise des valeurs entre 1000-1030 pour rester compatible avec Bootstrap tout en ayant le contrôle.

---

**Dernière mise à jour :** 10 octobre 2025  
**Version :** 1.0  
**Statut :** ✅ Documenté
