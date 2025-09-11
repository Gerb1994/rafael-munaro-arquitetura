# Padrões SEO para Páginas de Projetos

## 6. PADRÕES PARA PÁGINAS DE PROJETOS

### Template de <title> para Projetos:
```html
<title>[Nome do Projeto] | Arquiteto em [Cidade] | Rafael Munaro</title>
```

### Exemplos de Títulos Otimizados:
- `Casa Moderna Vila Bela | Arquiteto em Capivari | Rafael Munaro`
- `Escritório Corporativo Centro | Arquiteto em Americana | Rafael Munaro`
- `Residência Contemporânea | Arquiteto em Piracicaba | Rafael Munaro`
- `Reforma Residencial Jardim | Arquiteto em Rafard | Rafael Munaro`

### Template de Meta Description para Projetos:
```html
<meta name="description" content="Veja detalhes do projeto [Nome do Projeto], uma [casa/reforma/consultoria] em [Cidade do Projeto], SP. Realizado por Rafael Munaro Arquitetura.">
```

### Exemplos de Meta Descriptions:
- `Veja detalhes do projeto Casa Moderna Vila Bela, uma residência contemporânea em Capivari, SP. Realizado por Rafael Munaro Arquitetura.`
- `Veja detalhes do projeto Escritório Corporativo Centro, um espaço comercial moderno em Americana, SP. Realizado por Rafael Munaro Arquitetura.`
- `Veja detalhes do projeto Residência Contemporânea, uma casa de alto padrão em Piracicaba, SP. Realizado por Rafael Munaro Arquitetura.`

### Estrutura HTML Recomendada para Páginas de Projetos:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Nome do Projeto] | Arquiteto em [Cidade] | Rafael Munaro</title>
    <meta name="description" content="Veja detalhes do projeto [Nome], uma [tipo] em [Cidade], SP. Realizado por Rafael Munaro Arquitetura.">
    <meta name="keywords" content="arquiteto [cidade], projeto [tipo] [cidade], Rafael Munaro, arquitetura [cidade]">
    <link rel="canonical" href="https://rafaelmunaroarquitetura.com/projetos/[slug-projeto]">
    
    <!-- Schema.org para Projeto Específico -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "[Nome do Projeto]",
        "description": "Projeto de [tipo] realizado em [Cidade], SP",
        "creator": {
            "@type": "Person",
            "name": "Rafael Munaro",
            "jobTitle": "Arquiteto"
        },
        "locationCreated": {
            "@type": "Place",
            "name": "[Cidade], SP"
        },
        "dateCreated": "[Data do Projeto]",
        "image": "[URL da imagem principal]"
    }
    </script>
</head>
```

### H1 para Páginas de Projetos:
```html
<h1>[Nome do Projeto] - Arquitetura em [Cidade], SP</h1>
```

### Estrutura de Conteúdo Recomendada:
```html
<main>
    <article class="projeto">
        <header class="projeto__header">
            <h1>[Nome do Projeto] - Arquitetura em [Cidade], SP</h1>
            <p class="projeto__meta">Projeto realizado em [Cidade], SP | [Ano] | [Tipo de Projeto]</p>
        </header>
        
        <section class="projeto__detalhes">
            <h2>Sobre o Projeto</h2>
            <p>Este projeto de [tipo] foi desenvolvido em [Cidade], SP, com foco em [características principais]. O projeto atende às necessidades específicas do cliente, integrando funcionalidade e estética contemporânea.</p>
        </section>
        
        <section class="projeto__galeria">
            <h2>Galeria de Imagens</h2>
            <!-- Imagens com alt text otimizado -->
        </section>
    </article>
</main>
```


