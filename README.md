<div align="center">
    <img src="https://s3.moondrop.io/share/2022/07/26/nt_logo-taskana_rgb_schwarz-cyan-tuerkis.png" alt="Helica" width="600" />
</div>

<br />

<div align="center">Benchmark suite for the open source task management library TASKANA</div>

<br />

<div align="center">
    <a href="https://github.com/xojs/xo">
        <img src="https://img.shields.io/badge/code%20style-xo-5ed9c7?style=for-the-badge" alt="Code Style: XO">
    </a>
    <a href="https://www.jetbrains.com/help/idea/code-style-kotlin.html">
        <img src="https://img.shields.io/badge/style%20guide-jetbrains-5ed9c7?style=for-the-badge" alt="Style Guide: JetBrains">
    </a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/license-MIT-5ed9c7?style=for-the-badge" alt="MIT License">
    </a>
</div>

## About
TASKANA is a general purpose open source task management component library which is actively maintained and developed. In order to keep the performance of TASKANA at check - *with a constant flux of new features and development in general* - this benchmark suite was brought to life.

## Intentions
One of the biggest issue with benchmarks in general is ***reproducibility***. Benchmarks often tend to run on hardware that is either set up differently, uses different software, or - *in the worst case* - isn't even available anymore. Results thus vary **drastically** from setup to setup and are essentially **worthless**. 

By taking out the unpredictability and moving benchmarks to the cloud - where hardware, software and its environment is programmatically controlled - results suddenly become relevant and showcase a real way of measuring performance of a software product.

In order to achieve this, TASKANA benchmarks are fully autonomously triggered in a Continuous Integration pipeline and run in the cloud with hardware that has a guaranteed SLA for computing reproducibility. The environment and setup is programmatically controlled and will always be the same from run to run and from setup to setup. 

**TASKANA benchmarks thus achieve true reproducibility!**

## How It Works
TASKANA's relevant components *(REST & core)* are containerized and pushed to a container registry upon release *(automatically invoked by TASKANA's CI/CD pipeline)* for later use whenever a benchmark run is manually invoked.

Terraform scripts programmatically define the environment for aws and define the AMI for the relevant EC2 instance.

A GitHub workflow then asks for relevant parameters like a TASKANA version to know which images to grab from the registry, then invokes, validates, plans and applies the Terraform scripts to programmatically spin up a *clean* `t3.small` EC2 instance and finally runs scripts for the actual benchmark in following order:

1. Clean install all relevant dependencies and runtimes
2. Grab TASKANA components from container registry
3. Start up relevant TASKANA components for benchmarking
4. Start benchmark run and publish results to medium of choice
5. Dispatch signal for destroying the EC2 instance

Once the benchmark is done and results are published, the EC2 instance is destroyed.

## Usage
By default, TASKANA is benched in the aws Cloud on a `t3.small` EC2 instance. Hence, make sure to have a set of **Access and Private Keys** ready.

Continue by forking this repository and adding your Access und Private Key to your project's secrets and call them `TASKANA_BENCHMARK_AWS_KEY` and `TASKANA_BENCHMARK_AWS_SECRET` respectively. 

Once set up, navigate to the `Actions` tab where benchmark runs can be manually invoked. The benchmark workflow allows for certain user input like TASKANA versions that should be benched.

By default, this benchmark suite only allows for manual workflow dispatches and won't listen to any events emitted by GitHub. If it is desired to change this behavior *(e.g. to run on release or push to a feature branch)* you will want to copy the existing workflow in `.github/workflows` and adjust the file accordingly.

## License
This repository makes use of the [MIT License](https://opensource.org/licenses/MIT) and all of its correlating traits.
