# Loan EMI Calculator on Kubernetes

This project deploys a simple Loan EMI Calculator application on a local Kubernetes cluster using Minikube. The application uses MongoDB for data storage and NGINX Ingress to make the web application accessible through a local hostname.

The deployment also includes a MongoDB replica set and a Horizontal Pod Autoscaler (HPA) for the web application.

## Project overview

The main parts of the project are:

- **Loan EMI Calculator:** A Node.js application that calculates the monthly instalment for a loan.
- **MongoDB:** Stores application data and runs as a three-member replica set.
- **NGINX Ingress:** Routes browser requests to the application.
- **Horizontal Pod Autoscaler:** Adjusts the number of application pods according to resource usage.

## Project structure

The repository is organised into the following folders:

```text
emi-calculator/
├── app/                  # Node.js application and its Dockerfile
├── k8s/                  # Kubernetes manifests
├── scripts/              # Helper scripts, if required
├── results/              # Screenshots and deployment results
└── README.md             # Project instructions
```

The names above describe the expected project layout. If your local folder uses different names, update this tree so it matches the files in your repository.

## Requirements

Install the following tools before starting:

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- A browser

Make sure Docker is running before you start Minikube.

## 1. Start Minikube

Open a terminal in the project directory and start a local Kubernetes cluster:

```bash
minikube start --cpus=4 --memory=6144
```

Enable the Ingress and Metrics Server addons:

```bash
minikube addons enable ingress
minikube addons enable metrics-server
```

Check that the cluster is running:

```bash
kubectl get nodes
```

Wait until the node shows a `Ready` status.

## 2. Build the application image

Build the Docker image inside Minikube so that Kubernetes can use the image locally:

```bash
cd app
minikube image build -t emi-web:1.0 .
cd ..
```

Check that the image is available:

```bash
minikube image ls
```

The image name and tag used here must match the image configured in the application Deployment manifest.

## 3. Deploy the Kubernetes resources

Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/
```

This command applies the YAML files in the `k8s` directory. Make sure the manifests define the required namespace, MongoDB resources, MongoDB initialisation Job, application resources, Ingress and HPA.

Check the resources created in the cluster:

```bash
kubectl get all -A
```

If the manifests deploy the project into a namespace named `emi`, use the commands in the next section with `-n emi`. If they use the `default` namespace, omit `-n emi`.

## 4. Wait for the pods and MongoDB initialisation

For a deployment that uses the `emi` namespace and the resource names and labels shown below, run:

```bash
kubectl wait --for=condition=Ready pod -l app=mongo -n emi --timeout=300s
kubectl wait --for=condition=complete job/mongo-init -n emi --timeout=120s
kubectl wait --for=condition=Ready pod -l app=emi-web -n emi --timeout=120s
```

These commands wait for the MongoDB pods, the MongoDB initialisation Job and the web application pods.

**Important:** The namespace, pod labels and Job name in these commands must match the values in your Kubernetes YAML files. If your manifests use different names, change the commands accordingly. You can inspect the actual names with:

```bash
kubectl get pods,jobs -n emi
```

If your project does not use the `emi` namespace, run the command without `-n emi`.

## 5. Configure the local hostname

Get the Minikube IP address:

```bash
minikube ip
```

On Windows, open Notepad as Administrator and edit this file:

```text
C:\Windows\System32\drivers\etc\hosts
```

Add a line using the IP address returned by `minikube ip`:

```text
<MINIKUBE_IP> emi.local
```

Replace `<MINIKUBE_IP>` with the actual IP address. Save the file.

On Linux or macOS, edit `/etc/hosts` with administrator privileges and add the same entry.

## 6. Open the application

Open the following address in your browser:

```text
http://emi.local
```

If the page does not load, check that the Ingress controller is running and that the Ingress resource has been created:

```bash
kubectl get pods -n ingress-nginx
kubectl get ingress -A
```

You can also check the Minikube IP and confirm that the `emi.local` entry in your hosts file is correct.

## 7. Test the application

### Health check

Open this endpoint in your browser or test it from a terminal:

```bash
curl http://emi.local/health
```

A successful response should indicate that the application is running. The exact response depends on the implementation of the health endpoint.

### EMI calculation API

Send a POST request to the EMI endpoint:

```bash
curl -X POST http://emi.local/api/emi \
  -H "Content-Type: application/json" \
  -d '{"principal": 500000, "rate": 12, "months": 60}'
```

This example sends a loan amount, an annual interest rate and a repayment period. The request field names must match the API implemented in the application. If your application uses different field names, update the example before running it.

## 8. Check Kubernetes resources

Use these commands to review the deployment:

```bash
kubectl get pods -A
kubectl get deployments -A
kubectl get services -A
kubectl get ingress -A
kubectl get hpa -A
```

To inspect application pod details, use:

```bash
kubectl describe pods -n emi
```

To view application logs:

```bash
kubectl logs -l app=emi-web -n emi
```

To view MongoDB logs:

```bash
kubectl logs -l app=mongo -n emi
```

If your resources are not in the `emi` namespace, replace `-n emi` with the correct namespace or omit it.

## 9. Check autoscaling

The HPA uses resource metrics to decide whether the application needs more or fewer replicas.

Check its status:

```bash
kubectl get hpa -A
```

You can also watch the HPA while sending requests to the application:

```bash
kubectl get hpa -n emi --watch
```

Metrics may take a short time to become available after the Metrics Server starts. If the HPA shows unknown resource values, check the Metrics Server and pod resource requests:

```bash
kubectl get pods -n kube-system
kubectl top pods -n emi
```

The HPA can only make scaling decisions when the required metrics and resource configuration are available.

## 10. Stop and remove the deployment

To remove the Kubernetes resources created from the project manifests, run:

```bash
kubectl delete -f k8s/
```

To stop Minikube:

```bash
minikube stop
```

To delete the local cluster completely:

```bash
minikube delete
```

Use `minikube delete` only when you no longer need the cluster or its resources.

## 11. Save the project to GitHub

If Git is installed, initialise the repository (if it has not already been initialised):

```bash
git init
git add .
git commit -m "Add Loan EMI Calculator Kubernetes deployment"
```

Create an empty repository on GitHub, then connect your local project to it. Replace the URL below with your own repository URL:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

If a remote named `origin` already exists, update it instead of adding it again:

```bash
git remote set-url origin <YOUR_GITHUB_REPOSITORY_URL>
```

## Troubleshooting

| Problem | What to check |
|---|---|
| Minikube does not start | Check that Docker is running and that your machine has enough available memory and CPU. |
| Application image is not found | Confirm that the image was built inside Minikube and that the Deployment uses the same image name and tag. |
| Pods remain in `Pending` or `ImagePullBackOff` | Run `kubectl describe pod <POD_NAME> -n emi` and review the events. |
| MongoDB initialisation Job fails | Check the Job logs with `kubectl logs job/mongo-init -n emi` and confirm that the MongoDB services and configuration match the manifest. |
| `emi.local` does not open | Check the hosts file entry, Ingress resource and NGINX Ingress controller pods. |
| HPA shows unknown metrics | Check the Metrics Server and make sure the application containers have CPU resource requests configured. |

For more detail about a failing resource, use:

```bash
kubectl describe <RESOURCE_TYPE> <RESOURCE_NAME> -n emi
```

## Notes

- Run the commands from the project root unless a command says otherwise.
- Resource names, labels, namespaces, image tags and API request fields must match the actual files in this repository.
- The commands in this README are a deployment guide. Check them against your Kubernetes manifests and application code before submission.
