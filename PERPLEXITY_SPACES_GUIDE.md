# Guia para Perplexity Spaces - Traductor de Subtitulos .ASS

## Introduccion

Esta guia esta disenada para agentes y usuarios en **Perplexity Spaces** que necesiten trabajar con traducciones de subtitulos en formato .ass. El repositorio de referencia se encuentra en:

**URL del Repositorio**: https://github.com/Web-Yae-Star/subtitles-dataset

---

## Recursos Disponibles en el Repositorio

En el repositorio puedes acceder a:

1. **AI_GUIDE.md** - Guia detallada de traduccion y adaptacion al espanol latino
2. **+100 archivos .ass** - Ejemplos de subtitulos traducidos con diferentes estilos
3. Archivos con sufijos especiales:
   - `.LAT.ass` - Traducciones latinas confirmadas
   - `_es.ass` - Versiones en espanol
   - `ES-LA.ass` - Espanol latino verificado

---

## Acceso mediante Perplexity Spaces

Para utilizar este repositorio en Perplexity Spaces:

### Opcion 1: Enlace Directo

Vincula directamente la URL del repositorio:
```
https://github.com/Web-Yae-Star/subtitles-dataset
```

Perplexity podra acceder a:
- Archivos README y documentacion
- Estructura de carpetas y archivos
- Contenido de los archivos de guia

### Opcion 2: Archivo Especifico

Para acceder a archivos individuales, utiliza:
```
https://github.com/Web-Yae-Star/subtitles-dataset/blob/main/AI_GUIDE.md
https://github.com/Web-Yae-Star/subtitles-dataset/blob/main/[nombre_archivo].ass
```

### Opcion 3: Vista Raw

Para acceso directo al contenido sin formato GitHub:
```
https://raw.githubusercontent.com/Web-Yae-Star/subtitles-dataset/main/AI_GUIDE.md
```

---

## Flujo de Trabajo en Perplexity Spaces

### Paso 1: Agregar el Repositorio al Space

1. Abre tu Perplexity Space
2. Busca la opcion de "Agregar fuente" o "Add source"
3. Pega la URL: https://github.com/Web-Yae-Star/subtitles-dataset
4. El sistema indexara los archivos disponibles

### Paso 2: Acceder a la Informacion

Una vez vinculado, puedes:
- Consultar la guia de traduccion (AI_GUIDE.md)
- Revisar ejemplos de archivos .ass
- Identificar patrones de traduccion
- Obtener referencias de estilo y adaptacion

### Paso 3: Aplicar el Conocimiento

Utiliza la informacion del repositorio para:
- Traducir nuevos archivos .ass
- Mantener consistencia con ejemplos previos
- Adaptar adecuadamente al espanol latino
- Preservar la estructura tecnica de los archivos

---

## Puntos Clave de la Guia de Traduccion

### Principios Basicos

**HACER:**
- Adaptar, no traducir literalmente
- Usar espanol latino natural
- Mantener contenido sin censura
- Preservar contexto cultural

**NO HACER:**
- Traducciones palabra por palabra
- Usar espanol castellano
- Censurar contenido adulto
- Modificar timings o estructura .ass

### Adaptacion de Expresiones

El repositorio contiene ejemplos de como adaptar expresiones comunes:

| Expresion | Adaptacion |
|-----------|-----------|
| Palabras interjecciones | Usar equivalentes latinos naturales |
| Dialecto informal | Emplear modismos regionales apropiados |
| Lenguaje explicito | Conservar sin suavizar |
| Referencias culturales | Adaptar manteniendo significado |

### Estructura .ASS a Preservar

```ass
Dialogue: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
```

SOLO modificar el campo **Text** con la traduccion.
Mantener intactos: timings, estilos, codigos de formato especial.

---

## Consultas Recomendadas para Perplexity

Cuando uses este Space, puedes hacer consultas como:

1. "Busca ejemplos en el repositorio de como traducir [expresion]"
2. "Muestra un archivo .ass de referencia similar a [descripcion]"
3. "Cual es el patron de traduccion para [tipo de dialogo]?"
4. "Necesito adaptar [texto] siguiendo el estilo del repositorio"
5. "Verifica si esta traduccion sigue las normas de la guia"

---

## Archivos de Referencia Importantes

### Para Entender el Formato

- **Cualquier archivo .ass** del repositorio para ver la estructura
- Observar los campos: Dialogue, Start, End, Text

### Para Aprender el Estilo

- Buscar archivos con patrones similares a tu traduccion
- Comparar como adaptan expresiones similares
- Identificar el registro de lenguaje usado

### Para Verificar Calidad

Usar el Checklist de AI_GUIDE.md:
- Lei suficientes archivos de ejemplo?
- La traduccion suena natural en espanol latino?
- Mantuve el contenido sin censura?
- Preserve toda la estructura .ass?
- Los timings permanecen intactos?
- Los codigos de formato estan completos?
- El registro coincide con el personaje/contexto?

---

## Caracteristicas de Perplexity Spaces para Este Proyecto

Perplexity Spaces te permite:

1. **Acceso rapido** - Indiza automaticamente el contenido del repositorio
2. **Busqueda contextual** - Encuentra ejemplos relevantes rapidamente
3. **Consultas en lenguaje natural** - Pregunta en espanol de manera natural
4. **Analisis de archivos** - Lee y compara multiples archivos .ass
5. **Generacion asistida** - Ayuda a crear traducciones siguiendo los patrones

---

## Tips para Usar Este Space Efectivamente

### Tip 1: Sé Especifico

Mala consulta: "Ayudame con traduccion"
Buena consulta: "Necesito traducir la expresion 'Yamete' en un dialogo entre personajes, muestra ejemplos del repositorio"

### Tip 2: Solicita Comparaciones

"Compara estas dos traducciones segun el estilo usado en el repositorio"

### Tip 3: Usa el Contexto

"Estoy traduciendo una escena de comedia, que patrones de lenguaje usa el repositorio para este genero?"

### Tip 4: Verifica Consistencia

"Verifica que mi traduccion sea consistente con los ejemplos del repositorio"

### Tip 5: Aprende Patrones

"Cuales son los 5 patrones mas comunes de adaptacion en el repositorio?"

---

## Estructura del Repositorio

```
subtitles-dataset/
|-- AI_GUIDE.md (Guia principal de traduccion)
|-- README.md (Descripcion del proyecto)
|-- [+100 archivos .ass]
    |-- Archivos con .LAT.ass (traducciones latinas)
    |-- Archivos con _es.ass (espanol)
    |-- Archivos con ES-LA.ass (espanol latino verificado)
```

---

## Integracion Recomendada con Perplexity

### Para Traductores

1. Crea un Space dedicado a traduccion de subtitulos
2. Vincula el repositorio como fuente de referencia
3. Usa consultas para verificar consistencia
4. Consulta ejemplos antes de cada traduccion

### Para Desarrolladores

1. Crea un Space para analisis de patrones de traduccion
2. Genera reportes de consistencia
3. Identifica nuevos patrones emergentes
4. Documenta best practices descubiertos

### Para Investigadores

1. Analiza patrones de adaptacion regional
2. Estudia variaciones de lenguaje latino
3. Documenta estrategias de traduccion efectivas
4. Crea taxonomias de expresiones adaptadas

---

## Solucionar Problemas Comunes

### Perplexity no accede al repositorio

1. Verifica que la URL sea correcta: https://github.com/Web-Yae-Star/subtitles-dataset
2. Intenta usar la URL raw directa
3. Verifica tu conexion a internet
4. Refresca el Space

### No encuentra archivos especificos

1. Busca por patrones en el nombre: ".LAT.ass", "_es.ass"
2. Usa el nombre parcial del archivo
3. Solicita "todos los archivos del repositorio"
4. Busca por contenido: "episodios", "series"

### Las respuestas no son consistentes

1. Proporciona la guia AI_GUIDE.md como contexto
2. Incluye ejemplos especificos del repositorio
3. Define claramente el tipo de contenido
4. Especifica el nivel de libertad en la adaptacion

---

## Proximos Pasos

1. Abre tu Perplexity Space
2. Agrega la URL del repositorio
3. Consulta: "Resume la guia de traduccion del repositorio"
4. Practica con consultas sobre adaptacion de expresiones
5. Solicita analisis de ejemplos especificos

---

## Recursos Externos

- Repositorio GitHub: https://github.com/Web-Yae-Star/subtitles-dataset
- Documentacion AI_GUIDE.md: Incluida en el repositorio
- Archivos de ejemplo: +100 archivos .ass disponibles

---

*Esta guia debe ser consultada antes de usar el Perplexity Space.*
*Actualizado: 2026*
*Compatible con: Perplexity Spaces, GitHub API, acceso a repositorios publicos*
