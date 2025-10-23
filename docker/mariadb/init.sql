-- Script de inicialización para MariaDB
-- Se ejecuta automáticamente al crear el contenedor

-- Crear base de datos de desarrollo (ya se crea con MARIADB_DATABASE, pero por si acaso)
CREATE DATABASE IF NOT EXISTS nemesis_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear base de datos de QA (para cuando necesites probar localmente el ambiente QA)
CREATE DATABASE IF NOT EXISTS nemesis_qa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear base de datos de testing (útil para tests unitarios/integración)
CREATE DATABASE IF NOT EXISTS nemesis_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Otorgar permisos al usuario en todas las bases de datos
GRANT ALL PRIVILEGES ON *.* TO 'nemesis_user'@'%' WITH GRANT OPTION;

-- Otorgar permiso para crear bases de datos (necesario para shadow database de Prisma)
GRANT CREATE ON *.* TO 'nemesis_user'@'%';
GRANT CREATE ON *.* TO 'nemesis_user'@'localhost';

-- Otorgar permiso para eliminar bases de datos (necesario para limpiar shadow database)
GRANT DROP ON *.* TO 'nemesis_user'@'%';
GRANT DROP ON *.* TO 'nemesis_user'@'localhost';

FLUSH PRIVILEGES;

-- Log de inicialización
SELECT 'Databases initialized successfully!' AS Status;
