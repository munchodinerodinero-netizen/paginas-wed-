# MEMORY.md — Memoria de la agencia (ecom-growth-agency)

Registro de decisiones, aprendizajes y estado de cada producto. Se actualiza en cuanto se
aprenda algo importante — no al final de la sesión. Ver `references/response-protocol.md`,
sección "Registro en memoria".

---

## 2026-08-23 — Fundación del sistema

- Se construyó la agencia completa como skill independiente (`ecom-growth-agency`), separada de
  cualquier otra identidad de este repositorio (no lee ni escribe `Harvey/*.md`).
- Roster de 24 roles definido en `references/team-roster.md`.
- Se documentaron los 20+ sistemas operativos de la agencia (research, competencia, ángulos,
  hooks, UGC, formatos de video, funnel, oferta/pricing, landing, SEO, distribución/producción,
  automatización, testing/winners, comentarios/retargeting, email/SMS, customer service,
  branding, analítica, reglas de decisión/escalamiento, research diario, protocolo de
  respuesta) en `references/`.
- **Regla de compliance de salud/belleza fijada como no negociable** en
  `references/compliance-health-claims.md` — aplica a todo output de la agencia.
- **Primer research pass completado** para los 5 productos iniciales (máscara LED, roller, gua
  sha, masajeador facial/corporal, kit combinado), con datos de mercado reales y fuentes
  citadas (ver `products/`). Ningún costo real de proveedor confirmado todavía — pendiente
  antes de fijar precios finales o calcular margen real.
- **Decisión preliminar de portafolio**: tratar el roller y el gua sha como productos de
  entrada/tripwire (muy saturados como SKU suelto), el masajeador facial/corporal como
  candidato más fuerte a "hero product" individual, y el kit combinado como oferta ancla de
  marca hacia la que debe apuntar el funnel completo.
- **Pendiente crítico abierto**: confirmar con proveedor(es) real(es) — costo por unidad, costo
  de envío, tiempo de envío, especificación técnica verificada (longitud de onda LED, si el
  masajeador es resistente al agua/tiene calor) — antes de avanzar a `unit-economics` y fijar
  precio final de cualquier producto o del kit.
- **Próximo paso operativo**: en cuanto haya proveedor y costos reales, correr
  `references/offer-pricing-aov.md` completo por producto y decidir con cuál se abre el primer
  test (`references/testing-winner-detection.md`), empezando en el primer escalón de
  `references/decision-rules-scaling.md` ($50/día).

## 2026-08-23 — Primer costo real confirmado: Máscara facial LED

- Alberto confirmó costo real del producto ($15) y precio de venta ($100) para la máscara LED.
  Margen bruto de producto: $85 (85%) — el mejor margen de los 5 productos del portafolio.
- Con margen bruto conocido, el score subió de "no calculable" a **71/100 (banda TEST)** —
  ver `products/01-led-face-mask.md`.
- Siguen pendientes de confirmar: costo real de envío, packaging, y % de devoluciones esperado.
  Se documentó un modelo ilustrativo con esos 3 valores marcados explícitamente como estimación
  (no como dato confirmado) para no romper la regla de "nunca inventar costos".
- **Decisión del CEO**: la máscara LED es el producto que abre el primer test de la agencia,
  no el kit combinado — presupuesto inicial $50/día, ángulo "ritual nocturno"/self-care como
  prioridad por menor riesgo de compliance.
- **Pendiente para cerrar unit economics al 100%**: costo de envío real, packaging real, %
  de devoluciones real o estimado por el propio historial/proveedor.

## 2026-08-23 — Costos reales confirmados: Rodillo y Gua Sha

- Alberto confirmó costo $13 / precio $30 para **ambos**, rodillo facial y gua sha (mismos
  números para los dos). Margen bruto de producto: $17 (56.7%) cada uno.
- ROAS mínimo de breakeven calculado ≈ 2.84x para ambos — casi el doble de exigente que la
  máscara LED (1.49x). **Esto confirma con datos reales la recomendación previa**: ni el
  rodillo ni el gua sha se testean como hero product suelto; van como tripwire/entrada y como
  componentes del kit combinado.
- Score actualizado en ambos archivos: Margen pasa de "pendiente" a 6/10 (margen % sólido, pero
  ROAS de breakeven exigente).
- Aclarado con Alberto: el precio de $100 mencionado en el mensaje anterior correspondía a la
  máscara LED (ya registrado), no a un producto nuevo.
- **Pendiente crítico restante**: costo y precio de venta reales del **masajeador
  facial/corporal (producto 4)** — es el único de los 5 productos sin datos confirmados. El
  kit combinado (producto 5) sigue sin precio propio, pendiente de definir cuando estén todos
  los componentes.

## 2026-08-23 — Alberto compartió capturas de AliExpress; se detectó riesgo de precio señuelo

- Alberto mandó 3 capturas de AliExpress con precios "Welcome deal" (descuento de bienvenida de
  cuenta nueva, no repetible en pedidos siguientes): roller+guasha pack $0.33, masajeador
  corazón $0.99, máscara LED 7 colores+cuello $8.68 (regular $32.68).
  **Se marcó explícitamente que esos precios NO son costo real sostenible** — riesgo de romper
  la regla de "nunca inventar/usar un costo no sostenible como si fuera real".
- Se detectó además una discrepancia: esa máscara LED de la captura ($32.68 regular) no
  coincide con el costo ya registrado ($15) — quedó sin resolver cuál es el costo real de la
  máscara que Alberto va a usar; no se sobrescribió el $15 confirmado.

## 2026-08-23 — Precios de venta actualizados (no eran costos)

- Alberto aclaró vía pregunta directa: los números "$99 máscara / $20 masajeador / $20 roller"
  eran **precios de venta al cliente**, no costos de proveedor. Y confirmó que roller y gua sha
  van **por separado**, no en un pack combinado.
- **Cambios aplicados**:
  - Máscara LED: precio $100 → **$99** (costo sigue en $15, sin cambios). Impacto mínimo en la
    economía — sigue siendo el mejor producto del portafolio (ROAS breakeven ≈1.49x).
  - Rodillo facial: precio $30 → **$20** (costo sigue en $13). **Impacto crítico**: margen de
    contribución real cae a ~$1.37 (6.9%), ROAS de breakeven sube a ~14.6x — **no viable con
    tráfico pagado a este precio**. Score de margen bajó de 6 a 2.
  - Gua Sha: mismo cambio y mismo diagnóstico que el rodillo — precio $30 → $20, no viable con
    ads al precio actual.
- **Decisión del CEO registrada**: rodillo y gua sha quedan fuera de cualquier presupuesto de
  ads propio mientras el precio siga en $20 con costo $13. Solo se usan vía tráfico orgánico
  (CAC≈$0), como upsell/cross-sell dentro de un carrito ya rentable, o como componente del kit
  combinado — nunca como campaña paga independiente.
- **Pendiente crítico único restante para cerrar el portafolio de 5 productos**: el **costo**
  del masajeador facial/corporal (producto 4) — su precio de venta ya quedó confirmado en $20.
  Se documentó en su archivo una tabla de sensibilidad (costo $6/$10/$13) para mostrar qué tan
  determinante es ese dato antes de decidir si es viable con ads, sin asumir ninguno de los 3
  como real.

## 2026-08-23 — Portafolio de 5 productos CERRADO con costo/precio reales

- Alberto confirmó costo del masajeador ($0.60) **con el proveedor** — se preguntó
  explícitamente si no sería confusión con el $6.04 de la captura de AliExpress (dado lo bajo
  del número para un dispositivo "recargable"); Alberto confirmó $0.60 como correcto, así que
  se usa como dato real. Queda una nota de precaución en el archivo del producto: verificar en
  la primera muestra física que el dispositivo trae batería/circuito funcional real.
- **Tabla final del portafolio** (todos con datos de costo y precio confirmados por Alberto):

| Producto | Costo | Precio | Margen contribución est. | ROAS breakeven est. | Viable con ads |
|---|---|---|---|---|---|
| Máscara LED | $15 | $99 | ~$66 (67%) | ~1.49x | Sí — mejor del portafolio |
| Masajeador corazón | $0.60 | $20 | ~$9.62 (48%) | ~2.08x | Sí — segundo mejor |
| Rodillo facial | $13 | $20 | ~$1.37 (7%) | ~14.6x | **No** — solo orgánico/bundle |
| Gua Sha | $13 | $20 | ~$1.37 (7%) | ~14.6x | **No** — solo orgánico/bundle |

- **Decisión del CEO**: orden de prioridad de testing pago = (1) Máscara LED, $50/día inicial,
  (2) Masajeador corazón como segundo test en cuanto la máscara valide el sistema. Rodillo y
  gua sha quedan fuera de presupuesto de ads propio de forma indefinida al precio actual —
  solo tráfico orgánico, upsell/cross-sell, o componentes del kit combinado.
- **Pendiente abierto**: definir composición y precio del kit combinado (producto 5) usando
  estos costos ya confirmados; envío/packaging/% de devoluciones siguen siendo estimaciones
  marcadas explícitamente (no dato confirmado) en los 4 productos con costo — pendiente
  cerrarlos con datos reales del proveedor antes de fijar presupuesto de escalamiento más allá
  del primer test.

## 2026-08-23 — CORRECCIÓN GRANDE: costo real de rodillo y gua sha, veredicto revertido

- El costo de $13 registrado para rodillo y gua sha era **incorrecto**. Alberto corrigió,
  confirmado con proveedor tras pregunta directa de verificación (cambio de 14x amerita
  doble-check, mismo criterio que se aplicó al masajeador):
  - Rodillo facial: costo real **$0.90** (no $13).
  - Gua Sha: costo real **$1.50** (no $13) — número distinto al del rodillo, no comparten
    costo aunque comparten precio de venta ($20).
- **Esto revierte por completo el veredicto de "no viable con tráfico pagado" de la sesión
  anterior.** Con los costos correctos:
  - Rodillo: margen de contribución ~$13.47 (67.4%), ROAS breakeven ~1.48x (antes 14.6x con
    el dato erróneo).
  - Gua Sha: margen de contribución ~$12.87 (64.4%), ROAS breakeven ~1.55x (antes 14.6x).
- **Tabla del portafolio, ahora corregida** (los 4 productos individuales con costo real
  confirmado):

| Producto | Costo | Precio | Margen contribución est. | ROAS breakeven est. | Viable con ads |
|---|---|---|---|---|---|
| Máscara LED | $15 | $99 | ~$66 (67%) | ~1.49x | Sí |
| Rodillo facial | $0.90 | $20 | ~$13.47 (67%) | ~1.48x | **Sí (corregido)** |
| Gua Sha | $1.50 | $20 | ~$12.87 (64%) | ~1.55x | **Sí (corregido)** |
| Masajeador corazón | $0.60 | $20 | ~$9.62 (48%) | ~2.08x | Sí |

- **Lección operativa para la agencia**: esta sesión mostró que el primer costo dado ($13 para
  ambos) probablemente venía de una lectura equivocada del proveedor/plataforma, no de mala fe
  — pero el impacto en la decisión (matar vs. escalar un producto) fue total. Regla reforzada:
  ante cualquier costo que cambie 10x+ entre versiones, siempre re-confirmar antes de
  sobrescribir el archivo, tal como se hizo aquí y con el masajeador.
- **Decisión del CEO actualizada**: los 4 productos individuales son viables con ads. Orden de
  prioridad de testing pago sigue siendo por score y no solo por margen (saturación de mercado
  penaliza a rodillo/gua sha frente a máscara/masajeador): (1) Máscara LED, (2) Masajeador
  corazón, (3) Rodillo y Gua Sha — estos últimos dos con más presión de diferenciación de
  ángulo/creative por estar en categoría muy saturada, aunque el margen ya no sea el freno.
- **Pendiente sigue igual**: definir composición y precio del kit combinado con estos 4 costos
  ya confirmados; envío/packaging/% de devoluciones de los 4 productos siguen siendo
  estimaciones marcadas, no dato confirmado.

## 2026-08-23 — PORTAFOLIO COMPLETO: kit combinado cerrado, los 5 productos con datos reales

- Alberto decidió la composición del kit: **los 4 productos juntos** (máscara + masajeador +
  rodillo + gua sha). Costo total del kit: $18.00 (suma de los 4 costos confirmados). Suma de
  precios individuales: $159.
- **Precio de kit recomendado por el CEO: $129** (Opción A) — margen de contribución estimado
  ~$87.43 (67.8%), ROAS breakeven ~1.48x, ahorro real mostrado al cliente de $30 (19% off)
  frente a comprar los 4 por separado. Se documentó también una Opción B a $99 ("kit al precio
  de la máscara") como promo puntual, no como precio base — deja $30 de margen en la mesa.
- **Score del kit: 80/100 → TEST INTENSIVO — el más alto de los 5 productos.** Confirma la
  tesis de branding: el kit es la oferta ancla, no los productos sueltos.
- **Estructura de funnel decidida**: máscara LED sola en TOFU/MOFU (ángulo "ritual nocturno",
  $99) → kit combinado como upsell en checkout o en la secuencia post-compra ($129, "+$30 por
  completar tu ritual") — el kit no se presenta como primera oferta fría.

### Tabla final del portafolio (2026-08-23) — LOS 5 PRODUCTOS CERRADOS

| Producto | Costo | Precio | Margen contribución est. | ROAS breakeven est. | Score |
|---|---|---|---|---|---|
| **Kit combinado (los 4)** | $18.00 | $129 | ~$87.43 (68%) | ~1.48x | **80 — TEST INTENSIVO** |
| Máscara LED | $15.00 | $99 | ~$66 (67%) | ~1.49x | 71 — TEST |
| Masajeador corazón | $0.60 | $20 | ~$9.62 (48%) | ~2.08x | 67 — OBSERVAR/TEST |
| Rodillo facial | $0.90 | $20 | ~$13.47 (67%) | ~1.48x | 64 — OBSERVAR |
| Gua Sha | $1.50 | $20 | ~$12.87 (64%) | ~1.55x | 66 — OBSERVAR |

**Pendiente abierto para toda la agencia**: envío real, packaging real y % de devoluciones real
de los 5 productos siguen siendo estimaciones marcadas (no dato confirmado) — son el siguiente
dato crítico a cerrar con proveedor antes de mover presupuesto más allá del primer test de
$50/día en la máscara LED.
