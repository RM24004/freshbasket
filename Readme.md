Universidad de El Salvador 
Facultad Multidisciplinaria de Occidente – Ingeniería en Desarrollo de Software .


# Projecto FreshBasket
Este es la base para el projecto de materia desarrollo de aplicaciones web, para el año 2026 de la Universidad de El Salvador, posteriror mente se haran mas modificacion basados en JavaScript y otras technologias aplicadas a esta materia.



## Estructura del Proyecto
- `/frontend` - Interfaz de usuario
- `/backend` - API y lógica del servidor
- `/database` - Scripts y configuración de Base de Datos


##Otros


## Tutor: Ing. Victoria Castro 


## Integrantes -- nombre y carnet
| # | Nombre                             | carnet |
|---|------------------------------------|--------|
| 1 |Victor Alberto Rodriguez Monterrosa |RM24004 |
| 2 |Alexander Alonso Zeceña Martinez    |ZM24004 |
| 3 |José Alfredo López Rivera           |LR24003 |
| 4 | Irvin Adonay Ramirez linares   | RL22020 |
| 5 |Claudia Melissa Hernandez Ceren     |HC24020 |
|---|------------------------------------|--------|

Segundo paso:
Laboratorio 2: Backend Funciona

Objetivo:

Demostrar la capacidad de implementar un sistema persistente bajo una
arquitectura de N-Capas, asegurando el desacoplamiento de datos mediante DTOs y
la exposición profesional de servicios a través de OpenAPI

-- Descripción del Trabajo Realizado

Este proyecto implementa una arquitectura de N-Capas con las siguientes fases:

**Fase A - Persistencia con PostgreSQL:**
Se mapeó la entidad principal con @Entity, se implementó el repositorio
con JpaRepository y se generó el script SQL del schema de la base de datos.

**Fase B - Arquitectura y Mapeo:**
Se implementó la capa de servicio con conversión de objetos Entity a DTO
y viceversa, organizando el proyecto en paquetes: controller, service,
repository, entity y dto.

**Fase C - Swagger y OpenAPI:**
Se configuró la documentación con título, descripción y versión del proyecto,
y se documentaron los 4 métodos CRUD (GET, POST, PUT, DELETE)
usando @Operation y @Tag.
