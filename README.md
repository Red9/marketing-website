#Setting up the marketing server 
From a fresh Ubuntu install, run the provision.sh script in this respository.  This will
install and configure node and postgres.  When prompted, please enter a password for the
postgres user.

#Run the server as a service
Use the following Upstart script if you want to run the server as a service (you do):
description "node.js server - red9 marketing website"
author "Merwan Rodriguez - merwan@gmail.com"


```
#!bash

start on started mountall
stop on shutdown

# Respawn if necesary
respawn
respawn limit 99 5

script
        export HOME="/home/ubuntu"

        exec sudo /usr/bin/node /home/ubuntu/red9marketing/server.js >> /var/log/node.log 2>&1
end script

post-start script
        #Need a notifier script here
end script

```


#Export list of emails in CSV format 

To do this, simply run this command:

`echo "COPY (SELECT * FROM registrations) TO STDOUT With CSV HEADER;" | sudo -u postgres psql red9marketing | cat > ~/registrations.csv`

A file called `registrations.csv` will be created in your home directory.