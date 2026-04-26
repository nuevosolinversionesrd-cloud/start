/**
 * Nuevo Sol Inversiones - Predictive SEO Engine (E-E-A-T)
 * Dynamically generates JSON-LD Schema and updates Meta Tags
 */

window.initSEO = function(prop, lang) {
    if (!prop) return;

    // 1. Update Document Title
    const isEn = lang === 'en';
    const typeLabel = isEn ? prop.type_en : prop.type;
    const city = prop.location.city;
    const neighborhood = prop.location.neighborhood;
    
    // Predictive SEO Formula: [Type] in [Location] | [Unique Selling Point]
    const usp = isEn ? "High ROI & Legal Security" : "Plusvalía y Seguridad Jurídica";
    document.title = `${typeLabel} en ${neighborhood}, ${city} | ${usp} | Nuevo Sol`;

    // 2. Update Meta Description
    const priceFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: prop.currency, maximumFractionDigits: 0 }).format(prop.price);
    const desc = isEn 
        ? `Discover this luxury ${typeLabel.toLowerCase()} in ${neighborhood}, ${city}. Priced at ${priceFmt} ${prop.currency}. Featuring ${prop.features.bedrooms} BR and premium finishes. Verified by Dominic.`
        : `Descubre esta exclusiva ${typeLabel.toLowerCase()} en ${neighborhood}, ${city}. Por ${priceFmt} ${prop.currency}. Cuenta con ${prop.features.bedrooms} habitaciones y acabados de lujo. Verificada por Dominic.`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;

    // 3. Inject JSON-LD Schema (Monte's Job)
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": document.title,
        "description": desc,
        "url": window.location.href,
        "image": prop.images.map(img => window.location.origin + '/' + img),
        "offers": {
            "@type": "Offer",
            "price": prop.price,
            "priceCurrency": prop.currency,
            "availability": "https://schema.org/InStock",
            "validFrom": new Date().toISOString()
        },
        "subjectOf": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": prop.location.neighborhood,
                "addressRegion": prop.location.city,
                "addressCountry": "DO"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": prop.location.lat || 18.4861, // Fallback to SD
                "longitude": prop.location.lng || -69.9312
            }
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    console.log('SEO Engine: JSON-LD injected and Meta Tags updated.');
};
