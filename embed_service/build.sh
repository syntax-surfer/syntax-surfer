docker build -t embed-save .
aws ecr create-repository --repository-name embed-save-repo
docker tag embed-save:latest 596108273960.dkr.ecr.us-east-1.amazonaws.com/embed-save-repo:latest
docker push 596108273960.dkr.ecr.us-east-1.amazonaws.com/embed-save-repo:latest