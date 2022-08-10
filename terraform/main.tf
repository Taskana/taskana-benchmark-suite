data "aws_ami" "ubuntu" {
    # In case of multiple AMIs being returned we want to use the latest release candidate for our filters.
    most_recent = true

    # Filter for Ubuntu 20.04 AMIs.
    filter {
        name = "name"
        values = ["ubuntu/images/hvm-ssd/*20.04-amd64-server-*"]
    }

    # Filter for the correct virtualization type.
    # This is important to not accidentally get an AMI with paravirtual virtualization which has no guaranteed compute SLA.
    filter {
        name = "virtualization-type"
        values = ["hvm"]
    }

    # Only get AMIs from Canonical (https://ubuntu.com/server/docs/cloud-images/amazon-ec2).
    owners = ["099720109477"]
}

provider "aws" {
    # Provisioning EC2 instance to eu-central-1 (Frankfurt).
    region = "eu-central-1"
}

resource "aws_instance" "taskana_benchmark" {
    # Specify AMI from aws_ami data block
    ami = data.aws_ami.ubuntu.id

    # Instance provisioned by Technical Services
    instance_type = "t3.small"

    # Specify the key name of the key pair to use for this instance
    key_name = "elasticbamboo"

    # Install Docker after provisioning to run TASKANA containers
    user_data = file("${path.module}/../scripts/install_docker.sh")

    # Tags for easier identification of the instance during benchmark runs
    tags = {
        Name = var.ec2_instance_identifier
    }
}

output "bastion.ip" {
    value = "${aws_eip.bastion.public_ip}"
}
