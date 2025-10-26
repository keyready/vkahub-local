Установка клиента
===

Есть два стула:
1. Билд готовый
2. Докер дроченый
3. Дев-сервер облегченный

p.s. если надо измените ip хоста в `/client/src/shared/api/api.ts:10`

В первых двух вариантах надо раздавать статику любым сервером. Можете написать на express, можете использовать nginx. Надо раздавать статику из `/app/usr/client/`, я даже nginx-конфиг подготовил для таких утех

Если первый вариант (**и ip хоста не меняли**):  
```shell
sudo cp ./dist /app/usr/client/
```

Если второй вариант (я кста его не проверял):
```shell
docker build -t vkahub-client-build .

docker run --rm --name vkahub-client-temp vkahub-client-build sh -c "cp -r /dist /tmp/dist && tar -cf - -C /tmp dist" > dist.tar

mkdir -p ./dist
tar -xf dist.tar -C ./dist

sudo mkdir -p /app/usr/client/
sudo cp -r ./dist/* /app/usr/client/
```

Если третий (для конкретно отбитых):
- обязательно измените ip хоста в `/client/vite.config.ts:23`
```shell
*установите node js*
npm i 
npm run dev
*молитесь*
```