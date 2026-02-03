
# Plano: Corrigir URL de Navegação do Google Maps

## Problema Identificado

A URL de navegação do Google Maps está dando erro porque a vírgula que separa latitude e longitude não está sendo URL-encoded corretamente.

**URL atual (com erro):**
```
https://www.google.com/maps/dir/?api=1&destination=-23.5089,-46.628
```

**URL correta (documentação Google):**
```
https://www.google.com/maps/dir/?api=1&destination=-23.5089%2C-46.628
```

De acordo com a [documentação oficial do Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), coordenadas devem ser URL-encoded, onde a vírgula (`,`) deve ser codificada como `%2C`.

---

## Solucao

Usar `encodeURIComponent()` para garantir que as coordenadas sejam codificadas corretamente na URL.

---

## Mudancas no Codigo

**Arquivo:** `src/components/GymLocationsSection.tsx`

### Antes:
```typescript
const openGoogleMaps = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};
```

### Depois:
```typescript
const openGoogleMaps = (lat: number, lng: number) => {
  const destination = encodeURIComponent(`${lat},${lng}`);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  window.open(url, '_blank');
};
```

---

## Exemplo de URL Gerada

Para a academia WEMOVELT Zona Norte (lat: -23.50890000, lng: -46.62800000):

**Antes:** `https://www.google.com/maps/dir/?api=1&destination=-23.5089,-46.628`

**Depois:** `https://www.google.com/maps/dir/?api=1&destination=-23.5089%2C-46.628`

---

## Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/GymLocationsSection.tsx` | Aplicar `encodeURIComponent()` na funcao `openGoogleMaps` |

---

## Resultado Esperado

- URLs de navegacao Google Maps funcionando corretamente
- Compatibilidade total com a API oficial do Google Maps URLs
- Abre corretamente o app ou site do Google Maps com o destino definido
