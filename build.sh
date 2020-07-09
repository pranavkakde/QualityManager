#!/bin/bash
# run docker compose build
docker-compose build
# tag images for latest version
#imagelist=( 'pranavkakde/qualitymanager_mainbuild' 'pranavkakde/qualitymanager_auth-services' 'pranavkakde/qualitymanager_gateway-services' 'pranavkakde/qualitymanager_release-services' 'pranavkakde/qualitymanager_project-services' 'pranavkakde/qualitymanager_testcase-services' 'pranavkakde/qualitymanager_client-services' 'pranavkakde/qualitymanager_testsuite-services' 'pranavkakde/qualitymanager_defect-services' 'pranavkakde/qualitymanager_user-services')
imagelist=($(docker images | awk '{ if ($1 ~ /pranavkakde\/qualitymanager*/) { print $1 } }'))
for i in "${imagelist[@]}"
do	    
    docker tag $i:latest $i:$buildversion
done