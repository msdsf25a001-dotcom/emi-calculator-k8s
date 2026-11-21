# Loan EMI Calculator on Kubernetes (Minikube)

A complete cloud-native **Loan EMI Calculator** web application deployed on a single-node Kubernetes cluster (Minikube). The application stores every calculation in a 3-member **MongoDB Replica Set**, serves traffic through an **NGINX Ingress**, and autoscales using a **Horizontal Pod Autoscaler (HPA)**.

## 🏗️ Architecture
- **Frontend:** HTML, jQuery, Bootstrap (AJAX-based, no page reloads)
- **Backend:** Node.js + Express
- **Database:** MongoDB (StatefulSet with 3 replicas, 1Gi PVCs per pod)
- **Routing:** NGINX Ingress Controller (`http://emi.local`)
- **Autoscaling:** HPA (1–5 pods, target 50% CPU utilization)

## 📂 Repository Structure
```text
.
├── app/                  # Node.js source code, Dockerfile, .dockerignore
│   ├── public/           # HTML/JS frontend files
│   ├── server.js         # Express backend
│   ├── Dockerfile
│   └── package.json
├── k8s/                  # Kubernetes YAML manifests
│   ├── mongo-headless-service.yaml
│   ├── mongo-statefulset.yaml
│   ├── mongo-init-job.yaml
│   ├── mongo-configmap.yaml
│   ├── emi-web-deployment.yaml
│   ├── emi-web-service.yaml
│   ├── emi-web-ingress.yaml
│   └── emi-web-hpa.yaml
├── scripts/              # Load testing and monitoring scripts
└── README.md
