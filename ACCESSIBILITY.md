# Toegankelijkheidsverbeteringen Octovoc

## Geïmplementeerde verbeteringen voor blinde/slechtziende gebruikers

### ✅ 1. Hoog contrast design
- Zwart/wit kleurenschema voor optimaal contrast
- Geen gebruik van enkel kleur om informatie over te brengen
- Tekst is altijd leesbaar tegen de achtergrond

### ✅ 2. Semantische HTML
- `<header role="banner">` voor navigatie
- `<main role="main">` voor hoofdinhoud
- `<nav role="navigation">` voor niveau selectie
- `<h1>` voor hoofdtitel in plaats van `<div>`
- Proper heading hierarchy

### ✅ 3. ARIA labels en roles
- `aria-label` op alle interactieve elementen
- `role="button"` op klikbare lijst items
- `aria-pressed` voor toggle buttons (niveau selectie)
- `aria-disabled` voor niet-toegankelijke modules
- `aria-hidden="true"` op decoratieve tekst (| separators)
- `role="list"` en `role="navigation"` waar nodig

### ✅ 4. Keyboard navigatie
- Alle modules toegankelijk via Tab toets
- Enter en Spatiebalk activeren modules
- `tabIndex={0}` voor interactieve elementen
- `tabIndex={-1}` voor disabled elementen
- Duidelijke focus indicators (3px witte outline)
- Focus blijft zichtbaar tijdens navigatie

### ✅ 5. Focus indicators
- 3px witte outline bij focus op modules
- 2px outline offset bij niveau buttons
- Wit op zwart bij focus voor maximaal contrast
- Focus styling consistent met hover styling

### ✅ 6. Responsive typography
- `clamp()` voor alle tekst groottes
- Schaalt automatisch tussen min/max waarden
- Ondersteunt browser zoom tot 200%

## Extra aanbevelingen voor toekomstige implementatie

### 🔄 7. Skip links (Prioriteit: HOOG)
```jsx
<a href="#main-content" className="skip-link">
  Spring naar hoofdinhoud
</a>
```
Voeg toe aan begin van elke pagina zodat keyboard gebruikers navigatie kunnen overslaan.

### 🔄 8. Live regions voor feedback (Prioriteit: HOOG)
```jsx
<div role="status" aria-live="polite" aria-atomic="true">
  {feedback && <p>{feedback}</p>}
</div>
```
Voor oefeningen: kondig resultaten aan via screen readers.

### 🔄 9. Text-to-speech voor oefeningen (Prioriteit: MEDIUM)
```javascript
const speakWord = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'nl-NL'
  window.speechSynthesis.speak(utterance)
}
```
Optionele audio ondersteuning voor woorden en zinnen.

### 🔄 10. High contrast mode detectie (Prioriteit: MEDIUM)
```css
@media (prefers-contrast: high) {
  .module-item {
    border-width: 2px;
  }
}
```
Nog dikkere borders voor high contrast mode.

### 🔄 11. Reduced motion support (Prioriteit: MEDIUM)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Respecteer gebruikers voorkeur voor minder animaties.

### 🔄 12. Landmark regions
- `<aside>` voor sidebar content
- `<footer>` voor footer
- `aria-labelledby` om regions te labelen

### 🔄 13. Form accessibility
- `<label for="...">` voor alle form inputs
- Error messages gekoppeld met `aria-describedby`
- Required fields aangegeven met `aria-required="true"`

### 🔄 14. Breadcrumb navigatie
Voor complexe pagina structuren, help gebruikers te weten waar ze zijn:
```jsx
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/modules">Modules</a></li>
    <li aria-current="page">Economie</li>
  </ol>
</nav>
```

### 🔄 15. Document taal specificatie
Zorg dat HTML lang attribute correct is gezet:
```html
<html lang="nl">
```

## Testing aanbevelingen

### Screen readers testen met:
- **NVDA** (Windows, gratis): https://www.nvaccess.org/
- **JAWS** (Windows, betaald): https://www.freedomscientific.com/
- **VoiceOver** (macOS/iOS, ingebouwd): Cmd+F5
- **TalkBack** (Android, ingebouwd)

### Automated testing tools:
- **axe DevTools**: Browser extensie voor toegankelijkheids audits
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit

### Handmatige tests:
1. ✅ Navigeer hele app met alleen keyboard (Tab, Enter, Spatie)
2. ✅ Test met 200% browser zoom
3. 🔄 Test met screen reader (NVDA/VoiceOver)
4. ✅ Test in high contrast mode
5. 🔄 Test met verschillende kleurenblindheid simulaties

## WCAG 2.1 Level AA compliance

### Huidige status:
- ✅ 1.4.3 Contrast (Minimum): Zwart/wit heeft ratio > 7:1
- ✅ 1.4.4 Resize text: Schaalt tot 200% zonder verlies van functionaliteit
- ✅ 2.1.1 Keyboard: Alle functionaliteit via keyboard
- ✅ 2.4.7 Focus Visible: Duidelijke focus indicators
- ✅ 4.1.2 Name, Role, Value: ARIA labels aanwezig

### Te verbeteren:
- 🔄 2.4.1 Bypass Blocks: Skip links toevoegen
- 🔄 3.3.1 Error Identification: Error messages koppelen met aria-describedby
- 🔄 3.3.2 Labels or Instructions: Form labels verbeteren

## Implementatie checklist

- [x] Semantische HTML elementen
- [x] ARIA labels voor alle interacties
- [x] Keyboard navigatie volledig werkend
- [x] Focus indicators zichtbaar
- [x] Hoog contrast design
- [ ] Skip links geïmplementeerd
- [ ] Live regions voor feedback
- [ ] Screen reader testing uitgevoerd
- [ ] Text-to-speech optie (toekomstig)
- [ ] Reduced motion support (toekomstig)

## Contact voor toegankelijkheids issues
Bij toegankelijkheidsproblemen, neem contact op via info@katern.be
