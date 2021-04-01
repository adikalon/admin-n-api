## admin-n-api
Приложение для реализации REST API, написанное с использованием фреймворка `NestJS` и упакованное в `Docker`. Включает в себя административную панель, управление пользователями и доступ к логам.

В качестве базы данных используется `PostgreSQL` и менеджер администрирования - `Adminer`.  
`Nginx` используется как обратный прокси и контроллер доступа (через HTTP аутентификацию).  
Для просмотра логов докер-контейнеров используется `Dozzle`.  
Роль админ панели выполняет NodeJS библиотека - `AdminBro`.

> Документация является не полной и поверхностной.

### Содержание
* [Запуск](#run)
* [Переменные окружения](#env)
* [Сервисы](#services)
* [Пользователи](#users)
* [Строки](#strings)
* [Конфиги](#configs)

### Запуск через docker-compose <a name="run"></a>
```bash
$ docker-compose up
```

В запсимости от переменной окружения `NODE_ENV` будет собран production или development контейнер.

### Переменные окружения (файл .env) <a name="env"></a>
`PREFIX` - Используется для префикса в именах контейнеров, волюмов, нетворков и пр.  
`TAG_NGINX`, `TAG_DOZZLE`, `TAG_POSTGRES`, `TAG_ADMINER`, `TAG_NODE` - Версии образов. Работоспособность проверялась только на установленных по умолчанию версиях (`.env.example`).  
`UID`, `GID` - Идентификаторы пользователя в юникс-подобных ОС. Необходимы для правильной установки прав внутри контейнеров.  
`PORT` - Основной порт приложения.  
`PORT_DOZZLE` - Порт, для доступа к логам.  
`PORT_ADMINER` - Порт, для доступа к администрированию БД.  
`RESTART` - Параметр `restart`, для `docker-compose.yml`.  
`CLI_POSTGRES_PORT`, `CLI_POSTGRES_HOST` - Порт и хост для доступа к БД из хостовой машины. Необходимы для более удобного управления миграциями в `TypeORM`.  
`NODE_ENV` - `production` или `development`.  
`PG_USER`, `PG_PASSWORD`, `PG_BASENAME` - Настройки для БД.  
`SMS_SERVICE` - Тип сервиса для SMS рассылки. На данный момент реализован только `sms.ru`.  
`SMS_API` - Ключ доступа к API SMS сервиса.  
`EMAIL_SERVICE` - Тип сервиса для Email рассылки. На данный момент реализован только `sendpulse`.  
`EMAIL_SP_USER_ID`, `EMAIL_SP_SECRET` - Ключ доступа к API `SendPulse` сервиса.  
`EMAIL_SP_BOOK_LOGIN` - Идентификатор книги используемой при регистрации/авторизации пользователя.  
`EMAIL_SP_BOOK_CHANGE` - Идентификатор книги используемой при смене email'а.  

### Сервисы <a name="services"></a>
Доступ к сервисам администрирования приложением через веб-браузер:  
`http://localhost:XXX/` - Главная страница приложения  
`http://localhost:XXX/admin/` - Админка AdminBro  
`http://adminer.localhost:XXX/` - Доступ к adminer'у  
`http://dozzle.localhost:XXX/` - Доступ к dozzle  

`XXX` - переменная окружения `PORT`.

Альтернативный доступ в `Dozzle` и `Adminer`:  
`http://localhost:YYY/` - `YYY` - переменная окружения `PORT_DOZZLE` или `PORT_ADMINER`

Доступ в `Dozzle` и `AdminBro` защищен HTTP - аутентификацией.

Закодированный логин и пароль для `Dozzle` тут:  
`docker/config/system.htpasswd`

Для `AdminBro`:  
`docker/config/admin.htpasswd`

Логин и пароль по умолчанию: `admin:admin`

### Пользователи <a name="users"></a>
Регистрация и авторизация пользователя являются один и тем-же действием. Всего существует два типа регистрации: по email и по номеру телефона, один и тот же пользователь может использовать один из вариантов или сразу оба. Сама валидация аутентификации осуществляется через классическую строку-token.

Все запросы должны отправляться методом `POST` с заголовком:  
`Content-Type: application/json`

Все ответы имеют приблизительно такой формат:
```json
{
  "success": true,
  "message": "message",
  "data": {
    ...
  }
}
```

Для регистрации по номеру телефона необходимо отправить запрос по данному адресу:
`/api/user/login/code/phone`

С таким телом:
```json
{
  "phone": 79...
}
```

Разрешены только российские, украинские, белорусские и казахстанские номера.

В случае успеха на указанный номер телефона будет отправлен код для подтверждения регистрации/авторизации. Подтверждение осуществляется по данному маршруту:
`/api/user/login/confirm/phone`

С таким телом:
```json
{
  "code": "53061"
}
```

В случае успеха будет возвращен объект с информцией о пользователе и авторизации, среди ключей объекта будет ключ "`token`", содержащий токен для авторизации. Количество авторизаций (и соответственно токенов) для одного и тогоже пользователя не ограничено.

Для смены номера телефона у уже зарегистрированного пользователя, необходимо отправить запрос по данному адресу:
`/api/user/change/code/phone`

С таким телом:
```json
{
  "access_token": "nXZ...",
  "phone": 79...
}
```

В случае успеха на новый номер телефона будет отправлен код для подтверждения. Подтверждение тут:
`/api/user/change/confirm/phone`

Тело запроса:
```json
{
  "access_token": "nXZ...",
  "code": "84115"
}
```

Регистрация/авторизация по email выглядит аналогичным образом.

Регистрация/авторизация:
`/api/user/login/code/email`

Тело:
```json
{
  "email": "example@domain.test"
}
```

Токен подтверждения будет отправлен в книгу `SendPulse` с переменной code

Подтверждение:
`/api/user/login/confirm/email`

Тело:
```json
{
  "code": "Lzb..."
}
```

Смена email'а:
`/api/user/change/code/email`

Тело:
```json
{
  "access_token": "Lzb...",
  "email": "new_example@domain.test"
}
```

Подтверждение смены:
`/api/user/change/confirm/email`

Тело:
```json
{
  "access_token": "Lzb...",
  "code": "lLt..."
}
```

Если изменить номер телефона у пользователя, который был зарегистрирован по emal'у, тогда номер телефона привяжется к данному пользователю. Аналогичная логика и для смены emeil'а у пользователя, который имеет только номер телефона.

### Строки <a name="strings"></a>
Все текстовые уведомления (например ошибки), можно найти и изменить в данных файлах:  
`src/common/strings/exception.ts`  
`src/modules/user/strings/exceptions-email.ts`  
`src/modules/user/strings/exceptions-phone.ts`  
`src/modules/user/strings/exceptions-user.ts`  
`src/modules/user/strings/responses-email.ts`  
`src/modules/user/strings/responses-phone.ts`  
`src/modules/user/strings/sendings-sms.ts`

### Конфигурационные файлы <a name="configs"></a>
`src/modules/email/config/email.ts`  
`src/modules/sms/config/sms.ts`  
`src/modules/user/config/email.ts`  
`src/modules/user/config/phone.ts`  
`src/modules/user/config/user.ts`
