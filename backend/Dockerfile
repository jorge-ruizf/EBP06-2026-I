# Imagen con Java
FROM eclipse-temurin:17-jdk-jammy

# Carpeta de trabajo
WORKDIR /app

# Copiar el jar
COPY target/*.jar app.jar

# Ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]