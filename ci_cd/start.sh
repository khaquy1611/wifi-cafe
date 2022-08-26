#/bin/bash 
# Set and generate DOCKER_CONFIG_FILE
DOCKER_CONFIG_FILE="/server/variables.docker"

if [ -f "$DOCKER_CONFIG_FILE.rb" ]; then
  echo "$(date) - Processing ERB templates"
  for file in $(find . -maxdepth 5 -type f -name \*.erb); do
    echo "$(date) - Generating $(echo $file | cut -d '.' -f 1,2,3) from $file"
    erb -r $DOCKER_CONFIG_FILE $file > $(echo $file | cut -d '.' -f 1,2,3)
  done
fi
if [ -f /server/nginx-site.conf ]; then
  cp /server/nginx-site.conf /etc/nginx/sites-available/default.conf
fi
exec /usr/bin/supervisord -n -c /etc/supervisord.conf                                                         