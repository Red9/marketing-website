#!/bin/bash

sudo apt-get install python-software-properties
sudo apt-add-repository ppa:chris-lea/node.js
sudo apt-get update

sudo apt-get -y install nodejs postgresql postgresql-contrib apache2

# Setup PostgreSQL database, table and user

sudo -u postgres psql --command '\password postgres' # create a password here
sudo -u postgres psql -c "CREATE USER red9 WITH ENCRYPTED PASSWORD 'Red9Marketing778';"
sudo -u postgres createdb red9marketing
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE red9marketing TO red9;"
sudo -u postgres psql -d red9marketing -c "CREATE TABLE registrationsq ( id SERIAL primary key, email TEXT UNIQUE, fullname TEXT, postalcode TEXT, time_registered TIMESTAMP NOT NULL DEFAULT now());"
sudo -u postgres psql -d red9marketing -c "GRANT ALL ON registrations TO red9;"
sudo -u postgres psql -d red9marketing -c "GRANT ALL ON registrations_id_seq TO red9;"
