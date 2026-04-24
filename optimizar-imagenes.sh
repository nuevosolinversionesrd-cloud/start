#!/bin/bash
# Script para optimizar imágenes para la web de Nuevo Sol Inversiones
# Reduce el tamaño máximo a 1920px y la calidad al 60% para que carguen súper rápido.

echo "Iniciando optimización de imágenes..."
CARPETA_IMAGENES="assets/images/properties"

if [ ! -d "$CARPETA_IMAGENES" ]; then
  echo "Error: No se encuentra la carpeta $CARPETA_IMAGENES"
  exit 1
fi

# Buscar todas las imágenes jpg, jpeg y png y optimizarlas
find "$CARPETA_IMAGENES" -type f \( -iname \*.jpg -o -iname \*.jpeg -o -iname \*.png \) | while read img; do
  echo "Optimizando: $img"
  # -Z 1920 restringe el lado más largo a 1920px
  # -s formatOptions 60 reduce la calidad al 60% para web
  sips -Z 1920 -s formatOptions 60 "$img" > /dev/null 2>&1
done

echo "✅ Optimización completada. Tus imágenes ahora pesan mucho menos."
