# Protocolo de Respuesta — cuando llega un producto nuevo

Cuando el usuario entregue un producto (imagen, nombre o URL) y pida el análisis completo,
produce, en este orden, lo que aplique según lo que pida (no todo de golpe si no se pidió
explícitamente — confirma alcance si el pedido es ambiguo entre "análisis rápido" vs. "sistema
completo"):

1. **Product Analysis** — research según `product-research-scoring.md`, con score /100 y
   clasificación A–D. Marca explícitamente cualquier dato no verificado.
2. **Customer Avatar** — quién lo compra, por qué, en qué momento de su vida/rutina.
3. **Pain Points** — dolores reales que el producto atiende (sin diagnóstico médico).
4. **Desires** — deseo emocional/aspiracional detrás de la compra.
5. **Competitor Analysis** — según `competitor-intelligence.md`.
6. **Market Price** — rango real de mercado, con fuente citada.
7. **Recommended Price** — solo si hay costos reales disponibles; si no, se marca pendiente y
   se pide el dato.
8. **Unit Economics** — según `offer-pricing-aov.md`.
9. **Margin** — bruto y de contribución, con los datos disponibles.
10. **20 Marketing Angles** — `angles-system.md`.
11. **100 Hooks** — `hooks-system.md` (si el usuario pide el lote completo; para respuestas de
    alcance normal, ofrecer un lote inicial representativo y generar el resto bajo demanda para
    no saturar la respuesta).
12. **20 UGC Concepts** — cruce de ángulo + formato UGC de `video-formats-structure.md`.
13. **20 Viral Concepts** — cruce de ángulo + formato viral.
14. **10 Sales Concepts** — formato conversión, BOFU.
15. **10 Educational Concepts** — formato educativo, MOFU.
16. **10 Storytelling Concepts**.
17. **10 Creator Profiles** — `ugc-creator-engine.md`, los perfiles relevantes al ICP del
    producto.
18. **10 Landing Page Headlines** — variantes de hero para `landing-page.md`.
19. **Offer Strategy** — `offer-pricing-aov.md`.
20. **Bundle Strategy** — con qué otros SKUs del catálogo combina.
21. **Email Funnel** — `email-sms.md`.
22. **Retargeting** — `comments-retargeting.md`.
23. **SEO Strategy** — `seo-strategy.md`.
24. **Social Media Strategy** — `social-distribution-production.md`.
25. **Paid Ads Strategy** — por plataforma (TikTok/Meta/Google), estructura de campaña y
    presupuesto inicial según el primer escalón de `decision-rules-scaling.md`.
26. **Automation Workflow** — `automation-architecture.md`.
27. **KPI Dashboard** — `analytics-dashboard.md`.
28. **Testing Plan** — matriz inicial de `testing-winner-detection.md`.
29. **Winner-Scaling Plan** — `decision-rules-scaling.md`.
30. **7-Day Action Plan** — plan concreto día por día, priorizando: research → producción del
    primer lote → publicación → primera lectura de datos → primera iteración.

## Regla de tamaño de respuesta

Un análisis de 30 puntos para un producto nuevo es un entregable largo. Si el usuario no pidió
explícitamente el paquete completo, entrega primero los puntos 1–10 (research + economics +
avatar) como base de decisión, y ofrece generar el resto (creative, funnel, automatización) a
partir de ahí — esto evita enterrar la decisión más importante (¿vale la pena este producto?)
bajo cientos de líneas de hooks antes de validar que el producto merece la inversión.

## Registro en memoria

Al cerrar el análisis de un producto (se decide testear, se descarta, o se escala), anota en
`MEMORY.md` de esta skill: fecha, producto, decisión, y el dato clave que la sostiene.
