cd /var/projects/dc-car/

npm i

sudo docker stop dc-car
sudo docker rm dc-car
sudo docker rmi -f dc-car

sudo docker build -t dc-car .

cd /var/projects/dc-car/docker/
sudo docker-compose up -d
