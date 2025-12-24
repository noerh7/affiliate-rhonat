# Guide d'utilisation du sélecteur de langue / Language Switcher Guide

## 🇫🇷 Français

### Comment changer de langue

1. **Localiser le sélecteur** : Cherchez l'icône de globe (🌐) avec un drapeau dans la barre de navigation en haut à droite
2. **Ouvrir le menu** : Cliquez sur le sélecteur pour afficher les options
3. **Choisir la langue** : Cliquez sur "Français" ou "English"
4. **Confirmation** : L'interface change immédiatement de langue

### Langues disponibles

- 🇫🇷 **Français** - Langue par défaut
- 🇬🇧 **English** - Anglais

### Persistance

Votre choix de langue est automatiquement sauvegardé et sera restauré lors de votre prochaine visite.

---

## 🇬🇧 English

### How to Change Language

1. **Locate the switcher**: Look for the globe icon (🌐) with a flag in the top-right navigation bar
2. **Open the menu**: Click on the switcher to display options
3. **Choose language**: Click on "Français" or "English"
4. **Confirmation**: The interface immediately changes language

### Available Languages

- 🇫🇷 **Français** - Default language
- 🇬🇧 **English** - English

### Persistence

Your language choice is automatically saved and will be restored on your next visit.

---

## For Developers

### Adding the Language Switcher to a Page

```tsx
import LanguageSwitcher from './components/LanguageSwitcher';

function MyPage() {
  return (
    <div>
      <LanguageSwitcher />
      {/* Your page content */}
    </div>
  );
}
```

### Using Translations

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description')}</p>
    </div>
  );
}
```

### Changing Language Programmatically

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };
  
  const switchToFrench = () => {
    i18n.changeLanguage('fr');
  };
  
  return (
    <div>
      <button onClick={switchToFrench}>FR</button>
      <button onClick={switchToEnglish}>EN</button>
    </div>
  );
}
```

### Getting Current Language

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  console.log('Current language:', i18n.language); // 'fr' or 'en'
  
  return <div>Current: {i18n.language}</div>;
}
```
