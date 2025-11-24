# VkaHub

```VkaHub``` - проект, разработанный для аггрегации и мониторинга деятельности военно-научного общества 61 кафедры ВКА им.А.Ф.Можайского

# Quick Start

1. Клонируем репозиторий:
```shell
git clone <repository-url>/vkahub-local.git
cd vkahub-local
```

2. Инициализируем файл конфигураций `configs/production.yaml` и файл переменных окружения `.env`:
```yaml
database:
  username: postgres
  password: postgres
  host: db
  port: 5432
  databaseName: vkahub
  sslMode: false

migrations:
  enable: true
  connUri: postgres://postgres:postgres@db:5432/vkahub?sslmode=disable
  dirUrl: file:///app/migrations
  mock: 
    enable: false
    dirUrl: file:///app/mock

authorizer:
  accessSecretKey: access-secret-key
  refreshSecretKey: refresh-secret-key
```

```env
PGADMIN_DEFAULT_EMAIL=vkahub-admin@vkahub.com
PGADMIN_DEFAULT_PASSWORD=admin-61kaf-vkahub
PGADMIN_LISTEN_PORT=5001

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vkahub
```

3. Запускаем приложение при помощи `docker compose`:
```shell
docker compose -f docker-compose.yaml up --build 
```