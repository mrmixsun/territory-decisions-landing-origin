#!/bin/zsh
# Двойной клик по файлу публикует текущую рабочую версию сайта в GitHub Pages.
# Проверки, тесты и git pull намеренно не запускаются.

set -e

ROOT_DIR="${0:A:h}"
SITE_DIR="$ROOT_DIR/site"
MESSAGE="${1:-Обновление сайта $(date '+%Y-%m-%d %H:%M')}"

cd "$ROOT_DIR"

# Обновить docs/ из исходников: GitHub Pages публикует именно эту папку.
node "$SITE_DIR/scripts/build.mjs"
cp -R "$SITE_DIR/dist/." "$ROOT_DIR/docs/"

# Опубликовать всё, что сейчас изменено в репозитории сайта.
git add -A
git commit -m "$MESSAGE"
git push origin main

echo
echo "Готово: изменения отправлены в GitHub Pages."
echo "Сайт: https://mrmixsun.github.io/territory-decisions-landing-origin/"
echo
read "?Нажмите Enter, чтобы закрыть окно... "
