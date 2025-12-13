@echo off
echo Pausando OneDrive temporalmente...
echo Por favor, haz clic derecho en el icono de OneDrive en la bandeja del sistema
echo y selecciona "Pausar sincronizacion" por 2 horas
echo.
pause

cd /d "%~dp0"

git config windows.appendAtomically false
git config core.compression 0
git add src/app/page.tsx
git add src/components/TestingTab.tsx
git add src/components/PreciosTab.tsx
git add src/app/api/precios/route.ts
git add src/app/api/precios/export/route.ts
git add src/app/api/precios/import/route.ts
git add package.json
git add src/lib/storage.ts

git commit -m "Add conversation manager and prices panel

- New Testing tab with conversation manager for La Tinta Fine Art Print
- Conversation threads organized by date
- Prices panel with product management and Excel import/export
- Both tabs integrated in main navigation"

git push

echo.
echo Cambios subidos a GitHub!
echo Ahora puedes reactivar OneDrive
pause
