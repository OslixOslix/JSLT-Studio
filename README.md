# JSLT Studio

JSLT Studio — это веб‑инструмент для интерактивного тестирования преобразований JSON по правилам JSLT. Приложение разворачивает три панели: исходные данные, схема JSLT и результат, что позволяет быстро проверять логику преобразования без локальной установки движка Schibsted.

## Что внутри
- **App.tsx** — основное React‑приложение с тремя редакторами, подсветкой состояния и запуском трансформации через кнопку `Run Transform`.
- **components/CodeEditor** — переиспользуемый редактор с подсветкой синтаксиса и форматированием ввода.
- **services/jsltService.ts** — тонкий клиент к локальному HTTP‑ендпоинту, который запускает оригинальный движок [Schibsted JSLT](https://github.com/schibsted/jslt) и возвращает результат или сообщение об ошибке.
- **constants.ts** — стартовые примеры входного JSON, схемы JSLT и подсказки для предпросмотра результата.

## Какую задачу решает
Приложение помогает быстро проверять JSLT‑преобразования: вы вводите JSON и схему, сервис отправляет данные в локальный сервер с оригинальной библиотекой Schibsted JSLT, а результат сразу отображается в правой панели. Это снижает время на настройку среды и облегчает отладку правил миграции или интеграционных маппингов.

## Как подключить собственный движок
Приложение включает лёгкий Node/Express‑сервер, который сам вызывает оригинальный Java‑движок. Запросы выполняются локально через команду:

```bash
java -cp java-lib/* com.schibsted.spt.data.jslt.cli.JSLT transform.jslt input.json
```

Сборка Docker устанавливает JRE и скачивает артефакты JSLT + Jackson в `/opt/jslt`. Для собственного окружения:

1. Установите Java 11+.
2. Скачайте jar‑файлы с Maven Central в каталог `java-lib` (или укажите свой путь через `JSLT_JAR_DIR`).
   - [`jslt-0.1.14.jar`](https://repo1.maven.org/maven2/com/schibsted/spt/data/jslt/0.1.14/jslt-0.1.14.jar)
   - [`jackson-databind-2.13.4.2.jar`](https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.13.4.2/jackson-databind-2.13.4.2.jar)
   - [`jackson-annotations-2.13.4.jar`](https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.13.4/jackson-annotations-2.13.4.jar)
   - [`jackson-core-2.13.4.jar`](https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.13.4/jackson-core-2.13.4.jar)
3. Запустите приложение: `npm run build && npm run start`. При желании поменяйте URL вызова движка через `VITE_JSLT_ENDPOINT` (по умолчанию `/api/transform`).
