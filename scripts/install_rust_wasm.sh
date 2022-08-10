#! /bin/bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup override set 1.50.0

curl -sL https://deb.nodesource.com/setup_16.x |  bash
sudo apt-get install -y nodejs npm

npm install -g rustwasmc

sudo apt-get update
sudo apt-get -y upgrade
sudo apt install -y build-essential curl wget git vim libboost-all-dev llvm-dev liblld-10-dev
