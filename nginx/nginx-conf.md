Настройка Nginx
===

**p.s. при необходимости измените ip хоста в `/nginx/default:12:27`**

```shell
sudo apt-get update
sudo apt-get -y install nginx
sudo ufw allow 'Nginx HTTP'

sudo cp ./default /etc/nginx/sites-available/default
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

if sudo nginx -t; 
then
    echo "Конфиг валиден. Перезагрузка Nginx"
    sudo systemctl restart nginx
else
    echo "Ошибка в конфиге Nginx."
    exit 1
fi

echo "Nginx успешно перезапущен с новым конфигом"
```