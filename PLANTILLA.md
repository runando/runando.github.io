---
title: "Título de tu post"
date: 2026-06-09
tags: [Tema, Otro Tema]
excerpt: "Una frase corta que resume el post. Aparece en la lista del blog."
draft: true
---
**Cómo usar esta plantilla:** copia este archivo, renómbralo (p. ej. `mi-post.md`), edita la cabecera de arriba y, cuando esté listo, **borra la línea `draft: true`**. Mientras tenga esa línea, el post no se publica.

A partir de aquí escribes en Markdown. Esto es lo que entiende la web y cómo se ve:

## Un encabezado de sección (##)

Texto normal en párrafos. Puedes poner palabras en **negrita** para destacar, *cursiva* para matizar, o un poco de `código en línea` dentro de la frase. Los enlaces se ven así: [mi perfil de X](https://x.com/runando).

### Un subencabezado (###)

Listas con viñetas:

- Primer punto
- Segundo punto
- Tercero

Listas numeradas:

1. Paso uno
2. Paso dos
3. Paso tres

> Una cita destacada queda con una barra de color a la izquierda. Útil para una idea fuerte o un fragmento que quieras resaltar.

## Código

Bloque de código con resaltado de fondo (indica el lenguaje tras las comillas):

```python
def hola(nombre: str) -> str:
    return f"Hola, {nombre}"
```

## Tabla

| Columna | Descripción |
|---------|-------------|
| A       | Primera     |
| B       | Segunda     |

## Imagen

Para una imagen, súbela a una carpeta (p. ej. `posts/img/`) y enlázala así:

![Texto alternativo](img/mi-imagen.jpg)

---

Y un separador horizontal (`---`) para cerrar secciones. Eso es todo: escribe, guarda y haz commit en GitHub.
