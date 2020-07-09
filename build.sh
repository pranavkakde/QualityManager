#!/bin/bash
docker run --rm -v "$PWD":/app treeder/bump patch
version=`cat VERSION`
#run docker compose
docker-compose build
#tag images for latest version
imagelist=( 'pranavkakde/qualitymanager_mainbuild' 'pranavkakde/qualitymanager_auth-services' 'pranavkakde/qualitymanager_gateway-services' 'pranavkakde/qualitymanager_release-services' 'pranavkakde/qualitymanager_project-services' 'pranavkakde/qualitymanager_testcase-services' 'pranavkakde/qualitymanager_client-services' 'pranavkakde/qualitymanager_testsuite-services' 'pranavkakde/qualitymanager_defect-services' 'pranavkakde/qualitymanager_user-services')
for i in "${imagelist[@]}"
do	
    docker tag $i:latest $i:$version
    docker tag $i:latest $i:$buildversion
done
#push VERSION to git
#git add VERSION
#git commit -m "updated latest version"
#git push 
