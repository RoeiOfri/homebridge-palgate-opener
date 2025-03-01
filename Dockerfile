FROM registry.fedoraproject.org/fedora-minimal:latest

WORKDIR /app

# Install Python, pip, and git
RUN microdnf install -y python3 python3-pip git && \
    microdnf clean all

# Upgrade pip
RUN pip3 install --upgrade pip

# Install pylgate, requests, and qrcode - mandatory for running the extraction script
RUN pip3 install git+https://github.com/DonutByte/pylgate.git@main requests qrcode

# Clone the full repo to run the script that registered your device as a linked device
RUN git clone https://github.com/DonutByte/pylgate.git /app/pylgate-repo

# Run the script from the cloned repo
CMD ["python3", "/app/pylgate-repo/examples/generate_linked_device_session_token.py"]