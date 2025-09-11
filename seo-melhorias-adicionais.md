# Melhorias Adicionais de SEO

## 7. MELHORIAS ADICIONAIS RECOMENDADAS

### Breadcrumbs para Navegação:
```html
<nav aria-label="Breadcrumb" class="breadcrumb">
    <ol class="breadcrumb__list">
        <li class="breadcrumb__item">
            <a href="/" class="breadcrumb__link">Início</a>
        </li>
        <li class="breadcrumb__item">
            <a href="/portfolio" class="breadcrumb__link">Portfólio</a>
        </li>
        <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">
            [Nome do Projeto]
        </li>
    </ol>
    </nav>
```

### Schema.org para Breadcrumbs:
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": "https://rafaelmunaroarquitetura.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Portfólio",
            "item": "https://rafaelmunaroarquitetura.com/portfolio"
        },
        {
            "@type": "ListItem",
            "position": 3,
            "name": "[Nome do Projeto]",
            "item": "https://rafaelmunaroarquitetura.com/projetos/[slug]"
        }
    ]
}
</script>
```

### Meta Tags Adicionais para SEO Local:
```html
<!-- Geo Tags -->
<meta name="geo.region" content="BR-SP">
<meta name="geo.placename" content="Capivari">
<meta name="geo.position" content="-22.9956;-47.5084">
<meta name="ICBM" content="-22.9956, -47.5084">

<!-- Local Business Tags -->
<meta name="business:contact_data:locality" content="Capivari">
<meta name="business:contact_data:region" content="SP">
<meta name="business:contact_data:postal_code" content="13360-152">
<meta name="business:contact_data:country_name" content="Brasil">
```

### Otimização de URLs (Sugestões):
- `/arquiteto-capivari` - Página específica para Capivari
- `/arquiteto-americana` - Página específica para Americana  
- `/arquiteto-piracicaba` - Página específica para Piracicaba
- `/projetos-residenciais-capivari` - Projetos residenciais por cidade
- `/projetos-comerciais-americana` - Projetos comerciais por cidade

### Conteúdo Adicional Recomendado:

#### Seção FAQ Otimizada:
```html
<section class="faq section">
    <div class="container">
        <h2>Perguntas Frequentes - Arquiteto em Capivari, Americana e Piracicaba</h2>
        
        <div class="faq__item">
            <h3>Quanto custa um projeto arquitetônico em Capivari?</h3>
            <p>O valor de um projeto arquitetônico em Capivari varia conforme a complexidade e tamanho. Entre em contato para um orçamento personalizado.</p>
        </div>
        
        <div class="faq__item">
            <h3>Rafael Munaro atende em Americana e Piracicaba?</h3>
            <p>Sim, atendemos regularmente em Americana, Piracicaba e toda a região de Campinas. Nosso escritório fica em Capivari/SP.</p>
        </div>
    </div>
</section>
```

#### Schema.org para FAQ:
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Quanto custa um projeto arquitetônico em Capivari?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "O valor de um projeto arquitetônico em Capivari varia conforme a complexidade e tamanho. Entre em contato para um orçamento personalizado."
            }
        },
        {
            "@type": "Question",
            "name": "Rafael Munaro atende em Americana e Piracicaba?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim, atendemos regularmente em Americana, Piracicaba e toda a região de Campinas. Nosso escritório fica em Capivari/SP."
            }
        }
    ]
}
</script>
```


