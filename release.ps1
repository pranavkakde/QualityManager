#Run kubectl to create deployments and services

#kubectl apply -f ./k8sfile/create-map.yaml
#Create configmap
kubectl create configmap db-config --from-literal=DBINSTANCE=$Env:DBINSTANCE `
            --from-literal=DATABASE=$Env:DATABASE  `
            --from-literal=DBUSER=$Env:DBUSER  `
            --from-literal=DBPASSWORD=$Env:DBPASSWORD  ; kubectl apply

kubectl apply -f ./k8sfile/create-deployment.yaml
kubectl apply -f ./k8sfile/create-service.yaml