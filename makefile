

#This makefile is not ready yet

install-deps:

ifeq (, $(shell which curl))
	@echo No curl is installed, curl will be installed now....
	@sudo apt-get install curl -y
endif

ifeq (,$(shell which dfxvm))
	@echo No dfx is installed, dfx will be installed now....
	curl -fsSL https://internetcomputer.org/install.sh -o install_dfx.sh
	chmod +x install_dfx.sh
	./install_dfx.sh
	rm install_dfx.sh
	@echo
	@echo
	@echo Please reopen terminal window and execute again 'make install-deps'
	@echo because terminal needs to be restarted after DFX was installed.
	@echo -> The error-message you can ignore.
	@exit 127
endif


	sudo apt install nodejs -y
	sudo apt install npm -y
	sudo npm install ic-mops
#	sudo npm install @babel/core
#	sudo npm install @babel/node
#	sudo npm install @babel/preset-env



# So we have at least version 0.15.3 of dfx installed, because of Regions bugfix
	dfxvm update

#	npm update
	sudo npm i @dfinity/ledger-icp
	sudo npm i @dfinity/principal
	sudo npm i @dfinity/candid

	sudo npm i @dfinity/agent
	sudo npm i @dfinity/utils
	sudo npm i @dfinity/nns-proto
#	sudo npm i artemis-web3-adapter @dfinity/identity @dfinity/identity-secp256k1 crypto-browserify
	sudo npm i @dfinity/identity @dfinity/identity-secp256k1 crypto-browserify
	sudo npm i browserify-zlib @dfinity/auth-client
	sudo npm install --save isomorphic-fetch
	sudo npm install svelte-preprocess
	sudo npm i crypto-js
	sudo npm i @jest/console
	sudo npm i react
	sudo npm i react-native
	sudo npm i react-native-webview
	sudo npm i react-refresh
	@sudo chmod -R go+rw src/TrabyterHub_frontend/.svelte-kit
