cd /var/projects/PTCGP_WEB/client
npm ci
npm run build

cp -r /var/projects/PTCGP_WEB/client/dist/spa/* /var/projects/PTCGP_WEB/server/public