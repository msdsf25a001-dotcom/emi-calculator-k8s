# Loan EMI Calculator on Kubernetes (Minikube)

A complete cloud-native **Loan EMI Calculator** web application deployed on a single-node Kubernetes cluster (Minikube). The application stores every calculation in a 3-member **MongoDB Replica Set**, serves traffic through an **NGINX Ingress**, and autoscales using a **Horizontal Pod Autoscaler (HPA)**.

## 📂 Repository Structure
```text
.
├── app/                  # Node.js source code, Dockerfile, .dockerignore
├── k8s/                  # All Kubernetes YAML manifests
├── scripts/              # Load testing and monitoring scripts
├── results/              # Raw outputs and graphs
└── README.md


🚀 How to Bring Up the System on a Fresh Minikube Cluster
Follow these exact steps to deploy the entire application from scratch.

1. Prerequisites
Ensure you have Docker, Minikube, and kubectl installed. Start Minikube and enable the required addons:

bash
minikube start --cpus=4 --memory=6144
minikube addons enable ingress
minikube addons enable metrics-server
2. Build the Docker Image
Navigate to the app directory and build the image directly into Minikube's container runtime:

bash
cd app
minikube image build -t emi-web:1.0 .
cd ..
3. Deploy the Entire System (Single Command)🚀 How to Bring Up the System on a Fresh Minikube Cluster
Follow these exact steps to deploy the entire application from scratch.

1. Prerequisites
Ensure you have Docker, Minikube, and kubectl installed. Start Minikube and enable the required addons:

bash
minikube start --cpus=4 --memory=6144
minikube addons enable ingress
minikube addons enable metrics-server
2. Build the Docker Image
Navigate to the app directory and build the image directly into Minikube's container runtime:

bash
cd app
minikube image build -t emi-web:1.0 .
cd ..
3. Deploy the Entire System (Single Command)
Apply all manifests in the k8s/ directory at once. This will create the StatefulSet, Init Job, Deployments, Services, Ingress, and HPA.

bash
kubectl apply -f k8s/
4. Wait for System to be Ready
The MongoDB replica set takes a few moments to initialize. Wait for the initialization job to complete and all pods to be ready:

bash
# Wait for MongoDB pods to be ready
kubectl wait --for=condition=Ready pod -l app=mongo --timeout=300s

# Wait for the init job to complete
kubectl wait --for=condition=complete job/mongo-init --timeout=120s

# Wait for Web pods to be ready
kubectl wait --for=condition=Ready pod -l app=emi-web --timeout=120s
5. Configure Local DNS (Ingress)
Find your Minikube IP:

bash
minikube ip
Add this IP to your local /etc/hosts file (Linux/macOS/WSL) or C:\Windows\System32\drivers\etc\hosts (Windows):

text
<minikube-ip> emi.local
🌐 Accessing the Application
Open your browser and navigate to:
http://emi.local

(Alternatively, you can use port-forwarding: kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 and open http://localhost:8080).

🧪 Testing
Health Check: curl http://emi.local/health

Calculate EMI:

bash
curl -X POST http://emi.local/api/emi \
  -H "Content-Type: application/json" \
  -d '{"principal":500000,"rate":12,"months":24}'
Apply all manifests in the k8s/ directory at once. This will create the StatefulSet, Init Job, Deployments, Services, Ingress, and HPA.

bash
kubectl apply -f k8s/
4. Wait for System to be Ready
The MongoDB replica set takes a few moments to initialize. Wait for the initialization job to complete and all pods to be ready:

bash
# Wait for MongoDB pods to be ready
kubectl wait --for=condition=Ready pod -l app=mongo --timeout=300s

# Wait for the init job to complete
kubectl wait --for=condition=complete job/mongo-init --timeout=120s

# Wait for Web pods to be ready
kubectl wait --for=condition=Ready pod -l app=emi-web --timeout=120s
5. Configure Local DNS (Ingress)
Find your Minikube IP:

bash
minikube ip
Add this IP to your local /etc/hosts file (Linux/macOS/WSL) or C:\Windows\System32\drivers\etc\hosts (Windows):

text
<minikube-ip> emi.local
🌐 Accessing the Application
Open your browser and navigate to:
http://emi.local

(Alternatively, you can use port-forwarding: kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 and open http://localhost:8080).

🧪 Testing
Health Check: curl http://emi.local/health

Calculate EMI:

bash
curl -X POST http://emi.local/api/emi \
  -H "Content-Type: application/json" \
  -d '{"principal":500000,"rate":12,"months":24}'
