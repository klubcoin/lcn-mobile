import Web3 from 'web3';
import Engine from './Engine';
import ContractABIs from './ABIs';

const contractAddress = '0x469f64a498F9f3751b37C1075556EBF5e3eA5616'; //'0x7Bd6050C39252103cEad4501DA5069481aB4F172';
const rpcProvider = 'https://testnet.liquichain.io/rpc';

const contract = () => {
  const { selectedAddress } = Engine.state.PreferencesController;
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcProvider));
  return new web3.eth.Contract(ContractABIs, contractAddress, { from: selectedAddress });
}

export default class Erc20Service {

  getFixedFee = async () => {
    return await contract().methods.getFixedFee().call();
  }
}