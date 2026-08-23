# Oferta, Pricing y AOV

## Regla dura: nunca inventar el precio

Antes de fijar cualquier precio de venta, se necesita el **costo real**:

```
costo del producto
+ envío
+ packaging
+ fees (pasarela de pago, plataforma)
+ impuestos
+ coste de adquisición (CAC estimado o real)
+ devoluciones (% esperado × costo)
= COSTO REAL
```

Con eso se calcula:

- **Precio de venta**
- **Margen bruto** = precio de venta − costo del producto/envío/packaging/fees
- **Margen de contribución** = margen bruto − CAC
- **CAC máximo sostenible** = margen bruto que se está dispuesto a gastar en adquirir un cliente
- **ROAS mínimo** = precio de venta ÷ CAC máximo
- **Break-even ROAS** = punto en el que el ad spend iguala el margen bruto (beneficio = 0)
- **Beneficio por pedido** = precio de venta − costo real completo
- **Beneficio semanal** = beneficio por pedido × pedidos de la semana

Si el usuario no ha dado estos datos reales, pregúntalos explícitamente antes de recomendar un
precio — no se estima "a ojo". Sí se puede mostrar el **rango de precio de mercado** de la
categoría citando fuente (ver `products/`), dejando claro que es referencia de mercado, no el
precio final recomendado hasta tener costos reales.

## Formatos de oferta a evaluar por producto

Producto individual · Bundle · Kit de skincare · Oferta 2x1 · "Compra 2 y ahorra" · Upsell ·
Cross-sell · Subscription (cuando tenga sentido — productos de recompra, no de compra única) ·
Regalo con compra · Oferta por cantidad (compra 1/2/3 con descuento escalonado).

## Estructura clásica de escalones de cantidad

Ejemplo genérico (sustituir precios por los reales del producto):

```
1 unidad  = precio base
2 unidades = precio con descuento por unidad (~15-20% off vs. 2×base)
3 unidades = mayor descuento por unidad (~30-35% off vs. 3×base), suele ser el "ancla" más
             rentable en volumen porque sube AOV sin regalar margen
```

## Estrategias para subir AOV

- Producto individual como entrada, bundle de skincare como "recomendado" (ancla visual/precio).
- Upsell post-agregar-al-carrito (ej. accesorio o segunda unidad con descuento).
- Cross-sell con producto complementario del catálogo (ej. gua sha + roller + suero aplicador).
- Envío gratis a partir de cierto importe — fijarlo justo por encima del AOV actual para
  empujar el ticket hacia arriba.
- Regalo con compra en el tier más alto (percibido como bonus, no como descuento — protege el
  precio ancla).

## Cómo decidir qué estructura usar

Calcular el margen de contribución resultante de cada estructura candidata (individual / bundle
/ 2x1 / cantidad escalonada) con los costos reales, y elegir la que maximice **beneficio total
esperado** (AOV proyectado × conversión esperada × margen), no solo la que se vea más atractiva
en la landing. Documentar el cálculo, no solo la conclusión.
