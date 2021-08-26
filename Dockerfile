FROM registry.fedoraproject.org/fedora-minimal:latest

RUN microdnf install -y python3-requests

COPY extraction_tool/ .

CMD ./extract_token.py
