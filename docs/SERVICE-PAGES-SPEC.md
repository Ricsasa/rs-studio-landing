# RS Studio — Service pages v1 specification (ES/EN)

## Project objective

Create a first version of the homepage services section and four dedicated service pages for RS Studio. The goal is to improve SEO, clearly communicate the value of each service, and increase lead generation.

The current "Qué hacemos" section on the homepage will be replaced with a services overview that links to dedicated service pages.

## Language requirements (mandatory)

All content must be implemented in Spanish and English.

This includes:

* Homepage section
* Page titles
* Headings
* Body copy
* Buttons
* CTAs
* FAQ content
* Meta titles
* Meta descriptions
* Open Graph content
* Navigation labels
* Internal links

The implementation should support language switching between ES and EN.

## URL structure (mandatory)

Use English URL slugs for both language versions.

URL slugs stay in English regardless of the selected language. Localization uses the same locale routing already implemented for `/work/[slug]`: the default locale (`es-MX`) has no URL prefix, and the secondary locale (`en-US`) is prefixed with `/en-US/`. No `/es/` prefix exists for the default locale.

| Service | Spanish URL (default, no prefix) | English URL |
|---|---|---|
| Landing pages | /landing-pages | /en-US/landing-pages |
| WordPress e-commerce | /wordpress-ecommerce | /en-US/wordpress-ecommerce |
| CRM, ERP and custom systems | /crm-erp-systems | /en-US/crm-erp-systems |
| Digital marketing | /digital-marketing | /en-US/digital-marketing |

Each page's `getStaticPaths` returns `buildStaticPaths()` from `astro-react-i18next/utils`, matching the pattern in `[...locale]/work/[slug].astro` and `[...locale]/index.astro`. Canonical URLs and hreflang alternates need no separate implementation: `Layout.astro` already emits both for every locale automatically.

## Content source (mandatory)

Service page copy (hero, problem, benefits, deliverables, process, FAQ, SEO keywords) is stored in i18next locale JSON files, not in Astro content collections — content collections stay reserved for the blog's free-form Markdown/MDX posts.

Add a new namespace `services.json` under `public/locales/es-MX/` and `public/locales/en-US/`, one object per service (`landingPages`, `wordpressEcommerce`, `crmErpSystems`, `digitalMarketing`), each holding:

* `title`, `intro` (hero copy)
* `problem`, `whyItMatters` (paragraphs)
* `benefits` (array)
* `deliverables` (array)
* `process` (array of 4 steps)
* `faq` (array of question/answer pairs)
* `seoKeywords` (array)
* `meta.title`, `meta.description`

Pages read this content with `tList()` / `i18n.t()`, the same pattern `Services.astro` uses for `services.items`.

---

## Homepage services section (replaces "Qué hacemos")

### Objective

Replace the current "Qué hacemos" section with a clear services overview that communicates the four core business areas and drives users to the detailed service pages.

This section should function as the primary navigation point to the service pages.

### Section title

Soluciones digitales para hacer crecer tu negocio

### Intro text

Desarrollamos soluciones digitales para aumentar ventas, automatizar procesos y fortalecer la presencia online de tu negocio.

### Service cards

Each card should link to its corresponding service page.

**Landing pages**

Páginas diseñadas para generar contactos, cotizaciones y ventas mediante una experiencia enfocada en conversión.

Link: /landing-pages

**Tiendas online con WordPress**

Desarrollamos e-commerce con WooCommerce para vender productos en línea de forma segura y fácil de administrar.

Link: /wordpress-ecommerce

**CRM, ERP y sistemas personalizados**

Creamos herramientas a medida para gestionar clientes, operaciones, inventario y sistemas de citas desde un solo lugar.

Link: /crm-erp-systems

**Marketing digital**

Administramos campañas en Meta Ads y Google Ads para generar clientes potenciales y aumentar el retorno de inversión.

Link: /digital-marketing

### Interaction

* Entire card should be clickable.
* Include a "Conocer más" link or arrow.
* Hover state should indicate interactivity.
* Cards should be accessible and mobile-friendly.

### Homepage CTA

¿No sabes cuál solución necesita tu negocio?

Te ayudamos a identificar la mejor estrategia según tus objetivos y presupuesto.

Primary CTA: Solicitar una propuesta

Secondary CTA: Agendar una llamada

---

## Target audience

Small and medium-sized businesses in Mexico that need digital presence, online sales, process automation, or paid advertising.

## Primary CTA

Use the same primary call to action across all pages.

Spanish

* Solicitar una propuesta
* Agendar una llamada

English

* Request a proposal
* Schedule a call

**CTA targets (for now)**: both CTAs reuse the existing contact targets already implemented in `Contact.astro` — no new booking tool for v1.

* "Solicitar una propuesta" / "Request a proposal" → `mailto:` link, using `contact.email` from i18next.
* "Agendar una llamada" / "Schedule a call" → WhatsApp, using `whatsappHref()` from `lib/whatsapp.ts` (fixed number, prefilled message via `i18n.t("whatsapp.message")`). A distinct prefilled message per CTA context (homepage vs each service page) can reuse the same `whatsappHref()` helper with a different message key.

CTA should appear:

* Final section only

---

## Global page structure

**1. Hero section**

* H1
* Short value proposition (2–3 sentences)
* Primary CTA
* Supporting visual or illustration

**2. The problem**

Explain the business problem.

**3. Why it matters**

Explain why this is important for growth, competitiveness, and customer acquisition.

**4. Benefits**

Use icon cards with short descriptions.

**5. What we build**

Specific deliverables included in the service.

**6. Our process**

Four-step process.

1. Discovery
2. Strategy
3. Implementation
4. Optimization

**7. FAQ**

4–6 questions.

**8. Final CTA**

Short persuasive paragraph and contact button.

---

## Page 1: Landing pages

### URL

/landing-pages (en-US: /en-US/landing-pages)

### H1

Spanish: Landing pages que convierten visitantes en clientes

English: Landing pages that convert visitors into customers

### Main message

A landing page should generate leads, appointments, quotes, or sales.

### Benefits

* Higher conversion rates
* Better campaign performance
* Mobile optimization
* Fast loading speed
* Conversion tracking

### Deliverables

* Responsive design
* Contact forms
* WhatsApp integration
* Analytics integration
* Basic SEO
* Speed optimization

### Suggested FAQ

* What is a landing page?
* How is it different from a website?
* How long does it take?
* Can it connect with Meta Ads or Google Ads?

### SEO keywords (ES)

* landing pages
* landing page para negocios
* diseño de landing pages
* generación de leads

### SEO keywords (EN)

* landing pages
* lead generation landing pages
* conversion-focused landing pages
* landing page design

---

## Page 2: WordPress e-commerce

### URL

/wordpress-ecommerce (en-US: /en-US/wordpress-ecommerce)

### H1

Spanish: Tiendas online con WordPress y WooCommerce

English: Online stores with WordPress and WooCommerce

### Main message

Sell products online with a scalable and easy-to-manage store.

### Benefits

* 24/7 sales
* Inventory control
* Online payments
* Shipping management
* Easy administration

### Deliverables

* WooCommerce setup
* Product catalog
* Payment gateways
* Shipping configuration
* Coupons
* Analytics
* Basic SEO

### Suggested FAQ

* Why WooCommerce?
* Can I manage the store myself?
* Can it integrate with shipping providers?
* Is it scalable?

### SEO keywords (ES)

* tienda en línea WordPress
* WooCommerce México
* ecommerce WordPress
* desarrollo de tiendas online

### SEO keywords (EN)

* WordPress ecommerce
* WooCommerce development
* online store development
* ecommerce website

---

## Page 3: CRM, ERP and custom systems

### URL

/crm-erp-systems (en-US: /en-US/crm-erp-systems)

### H1

Spanish: CRM, ERP y sistemas personalizados

English: Custom CRM, ERP and business systems

### Main message

Automate operations and centralize business information.

### Benefits

* Process automation
* Better customer management
* Fewer manual errors
* Better reporting
* Business scalability

### Deliverables

**CRM**

* Leads
* Customers
* Sales pipeline
* Follow-ups

**ERP**

* Inventory
* Sales
* Purchases
* Reports

**Booking systems**

* Online scheduling
* Reminders
* Availability management
* Calendar integration

### Suggested FAQ

* Do I need a custom CRM?
* What is the difference between CRM and ERP?
* Can it integrate with WhatsApp?
* Can it replace spreadsheets?

### SEO keywords (ES)

* CRM personalizado
* ERP para empresas
* sistema de citas
* automatización de procesos

### SEO keywords (EN)

* custom CRM
* ERP software
* appointment booking system
* business automation

---

## Page 4: Digital marketing

### URL

/digital-marketing (en-US: /en-US/digital-marketing)

### H1

Spanish: Marketing digital y administración de campañas

English: Digital marketing and campaign management

### Main message

Generate measurable business opportunities through Meta Ads and Google Ads.

### Benefits

* More qualified leads
* Better ROI
* Campaign optimization
* Conversion tracking
* Clear reporting

### Deliverables

* Campaign strategy
* Audience research
* Ad creation
* Budget optimization
* Pixel and conversion tracking
* Monthly reports

### Suggested FAQ

* Meta Ads or Google Ads?
* What budget do I need?
* How are results measured?
* How quickly can campaigns start?

### SEO keywords (ES)

* Meta Ads
* Google Ads
* administración de campañas
* marketing digital para negocios

### SEO keywords (EN)

* Meta Ads management
* Google Ads management
* digital marketing services
* PPC campaign management

---

## Internal linking

The homepage services section should link to each service page.

Each service page should include a "Related services" section.

Suggested links:

* Landing pages → Marketing
* Marketing → Landing pages
* E-commerce → CRM/ERP
* CRM/ERP → E-commerce

All internal links must point to the corresponding language version.

---

## Design consistency requirement (mandatory)

The new homepage services section and all four service pages must maintain the same visual language and layout quality as the existing project detail pages located at /work/[slug].

The /work/[slug] template should be treated as the primary visual reference for spacing, typography, content rhythm, and overall presentation.

### Typography

Use the same typography system currently implemented in /work/[slug].

This includes:

* H1 size and weight
* H2 and H3 hierarchy
* Paragraph font size
* Line height
* Letter spacing
* Text width and readability

### Spacing

Maintain equivalent vertical spacing between sections.

Match the spacing patterns used in /work/[slug] for:

* Hero to content transition
* Section spacing
* Heading margins
* Paragraph spacing
* Card spacing
* CTA spacing

### Layout rhythm

The service pages should follow the same content rhythm as the project pages:

* Clear section separation
* Generous whitespace
* Consistent container widths
* Balanced text and visual composition

### Reusable components

Whenever possible, reuse the same components, utilities, and layout patterns already used by /work/[slug] instead of creating new typography or spacing systems.

### Goal

A visitor should immediately perceive the service pages as part of the same design system and brand identity as the existing project pages.

The implementation must prioritize consistency over novelty.

---

## Technical requirements

* Mobile-first
* Lighthouse score target: 90+
* Optimized images
* Schema markup for services
* Open Graph tags
* Meta title and description
* Sitemap inclusion
* Fast loading (<2s target)
* Language-specific metadata
* Proper hreflang implementation
* Canonical URLs for each language

---

## Success metrics

* Increase organic traffic
* Increase contact form submissions
* Increase WhatsApp clicks
* Improve average time on page
* Improve search visibility for service keywords

---

## Deliverables

1. Homepage services section implemented.
2. Four responsive service pages.
3. Spanish and English versions of all content.
4. Language switch support.
5. Homepage links updated.
6. Reusable page template aligned with /work/[slug].
7. SEO metadata.
8. FAQ sections.
9. CTA sections.
10. Internal linking implemented.
11. Language-specific routing and metadata.

Version: v1

Owner: RS Studio

Status: Ready for implementation
