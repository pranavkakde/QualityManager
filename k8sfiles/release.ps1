#Run kubectl to create deployments and services

#kubectl apply -f ./k8sfile/create-map.yaml
#Create configmap
kubectl create configmap db-config --dry-run=client -o yaml --from-literal=DBINSTANCE=$Env:DBINSTANCE `
            --from-literal=DATABASE=$Env:DATABASE  `
            --from-literal=DBUSER=$Env:DBUSER  `
            --from-literal=DBPASSWORD=$Env:DBPASSWORD | kubectl apply -f -
kubectl apply -f .\create-deployment.yaml
kubectl apply -f .\create-service.yaml