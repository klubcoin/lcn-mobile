# LiquiChain white paper

LiquiChain is a blockchain whose nodes form a graph of trust and proximity.
It is used to run smart contracts in a fast, secured and low energy consumption way,
allowing to implement crypto currency, voting systems, file sharing, business processes and more.

## Trust Graph: the friends
When a user creates an account, a hash is created from his account data.
He then sends an `account_creation_request` to 3 (or more) trusted accounts.
Once the owners of the trusted account have validated the identity of the account creator, they send him
back a signed `account_validation` message that can serve as a proof of their trust.

## Proximity graph: the neighbours
Besides his required friends, an account also has neighbours.
The neighbours are the accounts that have the closest hash in terms of the xor metric used in bittorrent DHT.
To be confirmed, an account also need to receive a signed message from 3 among its 10 closest neighbours (this is used to forbid the same user to create 2 accounts).
The proximity graph allows to define proximity circles, each node is mandated to perform block forging and state storing for each of its proximity circles. 

## Epochs
The time measurement of exchanges is checked by using UTC time.
Nodes time are synchronized using [NTP protocol](https://www.ntp.org/) and the [NTP pool of servers](https://www.ntppool.org/en/).
Several process in liquiChain, like accout creation, block forging, take place during an epoch.
An epoch is a time period of 1 million seconds (a bit more than 11 days)
The first epoch for liquiChain is unix epoch 1622 (May 26 2021, 5:33:20 AM).
This number is quite easy to remember as it is the year when January 1 was declared the first day on the year in the Gregorian calendar,
besides it is also the birth year of Moliere.

## Smart contract and wallets
LiquiChain is a blockchain running smart contracts.
Smart contracts are funtions that decide under wich condition a transaction is valid
and what are the output state and transactions it triggers.
It is packaged in a torrent file and can be accessed by the nodes over the torrent protocol.
For a crypto currency the smart contract describes for instance the rules that allow for a coin transfer to take place
and how fees or taxes are applied.
For a voting system, the smart contract describes the rules of who can vote for what, how can vote be delegated,...
It can be used to implement a wide range of systems, from liquid democracy to completly pyramidal system.
As smart contract are fairly broad piece of software, they can also be used to implement application like NFT, decentralized file sharing, etc...
Smart contracts contains several parameters like the number of neighbour circles, the storage size of wallets,...
The hash of a smart contract is also the hash of its wallet and as such, contains the initial state of the smart contract wallet.
The smart contract is signed by the account who is the owner of the contract wallet.

## Transaction
When a transaction is initiated from the wallet of an origin account A to a destination wallet of an account B.
A validation process involving friends and neighbours is performed.

### Outbound transaction
This kind of transaction is at the initiative of A, this is for instance the case of a donation from a person to an organization.
First an `transaction_proposal` is submited from an origin node of A (could be a HSM server accessed from a website, a mobile or desktop app on device using a security token).
to a destination node of B. The transaction contains the smart contract hash code, the transaction date, the origin and destination wallet hash, the input parameters of the transaction (for instance a amount of coin for a currency, a reference to a proposal for a vote, a document for file transfer,...) and a hash of the output state and transactions.
This transaction is signed by A.
The transaction is then accepted or refused, either manually or automatically by B.
If it is accepted then one (or more) chain of trust is built and a `transaction_validation_request` is forwarded along this chain.
The nodes in the chains that hold the current state of A or B for the smart contract associated to the transaction simulate the smart contract execution and depending on the result, validates or not the transation. If validated, it creates and sign a `transaction_validation` and send it back to down the chain.
Once B receives the signed `transaction_validation` he creates a `transaction`, sign it and send it back to A, the neighbours of A, and to its friends.
On his side A sends the `transaction` to his friends and to the neighbours of B.
Those nodes spread the transactions to all node holding A or B state.

### Inbound transaction
This kind of transaction is at the initiative of B, this is for instance the case when person is buying a product or service from an organization.
The content of `transaction_proposal` is submited from a destination node of B to an origin node of A.
If A approve it, it sign it and send it back to B as an outbound transaction.

## Transaction validation
When a node receives a `transaction_validation_request` it is either from one of his friends or his neighbour.
The message contain sthe transaction details and a hint about the list of nodes in the chain.
If it holds the state of A or B or holds a `warrant` from a friend of A or B while none is online for this smart contract,
 then it simulates the execution of the smart contract. In case the simulated execution succeeds,
 it produces a `transaction_validation` and send it back.

## Smart contract execution
When a node receives a `transaction`, if it holds a state of A or B it executes the smart contract, update its state and triggers the output transactions.
In case the smart contract cannot be executed, an `invalid_transaction` message mentionning the cheating node and A state is spread.

## Invalid transaction
When a node receives an `invalid_transaction` about a list of cheating nodes it verifies it then blacklist them.
if the `invalid_transaction` is itself invalid, it is the sending node that is blacklisted.

## Block forging
In order to be able to restore lost wallets states and to keep the blockchain of each node to a certain size.
A block forging process is implemented in each neighbour circle.
For a given smart contract, the first level circle (also called swarm) is the set of all accounts that have a state 
for this contract.
The number of circles at the second level is a parameter defined in the smart contract, let say N.
The accounts belonging to the second level circle of index i (0 <= i < N) are the accounts of the swarm whose hash start with the digit i (when written in base N).
We define in the same way the circles of level K as all node in the swarm whose hash start with the same K digits.
Each account has a fixed size storage allocated to the smart contract states of its neighbours and for the blocks of 
the chain of transactions, the size of the storage is a parameter of the smart contract.
