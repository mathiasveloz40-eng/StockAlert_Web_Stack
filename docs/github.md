# Publicar el proyecto en GitHub

Esta guía conecta la carpeta local `starter-project` con un repositorio remoto de GitHub y da acceso al equipo. El ZIP no trae una carpeta `.git`: cada equipo crea su propio historial y repositorio.

## 1. Preparar y comprobar la carpeta local

Descomprime el ZIP. Abre una terminal en `starter-project` y ejecuta:

```bash
npm install
npm run build
npm test
git init
git branch -M main
git status
```

`npm install` genera `package-lock.json`; consérvalo en el repositorio para fijar las dependencias resueltas para el equipo.

Si Git todavía no conoce tu identidad, define el nombre y correo para los commits de este proyecto:

```bash
git config user.name "Nombre Apellido"
git config user.email "correo-del-commit@example.com"
```

Usa un correo que puedas asociar con tu cuenta de GitHub, según las preferencias de privacidad de tu cuenta. Estos comandos, sin `--global`, afectan solo al repositorio actual.

## 2. Crear un repositorio remoto vacío

En GitHub, crea un repositorio para el proyecto. Para evitar historiales que diverjan, créalo sin README, licencia ni `.gitignore`: esos archivos ya vienen en el proyecto local.

Copia la URL HTTPS del repositorio. Tendrá una forma parecida a:

```text
https://github.com/USUARIO/NOMBRE-DEL-REPOSITORIO.git
```

## 3. Guardar y subir el primer commit

Desde la terminal ubicada en `starter-project`, ejecuta:

```bash
git add .
git status
git commit -m "chore: inicia proyecto base"
git remote add origin https://github.com/USUARIO/NOMBRE-DEL-REPOSITORIO.git
git remote -v
git push -u origin main
```

Reemplaza la URL de ejemplo por la URL real. Si GitHub solicita autenticación, usa el flujo seguro de Git configurado en tu equipo. No escribas contraseñas ni tokens dentro de la URL, del código o de archivos del proyecto.

Al finalizar, abre el repositorio en GitHub y comprueba que aparecen el README, `src/`, `tests/` y `docs/`.

## 4. Invitar al equipo

La persona propietaria del repositorio invita a cada integrante con su nombre de usuario de GitHub desde la configuración de acceso del repositorio. Cada invitado debe aceptar la invitación antes de colaborar. La interfaz de GitHub puede cambiar; consulta su documentación oficial si las opciones aparecen en otra ubicación.

Después de aceptar, cada integrante clona el mismo repositorio en su equipo:

```bash
git clone https://github.com/USUARIO/NOMBRE-DEL-REPOSITORIO.git
cd NOMBRE-DEL-REPOSITORIO
git status
```

No vuelvan a inicializar Git ni creen repositorios separados para el mismo equipo.

## 5. Rutina básica de trabajo

Antes de editar, actualiza la rama principal:

```bash
git pull --rebase origin main
```

Después de realizar un cambio:

```bash
git status
git add ARCHIVO-O-CARPETA
git commit -m "docs: completa contexto del sistema"
git push
```

Usa mensajes que expliquen el cambio. Coordina con el equipo para evitar que dos personas editen a la vez la misma sección de documentación. Si Git informa un conflicto, no borres cambios para resolverlo a ciegas: conserva una copia y pide apoyo al docente.

## 6. Revisión antes de subir cambios

- `git status` muestra únicamente los archivos que esperas compartir.
- No se incluyen `.env`, contraseñas, claves, tokens ni datos personales reales.
- `node_modules/` y `dist/` no se suben; están ignorados por `.gitignore`.
- El proyecto compila y sus pruebas pasan en tu equipo.
- Los cambios relevantes se reflejan en `docs/bitacora.md`.

