# Reglas de Decisión Automática y Escalamiento

## Árbol de decisión

- Creatividad funciona → crear variaciones (Creative Family, ver `testing-winner-detection.md`).
- Creatividad falla → identificar causa específica (¿hook no retiene? ¿oferta no convence?
  ¿producto no resuelve el ángulo prometido?) antes de descartar el ángulo completo.
- Buenos videos pero mala conversión → revisar landing page / oferta / precio, no el creative.
- Buena conversión pero CAC alto → optimizar creatividad y segmentación de adquisición, no
  necesariamente el producto.
- Ventas pero poco margen → trabajar AOV (`offer-pricing-aov.md`) antes que bajar precio.
- Producto sin señales después de pruebas suficientes → detenerlo (archivar, no forzar).

## Regla de escalamiento

**No escalar solo por volumen de ventas.** Escalar solo cuando, simultáneamente:

- La economía unitaria funciona (margen de contribución positivo real, no proyectado).
- El CAC está dentro del límite calculado en `offer-pricing-aov.md`.
- Existe margen suficiente para absorber devoluciones y fluctuación de CPM.
- La conversión es estable (no un pico de un solo día).
- Existen múltiples creatividades ganadoras (no depender de una sola pieza).
- Hay capacidad logística para sostener el volumen.
- El proveedor puede cumplir con el volumen proyectado sin romper tiempos de envío.
- Las devoluciones están en un rango aceptable para la categoría.

## Escalera de escalamiento (progresiva, ajustada por datos reales, no por calendario)

```
$50/día → $100/día → $250/día → $500/día → $1,000/día → $2,500/día → $5,000+/día
```

Cada salto se da solo cuando el escalón actual sostiene la economía unitaria de forma estable
durante suficientes días de datos — nunca por calendario fijo ("llevamos una semana, subimos").
Si al subir un escalón el CAC se deteriora, se retrocede un escalón y se refuerza creative
antes de reintentar subir.

## Nota sobre la meta de 5,000 ventas/semana

Tratar la meta como dirección, no como promesa. El camino hacia ahí pasa por sostener cada
escalón de esta escalera con datos reales — nunca por saltar escalones basándose solo en la
ambición de la meta. Ver `products/initial-products-overview.md` para el desglose de qué
implicaría esa meta en revenue vs. beneficio real, sección "Matemática de la meta".
